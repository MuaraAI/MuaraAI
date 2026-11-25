import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { POSITIONS_SETTING_KEY, parsePositions } from "@/lib/positions";
import { parseRules } from "@/lib/contributions/rules";
import { communityContent } from "@/lib/community-content";
import { GITHUB_ORG_URL, SOCIABUZZ_URL } from "@/lib/constants";
import { Section, SectionHeader } from "@/components/ui/section";
import CommunityStructure from "@/components/landing/community-structure";

export const metadata: Metadata = {
  title: "MuaraAI | An open community for builders and creatives",
  description:
    "MuaraAI is an open community. Contribute to real projects on GitHub, get your pull requests reviewed by other members, and build a track record anyone can check.",
  alternates: {
    canonical: "https://muaraai.com/en",
    languages: { id: "https://muaraai.com/", en: "https://muaraai.com/en" },
  },
};

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

const STEPS = [
  { title: "Sign in with GitHub", text: "Pick a division and a position, and tell us why you want to join." },
  { title: "A maintainer reviews your application", text: "When it is approved, your GitHub account is invited to the MuaraAI organisation." },
  { title: "Contribute with pull requests", text: "Only merged pull requests that another member approved count toward your monthly target." },
];

export default async function EnglishHomePage() {
  const supabase = isSupabaseConfigured() ? await createClient() : null;
  const read = async (key: string) =>
    supabase ? (await supabase.from("community_settings").select("value").eq("key", key).maybeSingle()).data?.value : undefined;
  const [positionsValue, rulesValue] = await Promise.all([read(POSITIONS_SETTING_KEY), read("contribution_rules")]);
  const positions = parsePositions(positionsValue);
  const { builder, creative } = parseRules(rulesValue);
  const arus = communityContent.muaraArusOne;

  return (
    <div className="flex flex-col">
      <section className="border-b border-stroke bg-background px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-20 lg:px-8">
        <div className="mx-auto max-w-[100rem]">
          <h1 className="max-w-4xl font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            Learn, build, <span className="text-muara-ocean">contribute.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-secondary sm:text-lg">
            MuaraAI is an open community for builders and creatives. Contribute to real projects on GitHub, get your pull requests reviewed by other members,
            and build a track record anyone can check. Students, learners and professionals from anywhere are welcome.
          </p>
          <div className="mt-9 grid grid-cols-[1fr_auto] gap-3 sm:flex sm:gap-4">
            <Link href="/en/join" className="px-btn inline-flex min-h-11 items-center justify-center px-4 py-3 text-sm font-bold sm:px-5">
              Join with GitHub
            </Link>
            <Link href="/members" className="px-btn-ghost inline-flex min-h-11 items-center justify-center px-4 py-3 text-sm font-semibold sm:px-5">
              See the members
            </Link>
          </div>
        </div>
      </section>

      <Section tone="tint">
        <SectionHeader eyebrow="How it works" title="Contribute in public, get reviewed by your peers." />
        <ol className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <p className="font-mono text-xs font-bold text-muara-ocean">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white">
        <SectionHeader eyebrow="Monthly target" title="What a month of contributing looks like." />
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Builder</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              {plural(builder.mergedPrs, "merged pull request", "merged pull requests")}, {builder.externalPrs} of them in repos owned by someone else,{" "}
              {plural(builder.commits, "commit", "commits")} inside those pull requests and {plural(builder.newRepos, "new repo", "new repos")}.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Creative</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              {plural(creative.mergedPrs, "merged pull request", "merged pull requests")}, {creative.externalPrs} of them in repos owned by someone else and{" "}
              {plural(creative.newWorks, "new work", "new works")}.
            </p>
          </div>
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-secondary">
          The maintainers set these numbers and may change them. Members who go beyond the target earn a recognition tier.
        </p>
      </Section>

      <CommunityStructure positions={positions} locale="en" />

      <Section tone="tint">
        <SectionHeader eyebrow="Projects" title="Open repositories you can contribute to today." />
        <div className="max-w-2xl">
          <h3 className="font-display text-xl font-bold text-foreground">{arus.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            A {arus.parameters}-parameter local AI model for academic and coding questions. It runs offline.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            <li><a href={arus.playground} target="_blank" rel="noopener noreferrer" className="text-muara-ocean hover:underline">Playground</a></li>
            <li><a href={arus.github} target="_blank" rel="noopener noreferrer" className="text-muara-ocean hover:underline">Code on GitHub</a></li>
            <li><a href={arus.huggingFace} target="_blank" rel="noopener noreferrer" className="text-muara-ocean hover:underline">Hugging Face</a></li>
            <li><a href={arus.ollama} target="_blank" rel="noopener noreferrer" className="text-muara-ocean hover:underline">Ollama</a></li>
          </ul>
          <p className="mt-6 text-sm">
            <a href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-muara-ocean hover:underline">
              All repositories on GitHub
            </a>
          </p>
        </div>
      </Section>

      <Section tone="white">
        <SectionHeader eyebrow="Support" title="Help keep MuaraAI running." />
        <p className="max-w-xl text-sm leading-relaxed text-secondary">Donations are voluntary and open to anyone.</p>
        <a href={SOCIABUZZ_URL} target="_blank" rel="noopener noreferrer" className="px-btn-ghost mt-5 inline-flex min-h-11 items-center px-5 py-2.5 text-sm font-semibold">
          Support the community
        </a>
      </Section>
    </div>
  );
}
