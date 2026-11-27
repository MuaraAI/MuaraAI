import { beforeEach, describe, expect, it, vi } from "vitest";

let configured = true;
let devMock = false;
let claims: { data: { claims: { sub?: string } } | null; error: unknown } = { data: { claims: { sub: "u1" } }, error: null };
const getClaims = vi.fn(async () => claims);
let createClientError: Error | null = null;

vi.mock("@/lib/supabase/server", () => ({
  isSupabaseConfigured: () => configured,
  createClient: async () => {
    if (createClientError) throw createClientError;
    return { auth: { getClaims } };
  },
}));
vi.mock("@/lib/dev-mock", () => ({ isDevMockEnabled: () => devMock }));

import { getSessionUser } from "../src/lib/session-user";

beforeEach(() => {
  configured = true;
  devMock = false;
  claims = { data: { claims: { sub: "u1" } }, error: null };
  createClientError = null;
  getClaims.mockClear();
});

describe("getSessionUser (what the page shows, never what a person may do)", () => {
  it("returns the signed-in user from the verified claims", async () => {
    expect(await getSessionUser()).toEqual({ id: "u1" });
  });

  it("returns null when nobody is signed in or the claims have no subject", async () => {
    claims = { data: null, error: null };
    expect(await getSessionUser()).toBeNull();
    claims = { data: { claims: {} }, error: null };
    expect(await getSessionUser()).toBeNull();
  });

  it("returns null instead of throwing when the session cannot be read", async () => {
    getClaims.mockRejectedValueOnce(new Error("boom"));
    expect(await getSessionUser()).toBeNull();
    createClientError = new Error("no cookies here");
    expect(await getSessionUser()).toBeNull();
  });

  it("does not touch Supabase when it is not configured, except in the local dummy mode", async () => {
    configured = false;
    expect(await getSessionUser()).toBeNull();
    expect(getClaims).not.toHaveBeenCalled();

    devMock = true;
    expect(await getSessionUser()).toEqual({ id: "u1" });
  });
});
