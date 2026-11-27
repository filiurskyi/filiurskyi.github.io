import { describe, expect, it } from "vitest";
import {
  article,
  blogPosting,
  homeGraph,
  personId,
  softwareSourceCode,
  toJsonLd,
} from "@/utils/jsonLd";

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
const author = { "@type": "Person", "@id": personId(site), name: "Ada" };

describe("homeGraph", () => {
  const home = {
    name: "Ada",
    siteName: "ada",
    siteDescription: "About CSS.",
    inLanguage: "en",
    sameAs: ["https://github.com/ada"],
  };
  const graph = homeGraph(site, { ...home, jobTitle: "" })["@graph"] as Record<
    string,
    unknown
  >[];

  it("holds one Person and one WebSite", () => {
    expect(graph.map(entity => entity["@type"])).toEqual(["Person", "WebSite"]);
  });

  it("names the Person as the publisher of the WebSite", () => {
    expect(graph[0]?.["@id"]).toBe("https://example.com/#person");
    expect(graph[1]?.publisher).toEqual({ "@id": graph[0]?.["@id"] });
  });

  it("lists the profile links as sameAs and leaves empty fields out", () => {
    expect(graph[0]?.sameAs).toEqual(home.sameAs);
    expect(graph[0]).not.toHaveProperty("jobTitle");
    const [person] = homeGraph(site, { ...home, sameAs: [] })[
      "@graph"
    ] as Record<string, unknown>[];
    expect(person).not.toHaveProperty("sameAs");
  });
});

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

  it("is one BlogPosting with the page's headline, URL, image and author", () => {
    expect(
      blogPosting({ ...base, datePublished: "2026-01-01T00:00:00.000Z" })
    ).toMatchObject({
      "@type": "BlogPosting",
      headline: base.headline,
      url,
      image: base.image,
      datePublished: "2026-01-01T00:00:00.000Z",
      author,
    });
  });
});

describe("article", () => {
  it("names the canonical page as its main entity", () => {
    expect(article(base).mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": url,
    });
  });

  it("is one Article with the page's headline, URL, image and author", () => {
    expect(article(base)).toMatchObject({
      "@type": "Article",
      headline: base.headline,
      url,
      image: base.image,
      author,
    });
  });
});

describe("softwareSourceCode", () => {
  it("names the project and leaves empty fields out", () => {
    const data = softwareSourceCode({
      site,
      name: "starglow",
      url: "https://example.com/projects/starglow/",
      image: base.image,
      codeRepository: "https://github.com/glowing-space/starglow",
      keywords: [],
      authorName: "Ada",
    });
    expect(data).toMatchObject({
      "@type": "SoftwareSourceCode",
      name: "starglow",
      url: "https://example.com/projects/starglow/",
      image: base.image,
      author,
    });
    expect(data).not.toHaveProperty("keywords");
    expect(data).not.toHaveProperty("description");
  });
});

describe("toJsonLd", () => {
  it("keeps a closing script tag in a title inside the block", () => {
    const json = toJsonLd({ headline: "</script><b>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ headline: "</script><b>" });
  });
});
