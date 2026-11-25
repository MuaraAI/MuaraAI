import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Footer from "../src/components/landing/footer";

describe("Footer language", () => {
  it("is Indonesian by default and links to both languages", () => {
    render(<Footer />);
    expect(screen.getByText("Ke atas")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Bahasa Indonesia" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "English" }).getAttribute("href")).toBe("/en");
    expect(screen.getByRole("link", { name: "Bahasa Indonesia" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: "English" }).getAttribute("aria-current")).toBeNull();
  });

  it("speaks English on the English site and marks English as current", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText("Back to top")).toBeTruthy();
    expect(screen.getByText("Partnership enquiries")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Products" })).toBeTruthy();
    expect(screen.queryByText("Ke atas")).toBeNull();
    expect(screen.queryByText("Hubungi kemitraan")).toBeNull();
    expect(screen.getByRole("link", { name: "English" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: "Bahasa Indonesia" }).getAttribute("aria-current")).toBeNull();
  });
});
