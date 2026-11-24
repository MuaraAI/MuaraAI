import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

const runMock = vi.fn();
vi.mock("@/lib/contributions/engine", () => ({ runContributionSync: (...args: unknown[]) => runMock(...args) }));
vi.mock("@/lib/contributions/supabase-deps", () => ({ buildSupabaseDeps: () => ({ built: true }) }));
vi.mock("@/lib/supabase/admin", () => ({ createPrivilegedClient: async () => ({}) }));

import { GET } from "../src/app/api/cron/contributions/route";

const call = (headers: Record<string, string> = {}) =>
  GET(new Request("https://muaraai.com/api/cron/contributions", { headers }));

beforeEach(() => {
  runMock.mockReset().mockResolvedValue({ month: "2026-12-01", dryRun: true, synced: 3 });
  process.env.CRON_SECRET = "s3cret-value";
});

describe("GET /api/cron/contributions", () => {
  it("refuses to run when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const response = await call({ authorization: "Bearer anything" });
    expect(response.status).toBe(500);
    expect(runMock).not.toHaveBeenCalled();
  });

  it("rejects a missing or wrong secret", async () => {
    expect((await call()).status).toBe(401);
    expect((await call({ authorization: "Bearer wrong" })).status).toBe(401);
    expect((await call({ authorization: "s3cret-value" })).status).toBe(401);
    expect(runMock).not.toHaveBeenCalled();
  });

  it("runs the sync and returns the summary for the right secret", async () => {
    const response = await call({ authorization: "Bearer s3cret-value" });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, summary: { month: "2026-12-01", dryRun: true, synced: 3 } });
    expect(runMock).toHaveBeenCalledTimes(1);
  });

  it("hides internal error details when the sync throws", async () => {
    runMock.mockRejectedValue(new Error("service role key leaked in message"));
    const response = await call({ authorization: "Bearer s3cret-value" });
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("leaked");
  });
});

describe("vercel.json", () => {
  it("schedules the contribution cron once a day", () => {
    const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../vercel.json"), "utf8"));
    expect(config.crons).toEqual([{ path: "/api/cron/contributions", schedule: "0 17 * * *" }]);
  });
});
