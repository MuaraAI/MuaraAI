import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

let user: { id: string; user_metadata?: Record<string, string> } | null = { id: "u1", user_metadata: { user_name: "newcomer", full_name: "Budi Santoso" } };
let member: Record<string, unknown> | null = null;
let requestLocale: "id" | "en" = "id";
const formProps = vi.fn();
let shellProps: Record<string, unknown> | null = null;

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
  usePathname: () => "/dashboard",
}));
vi.mock("@/lib/locale-server", () => ({ currentLocale: async () => requestLocale }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user } }) },
    from: () => {
      const result = async () => ({ data: member });
      const chain: { single: typeof result; maybeSingle: typeof result; eq: () => typeof chain } = { single: result, maybeSingle: result, eq: () => chain };
      return { select: () => chain };
    },
  }),
}));
vi.mock("@/lib/supabase/admin", async () => {
  const server = await import("@/lib/supabase/server");
  return { createPrivilegedClient: () => server.createClient() };
});
vi.mock("@/components/portal/portal-shell", () => ({
  default: (props: { children: React.ReactNode } & Record<string, unknown>) => {
    shellProps = props;
    return <div data-testid="shell">{props.children}</div>;
  },
}));
vi.mock("@/components/auth/onboarding-view", () => ({
  default: async (props: unknown) => {
    formProps(props);
    return <div data-testid="application-form">form</div>;
  },
}));
vi.mock("@/components/portal/membership-exit-client", () => ({ default: () => <div>exit</div> }));

import PortalLayout from "../src/app/(portal)/layout";
import DashboardProfilePage from "../src/app/(portal)/dashboard/page";
import MembershipExitPage from "../src/app/(public)/membership-exit/page";

beforeEach(() => {
  user = { id: "u1", user_metadata: { user_name: "newcomer", full_name: "Budi Santoso" } };
  member = null;
  requestLocale = "id";
  formProps.mockClear();
  shellProps = null;
});

describe("portal layout for someone who signed in but has not applied", () => {
  it("lets them into the portal instead of sending them to a form, with their GitHub name and an applicant status", async () => {
    render(await PortalLayout({ children: <p>isi halaman</p> }));
    expect(screen.getByText("isi halaman")).toBeTruthy();
    expect(shellProps?.member).toMatchObject({ full_name: "Budi Santoso", github_username: "newcomer", registration_status: "applicant", is_maintainer: false });
    expect(shellProps?.locale).toBe("id");
  });

  it("falls back to the GitHub username when there is no full name", async () => {
    user = { id: "u1", user_metadata: { user_name: "newcomer" } };
    render(await PortalLayout({ children: <p>x</p> }));
    expect(shellProps?.member).toMatchObject({ full_name: "newcomer", github_username: "newcomer" });
  });

  it("still sends signed-out visitors to the login page and exited or banned members to their page", async () => {
    user = null;
    await expect(PortalLayout({ children: <p>x</p> })).rejects.toThrow("redirect:/login");
    user = { id: "u1" };
    member = { membership_status: "exited" };
    await expect(PortalLayout({ children: <p>x</p> })).rejects.toThrow("redirect:/membership-exit");
    member = { membership_status: "banned" };
    await expect(PortalLayout({ children: <p>x</p> })).rejects.toThrow("redirect:/membership-exit?status=banned");
  });
});

describe("dashboard for someone who has not applied", () => {
  it("asks them to apply and shows the application form inside the dashboard", async () => {
    render(await DashboardProfilePage());
    expect(screen.getByRole("heading", { name: "Ajukan keanggotaan" })).toBeTruthy();
    expect(screen.getByText(/Kamu sudah masuk/)).toBeTruthy();
    expect(screen.getByTestId("application-form")).toBeTruthy();
    expect(formProps).toHaveBeenCalledWith({ locale: "id", embedded: true });
  });

  it("says it in English when the portal is in English", async () => {
    requestLocale = "en";
    render(await DashboardProfilePage());
    expect(screen.getByRole("heading", { name: "Apply for membership" })).toBeTruthy();
    expect(screen.getByText(/You are signed in/)).toBeTruthy();
    expect(formProps).toHaveBeenCalledWith({ locale: "en", embedded: true });
  });
});

describe("membership page for someone who has not applied", () => {
  it("sends them to the dashboard, where they apply", async () => {
    await expect(MembershipExitPage()).rejects.toThrow("redirect:/dashboard");
  });
});
