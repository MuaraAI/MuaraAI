import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member, TreasuryTransaction } from "@/types/database";
import { calculateMemberBill } from "@/lib/dues";
import Icon from "@/components/ui/icon";

export default async function MemberTreasuryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberData } = await supabase
    .from("members")
    .select("*")
    .eq("id", user?.id)
    .single();

  const member = memberData as Member;

  // Query transactions for ledger
  const { data: transactionsData } = await supabase
    .from("treasury_transactions")
    .select("*")
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(20);

  const transactions: TreasuryTransaction[] = transactionsData || [];

  const bill = calculateMemberBill(member?.dues_valid_until || null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Kas Komunitas & Pembayaran QRIS
        </h1>
        <p className="text-xs text-secondary font-sans">
          Iuran mingguan Rp 3.000 atau bulanan Rp 12.000. Dikelola secara otomatis via QRIS Pakasir tanpa struk fisik manual.
        </p>
      </div>

      {/* Bill & Status Banner */}
      <div className="rounded-[18px] border border-stroke bg-white p-6 sm:p-8 shadow-diffusion">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stroke">
          <div>
            <div className="text-xs font-mono text-secondary uppercase">Masa Aktif Kas Anda</div>
            <div className="font-display text-xl font-bold text-foreground mt-1">
              {member.dues_valid_until ? member.dues_valid_until : "Belum Pernah Membayar"}
            </div>
            {bill.weeks > 0 ? (
              <div className="mt-1 text-xs text-amber-700 font-mono flex items-center gap-1.5 font-semibold">
                <Icon name="warning" className="w-4 h-4 text-amber-600" />
                <span>Menunggak {bill.weeks} minggu (Total: {formatRupiah(bill.amount)})</span>
              </div>
            ) : (
              <div className="mt-1 text-xs text-emerald-700 font-mono flex items-center gap-1.5 font-semibold">
                <Icon name="check_circle" className="w-4 h-4 text-emerald-600" />
                <span>Masa aktif iuran kas masih berlaku</span>
              </div>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-secondary uppercase block mb-1">Tagihan Saat Ini</span>
            <span className="font-display text-2xl font-bold text-muara-ocean">
              {formatRupiah(bill.amount > 0 ? bill.amount : 3000)}
            </span>
          </div>
        </div>

        {/* QRIS Launcher Options */}
        <div className="pt-6">
          <h3 className="text-xs font-mono uppercase text-secondary mb-3 font-semibold">Pilih Paket Pembayaran QRIS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-[10px] border border-stroke bg-surface-alt p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-foreground">Paket 1 Minggu</div>
                <div className="text-xs font-mono text-secondary mt-0.5">Rp 3.000 (+7 hari aktif)</div>
              </div>
              <button
                type="button"
                className="rounded-[8px] bg-white hover:bg-muara-ocean hover:text-white border border-muara-ocean px-3.5 py-2 text-xs font-mono font-bold text-muara-ocean transition-colors shadow-xs"
              >
                Scan QRIS (3k)
              </button>
            </div>

            <div className="rounded-[10px] border border-stroke bg-surface-alt p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-foreground">Paket 1 Bulan (4 Minggu)</div>
                <div className="text-xs font-mono text-secondary mt-0.5">Rp 12.000 (+28 hari aktif)</div>
              </div>
              <button
                type="button"
                className="rounded-[8px] bg-muara-ocean hover:bg-muara-ocean-dark px-3.5 py-2 text-xs font-mono font-bold text-white transition-colors shadow-xs"
              >
                Scan QRIS (12k)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger History Table */}
      <div className="rounded-[18px] border border-stroke bg-white p-6 sm:p-8 shadow-diffusion">
        <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Icon name="receipt_long" className="w-5 h-5 text-muara-ocean" />
          <span>Riwayat Mutasi Kas Komunitas</span>
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-secondary text-xs font-mono bg-surface-alt rounded-[10px] border border-dashed border-stroke">
            Belum ada transaksi tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-stroke text-secondary uppercase font-semibold">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-alt/60">
                    <td className="py-2.5 px-3 text-secondary">
                      {new Date(tx.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          tx.type === "income"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 capitalize">{tx.category}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate">{tx.description}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        tx.type === "income" ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatRupiah(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
