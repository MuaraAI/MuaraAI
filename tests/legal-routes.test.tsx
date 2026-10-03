import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import CodeOfConductPage from "../src/app/(public)/code-of-conduct/page";
import TermsPage from "../src/app/(public)/terms/page";
import PrivacyPage from "../src/app/(public)/privacy/page";

describe("Legal & Compliance Pages", () => {
  it("renders Code of Conduct with Anti-Slop and Anti-Joki rules", () => {
    render(<CodeOfConductPage />);
    expect(screen.getByText(/anti-slop/i)).toBeDefined();
    expect(screen.getByText(/anti-joki/i)).toBeDefined();
  });

  it("renders Terms of Service with meritocracy policy", () => {
    render(<TermsPage />);
    expect(screen.getByText(/terms of service/i)).toBeDefined();
  });

  it("renders Privacy Policy with GitHub identity disclosure", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/privacy policy/i)).toBeDefined();
  });
});
