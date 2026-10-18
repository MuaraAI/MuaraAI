import React from "react";
import Icon from "@/components/ui/icon";

export default function Manifesto() {
  const principles = [
    { title: "Belajar dari sumber yang jelas", description: "Kami mulai dari materi, konteks, dan pertanyaan yang bisa ditelusuri." },
    { title: "Membuat sesuatu yang bisa dilihat", description: "Ide menjadi project dan Proof of Work, bukan berhenti di wacana." },
    { title: "Berbagi antar kampus", description: "Anggota dari seluruh Indonesia saling membuka jalur belajar dan kontribusi." },
    { title: "Menjaga kualitas bersama", description: "Review, tanggung jawab, dan kontribusi nyata menjadi dasar komunitas." },
  ];

  return (
    <section id="manifesto" className="border-b border-stroke bg-surface-alt/40 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-muara-ocean">CARA KAMI BERJALAN</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Komunitas yang bergerak dari rasa ingin tahu ke karya nyata.</h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-stroke bg-stroke sm:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle.title} className="bg-white p-6 sm:p-7">
              <Icon name="check_circle" className="h-5 w-5 text-muara-ocean" />
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{principle.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
