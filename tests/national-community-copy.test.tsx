import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Footer from "../src/components/landing/footer";
import ProjectsGrid from "../src/components/landing/projects-grid";
import Manifesto from "../src/components/landing/manifesto";
import TreasuryPreview from "../src/components/landing/treasury-preview";

describe("national community public copy", () => {
  it("shows Muara Arus 1 and UBSI API facts", () => {
    render(<ProjectsGrid />);
    expect(screen.getByText(/Muara Arus 1/i)).toBeTruthy();
    expect(screen.getByText(/1\.5B/i)).toBeTruthy();
    expect(screen.getByText(/muara-arus-1/i)).toBeTruthy();
    expect(screen.getByText(/UBSI API/i)).toBeTruthy();
    expect(screen.getByText(/unofficial/i)).toBeTruthy();
  });

  it("removes internal vault and vendor language from public sections", () => {
    render(
      <>
        <Manifesto />
        <TreasuryPreview currentBalance={0} totalExpenses={0} />
        <Footer />
      </>,
    );
    expect(screen.queryByText(/AES-256-GCM Vault/i)).toBeNull();
    expect(screen.getByText("Hugging Face")).toBeTruthy();
    expect(screen.getByText("Ollama")).toBeTruthy();
    expect(screen.getByText("UBSI API")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Hugging Face" }).getAttribute("href")).toBe("https://huggingface.co/MuaraAI/muara-arus-1");
    expect(screen.getByRole("link", { name: "Ollama" }).getAttribute("href")).toBe("https://ollama.com/MuaraAI/muara-arus-1");
    expect(screen.getByRole("link", { name: "Threads" }).getAttribute("href")).toBe("https://www.threads.com/@muara.ai");
    expect(screen.getByRole("link", { name: "Instagram" }).getAttribute("href")).toBe("https://www.instagram.com/muara.ai/");
    expect(screen.getByRole("link", { name: "X" }).getAttribute("href")).toBe("https://x.com/MuaraAI");
    expect(screen.queryByText(/Tencent/i)).toBeNull();
    expect(screen.queryByText(/Zero Slop/i)).toBeNull();
    expect(screen.queryByText(/100% Independent/i)).toBeNull();
  });
});
