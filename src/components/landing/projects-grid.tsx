import Link from "next/link";
import React from "react";
import { Section, SectionHeader } from "@/components/ui/section";
import ProductList from "@/components/landing/product-list";

export default function ProjectsGrid() {
  return (
    <Section id="projects" tone="tint">
      <SectionHeader
        eyebrow="Karya & Artefak Nyata"
        title="Karya yang bisa dipakai."
        description="Project komunitas yang lahir dari kebutuhan belajar dan membangun solusi nyata."
      />
      <ProductList />
      <p className="mt-8 text-sm">
        <Link href="/projects" className="font-semibold text-muara-ocean hover:underline">
          Lihat semua project di GitHub
        </Link>
      </p>
    </Section>
  );
}
