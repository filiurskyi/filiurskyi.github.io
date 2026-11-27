import { describe, expect, it } from "vitest";
import {
  codePointsOf,
  cssRequests,
  cssSubresources,
  parseUnicodeRange,
  rangesMatch,
  scriptImports,
  sizeClub,
  sizeClubProblem,
} from "@/utils/pageWeight";

describe("parseUnicodeRange", () => {
  it("reads ranges, single points and wildcards", () => {
    expect(parseUnicodeRange("U+20-7E, U+A0,u+4??")).toEqual([
      [0x20, 0x7e],
      [0xa0, 0xa0],
      [0x400, 0x4ff],
    ]);
  });
});

describe("rangesMatch", () => {
  const latin = codePointsOf("hello");
  it("matches a range the text uses", () => {
    expect(rangesMatch([[0x20, 0x7e]], latin)).toBe(true);
    expect(rangesMatch([[0x400, 0x4ff]], latin)).toBe(false);
  });
  it("treats no range as all of Unicode", () => {
    expect(rangesMatch([], latin)).toBe(true);
  });
});

describe("cssRequests", () => {
  const css = [
    '@font-face{font-family:A;src:url("/a-latin.woff2");unicode-range:U+20-7E}',
    "@font-face{font-family:A;src:url(/a-cyr.woff2);unicode-range:U+400-4FF}",
    "@font-face{font-family:B;src:url('/b.woff2')}",
    '@import "/more.css";',
    ".x{background:url(/bg.png)}.y{mask:url(data:image/svg+xml,abc)}",
  ].join("");

  it("keeps the fonts the page text needs and every other url", () => {
    expect(cssRequests(css, codePointsOf("hi"))).toEqual([
      "/a-latin.woff2",
      "/b.woff2",
      "/more.css",
      "/bg.png",
    ]);
  });

  it("loads the Cyrillic subset for Cyrillic text", () => {
    expect(cssRequests(css, codePointsOf("привет"))).toContain("/a-cyr.woff2");
  });
});

describe("cssSubresources", () => {
  it("lists every @import and url() but data URLs", () => {
    expect(
      cssSubresources(
        '@import "https://fonts.example/a.css";@import url(/b.css);' +
          "@font-face{src:url('/f.woff2');unicode-range:U+400-4FF}" +
          ".x{background:url( /bg.png )}.y{mask:url(data:image/svg+xml,abc)}"
      )
    ).toEqual(["https://fonts.example/a.css", "/b.css", "/f.woff2", "/bg.png"]);
  });
});

describe("scriptImports", () => {
  it("follows static imports and leaves dynamic ones out", () => {
    expect(
      scriptImports(
        'import{a}from"./keys.js";import"./side.js";const m=import("./lazy.js")'
      )
    ).toEqual(["./keys.js", "./side.js"]);
  });
});

describe("sizeClubProblem", () => {
  const green = sizeClub("512kb-green")!;
  it("passes a page under the limit", () => {
    expect(sizeClubProblem(green, { raw: 99_999, gzip: 30_000 })).toBe(
      undefined
    );
  });

  it("names the measured size and the team that fits", () => {
    expect(sizeClubProblem(green, { raw: 180_000, gzip: 60_000 })).toBe(
      "the homepage loads 180.0 KB uncompressed, over the 100.0 KB of the 512kb club green team; it fits the 512kb club orange team (512kb-orange)"
    );
  });

  it("checks the 250kb club against the gzip total", () => {
    const club = sizeClub("250kb")!;
    expect(sizeClubProblem(club, { raw: 900_000, gzip: 200_000 })).toBe(
      undefined
    );
    expect(sizeClubProblem(club, { raw: 900_000, gzip: 300_000 })).toMatch(
      /300\.0 KB gzip, over the 256\.0 KB of the 250kb club; it fits the 1mb club/
    );
  });

  it("says when no club fits", () => {
    expect(
      sizeClubProblem(sizeClub("1mb")!, { raw: 2_000_000, gzip: 900_000 })
    ).toMatch(/it fits no size club$/);
  });
});
