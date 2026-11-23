import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import DonateCta from "../src/components/landing/donate-cta";

describe("DonateCta", () => {
  it("links to the Sociabuzz page as a safe external link", () => {
    render(<DonateCta />);
    const link = screen.getByRole("link", { name: /dukung/i });
    expect(link.getAttribute("href")).toBe("https://sociabuzz.com/muaraai");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("does not mention the dead payment gateway or mandatory dues", () => {
    const { container } = render(<DonateCta />);
    expect(container.textContent).not.toMatch(/pakasir|qris|iuran/i);
  });
});
