import { describe, expect, it } from "vitest";
import userConfig from "@/starglow.config";
import { darkPalettes } from "@/palettes";
import {
  closestKey,
  parseStarglowConfig,
  starglowConfigSchema,
} from "@/types/config";

const site = { title: "t", description: "d", author: "a" };

/** The problem lines of a config that must fail. */
const problems = (input: unknown): string[] => {
  try {
    parseStarglowConfig(input);
  } catch (error) {
    return String((error as Error).message)
      .split("\n")
      .slice(1)
      .map(line => line.replace(/^ {2}- /, ""));
  }
  throw new Error("config was accepted");
};

describe("config schema", () => {
  it("accepts the shipped starglow.config.ts", () => {
    expect(starglowConfigSchema.safeParse(userConfig).success).toBe(true);
  });

  it("applies defaults to a minimal config", () => {
    const config = parseStarglowConfig({ site });
    expect(config.site).toMatchObject({
      lang: "en",
      timezone: "UTC",
      dir: "ltr",
      sourceBanner: "",
    });
    expect(config.posts).toEqual({ perPage: 4, perIndex: 4 });
    expect(config.features).toMatchObject({
      lightAndDarkMode: true,
      search: "pagefind",
      obsidian: false,
    });
    expect(config.appearance.palette).toEqual({
      dark: "starglow",
      light: "starglow",
    });
    expect(config.links).toEqual([]);
    expect(config.footer).toEqual({ credit: true, links: [] });
  });

  it("names an unknown key and suggests the closest one", () => {
    expect(problems({ site: { ...site, titel: "x" } })).toEqual([
      'site.titel: unknown key, did you mean "title"?',
    ]);
    expect(problems({ site, feature: {} })).toEqual([
      'feature: unknown key, did you mean "features"?',
    ]);
    expect(
      problems({ site, links: [{ type: "rss", uri: "/rss.xml" }] })
    ).toEqual(['links[0].uri: unknown key, did you mean "url"?']);
  });

  it("gives no suggestion for an unrelated key", () => {
    expect(problems({ site, newsletter: true })).toEqual([
      "newsletter: unknown key",
    ]);
  });

  it("explains removed keys", () => {
    const lines = problems({
      site: {
        ...site,
        sourceUrl: "https://x",
        fediverseCreator: "@a@b",
        url: "https://x",
      },
      socials: [],
      person: { description: "x" },
      features: {
        editPost: { enabled: true, url: "https://x/edit/" },
      },
    });
    expect(lines).toHaveLength(5);
    for (const key of [
      "site.fediverseCreator",
      "socials",
      "person.description",
      "features.editPost.url",
    ]) {
      expect(lines).toContainEqual(
        expect.stringMatching(new RegExp(`^${key}: removed in v0.1.1`))
      );
    }
    expect(lines).toContainEqual(
      expect.stringMatching(/^site\.url: .*SITE_URL/)
    );
  });

  it("rejects wrong types and values with the key path", () => {
    expect(problems({ site: { ...site, title: 1 } })).toEqual([
      "site.title: Invalid input: expected string, received number",
    ]);
    expect(problems({ site, posts: { perPage: 0 } })).toEqual([
      "posts.perPage: expected a whole number above 0, got 0",
    ]);
    expect(problems({ site, posts: { perIndex: 2.5 } })).toEqual([
      "posts.perIndex: expected a whole number above 0, got 2.5",
    ]);
    expect(problems({ site, features: { search: "algolia" } })).toEqual([
      'features.search: expected "pagefind" or false, got "algolia"',
    ]);
    expect(problems({ site: { ...site, timezone: "Mars/Olympus" } })).toEqual([
      expect.stringMatching(/^site\.timezone: unknown timezone/),
    ]);
  });

  it("checks links, the source banner and the OG image name", () => {
    expect(
      problems({ site, links: [{ type: "rss", url: "javascript:x" }] })
    ).toEqual([expect.stringMatching(/^links\[0\]\.url: expected http/)]);
    expect(
      parseStarglowConfig({ site, links: [{ type: "rss", url: "" }] }).links
    ).toHaveLength(1);
    expect(
      problems({ site: { ...site, sourceBanner: { message: "a -- b" } } })
    ).toEqual([expect.stringMatching(/^site\.sourceBanner: must not contain/)]);
    expect(problems({ site: { ...site, ogImage: "../secret.jpg" } })).toEqual([
      expect.stringMatching(/^site\.ogImage: expected a single filename/),
    ]);
  });

  it("needs site.sourceUrl for features.editPost", () => {
    expect(
      problems({ site, features: { editPost: { enabled: true } } })
    ).toEqual([
      expect.stringMatching(/^features\.editPost: needs site\.sourceUrl/),
    ]);
  });

  it("rejects placeholder text in person.jobTitle", () => {
    expect(problems({ site, person: { jobTitle: "[PLACEHOLDER]" } })).toEqual([
      expect.stringMatching(/^person\.jobTitle: must be real text/),
    ]);
  });
});

describe("palette validation", () => {
  const custom = { ...darkPalettes.starglow, label: "Mine" };

  it("adds custom palettes to the built-in ones", () => {
    const config = parseStarglowConfig({
      site,
      appearance: {
        palette: { dark: "mine" },
        palettes: { dark: { mine: custom } },
      },
    });
    expect(config.appearance.palette.dark).toBe("mine");
    expect(Object.keys(config.appearance.palettes.dark)).toEqual([
      ...Object.keys(darkPalettes),
      "mine",
    ]);
  });

  it("rejects an unknown palette and lists the available ones", () => {
    expect(
      problems({ site, appearance: { palette: { light: "nope" } } })
    ).toEqual([
      'appearance.palette.light: unknown palette "nope". Available: starglow, paper, petal, frost, sand, got "nope"',
    ]);
  });

  it("rejects colours that are not opaque hex", () => {
    expect(
      problems({
        site,
        appearance: {
          palettes: { dark: { mine: { ...custom, bg: "rgb(0 0 0)" } } },
        },
      })
    ).toEqual([
      expect.stringMatching(
        /^appearance\.palettes\.dark\.mine\.bg: expected an opaque hex colour/
      ),
    ]);
  });

  it("rejects a palette name that is not a plain identifier", () => {
    expect(
      problems({
        site,
        appearance: { palettes: { dark: { "my palette": custom } } },
      })
    ).toEqual([expect.stringMatching(/^appearance\.palettes\.dark/)]);
  });

  it("rejects a palette with a missing or extra colour", () => {
    const { glow: _glow, ...missing } = custom;
    expect(
      problems({
        site,
        appearance: { palettes: { dark: { mine: missing } } },
      })
    ).toEqual([
      expect.stringMatching(/^appearance\.palettes\.dark\.mine\.glow: /),
    ]);
    expect(
      problems({
        site,
        appearance: {
          palettes: { dark: { mine: { ...custom, glo: "#000" } } },
        },
      })
    ).toEqual([
      'appearance.palettes.dark.mine.glo: unknown key, did you mean "glow"?',
    ]);
  });
});

describe("closestKey", () => {
  it("matches case and small typos only", () => {
    expect(closestKey("Title", ["title", "author"])).toBe("title");
    expect(closestKey("perpage", ["perPage", "perIndex"])).toBe("perPage");
    expect(closestKey("zzzzzz", ["title"])).toBeUndefined();
  });
});
