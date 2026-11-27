import { describe, expect, it } from "vitest";
import { pageLastmod } from "@/utils/sitemapLastmod";

const meta = (key: string, value: string) =>
  `<meta property="article:${key}" content="${value}">`;

describe("pageLastmod", () => {
  it("prefers the modified time", () => {
    const html =
      meta("published_time", "2026-01-01T00:00:00.000Z") +
      meta("modified_time", "2026-02-01T00:00:00.000Z");
    expect(pageLastmod(html)).toBe("2026-02-01T00:00:00.000Z");
  });

  it("falls back to the published time", () => {
    expect(
      pageLastmod(meta("published_time", "2026-01-01T00:00:00.000Z"))
    ).toBe("2026-01-01T00:00:00.000Z");
  });

  it("is undefined for a page without a date", () => {
    expect(pageLastmod("<title>Tags</title>")).toBeUndefined();
  });
});
