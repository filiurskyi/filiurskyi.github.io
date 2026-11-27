/**
 * What makes two hrefs the same link: host without `www.`, path without a
 * trailing slash or index.html, and the query. Scheme and hash are ignored.
 */
export function sameLinkKey(href: string, site: URL): string {
  try {
    const url = new URL(href, site);
    if (url.protocol === "mailto:") return url.href.toLowerCase();
    const host = url.host.toLowerCase().replace(/^www\./, "");
    const path = url.pathname
      .replace(/\/index\.html?$/, "/")
      .replace(/\/+$/, "");
    return `${host}${path}${url.search}`;
  } catch {
    return href.trim();
  }
}
