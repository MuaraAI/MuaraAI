import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { MURA_POSE_ASSETS, MuraAnimated, type MuraPose } from "./mura-animated";

vi.mock("next/image", () => ({
  default: ({
    priority: _priority,
    ...props
  }: ComponentProps<"img"> & { priority?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const POSES: [MuraPose, string][] = [
  ["welcome", "/mascot/mura/welcome-onboarding-1.jpeg"],
  ["learning", "/mascot/mura/learning-learn-2.jpeg"],
  ["building", "/mascot/mura/building-project-workspace-3.jpeg"],
  ["empty", "/mascot/mura/empty-state-nothing-yet-5.jpeg"],
  ["maintenance", "/mascot/mura/error-maintenance-needs-attention-6.jpeg"],
  ["not-found", "/mascot/mura/404-7.jpeg"],
];

function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
}

function removeMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: undefined,
  });
}

afterEach(() => {
  cleanup();
  removeMatchMedia();
});

describe("MuraAnimated", () => {
  it.each(POSES)("maps %s to the correct asset", (pose, path) => {
    removeMatchMedia();
    expect(MURA_POSE_ASSETS[pose]).toBe(path);
    render(<MuraAnimated pose={pose} alt={`alt for ${pose}`} />);
    expect(screen.getByRole("img").getAttribute("src")).toBe(path);
  });

  it.each(POSES)("renders supplied alt text for %s", (pose) => {
    removeMatchMedia();
    render(<MuraAnimated pose={pose} alt={`Mura, ${pose} state`} />);
    expect(screen.getByAltText(`Mura, ${pose} state`)).toBeTruthy();
  });

  it("covers every pose exactly once", () => {
    expect(Object.keys(MURA_POSE_ASSETS).sort()).toEqual(
      POSES.map(([p]) => p).sort(),
    );
  });

  it("falls back safely for an unknown pose at runtime", () => {
    removeMatchMedia();
    render(<MuraAnimated pose={"nope" as MuraPose} alt="fallback" />);
    expect(screen.getByRole("img").getAttribute("src")).toBe(
      MURA_POSE_ASSETS.empty,
    );
  });

  it("renders without window.matchMedia", () => {
    removeMatchMedia();
    expect(() =>
      render(<MuraAnimated pose="welcome" alt="Mura waving" />),
    ).not.toThrow();
  });

  it("animates when motion is allowed", () => {
    stubMatchMedia(false);
    const { container } = render(<MuraAnimated pose="learning" alt="Mura reading" />);
    expect(container.firstElementChild?.getAttribute("data-motion")).toBe("full");
  });

  it("applies no movement when reduced motion is preferred", () => {
    stubMatchMedia(true);
    const { container } = render(<MuraAnimated pose="building" alt="Mura building" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.getAttribute("data-motion")).toBe("reduced");
    expect(wrapper.getAttribute("style")).toBeNull();
    expect(screen.getByAltText("Mura building")).toBeTruthy();
  });

  it("marks decorative images with empty alt and aria-hidden", () => {
    removeMatchMedia();
    const { container } = render(<MuraAnimated pose="empty" alt="ignored" decorative />);
    const img = container.querySelector("img")!;
    expect(img.getAttribute("alt")).toBe("");
    expect(img.getAttribute("aria-hidden")).toBe("true");
  });

  it("does not render a dead button or link when interactive is false", () => {
    removeMatchMedia();
    render(<MuraAnimated pose="building" alt="Mura building" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
