import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Hero from "../src/components/landing/hero";

describe("Hero v2 Interactive Terminal", () => {
  it("renders status chips and switches terminal code snippets between curl, typescript, and response", () => {
    render(<Hero />);
    expect(screen.getByText(/15.5:1 Text Contrast/i)).toBeDefined();
    expect(screen.getByText(/Zero Font CDN/i)).toBeDefined();

    // Tab buttons
    const curlTab = screen.getByRole("button", { name: /^curl$/i });
    const tsTab = screen.getByRole("button", { name: /typescript/i });
    const resTab = screen.getByRole("button", { name: /json response/i });

    expect(curlTab).toBeDefined();
    expect(tsTab).toBeDefined();
    expect(resTab).toBeDefined();

    // Click TypeScript tab
    fireEvent.click(tsTab);
    expect(screen.getByText(/import { MuaraClient }/i)).toBeDefined();
  });
});
