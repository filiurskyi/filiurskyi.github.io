import { defineStarglowConfig } from "./src/types/config";

// starglow theme configuration. Every key is documented in src/types/config.ts
// (hover it in your editor).
// The site origin is not set here: astro.config.ts reads it from SITE_URL.
export default defineStarglowConfig({
  site: {
    // Header, <title> and feeds. Used by: Layout, Header, rss.xml, OG images.
    title: "halvard",
    // The home page meta description, the RSS feed and the WebSite data.
    description:
      "Noor Halvard writes about CSS, accessibility, typography and the starglow theme.",
    // Default post author and the footer copyright name.
    author: "Noor Halvard",
    // Source repository of your site: the footer "source" link and the base
    // of features.editPost. The footer leaves the link out when another
    // footer link has the same URL, as the credit does here. Empty = neither.
    sourceUrl: "https://github.com/glowing-space/starglow",
    lang: "en",
    // IANA timezone for post dates. ./dev.sh reads this line too.
    timezone: "UTC",
    dir: "ltr",
    // Search Console verification value. Empty = PUBLIC_GOOGLE_SITE_VERIFICATION
    // from the environment, or no meta tag.
    googleVerification: "",
    // Header wordmark in the pixel face. Defaults to title.
    wordmark: "halvard",
    // Printed as an HTML comment at the top of every page, for people who
    // read the source. Text only; it must not contain two hyphens in a row.
    // Remove the whole key for no comment.
    sourceBanner: {
      art: String.raw`
      _                        _
 ___ | |_   __ _  _ __   __ _ | |  ___  __      __
/ __|| __| / _${"`"} || '__| / _${"`"} || | / _ \ \ \ /\ / /
\__ \| |_ | (_| || |   | (_| || || (_) | \ V  V /
|___/ \__| \__,_||_|    \__, ||_| \___/   \_/\_/
                        |___/`,
      message: [
        "hello, fellow source reader.",
        "plain static HTML, a little CSS, almost no JS.",
      ].join("\n"),
    },
  },
  // Optional homepage Person structured data. Empty fields are left out.
  person: {
    jobTitle: "Frontend developer",
  },
  posts: {
    perPage: 10,
    perIndex: 4,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showBackButton: true,
    // "Edit page" on posts: site.sourceUrl + path ("edit/main/" by default).
    editPost: { enabled: true },
    search: "pagefind",
    toc: true,
    // Obsidian wikilinks, image embeds, comments and properties in .md files.
    obsidian: false,
  },
  appearance: {
    // First-visit mode until the visitor toggles: "dark" | "light" | "system".
    defaultMode: "dark",
    // Header band light: "none" | "light" | "breathe" | "dawn".
    ambient: "breathe",
    wordmarkGlow: true,
    // Vim-style status bar on post and note pages.
    statusline: true,
    // Colour palettes, chosen separately for dark and light mode. Built in:
    // dark starglow | void | aurora | ember; light starglow | paper | petal |
    // frost | sand. Add your own under `palettes` (see src/palettes.ts).
    palette: { dark: "starglow", light: "starglow" },
    // Floating panel to try palettes and effects live. For demos; turn it
    // off on your own site.
    preview: true,
  },
  // 88x31 footer badges. Profile types (github, mastodon, linkedin, ...) are
  // also your rel="me" links, listed on /contact/, and the homepage sameAs; a
  // mastodon URL like https://host/@you sets the fediverse:creator meta. The
  // rss badge shows once a post or note is published. A URL the footer
  // already has (the credit, an earlier badge) is left out of the footer.
  links: [
    { type: "rss", url: "/rss.xml" },
    { type: "github", url: "https://github.com/glowing-space/starglow" },
    {
      type: "sparkle",
      url: "https://astro.build",
      label: "astro",
      title: "Built with Astro",
    },
    { type: "nocookies", url: "/privacy/" },
  ],
  // Webrings on /small-web/, linked from the footer once one is listed:
  // { name, url, prev?, next?, random? }, prev and next together.
  webrings: [],
  // Your 88x31 button at /88x31.png, shown on /small-web/ with HTML to copy.
  // Add a label (e.g. your site name) to publish it. Listing webrings without
  // one publishes a TODO placeholder, which fails the deploy.
  button: { icon: "sparkle" },
  footer: {
    // "powered by starglow" in the footer. Keeping it is appreciated.
    credit: true,
    // Text links on the badge row, e.g. pages from src/content/pages/.
    // The privacy page is linked by the "no cookies" badge above.
    links: [{ label: "impressum", href: "/impressum/" }],
  },
  images: {
    maxWidth: 1200,
    format: "webp",
    quality: 80,
  },
  // Cloudflare Web Analytics (cookieless). Unset = no script. The token may
  // also come from PUBLIC_CF_WEB_ANALYTICS_TOKEN in the environment.
  // analytics: { cloudflareToken: "" },
});
