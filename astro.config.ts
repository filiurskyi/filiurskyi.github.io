import { defineConfig, fontProviders, svgoOptimizer } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import {
  rehypeHeadingIds,
  unified,
  type RemarkPlugins,
} from "@astrojs/markdown-remark";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeCallouts from "rehype-callouts";
import { createCssVariablesTheme } from "shiki";
import { rehypeBlockLabels } from "./src/utils/rehypeBlockLabels";
import { rehypeTableWrapper } from "./src/utils/rehypeTableWrapper";
import { rehypeTodoMarkers } from "./src/utils/rehypeTodoMarkers";
import {
  obsidianIntegration,
  remarkObsidian,
} from "./src/utils/remarkObsidian";
import {
  contentCacheKey,
  contentCacheKeyPlugin,
} from "./src/utils/contentCacheKey";
import { tplStr } from "./src/i18n/format";
import type { UIStrings } from "./src/i18n/types";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import userConfig from "./starglow.config";
import { parseStarglowConfig } from "./src/types/config";
import { splitVariant } from "./src/utils/fontSubset";
import { remarkImages } from "./src/utils/remarkImages";
import { sitemapLastmod } from "./src/utils/sitemapLastmod";

// Fails here, before anything else runs, on an unknown key or a wrong value.
const config = parseStarglowConfig(userConfig);
const OBSIDIAN = config.features.obsidian;

// The site locale. Astro's i18n, <html lang> and the build-time UI strings
// (heading-link and table labels) all follow `site.lang`, so it needs a
// matching strings file in src/i18n/lang/.
const LANG = config.site.lang;
const LANG_FILE = new URL(`./src/i18n/lang/${LANG}.ts`, import.meta.url);
if (!existsSync(LANG_FILE)) {
  throw new Error(
    `site.lang is "${LANG}", but src/i18n/lang/${LANG}.ts does not exist. Copy src/i18n/lang/en.ts to it and translate the strings, or set site.lang to an existing locale.`
  );
}
const strings: UIStrings = (
  (await import(/* @vite-ignore */ LANG_FILE.href)) as { default: UIStrings }
).default;
const lastmod = sitemapLastmod(config.site.base);

// Plain text of a hast node (hast-util-to-string is not a direct dependency).
type HastNode = { type: string; value?: string; children?: HastNode[] };
const hastText = (node: HastNode): string =>
  node.type === "text"
    ? (node.value ?? "")
    : (node.children ?? []).map(hastText).join("");

export default defineConfig({
  site: config.site.url,
  ...(config.site.base && { base: config.site.base }),
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    ...(OBSIDIAN ? [obsidianIntegration()] : []),
    mdx(),
    lastmod.integration,
    sitemap({ serialize: lastmod.serialize }),
  ],
  i18n: {
    locales: [LANG],
    defaultLocale: LANG,
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    // Order matters: heading ids first (anchors link to them), anchors before
    // callouts, block labels and TODO markers after callouts, table wrapper
    // last. Shiki runs before all of them. MDX inherits this processor.
    processor: unified({
      remarkPlugins: [
        ...((OBSIDIAN
          ? [[remarkObsidian, { timezone: config.site.timezone }]]
          : []) satisfies RemarkPlugins),
        [remarkImages, config.images],
      ],
      rehypePlugins: [
        rehypeHeadingIds,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            test: ["h2", "h3", "h4", "h5", "h6"],
            properties: (node: HastNode) => ({
              className: ["heading-link"],
              dataPagefindIgnore: true,
              ariaLabel: tplStr(strings.a11y.headingLink, {
                heading: hastText(node),
              }),
            }),
            content: {
              type: "element",
              tagName: "span",
              properties: { className: ["heading-mark"], ariaHidden: "true" },
              children: [],
            },
          },
        ],
        [rehypeCallouts, { theme: "github" }],
        rehypeBlockLabels,
        rehypeTodoMarkers,
        [rehypeTableWrapper, { label: strings.a11y.scrollableTable }],
        // No-op: its key clears Astro's content cache when theme code changes.
        [
          contentCacheKeyPlugin,
          {
            key: contentCacheKey(fileURLToPath(new URL(".", import.meta.url))),
          },
        ],
      ],
    }),
    shikiConfig: {
      // Code colours come from the active palette (src/palettes.ts) through
      // --shiki-* custom properties set in src/styles/site-theme.css.
      theme: createCssVariablesTheme({
        name: "starglow",
        variablePrefix: "--shiki-",
        fontStyle: true,
      }),
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-inter",
      provider: fontProviders.local(),
      fallbacks: ["system-ui", "sans-serif"],
      display: "swap",
      options: {
        variants: [
          ...splitVariant("inter-latin-400-normal", 400, "normal"),
          ...splitVariant("inter-latin-400-italic", 400, "italic"),
          ...splitVariant("inter-latin-600-normal", 600, "normal"),
          ...splitVariant("inter-latin-600-italic", 600, "italic"),
        ],
      },
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.local(),
      fallbacks: ["ui-monospace", "monospace"],
      display: "swap",
      options: {
        variants: [
          ...splitVariant("jetbrains-mono-latin-400-normal", 400, "normal"),
          ...splitVariant("jetbrains-mono-latin-400-italic", 400, "italic"),
        ],
      },
    },
    {
      // The wordmark face (site title in the header). Replace name and file to
      // swap it; only its Latin subset ships.
      name: "Pixelify Sans",
      cssVariable: "--font-wordmark",
      provider: fontProviders.local(),
      fallbacks: ["monospace"],
      display: "swap",
      options: {
        variants: [
          ...splitVariant("pixelify-sans-latin-400-normal", 400, "normal"),
        ],
      },
    },
  ],
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
