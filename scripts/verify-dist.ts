// Assertions over the production build in dist/.
//
// Run: ./dev.sh pnpm verify          (node scripts/verify-dist.ts [distDir])
import { existsSync, readFileSync, statSync } from "node:fs";
import { registerHooks } from "node:module";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { findDraftOnlyAssets } from "./draft-assets.ts";
import { profileLinks } from "../src/utils/badges.ts";
import { NOTE_PATH, PROJECT_PATH } from "../src/utils/content/entryIds.ts";
import {
  frontmatterOf,
  isDraft,
  stringField,
  walk,
} from "../src/utils/contentFiles.ts";
import { contrast } from "../src/utils/contrast.ts";
import {
  NO_COOKIES_BADGE,
  cookieApisIn,
  inlineScripts,
  isCrossOrigin,
  pageSubresources,
} from "../src/utils/cookieFree.ts";
import {
  attr,
  badgeTypesIn,
  decodeEntities,
  footerOf,
  headOf,
  metaTags,
  pageTags,
  plainText,
  relations,
  visibleMarkup,
} from "../src/utils/htmlScan.ts";
import {
  LOADING_RELATIONS,
  codePointsOf,
  cssRequests,
  cssSubresources,
  scriptImports,
  sizeClub,
  sizeClubProblem,
  type PageWeight,
} from "../src/utils/pageWeight.ts";
import { sameLinkKey } from "../src/utils/sameLinkKey.ts";

if (existsSync(".env")) process.loadEnvFile(".env");

const SRC = pathToFileURL("src/").href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    const target = specifier.startsWith("@/")
      ? SRC + specifier.slice(2)
      : specifier;
    if (!/^(\.{1,2}\/|file:)/.test(target) || !context.parentURL)
      return nextResolve(target, context);
    const url = new URL(target, context.parentURL);
    const path = fileURLToPath(url);
    const extensionless = !existsSync(path) && existsSync(`${path}.ts`);
    return nextResolve(extensionless ? `${url.href}.ts` : url.href, context);
  },
});
const { default: userConfig } = await import("../starglow.config.ts");
const { parseStarglowConfig } = await import("../src/types/config.ts");
const { SMALL_WEB_PATH, hasSmallWebPage } =
  await import("../src/utils/smallWeb.ts");
const config = parseStarglowConfig(userConfig);

const DIST = process.argv[2] ?? "dist";

// --- Reporting --------------------------------------------------------------

type Check = { name: string; problems: string[] };
const checks: Check[] = [];

/** Records one problem of the running check. `file` is relative to dist, or "" for a global one. */
function fail(file: string, message: string): void {
  checks.at(-1)?.problems.push(`${file ? `${file}: ` : ""}${message}`);
}

/** Runs one named group of assertions. */
function run(name: string, check: () => void): void {
  checks.push({ name, problems: [] });
  check();
}

/** A precondition that stops the run before any check can start. */
function stopSetup(message: string): never {
  console.error(`verify-dist: FAIL setup: ${message}`);
  return process.exit(1);
}

// --- The build --------------------------------------------------------------

function rel(file: string): string {
  return relative(DIST, file).split(sep).join("/");
}

function read(file: string): string {
  return readFileSync(file, "utf8");
}

function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

/** URL path of a built html file: blog/2026/x/index.html -> /blog/2026/x/ */
function routeOf(name: string): string {
  return `/${name.replace(/(^|\/)index\.html$/, "$1")}`;
}

function routeFile(route: string): string {
  return join(DIST, route.endsWith("/") ? `${route}index.html` : route);
}

if (!existsSync(join(DIST, "index.html")))
  stopSetup(`${DIST}/index.html missing, run the production build first`);

const files = walk(DIST);
const robots = existsSync(join(DIST, "robots.txt"))
  ? read(join(DIST, "robots.txt"))
  : "";
const sitemapUrl = /^Sitemap:\s*(\S+)/m.exec(robots)?.[1];
const configuredSite = process.env.SITE_URL || sitemapUrl;
if (!configuredSite)
  stopSetup(
    "no origin: set SITE_URL or build with a Sitemap: line in robots.txt"
  );
const BASE = (
  process.env.BASE_PATH ||
  (sitemapUrl
    ? new URL(sitemapUrl).pathname.replace(/\/sitemap-index\.xml$/, "")
    : "")
).replace(/\/+$/, "");
/** The site root, base path included: https://example.com or https://u.github.io/repo. */
const origin = new URL(configuredSite).origin + BASE;
const site = new URL(`${origin}/`);

type Page = {
  name: string;
  route: string;
  html: string;
  markup: string;
  head: string;
};

const pages: Page[] = files
  .map(rel)
  .filter(name => name.endsWith(".html") && !name.startsWith("pagefind/"))
  .map(name => {
    const html = read(join(DIST, name));
    return {
      name,
      route: routeOf(name),
      html,
      markup: visibleMarkup(html),
      head: headOf(html),
    };
  });
const home = read(join(DIST, "index.html"));

function distFileOf(url: string, base = site.href): string | undefined {
  try {
    const resolved = new URL(url, base);
    if (!resolved.href.startsWith(site.href)) return undefined;
    const file = routeFile(
      decodeURIComponent(resolved.pathname.slice(BASE.length))
    );
    return isFile(file) ? file : undefined;
  } catch {
    return undefined;
  }
}

function footerBadgeTypes(html: string): Set<string> {
  return badgeTypesIn(footerOf(html));
}

const CF_BEACON = "https://static.cloudflareinsights.com/beacon.min.js";
const CF_BEACON_UNCOMPRESSED_BYTES = 24_000;
const CF_BEACON_GZIP_BYTES = 9_000;
const CF_TOKEN =
  config.analytics.cloudflareToken?.trim() ||
  process.env.PUBLIC_CF_WEB_ANALYTICS_TOKEN?.trim();

/** The Cloudflare Web Analytics beacon for the configured token. */
function isAllowedBeacon(tag: string): boolean {
  if (!CF_TOKEN || !/^<script\b/i.test(tag) || attr(tag, "src") !== CF_BEACON)
    return false;
  try {
    const beacon = JSON.parse(attr(tag, "data-cf-beacon") ?? "");
    return beacon.token === CF_TOKEN && beacon.spa === true;
  } catch {
    return false;
  }
}

// --- Source entries ---------------------------------------------------------

const ONE_DAY_MS = 86_400_000;
const COLLECTIONS = [
  { name: "blog", base: "src/content/blog", prefix: "/blog/" },
  { name: "notes", base: NOTE_PATH, prefix: "/notes/" },
  { name: "projects", base: PROJECT_PATH, prefix: "/projects/" },
  { name: "pages", base: "src/content/pages", prefix: "/" },
] as const;

type Entry = {
  collection: (typeof COLLECTIONS)[number]["name"];
  route: string;
  draft: boolean;
  /** A post dated within a day of now or later: the build's clock decides whether it is built. */
  future: boolean;
  tagged: boolean;
  canonicalUrl?: string;
  ogImage?: string;
};

function sourceEntries(): Entry[] {
  const now = Date.now();
  return COLLECTIONS.flatMap(({ name, base, prefix }) =>
    walk(base).flatMap((file): Entry[] => {
      const parts = relative(base, file).split(sep);
      if (!/\.mdx?$/.test(file) || parts.some(part => part.startsWith("_")))
        return [];
      const source = read(file);
      const fm = frontmatterOf(source);
      const id = parts.join("/").replace(/\.mdx?$/, "");
      const published = fm.pubDatetime;
      return [
        {
          collection: name,
          route: name === "pages" && id === "home" ? "/" : `${prefix}${id}/`,
          draft: isDraft(source),
          future:
            name === "blog" &&
            (published instanceof Date || typeof published === "string") &&
            new Date(published).getTime() > now - ONE_DAY_MS,
          tagged:
            (name === "blog" || name === "notes") &&
            [fm.tags].flat().some(tag => String(tag ?? "").trim() !== ""),
          canonicalUrl: stringField(fm, "canonicalUrl"),
          ogImage: stringField(fm, "ogImage"),
        },
      ];
    })
  );
}

const entries = sourceEntries();
const entryOf = new Map(entries.map(entry => [entry.route, entry]));
const draftRoutes = new Set(
  entries.filter(entry => entry.draft).map(entry => entry.route)
);
const published = entries.filter(entry => !entry.draft && !entry.future);
const searchable = published.filter(entry => entry.collection !== "pages");

// --- Drafts -----------------------------------------------------------------

function checkDraftsUnbuilt(): void {
  for (const route of draftRoutes)
    if (existsSync(routeFile(route))) fail("", `draft built: ${route}`);
}

function checkDraftLinks(): void {
  for (const file of files.filter(name => /\.(html|xml|txt)$/.test(name))) {
    const text = read(file);
    for (const route of draftRoutes)
      if (
        text.includes(`href="${route}"`) ||
        text.includes(`${origin}${route}`)
      )
        fail(rel(file), `links draft route ${route}`);
  }
}

/** Images that only a draft references stay out of dist/_astro. */
function checkDraftAssets(): void {
  for (const file of findDraftOnlyAssets(DIST))
    fail(rel(file), "draft-only asset shipped");
}

function checkDraftsUnindexed(): void {
  for (const url of searchIndex.urls)
    if (draftRoutes.has(url)) fail("", `search index holds draft route ${url}`);
}

// --- Links ------------------------------------------------------------------

const ALWAYS_BUILT_ROUTES = [
  "/",
  "/about/",
  "/404.html",
  "/robots.txt",
  "/sitemap-index.xml",
];

function expectedRoutes(): Set<string> {
  const has = (collection: Entry["collection"]) =>
    published.some(entry => entry.collection === collection);
  const conditional: [boolean, string[]][] = [
    [has("blog"), ["/blog/"]],
    [has("notes"), ["/notes/"]],
    [has("projects"), ["/projects/"]],
    [has("blog") || has("notes"), ["/rss.xml"]],
    [published.some(entry => entry.tagged), ["/tags/"]],
    [config.features.search === "pagefind", ["/search/"]],
    [hasSmallWebPage(config), [`/${SMALL_WEB_PATH}/`, "/88x31.png"]],
    [profileLinks(config.links).some(link => link.url?.trim()), ["/contact/"]],
  ];
  return new Set([
    ...ALWAYS_BUILT_ROUTES,
    ...conditional.flatMap(([built, routes]) => (built ? routes : [])),
    ...published.map(entry => entry.route),
  ]);
}

function checkRoutes(): void {
  for (const route of expectedRoutes())
    if (!existsSync(routeFile(route))) fail("", `route ${route} missing`);
}

/**
 * og:image is absolute. On the site it names a file in dist; on another
 * origin it is the entry's own `ogImage`.
 */
function checkOgImage({ name, route, head }: Page): void {
  const own = entryOf.get(route)?.ogImage;
  for (const { key, content: url } of metaTags(head)) {
    if (key !== "og:image") continue;
    if (!URL.canParse(url))
      fail(name, `og:image ${url} is not an absolute URL`);
    else if (url.startsWith(site.href)) {
      if (!distFileOf(url)) fail(name, `og:image ${url} not in dist`);
    } else if (
      !own ||
      !URL.canParse(own, origin) ||
      new URL(own, origin).href !== url
    )
      fail(
        name,
        `og:image ${url} is on another origin and is not this page's ogImage override`
      );
  }
}

const ASSET_ATTRIBUTES = [
  "src",
  "srcset",
  "href",
  "content",
  "poster",
  "imagesrcset",
];

function astroAssetPath(url: string): string[] {
  if (url.startsWith(`${BASE}/_astro/`)) return [url.slice(BASE.length)];
  if (url.startsWith(`${origin}/_astro/`)) return [url.slice(origin.length)];
  return [];
}

/** Local `/_astro/...` paths inside CSS `url(...)` values. */
function cssAssetUrls(css: string): string[] {
  return [...css.matchAll(/url\(\s*["']?([^"')\s]+)/gi)].flatMap(
    ([, raw = ""]) => astroAssetPath(decodeEntities(raw))
  );
}

/** Every `/_astro/...` URL a page's tags, inline styles and style attributes reference. */
function pageAssetUrls(html: string): string[] {
  return pageTags(html).flatMap(({ tag, name, body }) => [
    ...(name === "style" ? cssAssetUrls(body ?? "") : []),
    ...ASSET_ATTRIBUTES.flatMap(attribute =>
      (attr(tag, attribute) ?? "")
        .trim()
        .split(/[\s,]+/)
        .flatMap(astroAssetPath)
    ),
    ...cssAssetUrls(attr(tag, "style") ?? ""),
  ]);
}

/** Every `/_astro/...` reference names a file in dist. */
function checkAssetUrls(name: string, urls: string[]): void {
  for (const url of new Set(urls)) {
    let path: string;
    try {
      path = decodeURIComponent(url.replace(/[?#].*$/, ""));
    } catch {
      fail(name, `references malformed asset URL ${url}`);
      continue;
    }
    if (!isFile(join(DIST, path)))
      fail(name, `references missing asset ${url}`);
  }
}

/**
 * Each URL appears once in the footer: credit, badges, text links, contact,
 * source. Only the <footer> counts: /contact/ lists the profiles again.
 */
function checkFooterLinks({ name, html }: Page): void {
  const seen = new Set<string>();
  for (const [tag] of footerOf(html).matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(tag, "href");
    if (href === undefined) continue;
    const key = sameLinkKey(href, site);
    if (seen.has(key)) fail(name, `footer links ${href} twice`);
    seen.add(key);
  }
}

// --- Search -----------------------------------------------------------------

type SearchIndex = {
  urls: string[];
  unreadable: string[];
};

function readSearchIndex(): SearchIndex {
  const index: SearchIndex = { urls: [], unreadable: [] };
  for (const file of files) {
    const name = rel(file);
    if (!/^pagefind\/fragment\/.*\.pf_fragment$/.test(name)) continue;
    try {
      const raw = gunzipSync(readFileSync(file)).toString("utf8");
      const { url } = JSON.parse(raw.slice(raw.indexOf("{"))) as {
        url?: unknown;
      };
      index.urls.push(typeof url === "string" ? url : "");
    } catch (error) {
      index.unreadable.push(
        `${name}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  return index;
}

const searchIndex = readSearchIndex();

function checkSearchBundle(): void {
  const { urls, unreadable } = searchIndex;
  for (const name of ["pagefind.js", "pagefind-entry.json"])
    if (!existsSync(join(DIST, "pagefind", name)))
      fail("", `bundle missing (${name})`);
  for (const problem of unreadable) fail("", `unreadable fragment ${problem}`);

  for (const url of urls) {
    const entry = entryOf.get(url);
    if (!entry || entry.collection === "pages")
      fail("", `index holds ${url}, outside the content routes`);
  }
  for (const { route } of searchable) {
    const count = urls.filter(url => url === route).length;
    if (count !== 1)
      fail("", `published route ${route} indexed ${count} times`);
  }

  const entryFile = join(DIST, "pagefind", "pagefind-entry.json");
  if (!existsSync(entryFile)) return;
  try {
    const { languages = {} } = JSON.parse(read(entryFile)) as {
      languages?: Record<string, { page_count?: number }>;
    };
    const pageCount = Object.values(languages).reduce(
      (sum, language) => sum + (language.page_count ?? 0),
      0
    );
    if (pageCount !== urls.length)
      fail(
        "pagefind/pagefind-entry.json",
        `counts ${pageCount} page(s) but ${urls.length} fragment(s) exist`
      );
  } catch {
    fail("pagefind/pagefind-entry.json", "invalid JSON");
  }
}

/** /search/ shows the nothing-published line exactly when the index is empty. */
function checkSearchPage(): void {
  if (config.features.search !== "pagefind") return;
  const file = routeFile("/search/");
  if (!existsSync(file)) return;
  const indexed = searchIndex.urls.length;
  const empty = /<div\b[^>]*\sdata-search-empty[\s>=]/.test(read(file));
  if (empty !== (indexed === 0))
    fail(
      "search/index.html",
      `shows ${empty ? "empty" : "search"} but ${indexed} page(s) are indexed`
    );
}

// --- Discovery: sitemap, robots, feed and canonical --------------------------

/** Every `<loc>` value of a sitemap file, in order. */
function sitemapLocations(file: string): string[] {
  return [...read(file).matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map(match =>
    decodeEntities(match[1])
  );
}

/**
 * The sitemap lists exactly the built page routes: absolute, on the origin,
 * with a trailing slash, and without drafts.
 */
function checkSitemap(): void {
  const indexFile = join(DIST, "sitemap-index.xml");
  if (!existsSync(indexFile)) return fail("", "sitemap-index.xml missing");
  const built = new Set(
    pages.map(page => page.route).filter(route => route.endsWith("/"))
  );
  const listed = new Set<string>();
  for (const location of sitemapLocations(indexFile)) {
    const name = location.startsWith(site.href)
      ? location.slice(site.href.length)
      : "";
    if (!/^sitemap-\d+\.xml$/.test(name))
      fail("sitemap-index.xml", `${location} is not ${origin}/sitemap-<n>.xml`);
    else if (!existsSync(join(DIST, name)))
      fail("sitemap-index.xml", `${location} has no dist file`);
    else for (const url of sitemapLocations(join(DIST, name))) listed.add(url);
  }
  for (const url of listed) {
    if (!url.startsWith(site.href)) {
      fail("", `sitemap: ${url} not on ${origin}`);
      continue;
    }
    if (!url.endsWith("/")) fail("", `sitemap: ${url} lacks trailing slash`);
    const route = url.slice(origin.length);
    if (draftRoutes.has(route)) fail("", `sitemap: ${url} is a draft route`);
    else if (!built.has(route)) fail("", `sitemap: ${url} has no dist page`);
  }
  for (const route of built)
    if (!listed.has(`${origin}${route}`))
      fail("", `sitemap: route ${route} missing`);
}

function checkRobots(): void {
  const lines = robots.split(/\r?\n/).map(line => line.trim());
  for (const line of [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${origin}/sitemap-index.xml`,
  ])
    if (!lines.includes(line)) fail("robots.txt", `missing "${line}"`);
}

function checkRssFeed(): void {
  const file = join(DIST, "rss.xml");
  if (!existsSync(file)) return;
  const xml = read(file);
  const channel = xml.split("<item>")[0] ?? "";
  if (!/<rss\b[^>]*\sxmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/.test(xml))
    fail("rss.xml", "atom namespace not declared");
  const self = [...channel.matchAll(/<atom:link\b[^>]*>/g)]
    .map(match => match[0])
    .find(tag => attr(tag, "rel") === "self");
  const href = self === undefined ? undefined : attr(self, "href");
  if (href === undefined) fail("rss.xml", 'no atom:link rel="self"');
  else if (href !== `${origin}/rss.xml`)
    fail("rss.xml", `self link ${href} is not ${origin}/rss.xml`);
  if (!/<language>\s*\S[^<]*<\/language>/.test(channel))
    fail("rss.xml", "no <language>");
  if (xml.includes("<pubDate>") && !/<lastBuildDate>[^<]+</.test(channel))
    fail("rss.xml", "items have a pubDate but there is no <lastBuildDate>");
}

function checkCanonical({ name, route, head }: Page): void {
  const canonicals = [
    ...head.matchAll(/<link\b[^>]*\srel=["']?canonical["']?[^>]*>/gi),
  ].map(match => attr(match[0], "href") ?? "");
  if (canonicals.length !== 1)
    fail(name, `${canonicals.length} canonical links`);
  const expected = entryOf.get(route)?.canonicalUrl ?? `${origin}${route}`;
  for (const canonical of canonicals)
    if (canonical !== expected)
      fail(name, `canonical ${canonical} != ${expected}`);
}

// --- Accessibility ----------------------------------------------------------

function checkHeadings({ name, markup }: Page): void {
  const headings = [
    ...markup.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi),
  ].map(match => ({
    level: Number(match[1]),
    text: plainText(match[2] ?? "").slice(0, 60),
  }));
  const h1Count = (markup.match(/<h1[\s>]/gi) ?? []).length;
  if (h1Count !== 1) fail(name, `expected exactly 1 <h1>, found ${h1Count}`);
  let previous = 0;
  for (const heading of headings) {
    if (previous > 0 && heading.level > previous + 1)
      fail(
        name,
        `heading level jumps from h${previous} to h${heading.level} at "${heading.text}"`
      );
    previous = heading.level;
  }
}

function checkImageAlt({ name, markup }: Page): void {
  for (const [tag] of markup.matchAll(/<img\b[^>]*>/gi))
    if (!attr(tag, "alt")?.trim())
      fail(
        name,
        `<img src="${attr(tag, "src") ?? ""}"> has a missing or empty alt`
      );
}

const PALETTE_TEXT = [
  "--foreground",
  "--muted-foreground",
  "--accent",
  "--code-comment",
  "--red",
  "--orange",
  "--yellow",
  "--green",
  "--cyan",
  "--blue",
  "--purple",
];
const PALETTE_SURFACES = ["--background", "--mantle", "--crust", "--muted"];
const AA = 4.5;

/**
 * Every palette the site ships (the inline style of the homepage, custom ones
 * included) meets WCAG AA: each text token on each surface, and
 * accent-foreground on accent. The <html> data-dark / data-light attributes
 * name a shipped palette.
 */
function checkPalettes(): void {
  const rules = [
    ...home.matchAll(/html\[data-(dark|light)="([\w-]+)"\][^{]*\{([^}]*)\}/g),
  ];
  if (rules.length === 0)
    return fail("index.html", "palette: no palette rules");
  const shipped = new Set(rules.map(([, mode, name]) => `${mode}:${name}`));
  for (const mode of ["dark", "light"]) {
    const name = new RegExp(`<html[^>]*\\sdata-${mode}="([\\w-]+)"`).exec(
      home
    )?.[1];
    if (!name || !shipped.has(`${mode}:${name}`))
      fail(
        "index.html",
        `palette: data-${mode}="${name ?? ""}" is not shipped`
      );
  }
  for (const [, mode, name, body = ""] of rules) {
    const vars = new Map(
      [...body.matchAll(/(--[\w-]+):(#[0-9a-fA-F]{3,8})/g)].map(
        ([, key = "", value = ""]) => [key, value]
      )
    );
    const colour = (key: string) => vars.get(key) ?? "#000";
    const id = `${mode} palette "${name}"`;
    for (const key of [
      ...PALETTE_TEXT,
      ...PALETTE_SURFACES,
      "--accent-foreground",
    ])
      if (!vars.has(key)) fail("", `palette: ${id} has no ${key}`);
    for (const text of PALETTE_TEXT)
      for (const surface of PALETTE_SURFACES) {
        const ratio = contrast(colour(text), colour(surface));
        if (ratio < AA)
          fail(
            "",
            `palette: ${id} ${text} on ${surface} is ${ratio.toFixed(2)}:1, below ${AA}`
          );
      }
    const onAccent = contrast(
      colour("--accent-foreground"),
      colour("--accent")
    );
    if (onAccent < AA)
      fail(
        "",
        `palette: ${id} --accent-foreground on --accent is ${onAccent.toFixed(2)}:1`
      );
  }
}

// --- Badge claims: page weight and cookies ----------------------------------

function largestFile(candidates: string[]): string | undefined {
  return candidates.sort((a, b) => statSync(b).size - statSync(a).size)[0];
}

function homepageWeight(): PageWeight {
  const codePoints = codePointsOf(plainText(visibleMarkup(home)));
  const loaded = new Set<string>();
  const pending: string[] = [];
  const add = (file: string | undefined) => {
    if (!file || loaded.has(file)) return;
    loaded.add(file);
    pending.push(file);
  };
  const load = (url: string | undefined, base?: string) =>
    add(url ? distFileOf(url, base) : undefined);
  const tags = pageTags(home);
  for (const { tag, name, body } of tags) {
    for (const url of cssRequests(
      `${name === "style" ? (body ?? "") : ""}\n${attr(tag, "style") ?? ""}`,
      codePoints
    ))
      load(url);
    if (name === "link") {
      if (LOADING_RELATIONS.some(rel => relations(tag).includes(rel)))
        load(attr(tag, "href"));
    } else if (name === "script") {
      load(attr(tag, "src"));
      if (attr(tag, "type") === "module")
        for (const url of scriptImports(body ?? "")) load(url);
    } else if (name === "img" || name === "source") {
      const candidates = (attr(tag, "srcset") ?? "")
        .split(",")
        .flatMap(item => distFileOf(item.trim().split(/\s+/)[0] ?? "") ?? []);
      if (candidates.length > 0) add(largestFile(candidates));
      else load(attr(tag, "src"));
    } else if (name === "video") {
      load(attr(tag, "poster"));
    }
  }
  while (pending.length > 0) {
    const file = pending.shift() ?? "";
    const base = new URL(rel(file), site).href;
    if (file.endsWith(".css"))
      for (const url of cssRequests(read(file), codePoints)) load(url, base);
    else if (/\.m?js$/.test(file))
      for (const url of scriptImports(read(file))) load(url, base);
  }
  const bodies = [
    Buffer.from(home),
    ...[...loaded].map(file => readFileSync(file)),
  ];
  const beacon = tags.some(({ tag }) => isAllowedBeacon(tag));
  return {
    raw:
      bodies.reduce((sum, body) => sum + body.length, 0) +
      (beacon ? CF_BEACON_UNCOMPRESSED_BYTES : 0),
    gzip:
      bodies.reduce((sum, body) => sum + gzipSync(body).length, 0) +
      (beacon ? CF_BEACON_GZIP_BYTES : 0),
  };
}

function checkPageWeight(): void {
  const clubs = [...footerBadgeTypes(home)].flatMap(
    type => sizeClub(type) ?? []
  );
  if (clubs.length === 0) return;
  const weight = homepageWeight();
  for (const club of clubs) {
    const problem = sizeClubProblem(club, weight);
    if (problem) fail("index.html", `${club.type} badge: ${problem}`);
  }
}

function checkDarkTheme(): void {
  if (!footerBadgeTypes(home).has("darktheme")) return;
  if (config.appearance.defaultMode === "light")
    fail(
      "index.html",
      'the darktheme badge needs appearance.defaultMode "dark" or "system"'
    );
}

function checkCookies(): void {
  if (!footerBadgeTypes(home).has(NO_COOKIES_BADGE)) return;
  for (const { name, html } of pages) {
    for (const { url, source } of pageSubresources(html, isAllowedBeacon))
      if (isCrossOrigin(url, site))
        fail(name, `${source} loads ${url} from another origin`);
    for (const script of inlineScripts(html))
      for (const api of cookieApisIn(script))
        fail(name, `an inline script uses ${api}`);
  }
  for (const file of files) {
    const name = rel(file);
    if (name.endsWith(".css"))
      for (const url of cssSubresources(read(file)))
        if (isCrossOrigin(url, new URL(name, site)))
          fail(name, `loads ${url} from another origin`);
    if (/\.m?js$/.test(name))
      for (const api of cookieApisIn(read(file))) fail(name, `uses ${api}`);
  }
}

// --- Type scale -------------------------------------------------------------

const TYPE_SCALE_FILES = /\.(astro|ts|tsx|js|md|mdx|css)$/;
/** Tailwind utilities that leave the type scale of site-theme.css. */
const OUT_OF_SCALE =
  /(?<![\w-])(?:(?:[a-z0-9-]+|\[[^\]\s]*\]):)*(text-[4-9]xl|text-\[[0-9.][^\]\s]*\]|font-(?:thin|extralight|black|\[[^\]\s]*\]))(?![\w-])/g;
/** The font sizes (px) and weights of the type scale in site-theme.css. */
const SCALE_SIZES = new Set([10, 12, 13, 14, 15, 17, 18, 20, 24, 28, 32]);
const SCALE_WEIGHTS = new Set([400, 600]);
/** CSS in stylesheets and Astro `<style>` blocks. */
const STYLE_FILES = /\.(css|astro)$/;
/** `font-size`, `font-weight`, the `font` shorthand and the `--t-*` / `--text-*` tokens. */
const FONT_DECLARATION =
  /(?<![\w-])(font-size|font-weight|font|--t-[\w-]+|--text-(?:xs|sm|base|lg|\d?xl))\s*:\s*([^;{}]+)/g;

/** Pixel size of a px or rem length. */
function pixels(value: string, unit: string): number {
  return unit === "rem" ? Number(value) * 16 : Number(value);
}

/** Why a font declaration leaves the scale, or null when it is on it. */
function offScale(property: string, value: string): string | null {
  const v = value.trim();
  if (
    /^(?:inherit|initial|unset|revert)$/.test(v) ||
    /^var\(--[\w-]+\)$/.test(v)
  )
    return null;
  if (property === "font-weight") {
    if (v === "normal") return null;
    return SCALE_WEIGHTS.has(Number(v)) ? null : `font-weight ${v}`;
  }
  if (property === "font-size" || property.startsWith("--text-")) {
    if (v === "1em" || v === "100%") return null;
    const size = /^([\d.]+)(px|rem)$/.exec(v);
    if (!size) return `${property} ${v}`;
    const px = pixels(size[1] ?? "", size[2] ?? "");
    return SCALE_SIZES.has(px) ? null : `${property} ${v}`;
  }
  // The font shorthand and the --t-* tokens: `[weight] size/line-height family`.
  const size = /(?:^|\s)([\d.]+)(px|rem)\s*\//.exec(v);
  if (!size)
    return /\d/.test(v.split(/\s/)[0] ?? "") ? `${property} ${v}` : null;
  const px = pixels(size[1] ?? "", size[2] ?? "");
  if (!SCALE_SIZES.has(px)) return `${property} ${v}`;
  const weight = /^(\d{3})\s/.exec(v)?.[1];
  if (weight && !SCALE_WEIGHTS.has(Number(weight))) return `${property} ${v}`;
  return null;
}

/**
 * Source files stay on the type scale: every size and weight utility is on
 * it, and every font size and weight written in CSS (stylesheets and Astro
 * `<style>` blocks) is one of the scale's sizes and weights or a token.
 */
function checkTypeScale(): void {
  for (const file of walk("src").filter(name => TYPE_SCALE_FILES.test(name))) {
    const path = file.split(sep).join("/");
    const styled = STYLE_FILES.test(file);
    read(file)
      .split(/\r?\n/)
      .forEach((line, index) => {
        const problems = [
          ...[...line.matchAll(OUT_OF_SCALE)].map(match => match[1]),
          ...(styled ? [...line.matchAll(FONT_DECLARATION)] : []).map(
            ([, property = "", value = ""]) => offScale(property, value)
          ),
        ];
        for (const problem of problems)
          if (problem)
            fail(
              "",
              `${path}:${index + 1}: ${problem} is outside the type scale`
            );
      });
  }
}

// --- Run --------------------------------------------------------------------

run("drafts", () => {
  checkDraftsUnbuilt();
  checkDraftLinks();
  checkDraftAssets();
  checkDraftsUnindexed();
});
run("links", () => {
  checkRoutes();
  for (const page of pages) {
    checkOgImage(page);
    checkAssetUrls(page.name, pageAssetUrls(page.html));
    checkFooterLinks(page);
  }
  for (const file of files.filter(name => name.endsWith(".css")))
    checkAssetUrls(rel(file), cssAssetUrls(read(file)));
});
run("discovery", () => {
  checkSitemap();
  checkRobots();
  checkRssFeed();
  pages.forEach(checkCanonical);
});
run("search", () => {
  checkSearchBundle();
  checkSearchPage();
});
run("accessibility", () => {
  checkPalettes();
  pages.forEach(checkHeadings);
  pages.forEach(checkImageAlt);
});
run("type-scale", checkTypeScale);
run("claims", () => {
  checkPageWeight();
  checkCookies();
  checkDarkTheme();
});

const failed = checks.filter(check => check.problems.length > 0);
const scope = `${checks.length} checks on ${pages.length} pages`;
if (failed.length > 0) {
  for (const { name, problems } of failed)
    for (const problem of problems)
      console.error(`verify-dist: FAIL ${name}: ${problem}`);
  const count = failed.reduce((sum, check) => sum + check.problems.length, 0);
  console.error(
    `verify-dist: ${failed.length} of ${scope} failed (${failed.map(check => check.name).join(", ")}): ${count} ${count === 1 ? "problem" : "problems"}.`
  );
  process.exit(1);
}
console.log(
  `verify-dist: all ${scope} passed (${checks.map(check => check.name).join(", ")}).`
);
