import { describe, expect, it } from "vitest";
import { article, blogPosting } from "@/utils/jsonLd";

const site = new URL("https://example.com");
const url = "https://example.com/blog/2026/post/";
const base = {
  site,
  headline: "Post",
  url,
  image: "https://example.com/blog/2026/post/index.png",
  inLanguage: "en",
  authorName: "Ada",
};

describe("blogPosting", () => {
  it("names the canonical page as its main entity", () => {
    const data = blogPosting({
      ...base,
      datePublished: "2026-01-01T00:00:00.000Z",
    });
    expect(data.mainEntityOfPage).toEqual({ "@type": "WebPage", "@id": url });
  });

  it("states dateModified only when given", () => {
    const published = { ...base, datePublished: "2026-01-01T00:00:00.000Z" };
    expect(blogPosting(published)).not.toHaveProperty("dateModified");
    expect(
      blogPosting({ ...published, dateModified: "2026-02-01T00:00:00.000Z" })
        .dateModified
    ).toBe("2026-02-01T00:00:00.000Z");
  });
});

describe("article", () => {
  it("names the canonical page as its main entity", () => {
    expect(article(base).mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": url,
    });
  });
});
