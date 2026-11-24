import { describe, expect, it } from "vitest";
import { profileLinks } from "@/utils/badges";

describe("profileLinks", () => {
  it("keeps the profile badges in order", () => {
    const links = [
      { type: "rss", url: "/rss.xml" },
      { type: "github", url: "https://github.com/you" },
      { type: "sparkle", url: "https://astro.build" },
      { type: "mastodon", url: "https://host/@you" },
      { type: "email", url: "mailto:you@example.com" },
    ];
    expect(profileLinks(links).map(link => link.type)).toEqual([
      "github",
      "mastodon",
    ]);
  });

  it("returns nothing without profiles", () => {
    expect(profileLinks([{ type: "link", url: "/privacy/" }])).toEqual([]);
  });
});
