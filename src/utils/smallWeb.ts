import type { ResolvedStarglowConfig } from "@/types/config";
import { isPlaceholder } from "@/utils/markers";
import { sameLinkKey } from "@/utils/sameLinkKey";

export const SMALL_WEB_PATH = "small-web";

export type Webring = ResolvedStarglowConfig["webrings"][number];

export type RingLink = {
  kind: "prev" | "ring" | "next" | "random";
  href?: string;
};

export const hasSmallWebPage = (
  config: Pick<ResolvedStarglowConfig, "webrings" | "button">
): boolean => config.webrings.length > 0 || !isPlaceholder(config.button.label);

export function ringLinks(
  ring: Webring,
  site: URL,
  seen: Set<string> = new Set()
): RingLink[] {
  const fresh = (href: string | undefined) => {
    if (!href) return false;
    const key = sameLinkKey(href, site);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
  const links: RingLink[] = [];
  if (fresh(ring.prev)) links.push({ kind: "prev", href: ring.prev });
  links.push({ kind: "ring", href: fresh(ring.url) ? ring.url : undefined });
  if (fresh(ring.next)) links.push({ kind: "next", href: ring.next });
  if (fresh(ring.random)) links.push({ kind: "random", href: ring.random });
  return links;
}

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const buttonSnippet = (home: string, image: string, label: string) =>
  `<a href="${escapeHtml(home)}"><img src="${escapeHtml(image)}" width="88" height="31" alt="${escapeHtml(label)}"></a>`;
