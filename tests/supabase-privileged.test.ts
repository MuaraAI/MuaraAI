import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseJsCreate = vi.fn((..._args: unknown[]) => ({ __privileged: true }));
vi.mock("@supabase/supabase-js", () => ({ createClient: (...args: unknown[]) => supabaseJsCreate(...args) }));

let userClient: { auth: { getUser: () => Promise<unknown> }; from: (table: string) => unknown };
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => userClient }));

import { createPrivilegedClient, getMaintainerClient } from "../src/lib/supabase/admin";

const memberRow = (row: unknown) => ({
  auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row }) }) }) }),
});

beforeEach(() => {
  supabaseJsCreate.mockClear();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
});

describe("createPrivilegedClient", () => {
  it("builds a service-role client without persisting a session", async () => {
    await createPrivilegedClient();
    expect(supabaseJsCreate).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-key",
      expect.objectContaining({ auth: expect.objectContaining({ persistSession: false }) })
    );
  });

  it("fails loudly when the service role key is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(createPrivilegedClient()).rejects.toThrow("SUPABASE_SERVICE_ROLE_KEY is not configured");
  });
});

describe("getMaintainerClient", () => {
  it("returns the privileged client for a maintainer", async () => {
    userClient = memberRow({ hierarchy: "maintainer", roles: [] });
    await expect(getMaintainerClient()).resolves.toEqual({ __privileged: true });
  });

  it("returns null for a regular member", async () => {
    userClient = memberRow({ hierarchy: "member", roles: [] });
    await expect(getMaintainerClient()).resolves.toBeNull();
    expect(supabaseJsCreate).not.toHaveBeenCalled();
  });

  it("returns null when nobody is signed in", async () => {
    userClient = { auth: { getUser: async () => ({ data: { user: null } }) }, from: () => ({}) };
    await expect(getMaintainerClient()).resolves.toBeNull();
    expect(supabaseJsCreate).not.toHaveBeenCalled();
  });
});
