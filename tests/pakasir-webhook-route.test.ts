import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const verifyMock = vi.fn();
const notifyMock = vi.fn();
const createClientMock = vi.fn();

vi.mock("@/lib/pakasir", () => ({
  verifyAndProcessPakasirWebhook: (...args: unknown[]) => verifyMock(...args),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

vi.mock("@/lib/notify", () => ({
  notifyMaintainers: (...args: unknown[]) => notifyMock(...args),
}));

import { POST } from "../src/app/api/webhooks/pakasir/route";
import { DUES_CYCLE_DAYS, DUES_WEEKLY_FEE } from "../src/lib/constants";

const MEMBER_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const ORDER_ID = `dues_${MEMBER_ID}_1770000000`;

type DbResult = { data?: unknown; error?: unknown };

const ok = (data: unknown = null): DbResult => ({ data, error: null });

function chain(result: DbResult) {
  const link: {
    select: () => typeof link;
    eq: () => typeof link;
    maybeSingle: () => Promise<DbResult>;
    update: () => typeof link;
    insert: () => Promise<DbResult>;
    then: (resolve: (value: DbResult) => unknown) => Promise<unknown>;
  } = {
    select: () => link,
    eq: () => link,
    maybeSingle: () => Promise.resolve(result),
    update: () => link,
    insert: () => Promise.resolve(result),
    then: (resolve) => Promise.resolve(result).then(resolve),
  };
  return link;
}

function dbMock(config: {
  existingTx?: DbResult;
  member?: DbResult;
  memberUpdate?: DbResult;
  txInsert?: DbResult;
} = {}) {
  const memberUpdateLink = chain(config.memberUpdate ?? ok(null));
  const txInsertLink = chain(config.txInsert ?? ok(null));
  const tables = {
    members: {
      select: () => chain(config.member ?? ok(null)),
      update: memberUpdateLink.update,
    },
    treasury_transactions: {
      select: () => chain(config.existingTx ?? ok(null)),
      insert: txInsertLink.insert,
    },
  };
  const spies = {
    memberUpdate: vi.spyOn(tables.members, "update"),
    txInsert: vi.spyOn(tables.treasury_transactions, "insert"),
  };
  createClientMock.mockReturnValue({ from: (table: string) => (tables as never)[table] });
  return { tables, spies };
}

function member(overrides: Record<string, unknown> = {}) {
  return {
    id: MEMBER_ID,
    full_name: "Rani",
    dues_valid_until: "2026-01-01",
    ...overrides,
  };
}

function post(body: unknown) {
  const request = new Request("https://muaraai.com/api/webhooks/pakasir", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(request as never);
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://db.example.com";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  process.env.PAKASIR_PROJECT = "muaraai";
  vi.spyOn(console, "error").mockImplementation(() => {});
  verifyMock.mockReset();
  notifyMock.mockReset().mockResolvedValue({});
  createClientMock.mockReset();
  verifyMock.mockResolvedValue({
    success: true,
    transaction: {
      order_id: ORDER_ID,
      amount: DUES_WEEKLY_FEE,
      project: "muaraai",
      status: "completed",
      payment_method: "qris",
      completed_at: "2026-01-01T00:00:00Z",
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Pakasir webhook route", () => {
  it("rejects a payload without order_id or a numeric amount", async () => {
    const res = await post({ amount: "abc" });
    expect(res.status).toBe(400);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("never forwards the caller-supplied project to verification", async () => {
    dbMock({ member: ok(member()) });
    await post({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE, project: "attacker-project" });
    expect(verifyMock).toHaveBeenCalledWith({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE });
  });

  it("returns 401 when server-to-server verification fails", async () => {
    verifyMock.mockResolvedValue({ success: false });
    const res = await post({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE });
    expect(res.status).toBe(401);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("returns 200 without re-crediting an already processed payment", async () => {
    const { spies } = dbMock({ existingTx: ok({ id: "tx-1" }) });
    const res = await post({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE });
    expect(res.status).toBe(200);
    expect(spies.txInsert).not.toHaveBeenCalled();
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it("returns 500 on an idempotency query error without leaking the DB message", async () => {
    dbMock({ existingTx: { data: null, error: { message: "relation does not exist" } } });
    const res = await post({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE });
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("relation does not exist");
  });

  it("refuses to attribute a payment whose order id has no valid member id", async () => {
    const { spies } = dbMock();
    const res = await post({ order_id: "dues_not-a-uuid_1770000000", amount: DUES_WEEKLY_FEE });
    expect(res.status).toBe(422);
    expect(spies.memberUpdate).not.toHaveBeenCalled();
    expect(spies.txInsert).not.toHaveBeenCalled();
  });

  it("refuses to credit dues when the member is not found", async () => {
    const { spies } = dbMock({ member: ok(null) });
    const res = await post({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE });
    expect(res.status).toBe(422);
    expect(spies.memberUpdate).not.toHaveBeenCalled();
    expect(spies.txInsert).not.toHaveBeenCalled();
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it("returns 500 when the member update fails", async () => {
    dbMock({ member: ok(member()), memberUpdate: { data: null, error: { message: "boom" } } });
    const res = await post({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE });
    expect(res.status).toBe(500);
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it("returns 500 when the treasury insert fails", async () => {
    dbMock({ member: ok(member()), txInsert: { data: null, error: { message: "boom" } } });
    const res = await post({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE });
    expect(res.status).toBe(500);
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it("treats a duplicate-key insert as already processed", async () => {
    dbMock({
      member: ok(member()),
      txInsert: { data: null, error: { code: "23505", message: "duplicate key value" } },
    });
    const res = await post({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE });
    expect(res.status).toBe(200);
  });

  it("extends dues using the shared constants and notifies maintainers", async () => {
    const { spies } = dbMock({ member: ok(member({ dues_valid_until: "2099-01-01" })) });
    verifyMock.mockResolvedValue({
      success: true,
      transaction: {
        order_id: ORDER_ID,
        amount: DUES_WEEKLY_FEE * 2,
        project: "muaraai",
        status: "completed",
        payment_method: "qris",
        completed_at: "2026-01-01T00:00:00Z",
      },
    });
    const res = await post({
      order_id: ORDER_ID,
      amount: DUES_WEEKLY_FEE * 2,
      project: "attacker-project",
    });
    expect(res.status).toBe(200);
    expect(DUES_CYCLE_DAYS).toBe(7);
    // Rp 6000 == two weekly cycles == 14 days from the future valid-until date
    expect(spies.memberUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true, dues_valid_until: "2099-01-15" })
    );
    expect(spies.txInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "income",
        amount: DUES_WEEKLY_FEE * 2,
        member_id: MEMBER_ID,
        payment_ref: ORDER_ID,
      })
    );
    expect(notifyMock).toHaveBeenCalledTimes(1);
  });

  it("returns a generic message when an unexpected exception escapes", async () => {
    verifyMock.mockRejectedValue(new Error("pakasir key sk_live_leak"));
    const res = await post({ order_id: ORDER_ID, amount: DUES_WEEKLY_FEE });
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("sk_live_leak");
  });
});
