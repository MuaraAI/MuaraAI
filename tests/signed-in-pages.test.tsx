import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

let sessionUser: { id: string } | null = null;

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));
vi.mock("@/lib/session-user", () => ({ getSessionUser: async () => sessionUser }));
vi.mock("@/lib/dev-mock", () => ({ isDevMockEnabled: () => false }));
vi.mock("@/lib/supabase/server", () => ({ isSupabaseConfigured: () => false, createClient: async () => ({}) }));
vi.mock("@/lib/github-repos", () => ({ fetchOrgRepos: async () => ({ ok: false, repos: [] }) }));

import PublicLayout from "../src/app/(public)/layout";
import EnglishLayout from "../src/app/(english)/layout";
import LandingPage from "../src/app/(public)/page";
import MembersPage from "../src/app/(public)/members/page";
import LoginPage from "../src/app/(public)/login/page";
import EnglishHomePage from "../src/app/(english)/en/page";
import EnglishJoinPage from "../src/app/(english)/en/join/page";

beforeEach(() => {
  sessionUser = null;
});

const href = (name: RegExp | string) => screen.getAllByRole("link", { name })[0].getAttribute("href");

describe("navbar on the public pages", () => {
  it("shows Masuk and Daftar to a signed-out visitor", async () => {
    render(await PublicLayout({ children: <p>isi</p> }));
    expect(screen.getAllByText("Masuk").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Daftar").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
  });

  it("shows a Dashboard button instead of Masuk and Daftar to someone who is signed in", async () => {
    sessionUser = { id: "u1" };
    render(await PublicLayout({ children: <p>isi</p> }));
    expect(href("Dashboard")).toBe("/dashboard");
    expect(screen.queryByText("Masuk")).toBeNull();
    expect(screen.queryByText("Daftar")).toBeNull();
  });

  it("does the same on the English site", async () => {
    sessionUser = { id: "u1" };
    const { unmount } = render(await EnglishLayout({ children: <p>content</p> }));
    expect(href("Dashboard")).toBe("/dashboard");
    expect(screen.queryByText("Log in")).toBeNull();
    expect(screen.queryByText("Join")).toBeNull();
    unmount();

    sessionUser = null;
    render(await EnglishLayout({ children: <p>content</p> }));
    expect(screen.getAllByText("Log in").length).toBeGreaterThan(0);
    expect(href("Join")).toBe("/en/join");
  });
});

describe("sign-up calls to action for someone who is already signed in", () => {
  it("landing: the hero and the join section offer the dashboard, not another sign-up", async () => {
    sessionUser = { id: "u1" };
    render(await LandingPage({ searchParams: Promise.resolve({}) }));
    expect(screen.queryByText("Daftar dengan GitHub")).toBeNull();
    expect(screen.queryByText("Mulai Kirim Proof of Work Sekarang")).toBeNull();
    expect(screen.getAllByRole("link", { name: /Buka dashboard/ }).map((link) => link.getAttribute("href"))).toEqual(["/dashboard", "/dashboard"]);
  });

  it("landing: signed-out visitors still see the sign-up calls", async () => {
    render(await LandingPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("Daftar dengan GitHub")).toBeTruthy();
    expect(screen.getByText("Mulai Kirim Proof of Work Sekarang")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Buka dashboard/ })).toBeNull();
  });

  it("members directory: the sign-up button becomes a dashboard button", async () => {
    sessionUser = { id: "u1" };
    const { unmount } = render(await MembersPage());
    expect(screen.queryByText("Daftar dengan GitHub")).toBeNull();
    expect(href(/Buka dashboard/)).toBe("/dashboard");
    unmount();

    sessionUser = null;
    render(await MembersPage());
    expect(screen.getByText("Daftar dengan GitHub")).toBeTruthy();
  });

  it("English home: the hero offers the dashboard", async () => {
    sessionUser = { id: "u1" };
    const { unmount } = render(await EnglishHomePage());
    expect(screen.queryByText("Join with GitHub")).toBeNull();
    expect(href(/Open your dashboard/)).toBe("/dashboard");
    unmount();

    sessionUser = null;
    render(await EnglishHomePage());
    expect(screen.getByText("Join with GitHub")).toBeTruthy();
  });

  it("English join page: the button leads to the dashboard", async () => {
    sessionUser = { id: "u1" };
    const { unmount } = render(await EnglishJoinPage());
    expect(screen.queryByText("Continue with GitHub", { selector: "span" })).toBeNull();
    expect(href(/Go to your dashboard/)).toBe("/dashboard");
    unmount();

    sessionUser = null;
    render(await EnglishJoinPage());
    expect(screen.getByText("Continue with GitHub", { selector: "span" })).toBeTruthy();
  });
});

describe("the login page", () => {
  it("sends someone who is signed in to the dashboard instead of showing a login form", async () => {
    sessionUser = { id: "u1" };
    await expect(LoginPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("redirect:/dashboard");
  });

  it("still shows the form to a signed-out visitor", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { name: "Masuk ke MuaraAI" })).toBeTruthy();
  });
});
