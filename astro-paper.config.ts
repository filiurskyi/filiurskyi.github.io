import { defineAstroPaperConfig } from "./src/types/config";
import { glowingDark, glowingLight } from "./src/custom/palettes";

// The site origin is not set here: astro.config.ts is its single source (SITE_URL).
export default defineAstroPaperConfig({
  site: {
    title: "Andrii Filiurskyi",
    description:
      "Engineering notes and projects on Embedded Linux, Yocto, Linux systems, Rust, Python and hardware.",
    author: "Andrii Filiurskyi",
    profile: "https://github.com/filiurskyi",
    sourceUrl: "https://github.com/filiurskyi/filiurskyi.github.io",
    lang: "en",
    timezone: "Europe/Berlin",
    dir: "ltr",
    // Fediverse handle as @user@instance. Empty = no fediverse:creator meta.
    fediverseCreator: "",
    wordmark: "filiurskyi",
    // Printed as an HTML comment at the top of every page. Text only; it must
    // not contain two hyphens in a row.
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
        "plain static HTML, a little CSS, almost no JS. source: github.com/filiurskyi",
      ].join("\n"),
    },
  },
  // Optional homepage structured data. Empty fields are left out; real text only.
  person: { jobTitle: "", description: "" },
  posts: {
    perPage: 10,
    perIndex: 4,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: false,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
    toc: true,
  },
  appearance: {
    ambient: "breathe",
    wordmarkGlow: true,
    statusline: true,
    // glowing: the glowing.space logo colours, defined in src/custom/palettes.ts.
    palette: { dark: "glowing", light: "glowing" },
    palettes: { dark: { glowing: glowingDark }, light: { glowing: glowingLight } },
  },
  // 88x31 footer badges. Configured socials below get one automatically.
  links: [
    { type: "rss", url: "/rss.xml" },
    { type: "github", url: "https://github.com/filiurskyi" },
  ],
  // Fill a url to show that profile everywhere; empty slots render nowhere.
  socials: [
    { name: "github", label: "GitHub", url: "https://github.com/filiurskyi" },
    { name: "linkedin", label: "LinkedIn", url: "" },
    // Fill the Mastodon URL to show it on /contact/, in the footer badges and
    // in the homepage structured data.
    { name: "mastodon", label: "Mastodon", url: "" },
    { name: "bluesky", label: "Bluesky", url: "" },
    { name: "lemmy", label: "Lemmy", url: "" },
    { name: "x", label: "X", url: "" },
    { name: "reddit", label: "Reddit", url: "" },
    { name: "devto", label: "DEV.to", url: "" },
    { name: "medium", label: "Medium", url: "" },
  ],
});
