import { describe, expect, it } from "vitest";
import { BUTTON_LABEL_PLACEHOLDER } from "@/utils/markers";
import { hasSmallWebPage, ringLinks } from "@/utils/smallWeb";

const site = new URL("https://me.example");
const ring = {
  name: "Ring",
  url: "https://ring.example/",
  prev: "https://ring.example/prev/me",
  next: "https://ring.example/next/me",
  random: "https://ring.example/random",
};

describe("ringLinks", () => {
  it("orders previous, ring, next and random", () => {
    expect(ringLinks(ring, site)).toEqual([
      { kind: "prev", href: ring.prev },
      { kind: "ring", href: ring.url },
      { kind: "next", href: ring.next },
      { kind: "random", href: ring.random },
    ]);
  });

  it("keeps the ring alone when it has no navigation", () => {
    expect(ringLinks({ name: "Ring", url: ring.url }, site)).toEqual([
      { kind: "ring", href: ring.url },
    ]);
  });

  it("links each URL once across the page", () => {
    const seen = new Set<string>();
    ringLinks(ring, site, seen);
    expect(
      ringLinks(
        { name: "Again", url: "http://www.ring.example", random: ring.random },
        site,
        seen
      )
    ).toEqual([{ kind: "ring", href: undefined }]);
  });
});

describe("hasSmallWebPage", () => {
  const unset = { label: BUTTON_LABEL_PLACEHOLDER, icon: "sparkle" };
  it("needs a webring or a set button label", () => {
    expect(hasSmallWebPage({ webrings: [], button: unset })).toBe(false);
    expect(hasSmallWebPage({ webrings: [ring], button: unset })).toBe(true);
    expect(
      hasSmallWebPage({ webrings: [], button: { ...unset, label: "me" } })
    ).toBe(true);
  });
});
