import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

let localeHeader: string | null = null;
vi.mock("next/headers", () => ({ headers: async () => ({ get: (name: string) => (name === "x-locale" ? localeHeader : null) }) }));
vi.mock("@/components/ui/route-progress", () => ({ default: () => null }));
vi.mock("@/components/ui/feedback", () => ({ FeedbackProvider: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

import RootLayout from "../src/app/layout";

const html = async () => renderToStaticMarkup(await RootLayout({ children: <p>page</p> }));

beforeEach(() => {
  localeHeader = null;
});

describe("root layout language", () => {
  it("marks English pages as English", async () => {
    localeHeader = "en";
    expect(await html()).toContain('<html lang="en">');
  });

  it("defaults to Indonesian when there is no header or an unknown value", async () => {
    expect(await html()).toContain('<html lang="id">');
    localeHeader = "fr";
    expect(await html()).toContain('<html lang="id">');
  });
});
