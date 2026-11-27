import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import CopyLink from "@/components/CopyLink.astro";
import Syndication from "@/components/Syndication.astro";
import { attr, pageTags, relations } from "@/utils/htmlScan";

const links = (html: string) =>
  pageTags(html).filter(({ name }) => name === "a");

describe("share row", () => {
  it("renders one copy link to the URL it is given", async () => {
    const url = "https://me.example/blog/2026/hello/";
    const container = await AstroContainer.create();
    const html = await container.renderToString(CopyLink, { props: { url } });
    const copyLinks = links(html).filter(({ tag }) =>
      /\sdata-copy-link(?=[\s=>/])/.test(tag)
    );
    expect(copyLinks.map(({ tag }) => attr(tag, "href"))).toEqual([url]);
  });

  it("marks every syndication link as a syndication of the page", async () => {
    const urls = ["https://dev.to/noor/hello", "https://www.example.org/hello"];
    const container = await AstroContainer.create();
    const html = await container.renderToString(Syndication, {
      props: { urls },
    });
    const rendered = links(html);
    expect(rendered.map(({ tag }) => attr(tag, "href"))).toEqual(urls);
    for (const { tag } of rendered) {
      expect(attr(tag, "class")).toBe("u-syndication");
      expect(relations(tag)).toEqual(["syndication"]);
    }
    expect(html).toContain('<p class="syndication">');
  });

  it("renders no syndication line without URLs", async () => {
    const container = await AstroContainer.create();
    expect(
      (await container.renderToString(Syndication, { props: { urls: [] } }))
        .replace(/<!--[\s\S]*?-->/g, "")
        .trim()
    ).toBe("");
  });
});
