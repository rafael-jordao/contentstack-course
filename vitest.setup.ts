import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

/**
 * `cacheLife` and `cacheTag` only work inside a Next request scope, so the
 * adapters that call them are unusable in tests without this.
 */
/** Draft mode is off by default; tests that need it on override this per file. */
vi.mock("next/headers", () => ({
  draftMode: async () => ({
    isEnabled: false,
    enable: vi.fn(),
    disable: vi.fn(),
  }),
  headers: async () => new Headers(),
  cookies: async () => ({ get: () => undefined, has: () => false }),
}));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
}));

/**
 * Vitest never reads next.config.ts, so the real next/image would fall back to
 * the default optimizer and report urls that production never serves. The
 * custom loader is covered by its own unit test instead.
 */
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) =>
    createElement("img", {
      src: props.src,
      alt: props.alt,
      className: props.className,
    }),
}));

afterEach(() => {
  cleanup();
});
