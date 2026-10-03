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
      { order_id: "test_1", amount: 3000, project: "test" },
      { fetchFn: fetchMock as any, apiKey: "secret", project: "test" }
    );
    expect(result.success).toBe(false);
  });

  it("accepts completed transaction and confirms amount match", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        transaction: { status: "completed", amount: 3000, order_id: "test_2" },
      }),
    });
    const result = await verifyAndProcessPakasirWebhook(
      { order_id: "test_2", amount: 3000, project: "test" },
      { fetchFn: fetchMock as any, apiKey: "secret", project: "test" }
    );
    expect(result.success).toBe(true);
  });
});
