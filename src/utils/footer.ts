import { getRelativeLocaleUrl } from "astro:i18n";
import config from "@/config";
import { STARGLOW_REPO } from "@/types/config";
import { PROFILE_BADGES } from "@/utils/badges";
import { getAssetPath } from "@/utils/withBase";
import { getContactPage, getSections } from "@/utils/content/sections";
import { sameLinkKey } from "@/utils/sameLinkKey";
import { SMALL_WEB_PATH, hasSmallWebPage } from "@/utils/smallWeb";

type TextLink = { label: string; href: string };

const withBase = (href: string) =>
  /^\/(?!\/)/.test(href) ? getAssetPath(href) : href;

/**
 * Every footer link, each URL once. Earlier wins: the credit, the badges,
 * `footer.links`, `footer.legal`, then contact, small web and source. The
 * RSS badge waits for a post or a note. `pages` holds contact, small web and
 * `footer.links`, in that order.
 */
export async function getFooterLinks(
  locale: string,
  labels: { contact: string; smallWeb: string; source: string }
) {
  const site = new URL(import.meta.env.SITE);
  const seen = new Set<string>();
  const fresh = (href: string) => {
    const key = sameLinkKey(href, site);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
  const textLinks = (links: TextLink[]) =>
    links
      .map(link => ({ label: link.label, href: withBase(link.href) }))
      .filter(link => fresh(link.href));

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

  const extra = textLinks(config.footer.links);
  const legal = textLinks(config.footer.legal);

  const pages: TextLink[] = [];
  if (await getContactPage()) {
    const href = getRelativeLocaleUrl(locale, "contact");
    if (fresh(href)) pages.push({ label: labels.contact, href });
  }
  if (hasSmallWebPage(config)) {
    const href = getRelativeLocaleUrl(locale, SMALL_WEB_PATH);
    if (fresh(href)) pages.push({ label: labels.smallWeb, href });
  }
  pages.push(...extra);

  const sourceUrl = config.site.sourceUrl;
  const source =
    sourceUrl && fresh(sourceUrl)
      ? { label: labels.source, href: sourceUrl }
      : undefined;

  return { credit, badges, pages, legal, source };
}
