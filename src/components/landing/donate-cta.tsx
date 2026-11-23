import React from "react";
import Icon from "@/components/ui/icon";
import { SOCIABUZZ_URL } from "@/lib/constants";

export default function DonateCta() {
  return (
    <section id="donate" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-white">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
            Dukungan Komunitas
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Bantu MuaraAI terus berjalan
          </p>
          <p className="mt-3 text-sm text-slate-600 max-w-xl">
            Donasi bersifat sukarela dan terbuka untuk siapa saja. Dana dipakai untuk infrastruktur cloud dan pendaftaran lomba.
          </p>
        </div>
        <a
          href={SOCIABUZZ_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white border border-border-ocean px-5 py-3 text-sm font-semibold text-foreground hover:border-muara-ocean transition-colors shadow-sm"
        >
          Dukung komunitas
          <Icon name="open_in_new" className="w-4 h-4 text-muara-ocean" />
        </a>
      </div>
    </section>
  );
}
