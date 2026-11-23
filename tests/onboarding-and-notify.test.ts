import { describe, it, expect } from "vitest";
import { notifyMaintainers } from "../src/lib/notify";

describe("Maintainer Notification Dispatcher", () => {
  it("handles missing webhook variables gracefully without throwing", async () => {
    // Should resolve without unhandled exceptions
    await expect(notifyMaintainers("Test Title", "Test Message")).resolves.not.toThrow();
  });
});
