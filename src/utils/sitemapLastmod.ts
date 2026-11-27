import { readFile } from "node:fs/promises";
import type { AstroIntegration } from "astro";

const articleTime = (html: string, key: string): string | undefined =>
  new RegExp(`<meta property="article:${key}" content="([^"]+)"`).exec(
    html
  )?.[1];

export function pageLastmod(html: string): string | undefined {
  return (
    articleTime(html, "modified_time") ?? articleTime(html, "published_time")
  );
}

export function sitemapLastmod(base: string) {
  let outDir: URL | undefined;
  const integration: AstroIntegration = {
    name: "starglow:sitemap-lastmod",
    hooks: {
      "astro:config:done": ({ config }) => {
        outDir = config.outDir;
      },
    },
  };
  const serialize = async <T extends { url: string; lastmod?: string }>(
    item: T
  ): Promise<T> => {
    if (!outDir) return item;
    const path = new URL(item.url).pathname.slice(base.length);
    const file = new URL(`.${path}index.html`, outDir);
    const html = await readFile(file, "utf8").catch(() => "");
    const lastmod = pageLastmod(html);
    return lastmod ? { ...item, lastmod } : item;
  };
  return { integration, serialize };
}
