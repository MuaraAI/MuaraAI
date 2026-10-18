import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import SyndicateRoster from "../src/components/landing/syndicate-roster";

describe("national maintainer roster", () => {
  it("renders corrected names, NIMs, order, and Builder roles", () => {
    render(<SyndicateRoster initialMembers={[]} />);
    const text = document.body.textContent || "";
    expect(text).toContain("Yuken Velino | 15260767");
    expect(text).toContain("Muhammad Raffli Aldiansyah | 15260161");
    expect(text).toContain("Verzio Yamanansyah | 15260225");
    expect(text.indexOf("Yuken Velino | 15260767")).toBeLessThan(text.indexOf("Muhammad Raffli Aldiansyah | 15260161"));
    expect(text.indexOf("Muhammad Raffli Aldiansyah | 15260161")).toBeLessThan(text.indexOf("Verzio Yamanansyah | 15260225"));
    expect(screen.queryByText("Creative")).toBeNull();
  });
});
