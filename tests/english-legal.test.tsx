import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import EnglishTermsPage, { metadata as termsMeta } from "../src/app/(english)/en/terms/page";
import EnglishPrivacyPage, { metadata as privacyMeta } from "../src/app/(english)/en/privacy/page";
import EnglishConductPage, { metadata as conductMeta } from "../src/app/(english)/en/code-of-conduct/page";
import { metadata as idTermsMeta } from "../src/app/(public)/terms/page";
import { metadata as idPrivacyMeta } from "../src/app/(public)/privacy/page";
import { metadata as idConductMeta } from "../src/app/(public)/code-of-conduct/page";

const pages = [
  { name: "Terms of Service", Page: EnglishTermsPage, meta: termsMeta, idMeta: idTermsMeta, path: "terms", sections: ["1. Membership & Proof of Work", "2. Voluntary Support", "3. Intellectual Property & Open Source"] },
  { name: "Privacy Policy", Page: EnglishPrivacyPage, meta: privacyMeta, idMeta: idPrivacyMeta, path: "privacy", sections: ["1. Data We Collect", "2. Who Can See Your Data", "3. Use & Security of Data", "4. Access & Deletion"] },
  { name: "Code of Conduct & Engineering Ethics", Page: EnglishConductPage, meta: conductMeta, idMeta: idConductMeta, path: "code-of-conduct", sections: ["1. Anti-Slop (Zero Uncurated AI Artifacts)", "2. Academic Integrity & No Cheating Services", "3. Zero Hardcoded Secrets & Data Security", "4. Git Discipline & Mandatory Testing"] },
] as const;

describe.each(pages)("English $name", ({ name, Page, meta, idMeta, path, sections }) => {
  it("has the same sections as the Indonesian original, in English", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(name);
    for (const section of sections) expect(screen.getByRole("heading", { level: 2, name: section })).toBeTruthy();
  });

  it("says it is a translation and that the Indonesian original applies, with a link to it", () => {
    render(<Page />);
    expect(document.body.textContent).toMatch(/English translation of the Indonesian original/);
    expect(document.body.textContent).toMatch(/Indonesian version applies/);
    expect(screen.getByRole("link", { name: /Indonesian original/ }).getAttribute("href")).toBe(`/${path}`);
  });

  it("stays in the English site and in English", () => {
    const { container } = render(<Page />);
    expect(screen.getByRole("link", { name: /Home/ }).getAttribute("href")).toBe("/en");
    expect(container.textContent).not.toMatch(/\b(yang|dan|dengan|untuk|Anda|kami|atau)\b/);
    expect(container.textContent).not.toContain("—");
  });

  it("is searchable as a pair with the Indonesian page", () => {
    expect(meta.alternates?.canonical).toBe(`https://muaraai.com/en/${path}`);
    const pair = { id: `https://muaraai.com/${path}`, en: `https://muaraai.com/en/${path}`, "x-default": `https://muaraai.com/${path}` };
    expect(meta.alternates?.languages).toMatchObject(pair);
    expect(idMeta.alternates?.canonical).toBe(`https://muaraai.com/${path}`);
    expect(idMeta.alternates?.languages).toMatchObject(pair);
    expect(String(meta.title)).toContain("MuaraAI");
  });
});

describe("English legal facts match the Indonesian originals", () => {
  it("keeps the contact address, the licence and the 100 percent test rule", () => {
    render(<EnglishPrivacyPage />);
    expect(document.body.textContent).toContain("admin@muaraai.com");
    render(<EnglishTermsPage />);
    expect(document.body.textContent).toContain("MIT License");
    render(<EnglishConductPage />);
    expect(document.body.textContent).toContain("100%");
    expect(document.body.textContent).toContain("Conventional Commits");
  });
});
