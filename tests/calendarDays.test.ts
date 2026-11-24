import { describe, expect, it } from "vitest";
import { withCalendarDays } from "@/utils/calendarDate";
import { dateOnlyKeys, frontmatterOf } from "@/utils/contentFiles";
import { postEntryId } from "@/utils/postEntryId";

const md = (frontmatter: string) => `---\n${frontmatter}\n---\n\nBody.\n`;

describe("dateOnlyKeys", () => {
  it("finds values written as a bare YYYY-MM-DD", () => {
    const source = md(
      [
        "pubDatetime: 2026-03-01",
        "modDatetime: 2026-03-01T00:00:00Z",
        "updated: 2026-03-01T01:00:00+01:00",
        'quoted: "2026-03-01"',
        "commented: 2026-03-02 # a day",
      ].join("\n")
    );
    expect([...dateOnlyKeys(source)].sort()).toEqual([
      "commented",
      "pubDatetime",
    ]);
  });

  it("follows an alias to a bare date", () => {
    expect([...dateOnlyKeys(md("a: &d 2026-03-01\nb: *d"))].sort()).toEqual([
      "a",
      "b",
    ]);
  });

  it("is empty without YAML frontmatter", () => {
    expect(dateOnlyKeys("No frontmatter.").size).toBe(0);
    expect(dateOnlyKeys("+++\ndate = 2026-03-01\n+++\n").size).toBe(0);
  });
});

describe("withCalendarDays", () => {
  const read = (frontmatter: string, zone: string) => {
    const source = md(frontmatter);
    return withCalendarDays(frontmatterOf(source), source, zone);
  };

  it("reads a bare date as midnight in the zone", () => {
    expect(
      read("pubDatetime: 2026-03-01", "America/New_York").pubDatetime
    ).toEqual(new Date("2026-03-01T05:00:00Z"));
  });

  it("keeps an explicit midnight UTC as that instant", () => {
    expect(
      read("pubDatetime: 2026-03-01T00:00:00Z", "America/New_York").pubDatetime
    ).toEqual(new Date("2026-03-01T00:00:00Z"));
    expect(
      read("updated: 2026-03-01T01:00:00+01:00", "Asia/Bangkok").updated
    ).toEqual(new Date("2026-03-01T00:00:00Z"));
  });
});

describe("postEntryId", () => {
  const id = (frontmatter: string, zone: string) => {
    const source = md(frontmatter);
    return postEntryId("2026/post.md", frontmatterOf(source), zone, source);
  };

  it("checks a bare date's year in the post timezone", () => {
    expect(id("pubDatetime: 2026-01-01", "America/New_York")).toBe("2026/post");
  });

  it("checks an explicit midnight UTC as that instant", () => {
    expect(() =>
      id("pubDatetime: 2026-01-01T00:00:00Z", "America/New_York")
    ).toThrow(/folder year 2026 does not match pubDatetime year 2025/);
    expect(
      id(
        "pubDatetime: 2026-01-01T00:00:00Z\ntimezone: Asia/Bangkok",
        "America/New_York"
      )
    ).toBe("2026/post");
  });
});
