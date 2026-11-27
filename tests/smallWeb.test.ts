import { describe, expect, it } from "vitest";
import { BUTTON_LABEL_PLACEHOLDER } from "@/utils/markers";
import {
  buttonAlt,
  buttonFiles,
  buttonSource,
  hasSmallWebPage,
  ringLinks,
} from "@/utils/smallWeb";

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

describe("own button image", () => {
  const unset = { label: BUTTON_LABEL_PLACEHOLDER, icon: "sparkle" };
  const own = { ...unset, image: "/b.png" };
  const both = { ...own, imageLight: "/b-light.png" };

  it("publishes /small-web/ without a label", () => {
    expect(hasSmallWebPage({ webrings: [], button: own })).toBe(true);
  });

  it("lists the light button only when it is set", () => {
    expect(buttonFiles(unset)).toEqual(["88x31"]);
    expect(buttonFiles(own)).toEqual(["88x31"]);
    expect(buttonFiles(both)).toEqual(["88x31", "88x31-light"]);
    expect(buttonSource(both, "88x31")).toBe("/b.png");
    expect(buttonSource(both, "88x31-light")).toBe("/b-light.png");
    expect(buttonSource(unset, "88x31")).toBeUndefined();
  });

  it("takes the alt text from the label, else the site title", () => {
    expect(buttonAlt(own, "My Site")).toBe("My Site");
    expect(buttonAlt({ ...own, label: "me" }, "My Site")).toBe("me");
    expect(buttonAlt(unset, "My Site")).toBe(BUTTON_LABEL_PLACEHOLDER);
  });
});
