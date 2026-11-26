import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Footer from "../src/components/landing/footer";
import ProjectsGrid from "../src/components/landing/projects-grid";
import Manifesto from "../src/components/landing/manifesto";
import DonateCta from "../src/components/landing/donate-cta";

describe("national community public copy", () => {
  it("says plainly that Mira is independent of UBSI", () => {
    render(<ProjectsGrid />);
    expect(screen.getByText(/tidak berafiliasi dengan UBSI/i)).toBeTruthy();
  });

  it("removes internal vault and vendor language from public sections", () => {
    render(
      <>
        <Manifesto />
        <DonateCta />
        <Footer />
      </>,
    );
    expect(screen.queryByText(/AES-256-GCM Vault/i)).toBeNull();
    expect(screen.getByRole("link", { name: "Mira" }).getAttribute("href")).toBe("https://mira.muaraai.com");
    expect(screen.getByRole("link", { name: "FluxCode" }).getAttribute("href")).toBe("https://fluxcode.muaraai.com");
    expect(screen.getByRole("link", { name: "Muara V1 Flash" }).getAttribute("href")).toBe("https://ai.muaraai.com");
    expect(screen.getByRole("link", { name: "Laku" }).getAttribute("href")).toBe("https://laku.muaraai.com");
    expect(screen.queryByText("Ollama")).toBeNull();
    expect(screen.getByRole("link", { name: "Threads" }).getAttribute("href")).toBe("https://www.threads.com/@muara.ai");
    expect(screen.getByRole("link", { name: "Instagram" }).getAttribute("href")).toBe("https://www.instagram.com/muara.ai/");
    expect(screen.getByRole("link", { name: "X" }).getAttribute("href")).toBe("https://x.com/MuaraAI");
    expect(screen.queryByText(/Tencent/i)).toBeNull();
    expect(screen.queryByText(/Zero Slop/i)).toBeNull();
    expect(screen.queryByText(/100% Independent/i)).toBeNull();
  });
});
