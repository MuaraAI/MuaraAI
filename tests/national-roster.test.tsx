import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import SyndicateRoster from "../src/components/landing/syndicate-roster";

describe("national maintainer roster", () => {
  it("renders corrected names, NIMs, order, and roles", () => {
    render(<SyndicateRoster initialMembers={[]} />);
    const text = document.body.textContent || "";
    for (const nim of ["15260767", "15260161", "15260225"]) expect(text).toContain(`NIM ${nim}`);
    expect(text.indexOf("Yuken Velino")).toBeLessThan(text.indexOf("Muhammad Raffli Aldiansyah"));
    expect(text.indexOf("Muhammad Raffli Aldiansyah")).toBeLessThan(text.indexOf("Verzio Yamanansyah"));
    const roles = (name: string) => screen.getByRole("list", { name: `Peran ${name}` }).textContent;
    expect(roles("Yuken Velino")).toContain("AI Engineer");
    expect(roles("Muhammad Raffli Aldiansyah")).toContain("Backend");
    expect(roles("Verzio Yamanansyah")).toContain("Desainer");
    expect(roles("Verzio Yamanansyah")).not.toContain("Handle UI");
    expect(screen.queryByText("Creative")).toBeNull();
  });
});
