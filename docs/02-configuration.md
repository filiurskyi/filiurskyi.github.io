# Configuring starglow

All site settings live in one typed file, `starglow.config.ts`, at the root of the repository. It is wrapped in `defineStarglowConfig()`, so your editor completes the keys and `astro check` reports a wrong type. The keys, their comments and their defaults are defined once, as a Zod schema in `src/types/config.ts`; `src/config.ts` adds the values that depend on others or on the environment. Each key's comment ends with a `Used by:` line that names the files reading it, so you can see what a change affects.

Every build validates the file against that schema before anything else runs. An unknown key, a value of the wrong type or a key that was removed fails the build with one line per problem, naming the key path and, for a likely typo, the closest valid key:

```text
[config] starglow.config.ts is invalid:
  - site.titel: unknown key, did you mean "title"?
  - posts.perPage: expected a whole number above 0, got 0
  - socials: removed in v0.1.1 (see UPGRADING.md): add each profile to `links` as a badge, ...
```

The site URL is not in this file. It comes from `SITE_URL`, see [Getting started](./01-getting-started.md).

## site

| Key                  | Required | Default         | What it does                                                                           |
| :------------------- | :------- | :-------------- | :------------------------------------------------------------------------------------- |
| `title`              | yes      |                 | Site title in the header, page titles and meta tags.                                   |
| `description`        | yes      |                 | Home page meta description, RSS description and WebSite structured data.               |
| `author`             | yes      |                 | Default author of posts.                                                               |
| `sourceUrl`          | no       | none            | Source repository (http or https): the footer `source` link and `features.editPost`.   |
| `wordmark`           | no       | `title`         | Text of the header wordmark, set in the pixel font.                                    |
| `sourceBanner`       | no       | none            | An HTML comment with `art` and `message` lines, printed at the top of every page.      |
| `ogImage`            | no       | generated image | Fallback social image filename in `public/`. Only needed with `dynamicOgImage: false`. |
| `lang`               | no       | `"en"`          | Page locale and `lang` attribute; needs `src/i18n/lang/<lang>.ts` or the build fails.  |
| `timezone`           | no       | `"UTC"`         | IANA zone used to read and show post dates. An unknown zone fails the build.           |
| `dir`                | no       | `"ltr"`         | Text direction: `ltr`, `rtl` or `auto`.                                                |
| `googleVerification` | no       | none            | Search Console verification value. Wins over `PUBLIC_GOOGLE_SITE_VERIFICATION`.        |

Only the home page uses `description` as its meta description. Posts, projects and pages with a `description` in their frontmatter use that; notes and pages without one use the opening words of their text; listing pages have none, so search engines pick their own snippet.

The footer leaves out the `source` link when another footer link has the same URL, for example the credit when your site is a copy of the starglow repository.

The `sourceBanner` text ends up inside an HTML comment, so it must not contain two hyphens in a row, start with `>` or end with `-`. The build fails with a clear message if it does.

## person

Optional `Person` structured data on the homepage: `jobTitle`. An empty value is left out, and placeholder text fails the build, because structured data should only carry real information. The Person's `sameAs` comes from the profile badges in [`links`](#links); the site is described once, by `site.description`.

## posts

| Key        | Default | What it does                                                                                      |
| :--------- | :------ | :------------------------------------------------------------------------------------------------ |
| `perPage`  | `4`     | Entries per page on the blog, notes and tag lists.                                                |
| `perIndex` | `4`     | Featured projects on the homepage. The latest-writing list (posts and notes) shows twice as many. |

Both must be whole numbers above 0; anything else fails the build.

## features

| Key                | Default      | What it does                                                                                      |
| :----------------- | :----------- | :------------------------------------------------------------------------------------------------ |
| `lightAndDarkMode` | `true`       | The light and dark toggle. The first visit uses `appearance.defaultMode`.                         |
| `dynamicOgImage`   | `true`       | Generated social images per post, note and project, plus `/og.png`.                               |
| `showBackButton`   | `true`       | The back link on posts and notes: "Back" after a page of this site, "Home" on a direct visit.     |
| `editPost`         | disabled     | `{ enabled: true }` adds an edit link to posts: `site.sourceUrl` + `path` + the file path.        |
| `search`           | `"pagefind"` | Full-text search on `/search/`; `/` opens it from any page. `false` removes it.                   |
| `toc`              | `true`       | A table of contents on posts with two or more `h2` or `h3` headings.                              |
| `obsidian`         | `false`      | Obsidian syntax in `.md` content, see [Writing in Obsidian](./04-writing.md#writing-in-obsidian). |

`editPost.path` defaults to `"edit/main/"`, which suits GitHub and a `main` branch; GitLab uses `"-/edit/main/"`. Turning `editPost` on without `site.sourceUrl` fails the build.

Search is left out of the header while nothing is published, like the Blog, Notes and Projects entries while their section is empty.

## appearance

These keys control the small amount of motion and decoration in the theme. The ambient pulse and the wordmark glow are slow decoration and keep running under `prefers-reduced-motion`; the blinking cursor and the back-to-top slide stop.

| Key            | Default                                   | What it does                                                                                                                            |
| :------------- | :---------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultMode`  | `"dark"`                                  | Mode on a first visit: `dark`, `light`, or `system` to follow the OS. A stored toggle choice wins.                                      |
| `ambient`      | `"none"`                                  | Inner light of the header band: `none`, `light` (static), `breathe` (slow pulse), `dawn`.                                               |
| `wordmarkGlow` | `false`                                   | A soft pulsing glow on the header wordmark.                                                                                             |
| `statusline`   | `false`                                   | A vim-style status bar on post and note pages: source path, file type and scroll position; j/k scroll, h/l open the previous/next post. |
| `palette`      | `{ dark: "starglow", light: "starglow" }` | The dark and light colour palettes, see [Customising](./05-customising.md).                                                             |
| `palettes`     | none                                      | Your own palettes by name, usable in `palette`.                                                                                         |
| `preview`      | `false`                                   | A floating panel to switch palettes and effects live, for demos. Changes last one browser session.                                      |

The statusline is a keyboard aid, so it is hidden on touch screens and on screens narrower than 40rem (640px), and its keys are off there too. The keys also do nothing while you type in a field or while the image preview is open.

The demo site uses `ambient: "breathe"`, `wordmarkGlow: true`, `statusline: true` and `preview: true`. Turn `preview` off on your own site.

## links

Small 88x31 badges under the footer, one line of text and an icon each:

```ts
links: [
  { type: "rss", url: "/rss.xml" },
  { type: "github", url: "https://github.com/you" },
  { type: "email", url: "mailto:you@example.com" },
],
```

Known types with their own icon: `github`, `gitlab`, `codeberg`, `srht`, `linkedin`, `mastodon`, `bluesky`, `stack`, `hackaday`, `crates`, `email`, `rss` and `sparkle`. Any other type gets a generic link icon. A `url` may be `http(s)`, `mailto:` or a site path starting with `/`. Optional `label` and `title` override the badge text and the tooltip.

An empty `url` renders nowhere, so you can keep unused slots in the file.

Badges of a profile type (`github`, `gitlab`, `codeberg`, `srht`, `linkedin`, `mastodon`, `bluesky`, `stack`, `hackaday`, `crates`, `lemmy`, `x`, `reddit`, `devto`, `medium`) are your profiles: they carry `rel="me"`, are listed on `/contact/` and are the homepage `sameAs`. A `mastodon` URL of the form `https://instance/@you` also adds `<meta name="fediverse:creator" content="@you@instance">`.

The `rss` badge is the footer's only RSS link, and it appears once a post or note is published.

Each URL appears once in the footer. URLs are compared without scheme, `www.`, trailing slash and hash, and the first one wins in this order: the credit, the badges, `footer.links`, the contact link, the `source` link. A `github` badge that points at the starglow repository, for example, is left out while the credit is on. This applies to the footer only: `/contact/` lists every profile badge.

## footer

| Key      | Default | What it does                                                                                                                                         |
| :------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `credit` | `true`  | Shows "powered by `starglow`", linked to the theme repository. Set it to `false` to remove the line; keeping it is a nice way to say thanks.         |
| `links`  | `[]`    | Text links `{ label, href }` on the right of the badge row. A root-relative `href` such as `/impressum/` gets the base path; others stay as written. |

Next to the credit, the footer shows `contact` when there is a contact page, that is when `src/content/pages/contact.md` exists or `links` has a profile badge (see [Content model](./03-content-model.md#pages)) and `source` when `site.sourceUrl` is set and not already linked.

Footer links pair well with [standalone pages](./03-content-model.md#pages), for example an Impressum and a privacy policy:

```ts
footer: {
  links: [
    { label: "impressum", href: "/impressum/" },
    { label: "privacy", href: "/privacy/" },
  ],
},
```

## analytics

| Key               | Default | What it does                                                                                                                                  |
| :---------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `cloudflareToken` | none    | Cloudflare Web Analytics site token. Loads Cloudflare's cookieless beacon on every page. Empty falls back to `PUBLIC_CF_WEB_ANALYTICS_TOKEN`. |

Unset means no script at all, and the demo ships without one. The beacon runs in single-page mode, so navigations through the view-transition router are counted too. `pnpm verify` accepts exactly this beacon while a token is set and still fails on any other analytics or comment connector.

## Environment variables

| Variable                          | What it does                                                                                 |
| :-------------------------------- | :------------------------------------------------------------------------------------------- |
| `SITE_URL`                        | The site origin.                                                                             |
| `BASE_PATH`                       | Subpath for a project site, e.g. `/repo` for `https://<user>.github.io/repo/`. Unset = root. |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Search Console token, used when `site.googleVerification` is empty.                 |
| `PUBLIC_CF_WEB_ANALYTICS_TOKEN`   | Optional Cloudflare Web Analytics token, used when `analytics.cloudflareToken` is empty.     |
| `MARKERS_STRICT`                  | `true` makes the placeholder check fail instead of warn.                                     |

Set a variable in the shell (`SITE_URL=https://example.org ./dev.sh build`) or copy `.env.example` to `.env` and uncomment or add the line (copying alone changes nothing, because the lines ship commented out). A variable set in the shell wins over `.env`.

- `SITE_URL` must be an origin only. A value with a path, query or hash fails the build with an error message. Put a subpath in `BASE_PATH` instead.
- `BASE_PATH` is a path such as `/repo`. Links in Markdown should be relative (`../other-post/`) or start with the base, because root links like `/blog/` are not rewritten.
- `PUBLIC_GOOGLE_SITE_VERIFICATION` is public by design, because it ends up in the HTML. Set it in the environment to keep it out of the repository, or commit it as `site.googleVerification`, which wins. An empty value renders no meta tag. Compose forwards it, like `SITE_URL`, into the container.
- `PUBLIC_CF_WEB_ANALYTICS_TOKEN` is public too: the token is written into every page. Compose forwards it like the Search Console token.
- `MARKERS_STRICT` is forwarded into the container from the shell like the two tokens, so `MARKERS_STRICT=true ./dev.sh ci` runs the strict check. `./dev.sh pnpm markers --strict` does the same for the marker check alone.
- The marker check also reads `GITHUB_ACTIONS`, which GitHub sets on its runners, to print one annotation per marker.
