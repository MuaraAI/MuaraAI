import React from "react";
import Image from "next/image";
import Icon from "@/components/ui/icon";
import { communityContent } from "@/lib/community-content";

type Locale = "id" | "en";

const COPY = {
  id: { site: "Buka Web", repo: "Repositori GitHub", soon: "Segera hadir:", alt: (name: string) => `Tampilan depan situs ${name}` },
  en: { site: "Open site", repo: "Source on GitHub", soon: "Coming soon:", alt: (name: string) => `Front page of the ${name} site` },
} as const;

/** The products that live in the org, with their live site and repo. One source for the landing, /projects and /en. */
export default function ProductList({ locale = "id" }: { locale?: Locale }) {
  const copy = COPY[locale];

  return (
    <>
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {communityContent.products.map((product) => (
        <li key={product.slug} className="px-card flex flex-col bg-white">
          <Image
            src={product.image}
            alt={copy.alt(product.name)}
            width={960}
            height={600}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[16/10] h-auto w-full border-b-2 border-[#163A55] object-cover object-top"
          />
          <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground">{product.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-secondary">{product[locale]}</p>
            {product.note ? <p className="mt-2 text-xs text-secondary">{product.note[locale]}</p> : null}
            <ul className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <li key={tag} className="px-chip bg-surface-alt px-2.5 py-1 font-mono text-xs text-foreground">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t-2 border-dashed border-[#CFE2EE] pt-4">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-muara-ocean transition-colors hover:text-foreground"
            >
              <Icon name="open_in_new" className="h-4 w-4" />
              <span>{copy.site}</span>
            </a>
            <a
              href={product.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-secondary transition-colors hover:text-foreground"
            >
              <Icon name="code" className="h-4 w-4" />
              <span>{copy.repo}</span>
            </a>
          </div>
          </div>
        </li>
      ))}
    </ul>
    {communityContent.comingSoon.map((item) => (
      <p key={item.name} className="mt-6 text-sm text-secondary">
        <span className="font-semibold text-foreground">{copy.soon}</span> {item.name}, {item[locale]}
      </p>
    ))}
    </>
  );
}
