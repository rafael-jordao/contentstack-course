import { describe, expect, it } from "vitest";
import { attempt } from "./result";

describe("attempt", () => {
  it("wraps a resolved value", async () => {
    const result = await attempt(Promise.resolve(["a", "b"]));

    expect(result).toEqual({ ok: true, data: ["a", "b"] });
  });

  it("captures a rejection instead of throwing", async () => {
    const error = new Error("network down");

    const result = await attempt(Promise.reject(error));

    expect(result).toEqual({ ok: false, error });
  });

  it("treats a resolved null as success", async () => {
    const result = await attempt(Promise.resolve(null));

    expect(result).toEqual({ ok: true, data: null });
  });
});
