import { describe, expect, it } from "vitest";
import { formatLongDate, formatMonthYear } from "./format-date";

describe("formatMonthYear", () => {
  it("formats an ISO date as short month and year", () => {
    expect(formatMonthYear("2026-01-15T00:00:00.000Z")).toBe("Jan 2026");
    expect(formatMonthYear("2026-10-27T00:00:00.000Z")).toBe("Oct 2026");
  });

  it("returns null for a missing date", () => {
    expect(formatMonthYear(null)).toBeNull();
  });

  it("does not shift the month for a UTC midnight date", () => {
    expect(formatMonthYear("2026-03-01T00:00:00.000Z")).toBe("Mar 2026");
  });
});

describe("formatLongDate", () => {
  it("formats an ISO date as a long date", () => {
    expect(formatLongDate("2026-10-27T00:00:00.000Z")).toBe("October 27, 2026");
  });

  it("returns null for a missing date", () => {
    expect(formatLongDate(null)).toBeNull();
  });

  it("keeps the day stable at UTC midnight", () => {
    expect(formatLongDate("2026-01-01T00:00:00.000Z")).toBe("January 1, 2026");
  });
});
