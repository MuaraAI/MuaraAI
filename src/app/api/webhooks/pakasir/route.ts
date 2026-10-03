import { NextRequest, NextResponse } from "next/server";
import { verifyAndProcessPakasirWebhook } from "@/lib/pakasir";
import { createClient } from "@supabase/supabase-js";
import { calculateDuesExtension } from "@/lib/dues";
import { notifyMaintainers } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.order_id || !body.amount) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1. Fail-closed server-to-server verification with Pakasir
    const verifyResult = await verifyAndProcessPakasirWebhook({
      order_id: body.order_id,
      amount: Number(body.amount),
      project: body.project,
    });

    if (!verifyResult.success || !verifyResult.transaction) {
      return NextResponse.json({ error: "Verification failed" }, { status: 401 });
    }

    const transaction = verifyResult.transaction;

    // Use service role client for background webhook DB mutations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://awlwvcmrknkdxnwolcoy.supabase.co";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, serviceKey);

    // 2. Idempotency Check: check if payment_ref already processed
    const { data: existingTx } = await supabase
      .from("treasury_transactions")
      .select("id")
      .eq("payment_ref", transaction.order_id)
      .maybeSingle();

    if (existingTx) {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // Parse memberId from orderId (format: dues_{memberId}_{timestamp} or query member by order)
    const orderParts = transaction.order_id.split("_");
    const memberId = orderParts.length >= 2 ? orderParts[1] : null;

    let memberName = "Member";

    if (memberId) {
      const { data: member } = await supabase
        .from("members")
        .select("id, full_name, dues_valid_until")
        .eq("id", memberId)
        .maybeSingle();

      if (member) {
        memberName = member.full_name;
        // Calculate days to add: Rp 3000 = 7 days, Rp 12000 = 28 days, else proportional
        const daysToAdd = Math.max(Math.round((transaction.amount / 3000) * 7), 7);
        const newDuesValidUntil = calculateDuesExtension(member.dues_valid_until, daysToAdd);

        // Update member active status & extended dues
        await supabase
          .from("members")
          .update({
            dues_valid_until: newDuesValidUntil.toISOString().slice(0, 10),
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", member.id);
      }
    }

    // 3. Record income transaction in treasury_transactions
    await supabase.from("treasury_transactions").insert({
      type: "income",
      amount: transaction.amount,
      category: "dues",
      description: `Pembayaran iuran kas QRIS Pakasir (${memberName})`,
      member_id: memberId,
      status: "paid",
      payment_ref: transaction.order_id,
    });

    // 4. Notify maintainers
    await notifyMaintainers(
      "Pembayaran Kas QRIS Diterima",
      `Pembayar: ${memberName}\nNominal: Rp ${transaction.amount.toLocaleString("id-ID")}\nOrder ID: ${transaction.order_id}\nMetode: ${transaction.payment_method}`
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Pakasir webhook error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
