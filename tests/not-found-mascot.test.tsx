import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import NotFoundView from "../src/components/ui/not-found-view";
import NotFound from "../src/app/not-found";

vi.mock("next/image", () => ({
  default: ({ priority: _priority, ...props }: React.ComponentProps<"img"> & { priority?: boolean }) => <img {...props} />,
}));

let requestLocale: string | null = null;
vi.mock("next/headers", () => ({ headers: async () => new Headers(requestLocale ? { "x-locale": requestLocale } : {}) }));

describe("not-found mascot state", () => {
  it("renders Mura's not-found pose and a real home link", () => {
    render(<NotFoundView locale="id" />);
    expect(screen.getByTestId("mura-not-found")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke Beranda" }).getAttribute("href")).toBe("/");
  });

  it("speaks English and stays on the English site under /en", () => {
    const { container } = render(<NotFoundView locale="en" />);
    expect(screen.getAllByText("Page not found")[0]).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to Home" }).getAttribute("href")).toBe("/en");
    expect(screen.getByRole("link", { name: "Join the community" }).getAttribute("href")).toBe("/en/join");
    for (const link of screen.getAllByRole("link", { name: "Code of Conduct" })) expect(link.getAttribute("href")).toBe("/en/code-of-conduct");
    expect(container.textContent).not.toMatch(/\b(yang|dan|dengan|untuk|Anda|Halaman tidak)\b/);
  });

  it("picks the language from the request header and defaults to Indonesian", async () => {
    requestLocale = "en";
    const { unmount } = render(await NotFound());
    expect(screen.getAllByText("Page not found")[0]).toBeTruthy();
    unmount();
    requestLocale = null;
    render(await NotFound());
    expect(screen.getAllByText("Halaman tidak ditemukan")[0]).toBeTruthy();
  });
});
