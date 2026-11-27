import { getRelativeLocaleUrl } from "astro:i18n";
import config from "@/config";
import { STARGLOW_REPO } from "@/types/config";
import { PROFILE_BADGES } from "@/utils/badges";
import { getAssetPath } from "@/utils/withBase";
import { getContactPage, getSections } from "@/utils/content/sections";

/**
 * What makes two hrefs the same link: host without `www.`, path without a
 * trailing slash or index.html, the query and the hash. Scheme is ignored.
 */
export function sameLinkKey(href: string, site: URL): string {
  try {
    const url = new URL(href, site);
    if (url.protocol === "mailto:") return url.href.toLowerCase();
    const host = url.host.toLowerCase().replace(/^www\./, "");
    const path = url.pathname
      .replace(/\/index\.html?$/, "/")
      .replace(/\/+$/, "");
    return `${host}${path}${url.search}${url.hash}`;
  } catch {
    return href.trim();
  }
}

const withBase = (href: string) =>
  /^\/(?!\/)/.test(href) ? getAssetPath(href) : href;

/**
 * Every footer link, each URL once. Earlier wins: the credit, the badges,
 * `footer.links`, then contact and source. The RSS badge waits for a post
 * or a note.
 */
export async function getFooterLinks(
  locale: string,
  labels: { contact: string; source: string }
) {
  const site = new URL(import.meta.env.SITE);
  const seen = new Set<string>();
  const fresh = (href: string) => {
    const key = sameLinkKey(href, site);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };

  const credit = config.footer.credit ? STARGLOW_REPO : undefined;
  if (credit) fresh(credit);

  const { posts, notes } = await getSections();
  const badges = config.links
    .filter(link => link.type !== "rss" || posts || notes)
    .filter(link => fresh(withBase(link.url)))
    .map(link => ({
      ...link,
      rel: PROFILE_BADGES.has(link.type) ? "me" : undefined,
    }));

  const extra = config.footer.links
    .map(link => ({ label: link.label, href: withBase(link.href) }))
    .filter(link => fresh(link.href));

  const nav: { label: string; href: string }[] = [];
  if (await getContactPage()) {
    const href = getRelativeLocaleUrl(locale, "contact");
    if (fresh(href)) nav.push({ label: labels.contact, href });
  }
  const source = config.site.sourceUrl;
  if (source && fresh(source)) nav.push({ label: labels.source, href: source });

  return { credit, badges, extra, nav };
}
