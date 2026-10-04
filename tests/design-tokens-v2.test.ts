import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Fluid Currents v2 Design Tokens", () => {
  it("defines correct palette and radii in tailwind.config.ts", () => {
    const configPath = path.resolve(__dirname, "../tailwind.config.ts");
    const content = fs.readFileSync(configPath, "utf-8");

    expect(content).toContain("#072033"); // Primary Deep Riverbed Ink
    expect(content).toContain("#3B5A70"); // Secondary Muted Ocean
    expect(content).toContain("#F7FAFC"); // Estuary Mist Background
    expect(content).toContain("#D9E5ED"); // Still water stroke
    expect(content).toContain("#F0F7FB"); // Surface alt
    expect(content).toContain("diffusion"); // Diffusion shadow
  });

  it("loads local JetBrains Mono woff2 font in globals.css", () => {
    const cssPath = path.resolve(__dirname, "../src/app/globals.css");
    const content = fs.readFileSync(cssPath, "utf-8");

    expect(content).toContain("JetBrains Mono");
    expect(content).toContain("jetbrains-mono-v24-latin_latin-ext-regular.woff2");
    expect(content).toContain("#F7FAFC");
    expect(content).toContain("#072033");
  });
});
