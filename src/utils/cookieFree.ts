import { attr, pageTags, relations } from "./htmlScan.ts";
import { LOADING_RELATIONS, cssSubresources } from "./pageWeight.ts";

export const NO_COOKIES_BADGE = "nocookies";

export type Subresource = {
  url: string;
  source: string;
};

const URL_ATTRIBUTES: Record<string, string[]> = {
  script: ["src"],
  img: ["src"],
  source: ["src"],
  video: ["src", "poster"],
  audio: ["src"],
  iframe: ["src"],
  embed: ["src"],
  object: ["data"],
  track: ["src"],
};
const SRCSET_ATTRIBUTES: Record<string, string> = {
  img: "srcset",
  source: "srcset",
  link: "imagesrcset",
};

const srcsetUrls = (srcset: string): string[] =>
  srcset
    .split(",")
    .map(candidate => candidate.trim().split(/\s+/)[0] ?? "")
    .filter(Boolean);

export function pageSubresources(
  html: string,
  exempt: (tag: string) => boolean = () => false
): Subresource[] {
  const found: Subresource[] = [];
  for (const { tag, name, body } of pageTags(html)) {
    if (exempt(tag)) continue;
    const add = (source: string, urls: (string | undefined)[]) => {
      for (const url of urls)
        if (url?.trim()) found.push({ url: url.trim(), source });
    };
    if (name === "link") {
      const rel = relations(tag);
      if (!LOADING_RELATIONS.some(relation => rel.includes(relation))) continue;
      add(`<link rel="${rel.join(" ")}">`, [attr(tag, "href")]);
    }
    for (const attribute of URL_ATTRIBUTES[name] ?? [])
      add(`<${name} ${attribute}>`, [attr(tag, attribute)]);
    const srcset = SRCSET_ATTRIBUTES[name];
    if (srcset) add(`<${name} ${srcset}>`, srcsetUrls(attr(tag, srcset) ?? ""));
    if (name === "style") add("<style>", cssSubresources(body ?? ""));
    add(`<${name} style>`, cssSubresources(attr(tag, "style") ?? ""));
  }
  return found;
}

export function isCrossOrigin(url: string, base: URL): boolean {
  try {
    const resolved = new URL(url, base);
    return (
      /^https?:$/.test(resolved.protocol) && resolved.origin !== base.origin
    );
  } catch {
    return true;
  }
}

const SCRIPT_TYPE = /^(?:module|(?:text|application)\/(?:java|ecma)script)?$/i;

export function inlineScripts(html: string): string[] {
  return pageTags(html)
    .filter(
      ({ tag, name }) =>
        name === "script" &&
        attr(tag, "src") === undefined &&
        SCRIPT_TYPE.test((attr(tag, "type") ?? "").trim())
    )
    .map(({ body }) => body ?? "");
}

const COOKIE_APIS: [string, RegExp][] = [
  ["document.cookie", /\bdocument\s*\.\s*cookie\b/],
  ["cookieStore", /\bcookieStore\b/],
];

export const cookieApisIn = (js: string): string[] =>
  COOKIE_APIS.filter(([, pattern]) => pattern.test(js)).map(([name]) => name);
