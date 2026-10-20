import React from "react";
import FadeIn from "@/components/ui/fade-in";
import { Section, SectionHeader } from "@/components/ui/section";

export default function Manifesto() {
  const principles = [
    { title: "Belajar dari sumber yang jelas", description: "Kami mulai dari materi, konteks, dan pertanyaan yang bisa ditelusuri." },
    { title: "Membuat sesuatu yang bisa dilihat", description: "Ide menjadi project dan Proof of Work, bukan berhenti di wacana." },
    { title: "Berbagi antar kampus", description: "Anggota dari seluruh Indonesia saling membuka jalur belajar dan kontribusi." },
    { title: "Menjaga kualitas bersama", description: "Review, tanggung jawab, dan kontribusi nyata menjadi dasar komunitas." },
  ];

  return (
    <Section id="manifesto" tone="tint">
      <SectionHeader eyebrow="Cara Kami Berjalan" title="Komunitas yang bergerak dari rasa ingin tahu ke karya nyata." />
      <div className="p-[2px]">
        <ol className="px-frame grid gap-[2px] bg-[#163A55] sm:grid-cols-2">
          {principles.map((principle, idx) => (
            // The cell stays put (so the grid lines never flash); only its content slides in.
            <li key={principle.title} className="group bg-white transition-colors duration-200 hover:bg-surface-alt">
              <FadeIn direction={idx % 2 === 0 ? "left" : "right"} distance={20} delay={idx * 0.08} className="flex gap-5 p-6 sm:p-7">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center bg-muara-ocean font-mono text-xs font-bold text-white shadow-[3px_3px_0_0_#163A55] transition-transform duration-300 ease-out group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{principle.description}</p>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
