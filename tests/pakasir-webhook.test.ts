import { describe, it, expect, vi } from "vitest";
import { verifyAndProcessPakasirWebhook } from "../src/lib/pakasir";

describe("Pakasir Webhook & Server-to-Server Verification", () => {
  it("rejects non-completed transaction status from Pakasir verification", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        transaction: { status: "pending", amount: 3000, order_id: "test_1" },
      }),
    });
    const result = await verifyAndProcessPakasirWebhook(
      { order_id: "test_1", amount: 3000 },
      { fetchFn: fetchMock as any, apiKey: "test-key", project: "test" }
    );
    expect(result.success).toBe(false);
  });

  it("accepts completed transaction and confirms amount match", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        transaction: { status: "completed", amount: 3000, order_id: "test_2", project: "test" },
      }),
    });
    const result = await verifyAndProcessPakasirWebhook(
      { order_id: "test_2", amount: 3000 },
      { fetchFn: fetchMock as any, apiKey: "test-key", project: "test" }
    );
    expect(result.success).toBe(true);
  });

  it("pins verification to the configured project and rejects foreign projects", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        transaction: {
          status: "completed",
          amount: 3000,
          order_id: "test_3",
          project: "someone-else",
        },
      }),
    });
    const result = await verifyAndProcessPakasirWebhook(
      { order_id: "test_3", amount: 3000 },
      { fetchFn: fetchMock as any, apiKey: "test-key", project: "test" }
    );
    expect(result.success).toBe(false);
  });

  it("sends the configured project, not a caller-supplied one, to Pakasir", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        transaction: {
          status: "completed",
          amount: 3000,
          order_id: "test_4",
          project: "test",
        },
      }),
    });
    await verifyAndProcessPakasirWebhook(
      { order_id: "test_4", amount: 3000 },
      { fetchFn: fetchMock as any, apiKey: "test-key", project: "test" }
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).project).toBe("test");
  });
});
