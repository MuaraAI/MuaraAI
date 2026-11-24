import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import TierBadge from "../src/components/members/tier-badge";

describe("TierBadge", () => {
  it("renders nothing for tier 0, undefined, or an unknown tier", () => {
    for (const tier of [0, undefined, 9, -1]) {
      const { container, unmount } = render(<TierBadge tier={tier} streak={5} />);
      expect(container.textContent).toBe("");
      unmount();
    }
  });

  it("shows the tier name", () => {
    const { unmount } = render(<TierBadge tier={4} />);
    expect(screen.getByText("Samudra")).toBeTruthy();
    unmount();
    render(<TierBadge tier={1} />);
    expect(screen.getByText("Riak")).toBeTruthy();
  });

  it("shows the streak only from 2 months", () => {
    const { unmount } = render(<TierBadge tier={2} streak={1} />);
    expect(screen.queryByText(/bulan berturut-turut/)).toBeNull();
    unmount();
    render(<TierBadge tier={2} streak={3} />);
    expect(screen.getByText("3 bulan berturut-turut")).toBeTruthy();
  });
});
