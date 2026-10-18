import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import NotFound from "../src/app/not-found";

vi.mock("next/image", () => ({
  default: ({ priority: _priority, ...props }: React.ComponentProps<"img"> & { priority?: boolean }) => <img {...props} />,
}));

describe("not-found mascot state", () => {
  it("renders Mura's not-found pose and a real home link", () => {
    render(<NotFound />);
    expect(screen.getByTestId("mura-not-found")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kembali ke Beranda" }).getAttribute("href")).toBe("/");
  });
});
