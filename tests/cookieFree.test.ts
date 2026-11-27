import { describe, expect, it } from "vitest";
import {
  cookieApisIn,
  inlineScripts,
  isCrossOrigin,
  pageSubresources,
} from "@/utils/cookieFree";

const site = new URL("https://me.example/repo/");

describe("pageSubresources", () => {
  const urls = (html: string) => pageSubresources(html).map(({ url }) => url);

  it("lists what scripts, links, media and frames load", () => {
    expect(
      pageSubresources(
        [
          '<script src="/a.js"></script>',
          '<link rel="stylesheet" href="/a.css">',
          '<link rel="preload" as="image" href="/hero.png" imagesrcset="/hero-2x.png 2x">',
          '<link rel="icon" href="/favicon.svg">',
          '<img src="/a.png" srcset="/a-1x.png 1x, https://cdn.example/a-2x.png 2x">',
          '<picture><source srcset="/a.avif"></picture>',
          '<video src="/v.mp4" poster="/v.jpg"><track src="/v.vtt"></video>',
          '<audio src="/s.mp3"></audio>',
          '<iframe src="https://video.example/embed"></iframe>',
          '<embed src="/e.pdf"><object data="/o.svg"></object>',
        ].join("")
      )
    ).toEqual([
      { url: "/a.js", source: "<script src>" },
      { url: "/a.css", source: '<link rel="stylesheet">' },
      { url: "/hero.png", source: '<link rel="preload">' },
      { url: "/hero-2x.png", source: "<link imagesrcset>" },
      { url: "/favicon.svg", source: '<link rel="icon">' },
      { url: "/a.png", source: "<img src>" },
      { url: "/a-1x.png", source: "<img srcset>" },
      { url: "https://cdn.example/a-2x.png", source: "<img srcset>" },
      { url: "/a.avif", source: "<source srcset>" },
      { url: "/v.mp4", source: "<video src>" },
      { url: "/v.jpg", source: "<video poster>" },
      { url: "/v.vtt", source: "<track src>" },
      { url: "/s.mp3", source: "<audio src>" },
      { url: "https://video.example/embed", source: "<iframe src>" },
      { url: "/e.pdf", source: "<embed src>" },
      { url: "/o.svg", source: "<object data>" },
    ]);
  });

  it("reads url() and @import in style elements and attributes", () => {
    expect(
      pageSubresources(
        '<style>@import "https://fonts.example/a.css";a{background:url(/bg.png)}</style>' +
          '<p style="background:url(https://cdn.example/p.png)">x</p>'
      )
    ).toEqual([
      { url: "https://fonts.example/a.css", source: "<style>" },
      { url: "/bg.png", source: "<style>" },
      { url: "https://cdn.example/p.png", source: "<p style>" },
    ]);
  });

  it("leaves out navigation links, comments and script text", () => {
    expect(
      urls(
        '<a href="https://other.example/">out</a>' +
          '<link rel="canonical" href="https://other.example/x/">' +
          '<link rel="me" href="https://social.example/@me">' +
          '<!-- <img src="https://cdn.example/old.png"> -->' +
          "<script>const html = '<img src=\"https://cdn.example/js.png\">';</script>"
      )
    ).toEqual([]);
  });

  it("skips the tags the caller exempts", () => {
    const beacon = '<script src="https://stats.example/beacon.js"></script>';
    expect(
      pageSubresources(`${beacon}<script src="/a.js"></script>`, tag =>
        tag.includes("stats.example")
      )
    ).toEqual([{ url: "/a.js", source: "<script src>" }]);
  });
});

describe("isCrossOrigin", () => {
  it("accepts relative, same-origin and data URLs", () => {
    for (const url of [
      "/a.png",
      "a.png",
      "../a.png",
      "#mask",
      "https://me.example/other/a.png",
      "data:image/png;base64,AAAA",
      "about:blank",
    ])
      expect(isCrossOrigin(url, site), url).toBe(false);
  });

  it("flags another host, scheme or port, and an unreadable URL", () => {
    for (const url of [
      "https://cdn.example/a.png",
      "//cdn.example/a.png",
      "http://me.example/a.png",
      "https://me.example:8443/a.png",
      "https://sub.me.example/a.png",
      "https://[bad/a.png",
    ])
      expect(isCrossOrigin(url, site), url).toBe(true);
  });
});

describe("inlineScripts", () => {
  it("returns the scripts a browser runs", () => {
    expect(
      inlineScripts(
        "<script>one()</script>" +
          '<script type="module">two()</script>' +
          '<script type="text/javascript">three()</script>' +
          '<script src="/a.js"></script>' +
          '<script type="application/ld+json">{"headline":"document.cookie"}</script>'
      )
    ).toEqual(["one()", "two()", "three()"]);
  });
});

describe("cookieApisIn", () => {
  it("names the cookie APIs a script uses", () => {
    expect(cookieApisIn('document.cookie="a=1"')).toEqual(["document.cookie"]);
    expect(cookieApisIn("await cookieStore.get('a')")).toEqual(["cookieStore"]);
    expect(
      cookieApisIn("document . cookie; window.cookieStore.delete('a')")
    ).toEqual(["document.cookie", "cookieStore"]);
  });

  it("returns nothing for a script that stores state elsewhere", () => {
    expect(
      cookieApisIn('localStorage.setItem("theme", t); const cookies = []')
    ).toEqual([]);
  });
});
