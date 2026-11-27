import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it, vi } from "vitest";
import config from "@/config";
import Layout, { type Props } from "@/layouts/Layout.astro";
import { attr, headOf, metaTags } from "@/utils/htmlScan";

vi.mock("@/utils/content/sections", () => ({
  getSections: async () => ({
    posts: true,
    notes: false,
    projects: false,
    tags: false,
  }),
}));

const SITE = "https://me.example";
const PAGE = `${SITE}/blog/2026/hello/`;

async function renderHead(props: Props = {}) {
  const container = await AstroContainer.create({
    astroConfig: { site: SITE },
  });
  const head = headOf(
    await container.renderToString(Layout, {
      props,
      request: new Request(PAGE),
    })
  );
  const metas = metaTags(head);
  return {
    head,
    canonicals: [...head.matchAll(/<link\b[^>]*>/gi)]
      .filter(([tag]) => attr(tag, "rel") === "canonical")
      .map(([tag]) => attr(tag, "href")),
    all: (key: string) =>
      metas.filter(meta => meta.key === key).map(meta => meta.content),
  };
}

describe("page head", () => {
  it("writes one canonical, the page URL, and repeats it as og:url", async () => {
    const { canonicals, all } = await renderHead();
    expect(canonicals).toEqual([PAGE]);
    expect(all("og:url")).toEqual([PAGE]);
  });

  it("takes the canonical a page passes", async () => {
    const canonicalURL = "https://elsewhere.example/original/";
    const { canonicals, all } = await renderHead({ canonicalURL });
    expect(canonicals).toEqual([canonicalURL]);
    expect(all("og:url")).toEqual([canonicalURL]);
  });

  it("writes each preview tag once", async () => {
    const { head, all } = await renderHead({ title: "Hello" });
    for (const key of [
      "og:type",
      "og:url",
      "og:title",
      "og:image",
      "og:image:alt",
      "twitter:card",
    ])
      expect(all(key), key).toHaveLength(1);
    expect(head.match(/<title[\s>]/gi)).toHaveLength(1);
    expect(all("og:title")).toEqual(["Hello"]);
  });

  it("resolves the preview image against the site and names its alt", async () => {
    const { all } = await renderHead({
      ogImage: "/blog/2026/hello/index.png",
      ogImageAlt: "Post: Hello",
    });
    expect(all("og:image")).toEqual([`${PAGE}index.png`]);
    expect(all("og:image:alt")).toEqual(["Post: Hello"]);
  });

  it("leaves the Twitter preview to the Open Graph tags", async () => {
    const { head } = await renderHead({ description: "About hello." });
    expect(
      metaTags(head)
        .map(meta => meta.key)
        .filter(key => key.startsWith("twitter:"))
    ).toEqual(["twitter:card"]);
  });

  it("sizes the generated image and leaves an unknown size out", async () => {
    const generated = await renderHead();
    expect(generated.all("og:image:width")).toEqual(["1200"]);
    expect(generated.all("og:image:height")).toEqual(["630"]);
    const own = await renderHead({ ogImageSize: null });
    expect(own.all("og:image:width")).toEqual([]);
    expect(own.all("og:image:height")).toEqual([]);
  });

  it("repeats a page description in the preview tags", async () => {
    const described = await renderHead({ description: "About hello." });
    for (const key of ["description", "og:description"])
      expect(described.all(key), key).toEqual(["About hello."]);
    const bare = await renderHead();
    for (const key of ["description", "og:description"])
      expect(bare.all(key), key).toEqual([]);
  });

  it("allows large image previews, and marks a page noindex when asked", async () => {
    expect((await renderHead()).all("robots")).toEqual([
      "max-image-preview:large",
    ]);
    expect((await renderHead({ noindex: true })).all("robots")).toEqual([
      "max-image-preview:large",
      "noindex",
    ]);
  });

  it("states the article times a page passes", async () => {
    const { all } = await renderHead({
      publishedTime: new Date("2026-01-02T00:00:00Z"),
      modifiedTime: new Date("2026-01-03T00:00:00Z"),
    });
    expect(all("article:published_time")).toEqual(["2026-01-02T00:00:00.000Z"]);
    expect(all("article:modified_time")).toEqual(["2026-01-03T00:00:00.000Z"]);
    expect((await renderHead()).all("article:published_time")).toEqual([]);
  });

  it("is a website unless the page says article", async () => {
    expect((await renderHead()).all("og:type")).toEqual(["website"]);
    expect((await renderHead({ ogType: "article" })).all("og:type")).toEqual([
      "article",
    ]);
  });

  it("writes the configured Search Console verification once", async () => {
    const { googleVerification } = config.site;
    expect((await renderHead()).all("google-site-verification")).toEqual(
      googleVerification ? [googleVerification] : []
    );
  });
});
