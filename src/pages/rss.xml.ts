import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getAllItems } from "@/utils/content/items";
import { getAssetPath } from "@/utils/withBase";
import config from "@/config";

function xmlAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
}

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error("[rss] site is not configured (site.url)");
  }

  const items = await getAllItems();
  const feedUrl = new URL(getAssetPath("rss.xml"), context.site).href;
  const times = items.flatMap(item => (item.date ? [item.date.getTime()] : []));
  const lastBuildDate =
    times.length > 0 ? new Date(Math.max(...times)).toUTCString() : undefined;

  return rss({
    title: config.site.title,
    description: config.site.description,
    site: new URL(import.meta.env.BASE_URL, context.site),
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: [
      `<atom:link href="${xmlAttr(feedUrl)}" rel="self" type="application/rss+xml"/>`,
      `<language>${config.site.lang}</language>`,
      lastBuildDate && `<lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    ]
      .filter(Boolean)
      .join(""),
    items: items.map(item => ({
      title: item.title,
      link: item.url,
      description: item.description,
      categories: [item.type, ...item.tags],
      ...(item.date && { pubDate: item.date }),
    })),
  });
}
