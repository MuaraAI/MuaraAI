import { NextRequest, NextResponse } from "next/server";
import { verifyAndProcessPakasirWebhook } from "@/lib/pakasir";
import { createClient } from "@supabase/supabase-js";
import { calculateDuesExtension } from "@/lib/dues";
import { DUES_CYCLE_DAYS, DUES_WEEKLY_FEE } from "@/lib/constants";
import { notifyMaintainers } from "@/lib/notify";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function dbFailure(context: string, error: { message?: string } | null) {
  console.error(`[Pakasir webhook] ${context}:`, error?.message ?? error);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (
      !body ||
      typeof body.order_id !== "string" ||
      !body.order_id ||
      typeof body.amount !== "number" ||
      !Number.isFinite(body.amount) ||
      body.amount <= 0
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1. Fail-closed server-to-server verification with Pakasir.
    // The project is pinned to the env config inside the lib; body.project is never trusted.
    const verifyResult = await verifyAndProcessPakasirWebhook({
      order_id: body.order_id,
      amount: body.amount,
    });

    if (!verifyResult.success || !verifyResult.transaction) {
      return NextResponse.json({ error: "Verification failed" }, { status: 401 });
    }

    const transaction = verifyResult.transaction;

    // Use service role client for background webhook DB mutations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error("[CRITICAL] NEXT_PUBLIC_SUPABASE_URL is not configured for Pakasir webhook.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (!serviceKey) {
      console.error("[CRITICAL] SUPABASE_SERVICE_ROLE_KEY is not configured for Pakasir webhook.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 2. Idempotency check: skip if this payment_ref was already recorded.
    // ponytail: race is closed by the UNIQUE index on treasury_transactions.payment_ref
    // (supabase/migrations/20261018_treasury_payment_ref_unique.sql); duplicate inserts surface as 23505 below.
    const { data: existingTx, error: idempotencyError } = await supabase
      .from("treasury_transactions")
      .select("id")
      .eq("payment_ref", transaction.order_id)
      .maybeSingle();

    if (idempotencyError) {
      return dbFailure("Idempotency check failed", idempotencyError);
    }

    if (existingTx) {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // 3. Attribute the payment: order format is dues_{memberId}_{timestamp}.
    const memberId = transaction.order_id.split("_")[1] ?? null;

    if (!memberId || !UUID_RE.test(memberId)) {
      console.error(`[Pakasir webhook] Cannot attribute order ${transaction.order_id} to a member.`);
      return NextResponse.json({ error: "Payment cannot be attributed" }, { status: 422 });
    }

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, full_name, dues_valid_until")
      .eq("id", memberId)
      .maybeSingle();

    if (memberError) {
      return dbFailure("Member lookup failed", memberError);
    }

    if (!member) {
      console.error(`[Pakasir webhook] Order ${transaction.order_id} references unknown member ${memberId}.`);
      return NextResponse.json({ error: "Payment cannot be attributed" }, { status: 422 });
    }

    const memberName = member.full_name || "Member";

    // Rp DUES_WEEKLY_FEE per DUES_CYCLE_DAYS, proportional, never less than one cycle
    const daysToAdd = Math.max(
      Math.round((transaction.amount / DUES_WEEKLY_FEE) * DUES_CYCLE_DAYS),
      DUES_CYCLE_DAYS
    );
    const newDuesValidUntil = calculateDuesExtension(member.dues_valid_until, daysToAdd);

    // Update member active status & extended dues
    const { error: updateError } = await supabase
      .from("members")
      .update({
        dues_valid_until: newDuesValidUntil.toISOString().slice(0, 10),
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (updateError) {
      return dbFailure("Member dues update failed", updateError);
    }

    // 4. Record income transaction in treasury_transactions
    const { error: insertError } = await supabase.from("treasury_transactions").insert({
      type: "income",
      amount: transaction.amount,
      category: "dues",
      description: `Pembayaran iuran kas QRIS Pakasir (${memberName})`,
      member_id: memberId,
      status: "paid",
      payment_ref: transaction.order_id,
    });

    if (insertError) {
      if ((insertError as { code?: string }).code === "23505") {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }
      return dbFailure("Treasury transaction insert failed", insertError);
    }

    // 5. Notify maintainers
    await notifyMaintainers(
      "Pembayaran Kas QRIS Diterima",
      `Pembayar: ${memberName}\nNominal: Rp ${transaction.amount.toLocaleString("id-ID")}\nOrder ID: ${transaction.order_id}\nMetode: ${transaction.payment_method}`
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Pakasir webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
