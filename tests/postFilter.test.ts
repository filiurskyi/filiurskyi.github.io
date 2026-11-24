import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CollectionEntry } from "astro:content";
import { postFilter } from "@/utils/postFilter";

// An explicit timezone keeps the result independent of site.timezone.
const post = (data: Partial<CollectionEntry<"posts">["data"]>) =>
  ({
    data: { pubDatetime: new Date(), timezone: "UTC", ...data },
  }) as CollectionEntry<"posts">;

describe("postFilter in production", () => {
  beforeEach(() => {
    vi.stubEnv("DEV", false);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00Z"));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("drops drafts", () => {
    expect(postFilter(post({ draft: true }))).toBe(false);
  });

  it("keeps posts up to and including the build day", () => {
    expect(postFilter(post({ pubDatetime: new Date("2026-03-01") }))).toBe(
      true
    );
    expect(
      postFilter(post({ pubDatetime: new Date("2026-03-10T23:00:00Z") }))
    ).toBe(true);
  });

  it("drops posts dated after the build day", () => {
    expect(
      postFilter(post({ pubDatetime: new Date("2026-03-11T00:30:00Z") }))
    ).toBe(false);
  });

  it("compares days in the post's timezone", () => {
    // 2026-03-11 01:00 in Bangkok, while the build day there is still 03-10.
    const pubDatetime = new Date("2026-03-10T18:00:00Z");
    expect(postFilter(post({ pubDatetime }))).toBe(true);
    expect(postFilter(post({ pubDatetime, timezone: "Asia/Bangkok" }))).toBe(
      false
    );
  });
});

describe("postFilter in dev", () => {
  it("shows everything", () => {
    vi.stubEnv("DEV", true);
    expect(postFilter(post({ draft: true }))).toBe(true);
    vi.unstubAllEnvs();
  });
});
