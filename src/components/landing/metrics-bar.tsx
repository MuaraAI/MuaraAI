import React from "react";
import Icon, { IconName } from "@/components/ui/icon";

const current = [
  {
    title: "Belajar",
    description: "Temukan materi dan konteks akademik yang relevan untuk langkah berikutnya.",
    icon: "school" as IconName,
  },
  {
    title: "Membangun",
    description: "Ubah ide menjadi project, karya, dan Proof of Work yang bisa dilihat.",
    icon: "build" as IconName,
  },
  {
    title: "Berkontribusi",
    description: "Bagikan hasil, bantu anggota lain, dan ikut menguatkan ekosistem UBSI.",
    icon: "hub" as IconName,
  },
];

export default function MetricsBar() {
  return (
    <section className="border-b border-stroke bg-surface-alt px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-3 md:gap-0">
          {current.map((item, index) => (
            <div
              key={item.title}
              className={`relative flex gap-4 px-1 md:px-8 ${index > 0 ? "md:border-l md:border-stroke" : ""}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stroke bg-white text-muara-ocean">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">{item.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-secondary">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
