/**
 * The starglow.config.ts schema. It is the only definition of the config:
 * the `StarglowConfig` type is derived from it, and `parseStarglowConfig`
 * fails the build on an unknown key, a wrong type or a removed key.
 */
import { z } from "astro/zod";
import { darkPalettes, lightPalettes, type Palette } from "../palettes";
import { PLACEHOLDER_MARKERS } from "../utils/markers";

/** Theme repository, linked from the footer credit. */
export const STARGLOW_REPO = "https://github.com/glowing-space/starglow";

/** Header band glow behind the wordmark and page head. */
export type AmbientMode = "none" | "light" | "breathe" | "dawn";

/** Icon and default label of an 88x31 badge. Unknown types get a generic icon. */
export type BadgeType =
  | "github"
  | "gitlab"
  | "codeberg"
  | "srht"
  | "linkedin"
  | "mastodon"
  | "bluesky"
  | "stack"
  | "hackaday"
  | "crates"
  | "email"
  | "rss"
  | "sparkle"
  | (string & {});

/**
 * Keys that no longer exist. Setting one fails the build with this hint
 * instead of a plain "unknown key".
 */
export const REMOVED_KEYS: Record<string, string> = {
  socials:
    'removed in v0.1.1 (see UPGRADING.md): add each profile to `links` as a badge, e.g. { type: "github", url: "https://github.com/you" }',
  "person.description":
    "removed in v0.1.1 (see UPGRADING.md): site.description describes the site; the Person keeps only jobTitle",
  "site.fediverseCreator":
    'removed in v0.1.1 (see UPGRADING.md): add a mastodon badge to `links` ({ type: "mastodon", url: "https://instance/@user" }); the fediverse:creator meta comes from it',
  "features.editPost.url":
    'removed in v0.1.1 (see UPGRADING.md): set site.sourceUrl to the repository; features.editPost.path ("edit/main/" by default) is appended',
  "site.url":
    "not set in this file: the site origin comes from the SITE_URL environment variable",
};

const isTimezone = (zone: string) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
};

const isHttpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** http(s), mailto: or a site path starting with "/". */
const isLinkUrl = (value: string) => {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** The view-source comment body: art, then message. */
const bannerBody = (banner: { art?: string; message?: string } | undefined) =>
  [banner?.art, banner?.message]
    .map(part => (part ?? "").replace(/^\n+|\s+$/g, ""))
    .filter(Boolean)
    .join("\n");

const HEX_COLOUR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const hex = z
  .string()
  .regex(HEX_COLOUR, 'expected an opaque hex colour like "#1e1e2e"');

const paletteSchema = z.strictObject({
  label: z.string(),
  bg: hex,
  mantle: hex,
  crust: hex,
  muted: hex,
  border: hex,
  fg: hex,
  mutedFg: hex,
  accent: hex,
  accentFg: hex,
  comment: hex,
  red: hex,
  orange: hex,
  yellow: hex,
  green: hex,
  cyan: hex,
  blue: hex,
  purple: hex,
  glow: hex,
}) satisfies z.ZodType<Palette>;

// Custom palette names end up in CSS selectors.
const customPalettes = z.record(
  z
    .string()
    .regex(/^[\w-]+$/, 'use letters, digits, "_" and "-" in a palette name'),
  paletteSchema
);

const count = z
  .int({ error: "expected a whole number above 0" })
  .min(1, { error: "expected a whole number above 0" })
  .default(4);

const siteSchema = z.strictObject({
  /** Blog title shown in header and meta tags */
  title: z.string().min(1),
  /**
   * One sentence about the site: the home page meta description, the RSS
   * feed and the WebSite structured data.
   *
   * Used by: src/pages/index.astro, src/pages/rss.xml.ts, src/pages/og.png.ts.
   */
  description: z.string(),
  /**
   * Default post author name
   *
   * Used by: src/content.config.ts (post default), src/components/Footer.astro,
   * src/utils/og/renderOg.ts.
   */
  author: z.string(),
  /**
   * Source repository of this site: the footer "source" link (left out when
   * another footer link already has this URL) and the base of
   * `features.editPost`. Empty = neither.
   *
   * Used by: src/utils/footer.ts, src/config.ts (features.editPost).
   */
  sourceUrl: z
    .string()
    .refine(url => url.trim() === "" || isHttpUrl(url.trim()), {
      error: "expected an http(s) URL or an empty string",
    })
    .optional(),
  /**
   * Header wordmark text (pixel face). Defaults to `title`.
   *
   * Used by: src/components/Header.astro.
   */
  wordmark: z.string().optional(),
  /**
   * HTML comment written right after the doctype of every page, for people
   * who read the source. Empty or missing = no comment. Must not contain `--`.
   *
   * Used by: src/layouts/Layout.astro.
   */
  sourceBanner: z
    .strictObject({
      /** Multi-line ASCII art, e.g. the wordmark in a figlet font. */
      art: z.string().optional(),
      /** Lines printed under the art. */
      message: z.string().optional(),
    })
    .optional()
    .refine(
      banner => {
        const body = bannerBody(banner);
        return !(
          body.includes("--") ||
          body.startsWith(">") ||
          body.endsWith("-")
        );
      },
      {
        error:
          "must not contain `--`, start with `>` or end with `-` (it is an HTML comment)",
      }
    )
    .transform(bannerBody),
  /**
   * Fallback OG image filename in /public, e.g. "og.jpg"
   *
   * Used by: src/utils/resolveDefaultOgImagePath.ts.
   */
  ogImage: z
    .string()
    .refine(name => name !== "" && !/\.\.|[/\\]/.test(name), {
      error: 'expected a single filename in public/, e.g. "default-og.jpg"',
    })
    .optional(),
  /**
   * HTML lang attribute, defaults to "en"
   *
   * Used by: astro.config.ts (locale, UI strings), src/i18n/index.ts.
   */
  lang: z
    .string()
    .regex(/^[A-Za-z0-9-]+$/, 'expected a locale such as "en" or "de"')
    .default("en"),
  /**
   * IANA timezone for post dates, e.g. "Asia/Bangkok". Defaults to "UTC".
   *
   * Used by: src/content.config.ts, src/utils/postFilter.ts, PostMeta.astro,
   * ./dev.sh new.
   */
  timezone: z
    .string()
    .refine(isTimezone, {
      error:
        'unknown timezone; use an IANA name such as "Asia/Bangkok" or "America/New_York"',
    })
    .default("UTC"),
  /**
   * Text direction
   *
   * Used by: src/layouts/Layout.astro.
   */
  dir: z.enum(["ltr", "rtl", "auto"]).default("ltr"),
  /**
   * Google Search Console verification meta tag value
   *
   * Used by: src/layouts/Layout.astro.
   */
  googleVerification: z.string().optional(),
});

const postsSchema = z.strictObject({
  /**
   * Posts per page on paginated listing pages
   *
   * Used by: src/pages/{blog,notes}/[...page].astro,
   * src/pages/tags/[tag]/[...page].astro.
   */
  perPage: count,
  /**
   * Featured projects on the home page. The home writing list (posts and
   * notes) shows twice as many.
   *
   * Used by: src/pages/index.astro.
   */
  perIndex: count,
});

const featuresSchema = z.strictObject({
  /**
   * Enable light/dark mode toggle. Defaults to true.
   *
   * Used by: src/components/Header.astro.
   */
  lightAndDarkMode: z.boolean().default(true),
  /**
   * Generate dynamic OG images per post and provide `/og.png` when the static
   * `public/{site.ogImage}` file is absent. When false, that file is required
   * for the default layout OG image (build fails if missing).
   *
   * Used by: the index.png.ts routes under src/pages/,
   * src/utils/resolveDefaultOgImagePath.ts.
   */
  dynamicOgImage: z.boolean().default(true),
  /**
   * Back link on post and note pages. It reads "Back" when the visitor came
   * from a page of this site and "Home" otherwise. Defaults to true.
   *
   * Used by: src/components/Main.astro, BackButton.astro.
   */
  showBackButton: z.boolean().default(true),
  /**
   * "Edit page" link on posts: `site.sourceUrl` + `path` + the file path.
   * `path` defaults to "edit/main/" (GitHub); GitLab uses "-/edit/main/".
   * Needs `site.sourceUrl`. Defaults to disabled.
   *
   * Used by: src/pages/blog/[...slug]/_components/EditPost.astro.
   */
  editPost: z
    .strictObject({
      /** Show the link. */
      enabled: z.boolean(),
      /** Path between `site.sourceUrl` and the file path. Defaults to "edit/main/". */
      path: z.string().optional(),
    })
    .optional(),
  /**
   * Search provider. "pagefind" ships in the base template.
   * Set to false to disable search entirely.
   *
   * Used by: src/components/Header.astro, src/pages/search.astro.
   */
  search: z
    .union([z.literal("pagefind"), z.literal(false)], {
      error: 'expected "pagefind" or false',
    })
    .default("pagefind"),
  /**
   * Table of contents on posts with 2+ h2/h3 headings: beside the post from
   * 1280px, in the floating button below that. Defaults to true. Turn it off
   * for one post with `hideToc: true` in its frontmatter.
   *
   * Used by: src/pages/blog/[...slug]/index.astro,
   * src/pages/notes/[year]/[slug].astro.
   */
  toc: z.boolean().default(true),
  /**
   * Obsidian-flavoured Markdown in `.md` content: `[[wikilinks]]`, image
   * embeds `![[img.png|alt]]` from `_assets/` next to the file, `%%comments%%`
   * removed. Obsidian-only frontmatter (aliases, cssclasses, publish,
   * permalink, created, modified) is dropped and `tags: rust` or `#rust` is
   * accepted. Defaults to false.
   *
   * Used by: astro.config.ts, src/content.config.ts,
   * src/utils/remarkObsidian.ts.
   */
  obsidian: z.boolean().default(false),
});

const appearanceSchema = z
  .strictObject({
    /**
     * Mode on a first visit, before the visitor uses the toggle: "dark",
     * "light", or "system" to follow the OS setting. A stored toggle choice
     * always wins. Defaults to "dark".
     *
     * Used by: src/layouts/Layout.astro.
     */
    defaultMode: z.enum(["dark", "light", "system"]).default("dark"),
    /**
     * Inner light of the header band: "light" a soft static glow, "breathe"
     * the same glow on a slow 10s pulse, "dawn" an accent-tinted glow.
     * Defaults to "none". The pulse keeps running under
     * prefers-reduced-motion.
     *
     * Used by: src/layouts/Layout.astro, src/components/PreviewPanel.astro.
     */
    ambient: z
      .enum(["none", "light", "breathe", "dawn"] satisfies AmbientMode[])
      .default("none"),
    /**
     * Pulsing accent glow on the wordmark. Defaults to false.
     *
     * Used by: src/layouts/Layout.astro, src/components/PreviewPanel.astro.
     */
    wordmarkGlow: z.boolean().default(false),
    /**
     * Vim-style status bar at the bottom of post and note pages: source
     * path, file type and scroll position; j/k scroll, h/l open the
     * previous/next post. Defaults to false.
     *
     * Used by: src/components/Statusline.astro.
     */
    statusline: z.boolean().default(false),
    /**
     * Colour palettes, chosen separately for dark and light mode. Built in:
     * dark "starglow", "void", "aurora", "ember"; light "starglow", "paper",
     * "petal", "frost", "sand". Defaults to "starglow" for both.
     *
     * Used by: src/layouts/Layout.astro, src/utils/ogTheme.ts.
     */
    palette: z
      .strictObject({
        /** Palette name for dark mode. Defaults to "starglow". */
        dark: z.string().default("starglow"),
        /** Palette name for light mode. Defaults to "starglow". */
        light: z.string().default("starglow"),
      })
      .prefault({}),
    /**
     * Your own palettes, by name, usable in `palette`. Same shape as the
     * built-in ones in src/palettes.ts; pnpm verify checks their contrast.
     */
    palettes: z
      .strictObject({
        /** Extra dark-mode palettes, by name. */
        dark: customPalettes.optional(),
        /** Extra light-mode palettes, by name. */
        light: customPalettes.optional(),
      })
      .optional(),
    /**
     * Floating "preview" panel to switch palette, mode, ambient light, glow
     * and statusline live. For theme demos; changes last for the browser
     * session only. Defaults to false.
     *
     * Used by: src/components/PreviewPanel.astro.
     */
    preview: z.boolean().default(false),
  })
  .transform(({ palettes: custom, ...appearance }, ctx) => {
    const palettes: Record<"dark" | "light", Record<string, Palette>> = {
      dark: { ...darkPalettes, ...custom?.dark },
      light: { ...lightPalettes, ...custom?.light },
    };
    for (const mode of ["dark", "light"] as const) {
      const name = appearance.palette[mode];
      if (!(name in palettes[mode])) {
        ctx.issues.push({
          code: "custom",
          path: ["palette", mode],
          input: name,
          message: `unknown palette "${name}". Available: ${Object.keys(palettes[mode]).join(", ")}`,
        });
      }
    }
    return { ...appearance, palettes };
  });

const badgeSchema = z.strictObject({
  /**
   * Icon and default label: "github", "gitlab", "codeberg", "srht",
   * "linkedin", "mastodon", "bluesky", "stack", "hackaday", "crates",
   * "email", "rss" or "sparkle". Any other name gets a generic icon.
   */
  type: z.custom<BadgeType>(
    value => typeof value === "string" && value !== "",
    { error: 'expected a badge type such as "github"' }
  ),
  /**
   * http(s) or mailto: URL, or a site path starting with "/". Empty or
   * missing = not configured, renders nowhere.
   */
  url: z
    .string()
    .refine(url => url.trim() === "" || isLinkUrl(url.trim()), {
      error: 'expected http(s), mailto: or a path starting with "/"',
    })
    .optional(),
  /** One-line badge text. Defaults per type, e.g. "github". */
  label: z.string().optional(),
  /** Tooltip and accessible name. Defaults per type, e.g. "GitHub". */
  title: z.string().optional(),
});

const footerLinkSchema = z.strictObject({
  /** Link text, shown as written. */
  label: z.string().min(1),
  /** "/impressum/", "https://..." or "mailto:...". */
  href: z.string().min(1),
});

export const starglowConfigSchema = z
  .strictObject({
    /** Site identity: title, author, language, timezone and source. */
    site: siteSchema,
    /** Optional homepage Person structured data (JSON-LD). Real text only. */
    person: z
      .strictObject({
        /**
         * Real job title, or empty to omit it from the Person.
         *
         * Used by: src/pages/index.astro.
         */
        jobTitle: z
          .string()
          .refine(
            text => !PLACEHOLDER_MARKERS.some(marker => text.includes(marker)),
            { error: "must be real text or empty, not a placeholder" }
          )
          .optional(),
      })
      .prefault({}),
    /** How many entries listings and the home page show. */
    posts: postsSchema.prefault({}),
    /** Optional features, each on or off. */
    features: featuresSchema.prefault({}),
    /** Header band glow, wordmark glow and the post statusline. */
    appearance: appearanceSchema.prefault({}),
    /**
     * 88x31 badges under the footer. Profile types (github, mastodon, ...)
     * also become `rel="me"` links and the homepage `sameAs`; a mastodon URL
     * like https://host/@user also sets the `fediverse:creator` meta. Empty
     * urls render nowhere.
     *
     * Used by: src/utils/footer.ts, src/pages/index.astro (sameAs),
     * src/config.ts (fediverse:creator).
     */
    links: z.array(badgeSchema).default([]),
    /** Footer options. */
    footer: z
      .strictObject({
        /**
         * "powered by starglow" in the footer, linked to the theme
         * repository. Defaults to true. Keeping it on is the easiest way to
         * support the theme.
         *
         * Used by: src/utils/footer.ts.
         */
        credit: z.boolean().default(true),
        /**
         * Extra text links on the right of the badge row, for example an
         * Impressum or a privacy policy. A root-relative `href` such as
         * "/impressum/" gets the base path; other hrefs are used as written.
         * Defaults to none.
         */
        links: z.array(footerLinkSchema).default([]),
      })
      .prefault({}),
    /** Build-time processing of Markdown and MDX images. */
    images: z
      .strictObject({
        /**
         * Widest output in px; a larger original is scaled down and a smaller
         * one is kept. An Obsidian size part such as `![[x.png|alt|600]]` sets
         * a narrower width. Defaults to 1200, the 36rem column at 2x.
         *
         * Used by: src/utils/remarkImages.ts.
         */
        maxWidth: z.number().int().min(64).default(1200),
        /**
         * Output format: "webp" or "avif". AVIF encodes slower and beats
         * WebP only at a lower quality, about 50. Defaults to "webp".
         *
         * Used by: src/utils/remarkImages.ts.
         */
        format: z.enum(["webp", "avif"]).default("webp"),
        /**
         * Encoder quality from 1 to 100. Defaults to 80.
         *
         * Used by: src/utils/remarkImages.ts.
         */
        quality: z.number().int().min(1).max(100).default(80),
      })
      .prefault({}),
    /** Optional visitor analytics. Off unless a token is set. */
    analytics: z
      .strictObject({
        /**
         * Cloudflare Web Analytics site token: loads Cloudflare's cookieless
         * beacon on every page. Empty = PUBLIC_CF_WEB_ANALYTICS_TOKEN from the
         * environment, or no script at all.
         *
         * Used by: src/layouts/Layout.astro.
         */
        cloudflareToken: z.string().optional(),
      })
      .prefault({}),
  })
  .superRefine((config, ctx) => {
    if (config.features.editPost?.enabled && !config.site.sourceUrl?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["features", "editPost"],
        message:
          "needs site.sourceUrl, the repository the edit link points into",
      });
    }
  });

/** What you write in starglow.config.ts. */
export type StarglowConfig = z.input<typeof starglowConfigSchema>;
/** The config after validation, with defaults applied. */
export type ParsedStarglowConfig = z.output<typeof starglowConfigSchema>;

export type BadgeLink = z.output<typeof badgeSchema>;
export type PersonConfig = ParsedStarglowConfig["person"];

type Parsed = ParsedStarglowConfig;

export interface ResolvedStarglowConfig {
  site: Omit<Parsed["site"], "wordmark" | "ogImage"> & {
    /** Fallback OG image filename in public/ */
    ogImage: string;
    /** `@user@host` from the mastodon badge in `links`, or undefined */
    fediverseCreator?: string;
    /** Header wordmark text, `title` when not set */
    wordmark: string;
    /** Site origin from SITE_URL (via astro.config.ts) */
    url: string;
  };
  person: PersonConfig;
  posts: Parsed["posts"];
  features: Omit<Parsed["features"], "editPost"> & {
    /** The edit link base, `site.sourceUrl` joined with `editPost.path`. */
    editPost: { enabled: true; url: string } | { enabled: false };
  };
  appearance: Parsed["appearance"];
  /** Badges with a usable URL. The footer drops repeated URLs (utils/footer.ts). */
  links: (BadgeLink & { url: string })[];
  footer: Parsed["footer"];
  images: Parsed["images"];
  analytics: Parsed["analytics"];
}

const levenshtein = (a: string, b: string): number => {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (row[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = row;
  }
  return prev[b.length] ?? 0;
};

/** The closest of `candidates` to `key`, if it is close enough to be a typo. */
export function closestKey(
  key: string,
  candidates: string[]
): string | undefined {
  let best: string | undefined;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance =
      candidate.toLowerCase() === key.toLowerCase()
        ? 0
        : levenshtein(key, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return bestDistance <= Math.max(2, Math.floor(key.length / 3))
    ? best
    : undefined;
}

interface Def {
  type: string;
  innerType?: z.ZodType;
  in?: z.ZodType;
  shape?: Record<string, z.ZodType>;
  element?: z.ZodType;
  valueType?: z.ZodType;
}
const defOf = (schema: z.ZodType) => schema._zod.def as unknown as Def;

/** Optional, default, pipe and similar wrappers peeled off. */
const unwrap = (schema: z.ZodType): z.ZodType => {
  const def = defOf(schema);
  const inner = def.type === "pipe" ? def.in : def.innerType;
  return inner ? unwrap(inner) : schema;
};

/** The keys the object in the schema at `path` accepts. */
function keysAt(path: PropertyKey[]): string[] {
  let node: z.ZodType | undefined = starglowConfigSchema;
  for (const segment of path) {
    if (!node) return [];
    const def = defOf(unwrap(node));
    node =
      def.type === "object"
        ? def.shape?.[String(segment)]
        : def.type === "array"
          ? def.element
          : def.type === "record"
            ? def.valueType
            : undefined;
  }
  const shape = node && defOf(unwrap(node)).shape;
  return shape ? Object.keys(shape) : [];
}

const formatPath = (path: PropertyKey[]) =>
  path
    .map((segment, i) =>
      typeof segment === "number"
        ? `[${segment}]`
        : `${i === 0 ? "" : "."}${String(segment)}`
    )
    .join("");

/** One line per problem, each naming the key path. */
export function formatConfigIssues(issues: z.core.$ZodIssue[]): string[] {
  const lines: string[] = [];
  for (const issue of issues) {
    if (issue.code === "unrecognized_keys") {
      for (const key of issue.keys) {
        const path = [...issue.path, key];
        const removed = REMOVED_KEYS[path.map(String).join(".")];
        const suggestion = closestKey(key, keysAt(issue.path));
        lines.push(
          `${formatPath(path)}: ${
            removed ??
            `unknown key${suggestion ? `, did you mean "${suggestion}"?` : ""}`
          }`
        );
      }
      continue;
    }
    const input = (issue as { input?: unknown }).input;
    const got =
      !issue.message.includes("received") &&
      ["string", "number", "boolean"].includes(typeof input)
        ? `, got ${JSON.stringify(input)}`
        : "";
    lines.push(`${formatPath(issue.path) || "(root)"}: ${issue.message}${got}`);
  }
  return lines;
}

/** Validates starglow.config.ts and applies defaults. Throws on any problem. */
export function parseStarglowConfig(input: unknown): ParsedStarglowConfig {
  const result = starglowConfigSchema.safeParse(input, { reportInput: true });
  if (result.success) return result.data;
  throw new Error(
    `[config] starglow.config.ts is invalid:\n${formatConfigIssues(
      result.error.issues
    )
      .map(line => `  - ${line}`)
      .join("\n")}`
  );
}

/** Type helper for starglow.config.ts. */
export function defineStarglowConfig(config: StarglowConfig): StarglowConfig {
  return config;
}
