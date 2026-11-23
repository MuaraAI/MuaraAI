import React from "react";
import Icon, { IconName } from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";

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
    <section className="overflow-x-clip border-b border-stroke bg-surface-alt px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="mx-auto max-w-[100rem]">
        <div className="rail grid gap-7 md:grid-cols-3 md:gap-0">
          {current.map((item, index) => (
            <FadeIn
              key={item.title}
              direction="left"
              delay={index * 0.12}
              className={`relative flex gap-4 md:px-8 md:first:pl-0 ${index > 0 ? "md:border-l-2 md:border-dashed md:border-[#CFE2EE]" : ""}`}
            >
              <div className="px-icon h-10 w-10 shrink-0">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">{item.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-secondary">{item.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
