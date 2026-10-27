import { beforeEach, describe, expect, it, vi } from "vitest";

const headerValues = new Map<string, string>();

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => headerValues.get(name) ?? null,
  }),
}));

const { isPreviewRequest, previewHost, readLivePreviewQuery } = await import(
  "./preview"
);

beforeEach(() => {
  headerValues.clear();
  vi.stubEnv("CONTENTSTACK_REGION", "EU");
});

describe("previewHost", () => {
  it("maps each region to its preview host", () => {
    const cases: Array<[string, string]> = [
      ["EU", "eu-rest-preview.contentstack.com"],
      ["NA", "rest-preview.contentstack.com"],
      ["US", "rest-preview.contentstack.com"],
      ["AU", "au-rest-preview.contentstack.com"],
      ["AZURE_EU", "azure-eu-rest-preview.contentstack.com"],
      ["GCP_NA", "gcp-na-rest-preview.contentstack.com"],
    ];

    for (const [region, host] of cases) {
      vi.stubEnv("CONTENTSTACK_REGION", region);
      expect(previewHost()).toBe(host);
    }
  });

  it("never returns the delivery host", () => {
    expect(previewHost()).not.toBe("eu-cdn.contentstack.com");
    expect(previewHost()).toContain("preview");
  });

  it("throws on an unknown region instead of guessing", () => {
    vi.stubEnv("CONTENTSTACK_REGION", "MARS");

    expect(() => previewHost()).toThrow();
  });
});

describe("isPreviewRequest", () => {
  it("is true only when a hash is present", () => {
    expect(isPreviewRequest({ live_preview: "abc" })).toBe(true);
    expect(isPreviewRequest({})).toBe(false);
    expect(isPreviewRequest({ live_preview: "" })).toBe(false);
    expect(isPreviewRequest({ entry_uid: "blt1" })).toBe(false);
  });
});

describe("readLivePreviewQuery", () => {
  it("reads the hash the proxy forwarded", async () => {
    headerValues.set("x-cs-live-preview", "hash-123");
    headerValues.set("x-cs-content-type-uid", "page");
    headerValues.set("x-cs-entry-uid", "blt1");

    await expect(readLivePreviewQuery()).resolves.toEqual({
      live_preview: "hash-123",
      content_type_uid: "page",
      entry_uid: "blt1",
      preview_timestamp: undefined,
    });
  });

  it("treats blank headers as absent, so empty strings never reach the SDK", async () => {
    headerValues.set("x-cs-live-preview", "   ");

    const query = await readLivePreviewQuery();

    expect(query.live_preview).toBeUndefined();
    expect(isPreviewRequest(query)).toBe(false);
  });

  it("returns an empty query when the proxy did not run", async () => {
    await expect(readLivePreviewQuery()).resolves.toEqual({
      live_preview: undefined,
      content_type_uid: undefined,
      entry_uid: undefined,
      preview_timestamp: undefined,
    });
  });
});
