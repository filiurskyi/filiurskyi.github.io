import { describe, expect, it } from "vitest";
import {
  attr,
  decodeEntities,
  footerOf,
  headOf,
  metaTags,
  pageTags,
  plainText,
  relations,
  visibleMarkup,
} from "@/utils/htmlScan";

describe("decodeEntities", () => {
  it("decodes named and numeric references", () => {
    expect(decodeEntities("&lt;a&gt; &amp;amp; &#65;&#x42; &quot;&apos;")).toBe(
      "<a> &amp; AB \"'"
    );
  });

  it("reads an out-of-range reference as U+FFFD", () => {
    expect(decodeEntities("&#x110000;")).toBe("\uFFFD");
  });
});

describe("attr", () => {
  it("reads quoted, bare and mixed-case attributes", () => {
    const tag = `<a HREF="/x?a=1&amp;b=2" rel='Me  nofollow' data-n=3>`;
    expect(attr(tag, "href")).toBe("/x?a=1&b=2");
    expect(relations(tag)).toEqual(["me", "nofollow"]);
    expect(attr(tag, "data-n")).toBe("3");
    expect(attr(tag, "title")).toBeUndefined();
  });

  it("keeps attribute-like text inside another value", () => {
    expect(attr(`<img alt="src=wrong" src="/right.png">`, "src")).toBe(
      "/right.png"
    );
  });
});

describe("page readers", () => {
  const html = `<!doctype html><html><head><title>t</title>
    <meta name="description" content="a &gt; b">
    <meta property="og:title" content="T">
    <script>const x = "<meta name='ghost'>";</script>
    <style>a{background:url(/a.png)}</style></head>
    <body><!-- <img src="/comment.png"> --><h1>Hi <em>there</em></h1>
    <template><p>hidden</p></template>
    <footer><a href="/privacy/">privacy</a></footer></body></html>`;

  it("lists the meta tags of the head", () => {
    expect(metaTags(headOf(html))).toEqual([
      { key: "description", content: "a > b" },
      { key: "og:title", content: "T" },
    ]);
  });

  it("removes script, style and template text from the visible markup", () => {
    const markup = visibleMarkup(html);
    expect(markup).not.toContain("ghost");
    expect(markup).not.toContain("hidden");
    expect(plainText(/<h1>([\s\S]*?)<\/h1>/.exec(markup)?.[1] ?? "")).toBe(
      "Hi there"
    );
  });

  it("lists opening tags with script and style text", () => {
    const tags = pageTags(html);
    expect(tags.map(tag => tag.name)).not.toContain("img");
    expect(tags.find(tag => tag.name === "style")?.body).toBe(
      "a{background:url(/a.png)}"
    );
    expect(tags.find(tag => tag.name === "script")?.body).toContain("ghost");
    expect(tags.find(tag => tag.name === "h1")?.body).toBeUndefined();
  });

  it("cuts out the footer", () => {
    expect(footerOf(html)).toBe(
      '<footer><a href="/privacy/">privacy</a></footer>'
    );
    expect(footerOf("<p>none</p>")).toBe("");
  });
});
