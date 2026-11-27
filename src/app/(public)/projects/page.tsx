import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GITHUB_ORG_URL } from "@/lib/constants";
import ProductList from "@/components/landing/product-list";
import { PageHeader } from "@/components/ui/section";
import Icon from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Project | MuaraAI",
  description: "Produk komunitas MuaraAI: Mira, FluxCode, dan yang segera hadir.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader
        eyebrow="Project"
        title="Project MuaraAI"
        description="Produk utama komunitas. Pilih satu, baca README-nya, lalu buka PR pertamamu."
        actions={
          <a href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" className="px-btn inline-flex w-fit items-center gap-2 px-5 py-2.5 text-xs font-bold">
            <Icon name="github" className="h-4 w-4" />
            <span>Buka di GitHub</span>
          </a>
        }
      />

      <ProductList />

      <p className="mt-10 text-sm text-secondary">
        Mencari yang lain?{" "}
        <Link href="/karya" className="font-semibold text-muara-ocean hover:underline">
          Lihat karya lainnya dari komunitas
        </Link>
        .
      </p>
    </div>
  );
}
