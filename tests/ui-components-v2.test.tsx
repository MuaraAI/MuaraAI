import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import WaveDivider from "../src/components/ui/wave-divider";

describe("WaveDivider Component", () => {
  it("renders asymmetric SVG wave stroke with correct viewbox", () => {
    const { container } = render(<WaveDivider />);
    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 1200 120");

    const path = container.querySelector("path");
    expect(path?.getAttribute("stroke")).toBe("#D9E5ED");
  });
});
