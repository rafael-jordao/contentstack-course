import { beforeEach, describe, expect, it, vi } from "vitest";

const findEntries = vi.fn();

vi.mock("@/lib/contentstack", () => ({
  findEntries: (...args: unknown[]) => findEntries(...args),
}));

const { SITE_CONFIG_CONTENT_TYPE, getSiteConfig, safeGtmId, safeScriptSrc } =
  await import("./site-config");

beforeEach(() => {
  vi.clearAllMocks();
  findEntries.mockResolvedValue([]);
});

describe("safeGtmId", () => {
  it("accepts a well formed container id", () => {
    expect(safeGtmId("GTM-ABC1234")).toBe("GTM-ABC1234");
  });

  it("normalizes case and whitespace", () => {
    expect(safeGtmId("  gtm-abc1234 ")).toBe("GTM-ABC1234");
  });

  it("rejects anything that is not a container id", () => {
    expect(safeGtmId("UA-12345-1")).toBeNull();
    expect(safeGtmId("GTM-")).toBeNull();
    expect(safeGtmId("")).toBeNull();
    expect(safeGtmId(undefined)).toBeNull();
  });

  it("rejects an id carrying a script break-out", () => {
    expect(safeGtmId("GTM-ABC');alert(1);//")).toBeNull();
    expect(safeGtmId("GTM-ABC</script>")).toBeNull();
  });
});

describe("safeScriptSrc", () => {
  it("accepts an https url", () => {
    expect(safeScriptSrc("https://example.com/tag.js")).toBe(
      "https://example.com/tag.js",
    );
  });

  it("rejects http, so a script cannot load over plain text", () => {
    expect(safeScriptSrc("http://example.com/tag.js")).toBeNull();
  });

  it("rejects javascript and data urls", () => {
    expect(safeScriptSrc("javascript:alert(1)")).toBeNull();
    expect(safeScriptSrc("data:text/javascript,alert(1)")).toBeNull();
  });

  it("rejects a value that is not a url at all", () => {
    expect(safeScriptSrc("not a url")).toBeNull();
    expect(safeScriptSrc("")).toBeNull();
    expect(safeScriptSrc(undefined)).toBeNull();
  });
});

describe("getSiteConfig", () => {
  it("resolves the header and footer references", async () => {
    await getSiteConfig();

    expect(findEntries).toHaveBeenCalledWith(SITE_CONFIG_CONTENT_TYPE, {
      limit: 1,
      includeReference: ["default_header", "default_footer"],
    });
  });

  it("unwraps the single-item arrays the api returns for references", async () => {
    findEntries.mockResolvedValue([
      {
        site_name: "Acme",
        default_header: [{ uid: "h1", title: "Main header" }],
        default_footer: [{ uid: "f1", title: "Main footer" }],
      },
    ]);

    const config = await getSiteConfig();

    expect(config?.header).toEqual({ uid: "h1", title: "Main header" });
    expect(config?.footer).toEqual({ uid: "f1", title: "Main footer" });
  });

  it("returns nulls when the references are empty", async () => {
    findEntries.mockResolvedValue([{ site_name: "Acme" }]);

    const config = await getSiteConfig();

    expect(config?.header).toBeNull();
    expect(config?.footer).toBeNull();
    expect(config?.scripts).toEqual({});
  });

  it("returns null when no config entry is published", async () => {
    await expect(getSiteConfig()).resolves.toBeNull();
  });
});
