"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { syncContributionsNow } from "@/app/actions/admin";

export default function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sync = async () => {
    setLoading(true);
    setMessage(null);
    const result = await syncContributionsNow();
    setLoading(false);
    if (result.success && result.summary) {
      setMessage(`Tersinkron: ${result.summary.synced} anggota (${result.summary.skipped} dilewati).`);
      router.refresh();
    } else {
      setMessage(result.error ?? "Gagal sinkron.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={sync}
        disabled={loading}
        className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Menyinkronkan..." : "Sinkronkan sekarang"}
      </button>
      {message && <span role="status" className="text-sm text-secondary">{message}</span>}
    </div>
  );
}
