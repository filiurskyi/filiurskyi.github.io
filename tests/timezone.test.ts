import { describe, expect, it, vi } from "vitest";
import { calendarDate } from "@/utils/calendarDate";
import { resolveTimezone } from "@/utils/resolveTimezone";

describe("resolveTimezone", () => {
  it("returns a known zone and UTC for none", () => {
    expect(resolveTimezone("Asia/Bangkok")).toBe("Asia/Bangkok");
    expect(resolveTimezone(undefined)).toBe("UTC");
  });

  it("falls back to UTC with one warning per unknown zone", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveTimezone("Mars/Olympus")).toBe("UTC");
    expect(resolveTimezone("Mars/Olympus")).toBe("UTC");
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe("calendarDate", () => {
  it("reads the UTC day as midnight in the zone", () => {
    const day = new Date("2026-01-01T00:00:00Z");
    expect(calendarDate(day, "America/New_York").toISOString()).toBe(
      "2026-01-01T05:00:00.000Z"
    );
    expect(calendarDate(day, "Asia/Bangkok").toISOString()).toBe(
      "2025-12-31T17:00:00.000Z"
    );
  });
});
