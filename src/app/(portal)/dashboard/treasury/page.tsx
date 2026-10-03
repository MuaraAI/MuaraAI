import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member, TreasuryTransaction } from "@/types/database";
import { calculateMemberBill } from "@/lib/dues";

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
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
          Kas Komunitas & Pembayaran QRIS
        </h1>
        <p className="text-xs text-slate-400">
          Iuran mingguan Rp 3.000 atau bulanan Rp 12.000. Dikelola secara otomatis via QRIS Pakasir tanpa struk fisik manual.
        </p>
      </div>

      {/* Bill & Status Banner */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase">Masa Aktif Kas Anda</div>
            <div className="font-display text-xl font-bold text-white mt-1">
              {member.dues_valid_until ? member.dues_valid_until : "Belum Pernah Membayar"}
            </div>
            {bill.weeks > 0 ? (
              <div className="mt-1 text-xs text-amber-400 font-mono flex items-center gap-1.5">
                <span className="material-symbols-rounded text-sm">warning</span>
                Menunggak {bill.weeks} minggu (Total: {formatRupiah(bill.amount)})
              </div>
            ) : (
              <div className="mt-1 text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="material-symbols-rounded text-sm">check_circle</span>
                Masa aktif iuran kas masih berlaku
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Tagihan Saat Ini</span>
            <span className="font-display text-2xl font-bold text-muara-cyan">
              {formatRupiah(bill.amount > 0 ? bill.amount : 3000)}
            </span>
          </div>
        </div>

        {/* QRIS Launcher Options */}
        <div className="pt-6">
          <h3 className="text-xs font-mono uppercase text-slate-400 mb-3">Pilih Paket Pembayaran QRIS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-background p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Paket 1 Minggu</div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">Rp 3.000 (+7 hari aktif)</div>
              </div>
              <button
                type="button"
                className="rounded-lg bg-surface-hover hover:bg-muara-cyan hover:text-background border border-muara-cyan/40 px-3.5 py-2 text-xs font-mono font-bold text-muara-cyan transition-colors"
              >
                Scan QRIS (3k)
              </button>
            </div>

            <div className="rounded-lg border border-border bg-background p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Paket 1 Bulan (4 Minggu)</div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">Rp 12.000 (+28 hari aktif)</div>
              </div>
              <button
                type="button"
                className="rounded-lg bg-muara-cyan hover:bg-muara-cyan-light px-3.5 py-2 text-xs font-mono font-bold text-background transition-colors"
              >
                Scan QRIS (12k)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger History Table */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-rounded text-muara-cyan">receipt_long</span>
          Riwayat Mutasi Kas Komunitas
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            Belum ada transaksi tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-slate-300">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-background/40">
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 capitalize">{tx.category}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate">{tx.description}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        tx.type === "income" ? "text-emerald-400" : "text-red-400"
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
