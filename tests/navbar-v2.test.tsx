import { beforeEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import Navbar from "../src/components/landing/navbar";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

beforeEach(() => {
  pathname = "/";
});

describe("Public navigation", () => {
  it("links only to pages that exist and has a single sign-up button", () => {
    render(<Navbar user={null} />);
    const links = Object.fromEntries(screen.getAllByRole("link").map((link) => [link.textContent?.trim(), link.getAttribute("href")]));

    expect(links["Project"]).toBe("/projects");
    expect(links["Anggota"]).toBe("/members");
    expect(links["Aturan"]).toBe("/code-of-conduct");
    expect(links["Masuk"]).toBe("/login");
    expect(screen.getAllByRole("link", { name: "Daftar" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Daftar" }).getAttribute("href")).toBe("/onboarding");
    expect(screen.queryByText("Maintainers")).toBeNull();
  });

  it("shows the dashboard instead of sign-in and sign-up when logged in", () => {
    render(<Navbar user={{ id: "u1" }} />);
    expect(screen.getByRole("link", { name: /Dashboard/ }).getAttribute("href")).toBe("/dashboard");
    expect(screen.queryByRole("link", { name: "Daftar" })).toBeNull();
    expect(screen.queryByRole("link", { name: /Masuk/ })).toBeNull();
  });

  it("marks the current page", () => {
    pathname = "/members";
    render(<Navbar user={null} />);
    expect(screen.getByRole("link", { name: "Anggota" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Project" }).getAttribute("aria-current")).toBeNull();
  });

  it("opens and closes the mobile menu with the button and Escape", () => {
    render(<Navbar user={null} />);
    const button = screen.getByRole("button", { name: /menu/i });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("navigation", { name: "Menu mobile" })).toBeNull();

    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = screen.getByRole("navigation", { name: "Menu mobile" });
    expect(within(panel).getByRole("link", { name: "Project" }).getAttribute("href")).toBe("/projects");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("navigation", { name: "Menu mobile" })).toBeNull();
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("returns focus to the menu button when Escape closes the panel", () => {
    render(<Navbar user={null} />);
    const button = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(button);
    within(screen.getByRole("navigation", { name: "Menu mobile" })).getByRole("link", { name: "Anggota" }).focus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(button);
  });

  it("only points aria-controls at the panel while it exists", () => {
    render(<Navbar user={null} />);
    const button = screen.getByRole("button", { name: /menu/i });
    expect(button.getAttribute("aria-controls")).toBeNull();
    fireEvent.click(button);
    expect(button.getAttribute("aria-controls")).toBe("mobile-menu");
    expect(document.getElementById("mobile-menu")).toBeTruthy();
  });

  it("closes the mobile menu after choosing a link", () => {
    render(<Navbar user={null} />);
    fireEvent.click(screen.getByRole("button", { name: /menu/i }));
    fireEvent.click(within(screen.getByRole("navigation", { name: "Menu mobile" })).getByRole("link", { name: "Anggota" }));
    expect(screen.queryByRole("navigation", { name: "Menu mobile" })).toBeNull();
  });
});
