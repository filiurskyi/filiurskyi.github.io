import { defineStarglowConfig } from "./src/types/config";
import { glowingDark, glowingLight } from "./src/custom/palettes";

// starglow theme configuration. Every key is documented in src/types/config.ts
// (hover it in your editor) and in docs/02-configuration.md.
// The site origin is not set here: astro.config.ts reads it from SITE_URL.
export default defineStarglowConfig({
  site: {
    // Header, <title> and feeds. Used by: Layout, Header, rss.xml, OG images.
    title: "Andrii Filiurskyi",
    // The home page meta description, the RSS feed and the WebSite data.
    description:
      "Engineering notes and projects on Embedded Linux, Yocto, Linux systems, Rust, Python and hardware.",
    // Default post author and the footer copyright name.
    author: "Andrii Filiurskyi",
    // Source repository of your site: the footer "source" link and the base
    // of features.editPost. The footer leaves the link out when another
    // footer link has the same URL. Empty = neither.
    sourceUrl: "",
    lang: "en",
    // IANA timezone for post dates. ./dev.sh reads this line too.
    timezone: "Europe/Berlin",
    dir: "ltr",
    // Search Console verification value. Empty = PUBLIC_GOOGLE_SITE_VERIFICATION
    // from the environment, or no meta tag.
    googleVerification: "BW8ORG-wacMtYvWuByNQoGA747CuLXKT-_s7C9VDBG4",
    // Header wordmark in the pixel face. Defaults to title.
    wordmark: "filiurskyi",
    // Printed as an HTML comment at the top of every page, for people who
    // read the source. Text only; it must not contain two hyphens in a row.
    // Remove the whole key for no comment.
    sourceBanner: {
      art: String.raw`
 __ _ _ _                 _          _
 / _(_) (_)_   _ _ __ ___| | ___   _(_)
| |_| | | | | | | '__/ __| |/ / | | | |
|  _| | | | |_| | |  \__ \   <| |_| | |
|_| |_|_|_|\__,_|_|  |___/_|\_\\__, |_|
                               |___/`,
      message: [
        "hello, fellow source reader.",
        "plain static HTML, a little CSS, almost no JS.",
      ].join("\n"),
    },
  },
  // Optional homepage Person structured data. Empty fields are left out.
  person: { jobTitle: "" },
  posts: {
    perPage: 10,
    perIndex: 4,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showBackButton: true,
    // "Edit page" on posts: site.sourceUrl + path ("edit/main/" by default).
    editPost: { enabled: false },
    search: "pagefind",
    toc: true,
    // Obsidian wikilinks, image embeds, comments and properties in .md files.
    obsidian: true,
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
    // glowing: the glowing.space logo colours, defined in src/custom/palettes.ts.
    palette: { dark: "glowing", light: "glowing" },
    palettes: {
      dark: { glowing: glowingDark },
      light: { glowing: glowingLight },
    },
    // Floating panel to try palettes and effects live. For demos; turn it
    // off on your own site.
    preview: false,
  },
  // 88x31 footer badges. Profile types (github, mastodon, linkedin, ...) are
  // also your rel="me" links and the homepage sameAs; a mastodon URL like
  // https://host/@you sets the fediverse:creator meta. The rss badge shows
  // once a post or note is published. A URL the footer already has (the
  // credit, an earlier badge) is left out.
  links: [
    { type: "rss", url: "/rss.xml" },
    { type: "github", url: "https://github.com/filiurskyi" },
  ],
  footer: {
    // "powered by starglow" in the footer. Keeping it is appreciated.
    credit: true,
    // Text links on the badge row, e.g. pages from src/content/pages/.
    links: [
      { label: "impressum", href: "/impressum/" },
      { label: "privacy", href: "/privacy/" },
    ],
  },
  // Cloudflare Web Analytics (cookieless). Unset = no script. The token may
  // also come from PUBLIC_CF_WEB_ANALYTICS_TOKEN in the environment.
  analytics: { cloudflareToken: "a0c597e94640487e8ee34c05d15facf0" },
});
