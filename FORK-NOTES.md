# Fork notes

This site is a file-snapshot fork of AstroPaper.

| Field | Value |
|-------|-------|
| Upstream repo | https://github.com/satnaing/astro-paper |
| Upstream commit | `217c4e3362aa481951a6e1cc8ebde4a468f1074c` |
| Nearest tag | `v7.2.1` (the commit is the tag) |
| Upstream commit date | 2026-11-21 |
| Snapshot date | 2026-11-23 |

## Import method

- File snapshot via `git archive <sha> | tar -x`, with no upstream history (compatible with squashing to one init commit).
- A fetch-only `upstream` remote exists locally: `git remote add upstream https://github.com/satnaing/astro-paper.git`, then `git remote set-url --push upstream DISABLED` so an accidental push is impossible.
- Everything not listed in the tables below is byte-identical to the upstream commit above. This includes `pnpm-workspace.yaml`, `src/styles/theme.css` and `src/styles/typography.css`, which are left untouched on purpose (see "Upgrade cautions").

## Upgrade recipe

The snapshot shares no history with upstream, so diff upstream against itself and apply the result by hand:

1. `git fetch upstream`
2. `git diff 217c4e3362aa481951a6e1cc8ebde4a468f1074c upstream/main -- <paths>`
3. Apply the relevant hunks to the matching files here, checking the tables below first.
4. Optional, for a file that changed on both sides: pipe the upstream diff into a 3-way apply, `git diff 217c4e3362aa481951a6e1cc8ebde4a468f1074c upstream/main -- <paths> | git apply -3`. The base blobs are missing for files this fork rewrote, so expect conflict markers there and resolve them by hand.

The tables below were audited against `git diff --name-only 217c4e3362aa481951a6e1cc8ebde4a468f1074c` (working tree) plus untracked, not ignored files at the end of Phase 4: every differing path is listed, as its own path or under a directory ending in `/`.

## Excluded at import

Paths that exist upstream and were never copied.

| Path | Change | Reason |
|------|--------|--------|
| `.dockerignore` | not imported | Belonged to the upstream nginx production image (it ignored `*.astro`); a new one is listed under "Added" |
| `.github/` | not imported | Upstream's funding config, issue and PR templates, Dependabot config and tag-pinned CI workflow were never imported. This site's own workflows, composite action and Dependabot config, with every action pinned to a commit SHA, are listed under "Added" |
| `CHANGELOG.md` | not imported | Upstream release history, not this site's |
| `cz.yaml` | not imported | Upstream commitizen config |
| `AstroPaper-lighthouse-score.svg` | not imported | Upstream branding asset |
| `src/content/posts/` | not imported | Upstream sample posts and their images (all AstroPaper documentation and branding) |

## Removed after import

Upstream files that were copied and then deleted in a later plan.

| Path | Change | Reason |
|------|--------|--------|
| `src/pages/posts/` | moved to `src/pages/blog/`, see "Modified" | Route directory matches the `/blog/` URL scheme |
| `src/pages/archives/` | deleted | The Archives route is disabled (`showArchives: false`) and would build as a stray page |
| `src/assets/images/` | deleted (5 files) | Upstream sample and branding images, unreferenced after the sample posts were excluded |
| `public/default-og.jpg` | deleted | Upstream branding asset; the OG fallback is the generated `/og.png` |
| `src/utils/rehypeInlineToc.js` | deleted | Deprecated upstream and removed in AstroPaper v8; the inline TOC is now plain HTML in `PostToc.astro` |
| `src/remark-collapse.d.ts` | deleted | Module no longer used (`remark-collapse` removed) |
| `src/utils/transformers/fileName.js` | deleted | Shiki transformers dropped; code blocks have no file-name decoration |
| `copy-pagefind.mjs` | deleted | Upstream's post-build copy step is replaced by `scripts/build-search-index.ts`, which writes `public/pagefind` itself |
| `src/utils/getFontPathByWeight.ts` | deleted | No consumer after the OG renderer moved to `src/utils/og/renderOg.ts`, which reads the vendored font files |
| `src/pages/blog/[...slug]/_components/ShareLinks.astro` | deleted | The upstream share-links component (third-party share-intent links); replaced by `CopyLink.astro` (D-09) |
| `src/assets/icons/socials/facebook.svg` | deleted | Upstream share-only icon; no social profile uses it |
| `src/assets/icons/socials/mail.svg` | deleted | Upstream share-only icon; no social profile uses it |
| `src/assets/icons/socials/pinterest.svg` | deleted | Upstream share-only icon; no social profile uses it |
| `src/assets/icons/socials/telegram.svg` | deleted | Upstream share-only icon; no social profile uses it |
| `src/assets/icons/socials/whatsapp.svg` | deleted | Upstream share-only icon; no social profile uses it |
| `src/components/Breadcrumb.astro` | deleted | The site design puts the page title in the header band and marks the section in the nav; list pages no longer render a breadcrumb |
| `src/components/Card.astro` | deleted | Lists are leader rows (`IndexRow.astro`, `ItemRow.astro`) |
| `src/components/Socials.astro` | deleted | Social profiles are text links (`rel="me"`) in the footer colophon and leader rows on `/contact/` |
| `src/components/LinkButton.astro` | deleted | No consumer left; links and buttons use the site classes |
| `src/components/Datetime.astro` | deleted | Dates render as ISO `<time>` in `PostMeta.astro` and the list rows |

## Modified

| Path | Change | Reason |
|------|--------|--------|
| `.gitignore` | merged by hand: this repo's `.planning/` and `.claude/` lines kept, upstream entries appended | The repo keeps private planning files untracked |
| `README.md` | rewritten for this site; Phase 4 rewrites it to the sections Quickstart, Development, Authoring, Configuration, External setup checklist, Fork notes and License | Dev (Docker and native), checks and CI, authoring with templates, the environment variable table, the external setup checklist and the license, for someone who works from the README alone |
| `.vscode/astro-paper.code-snippets` | `author` line dropped, `draft` defaults to true, `tags` defaults to an empty list, AstroPaper wording removed | Neutral authoring template for `src/content/blog/YYYY/` |
| `LICENSE` | Andrii's 2026 copyright line added above the upstream line | MIT requires the upstream notice be kept; the permission text is byte-identical |
| `package.json` | name `filiurskyi-github-io`, version `0.1.0`, `private: true`, `packageManager` pinned to `pnpm@11.28.13+sha512...`; `rehype-autolink-headings` added; `remark-toc`, `remark-collapse` and `@shikijs/transformers` removed; Phase 3: `build` runs the draft-asset prune and `scripts/build-search-index.ts` instead of upstream's pagefind CLI and copy step, new `verify` script; Phase 4: new `build:site` (everything after `astro check`), new `markers` script, and `build` ends with the marker check | Pinned pnpm for reproducible installs; build-time heading anchors; unused or deprecated dependencies dropped; CI runs `build:site` so the marker check can warn or fail separately |
| `pnpm-lock.yaml` | regenerated by pnpm for the dependency changes above | Lockfile follows `package.json` |
| `Dockerfile` | replaced: dev image with digest-pinned `node:22-slim`, corepack pnpm, git | Upstream is an nginx production image; this repo needs a dev image |
| `compose.yaml` | replaced: project `filiurskyi-site`, service `dev`, host UID/GID, same-path bind mount, port 4321; Phase 3: key-only `PUBLIC_GOOGLE_SITE_VERIFICATION` | Upstream uses a pnpm image; this repo needs the host-UID dev service |
| `astro.config.ts` | `SITE_URL` as the single source of the origin with validation, `trailingSlash: "always"`, directory build format; rehype pipeline rewritten (heading ids, autolink headings, GitHub callouts, table wrapper); Shiki themes catppuccin-latte and catppuccin-mocha with no transformers; Google font entry replaced by two local font entries; `inlineTocDeprecation()` integration removed; Phase 4: `rehypeTodoMarkers` added to the rehype pipeline; site design: `rehypeBlockLabels` after the callouts, and a third local font entry (`--font-wordmark`, Pixelify Sans) for the header wordmark | Portable build, GitHub alert callouts and anchors (D-10), offline-capable fonts (D-08), Catppuccin code blocks (D-12, D-13) |
| `astro-paper.config.ts` | Andrii's identity, Europe/Berlin timezone, perPage 10, archives off, no `url` and no `ogImage`; nine typed social slots with GitHub the only one filled; `fediverseCreator` empty; Phase 3: optional `person` block (`jobTitle`, `description`, both empty), upstream's `shareLinks: []` removed; site design: `site.sourceUrl` (this repository, linked as "source" in the footer); site design, round two: `wordmark: "filiurskyi"`, the figlet source banner, `appearance` (breathe, glow, statusline on) and badge `links` (rss, GitHub); a comment marks the empty Mastodon slot for Andrii | Site identity; the origin comes from `SITE_URL` only; other profiles are filled by Andrii, never invented; the optional `person` text feeds the homepage JSON-LD and is never invented; third-party share links are not used (D-09) |
| `src/types/config.ts` | `SiteConfig.url` optional; the resolved `site.url` stays a required string; `SocialLink` becomes a typed `{ name, label, url?, linkTitle? }` with a `SocialName` union, new `ResolvedSocialLink`, new `site.fediverseCreator`; Phase 3: new `PersonConfig` and `person` on both config types, the upstream `ShareLink` interface and the `shareLinks` fields removed; site design: optional `site.sourceUrl`; site design, round two: optional `site.wordmark` and `site.sourceBanner`, an `appearance` block (`ambient`, `wordmarkGlow`, `statusline`) and a `links` badge list, with the resolved `site.wordmark`, `site.sourceBanner`, `appearance` and `links` | The origin is not set in `astro-paper.config.ts`; one typed socials list drives the footer, intro and contact page; the share list has no consumer since D-09 |
| `src/config.ts` | `site.url` read from `import.meta.env.SITE`; `resolveSocials` and `resolveFediverseCreator` replace the plain `socials ?? []` fallback; Phase 3: `person` resolved with empty defaults, the `shareLinks` resolution line removed; site design, round two: resolves the wordmark (default `site.title`), the source banner (rejects `--`), appearance defaults, and badge links (http(s), `mailto:` or a site path; configured socials without a badge are appended) | One source for the site origin; socials with no URL are filtered and the fediverse handle validated once, at load |
| `src/custom/Head.astro` | the user-owned slot emits `<meta name="fediverse:creator">` only when `site.fediverseCreator` is set; a malformed handle fails the build | Fediverse attribution without hardcoding anything (D-18) |
| `src/scripts/theme.ts` | sets `aria-pressed` on the toggle instead of overwriting its accessible name | The toggle keeps one static name, "Toggle theme" |
| `src/content.config.ts` | posts live in `src/content/blog`; ids from `postEntryId`; `z.strictObject` schema; `tags` default `[]`; new `notes` (path-derived ids, only `title` required) and `projects` (status, featured, stack, links, related posts) collections; `pages` schema gains optional `specialties`; Phase 3: posts and notes gain `canonicalUrl` (`z.httpUrl()`, replacing upstream's `canonicalURL`, so the old key fails `astro check`) and `syndication` (list of `z.httpUrl()`), pages gain `canonicalUrl` | Year folders under `src/content/blog/`, unknown frontmatter keys fail `astro check`; Notes and Projects are Phase 2 content types; the homepage chips come from `home.md` |
| `src/utils/getPostPaths.ts` | `getPostUrl` prefixes `blog/` instead of `posts/` | Post URLs are `/blog/YYYY/<slug>/` |
| `src/utils/postFilter.ts` | the dev check runs before the draft check | Drafts are visible in dev and excluded from production; `postFilter` is the only draft gate |
| `src/utils/getUniqueTags.ts` | takes `ContentItem[]` instead of posts and no longer calls `postFilter` | Visibility is decided once in `src/utils/content/items.ts` |
| `src/utils/rehypeTableWrapper.js` | accepts `{ label }`, adds `role="region"`, `aria-label` and `tabindex`; site design: an outer `div.table-block` carries a numbered `table n` label outside the scroller | Keyboard-scrollable tables with an accessible name |
| `src/styles/global.css` | callout import `obsidian` changed to `github`; `./site-theme.css` added as the last import | GitHub alert styling (D-10); one override file for the theme (D-07) |
| `src/layouts/Layout.astro` | `favicon.ico` link removed; font tags switched to the local Inter and JetBrains Mono variables; Phase 3: `ogType`, `ogImageAlt`, `ogImageSize` and `noindex` props, `og:image` width, height and alt, Twitter tags use `name=` instead of `property=`, `Props` exported; site design: the wordmark font is loaded (preloaded), selection colours move from body utilities to `site-theme.css`; site design, round two: the source banner comment after the doctype, `data-ambient` and `data-glow` on `<html>`, and the band light layer at the end of the body | No `.ico` exists; fonts are self-hosted; link-preview tags carry the image size and alt text, and the 404 page is kept out of search indexes. The internal prop stays `canonicalURL` (frontmatter uses `canonicalUrl`) |
| `public/favicon.svg` | replaced with an own `>_` glyph | Remove AstroPaper branding |
| `src/pages/og.png.ts` | Inter woff at 400 and 600, colors from `ogColors`; Phase 3: a thin endpoint over the shared `renderOgImage` | satori needs woff; the palette comes from one module and every OG endpoint (site, post, note, project) uses one renderer |
| `src/pages/index.astro` | portfolio-first homepage: intro from `src/content/pages/home.md` (h1, RSS link, Markdown body, specialties chips, social icon row), then Recent posts, Recent notes and Featured projects, each hidden when empty; the featured-posts section, upstream intro copy and the bottom "Read all posts" button removed; Phase 3: Person and WebSite JSON-LD from `src/utils/jsonLd.ts`; passes `home.md` `canonicalUrl` to the layout, as about and contact do (D-10); `ogImage` in `home.md` is still not read; site design: the intro sits in the header band with a visually hidden h1 (the site title), specialties render as one mono line (a whole-value marker renders as a TODO mark), then one "Writing" leader list of posts and notes, newest first, and Featured projects with status; the RSS icon and social icon row moved to the footer | Honest homepage with no invented content; at launch the production page is the intro block alone |
| `src/pages/404.astro` | giant 404 glyph removed; heading, body sentence and a "Go back home" link per the UI-SPEC; Phase 3: canonical `<origin>/404.html` and `noindex`; site design: rendered through `Main` like every other page (band head, then a home link); site design, round two: title "404: page not found", an ASCII terminal (aria-hidden), a sentence and a leader list to Home, Blog and Search | Phase 1 UI contract; the error page is not an indexable URL |
| `src/pages/tags/index.astro` | tags come from `getAllItems()` (posts and notes), chips at `gap-4`, shared `EmptyState`; site design: tags are leader rows with an entry count | Tags span both content types and the empty state is not repeated inline |
| `src/pages/tags/[tag]/[...page].astro` | paginates mixed posts and notes per tag through `ContentItem`, cards show the type; site design: leader rows with the kind column and a back link to /tags/ | One tag page for both content types, drafts filtered once |
| `src/pages/rss.xml.ts` | rewritten on `APIContext` and `context.site`; items from `getAllItems()` with `post` and `note` categories | One combined feed with the site origin from `SITE_URL` only |
| `src/components/Header.astro` | nav is Blog, Notes, Projects, Lab, About, Search and the theme toggle; breakpoint `md` instead of `sm`; 44px menu, search and theme controls; `aria-current`, labelled nav, Escape closes the menu; Tags and Archives items and the `IconArchive` import removed; `blog` instead of `posts` in the link and active check; site design: rewritten as the full-width header band: pixel wordmark linking home with a blinking cursor (off under reduced motion), search link with a `/` key hint (and a `/` shortcut that opens or focuses search), theme toggle (`#theme-btn`, `aria-pressed` kept), and a wrapping text nav; the mobile menu button and its script are gone because the nav fits at 320px; site design, round two: the wordmark text comes from `site.wordmark` | FND-06 navigation per the UI-SPEC: five text links do not fit below 768px, and touch targets are 44px |
| `src/components/Footer.astro` | author name from `config.site.author` in the copyright line; Contact and RSS nav with 44px links; `gap-2` for the stacked mobile layout; the icon row comes from the rewritten `Socials`; Phase 4: the copyright row wraps below `sm` instead of forcing one line; site design: a one-row mono colophon: copyright year and author left, footer nav (contact, rss, `site.sourceUrl` as source, configured socials with `rel="me"`) right; site design, round two: social text links replaced by the 88x31 badge list under the colophon | FND-08 and D-16/D-17: footer reaches Contact and RSS and shows configured socials only; the unwrapped copyright overflowed at 320px |
| `src/components/Tag.astro` | `transition` prop so list chips can drop the shared `transition:name`; site design: `#tag` mono text link; the hover margin shift and focus border removal are gone, so hover and focus never move layout | Duplicate view-transition names break navigation when a tag appears twice on a page |
| `src/components/Main.astro` | the description paragraph renders only when `pageDesc` is set; the heading takes `mb-6` when there is no description; site design: rewritten: page head (meta slot, h1, description, head slot) in the header band, the dither edge, then the reading column; `hideTitle`, `titleStyle` and `trackBack` props; posts, notes, projects and the 404 page use it too | Pages without a description (About, Contact) emitted an empty margined `<p>` |
| `src/components/Pagination.astro` | typed on `Page<unknown>`; site design: mono "← prev / page n of m / next →" row with a top rule | Notes and mixed lists paginate with the same component |
| `src/i18n/lang/en.ts`, `src/i18n/types.ts` | site design: `home` strings become Writing/archive/Projects/all, `footer` strings lowercase plus `source`, copyright strings and the menu strings removed, new `post.draftNotice`, `post.contentsLabel`, `post.copyCodeFailed`, `pagination.status`, `pages.tagCount`, lowercase copy-code and previous/next labels, `goBack` is "Back"; UI-SPEC copy table applied; new `empty`, `content`, `related`, `project`, `lab`, `about`, `contact`, `footer` and `home` strings, heading anchor, table, copy-button, reading-time and social-link strings; `nav` gains Notes, Projects, Lab, About and `blog` replaces `posts`; `nav.archives`, `pages.archives*`, `skipTableOfContents`, `home.socialLinks` and `home.featured` removed; Phase 3: search, copy-link, syndication and OG alt strings; Phase 4: `search.emptyBrowse`; site design, round two: `footer.elsewhere`; `notFound.message` and `notFound.body` reworded, `notFound.goHome` removed | UI strings in one place (UI-SPEC Copywriting Contract) |
| `src/i18n/index.ts` | `skipTableOfContents` fallback removed | The string no longer exists |
| `src/pages/about.astro` | rewritten (upstream's was deleted in Phase 1): renders `src/content/pages/about.md` through `getEntry` and `render`, with a link to Contact; Phase 3: passes `data.canonicalUrl` to the layout; site design: breadcrumb removed, the contact link is a text link | About is Markdown Andrii edits, shipped as marked placeholders; follows the frontmatter key rename |
| `src/content/pages/about.md` | rewritten (upstream's was deleted in Phase 1): `[[TODO: …]]` markers under About, Background and Current focus (Phase 4 replaced the Phase 2 placeholder text) | No invented biography (content honesty); Andrii fills it in, and the deploy fails until he has |
| `eslint.config.js` | `no-console` turned off for `scripts/**/*.ts` | The build and verify scripts report through the console |
| `.prettierignore` | `!/scripts` added to the allow-list | The build scripts are formatted like the rest of the source |
| `src/layouts/PostLayout.astro` | takes the Layout props plus `headline`, forwards them, and builds BlogPosting through `src/utils/jsonLd.ts` | One canonical, one OG image and one JSON-LD per post, computed once |
| `src/pages/search.astro` | Pagefind UI page rewritten: load-error copy, no-JavaScript sentence, `?q=` handling kept, theme rules in `site-theme.css`; Phase 4: the nothing-published line links to the blog, notes and projects; site design: breadcrumb removed; `autofocus`; before mounting, `pagefind-entry.json` is read and an index without languages (dev with only drafts) shows the nothing-to-search sentence from a `<template>` instead of hanging; the dev notice names `./dev.sh build` | Search works on the self-built index and degrades honestly |

## Added

| Path | Change | Reason |
|------|--------|--------|
| `.env.example` | documents `SITE_URL` | Open manual step: agents cannot edit this file, so Andrii adds commented `PUBLIC_GOOGLE_SITE_VERIFICATION=` and `MARKERS_STRICT=` lines by hand; the README table lists every variable |
| `.dockerignore` | ignores everything except `package.json` | The dev image copies only `package.json`; the source arrives through the bind mount, so the build context stays tiny (no `node_modules`, `.git` or `.env` sent to the daemon) |
| `.node-version` | the Node version of the dev image (`22.23.5`) | Lets fnm or nvm users match the Docker image on the native path |
| `FORK-NOTES.md` | this file | Records the upstream base and every local change |
| `dev.sh` | Docker entry point with dev, build, check, preview, shell and pnpm subcommands; passes `--quiet-build` to compose; Phase 4: `ci`, `links` and `workflows` subcommands with digest-pinned lychee, actionlint and zizmor images, and `new`, a host-only scaffold for drafts | Docker-only dev workflow. `--quiet-build` keeps image build progress out of command output, so `./dev.sh pnpm --version` prints only the version. `ci` runs the pull-request check set locally and `new` copies `templates/` into the right content folder |
| `src/pages/blog/` | moved from `src/pages/posts/` (list, post page and its components, OG image endpoint). Edited after the move: `[...page].astro`, `[...slug]/index.astro` and `[...slug]/_components/PostToc.astro`; new: `[...slug]/_components/PostMeta.astro`. Site design: the post page renders through `Main` (meta line and back link in the band), `PostToc` is an always-open labelled block, `PostMeta` is a mono line with ISO dates (shared with notes), `BackButton` is a meta link in the head row, `AdjacentPostNav` a two-column block with mono labels, `EditPost` a meta link, and `BackToTopButton` square with a bar for scroll progress instead of a ring. Phase 3: `[...slug]/index.png.ts` (post OG image) is rewritten on the shared renderer and the page gains BlogPosting JSON-LD, the share row (copy link and Also on line) and the OG preview; `[...slug]/_components/ShareLinks.astro` deleted, see "Removed after import" | Route directory matches the `/blog/` URL scheme. List and tag pages go through `postFilter`; the post page gets the meta row, copy buttons and an inline closed `<details>` TOC (zero JS) instead of the side TOC and popover. Phase 2: the inline script and status region moved into the shared `ArticleEnhancements` component (also used by notes), and the post page renders Related reading from shared tags. Phase 3: per-post OG image, JSON-LD and a share row without third-party links |
| `src/assets/fonts/` | eleven vendored font files and three OFL license texts; the two Inter Cyrillic `.woff` files (400, 600) were added after the Phase 3 review for the OG renderer; Pixelify Sans (Latin, 400) and `OFL-Pixelify-Sans.txt` for the wordmark | Self-hosted Inter, JetBrains Mono and Pixelify Sans, no font CDN (D-08); Ukrainian and other Cyrillic titles draw in OG images |
| `src/styles/site-theme.css` | palette, type scale (with a guard comment beside the remap, checked by `pnpm verify`), weights, callout, prose and component overrides; `--status-*` colors with light and dark values; Phase 4: the `.todo-marker` rule; site design: rewritten as the whole design system: Catppuccin mantle, crust, yellow and an AA code-comment colour per theme, `--band` and `--code-bg` roles, 4px spacing tokens, `--t-*` text styles (12 to 32px, weights 400 and 600), browser surfaces (selection, caret, scrollbar, 2px solid focus ring), header band, dither edge, leader lists, status squares, labelled code, table, callout and TOC blocks, prose, share row, pager, footer colophon and the Pagefind theme; site design, round two: Catppuccin peach, blue, mauve, lavender, sapphire and sky, badge bevel and `--badge-<type>` tokens, the `--glow-c` band light per theme and ambient mode, the wordmark glow, the 10px badge and 12px statusline text styles, statusline, badges and 404 art | The single theme file, so upstream `theme.css` and `typography.css` stay byte-identical (D-07): its component rules are unlayered and win over both. Phase 3 adds the Pagefind UI theme rules and the share-row styles |
| `src/utils/ogTheme.ts` | the five OG colours, read from the configured dark palette | satori cannot read CSS variables, so it takes the palette from the config |
| `src/utils/postEntryId.ts` | post ids as `YYYY/slug` with path-shape and folder-year checks | Year-folder contract enforced by `astro check` |
| `src/utils/readingTime.ts` | build-time reading time (200 wpm) | Post meta row |
| `src/content/blog/2026/` | demo posts: `demo-code-blocks.md`, `demo-mdx.mdx`, `demo-callouts.md`, `demo-tables.md`, `demo-images.md`, `demo-headings-toc.md` and `_assets/demo-figure.svg` | `[DEMO]` drafts that exercise rendering; visible in dev, never in production builds |
| `src/utils/content/` | `entryIds.ts`, `visibility.ts`, `gitDates.ts`, `notes.ts`, `items.ts` (with `itemTime`, the ISO date of a list row), `projects.ts`, `related.ts` | Note and project ids and URLs, the `isVisible` draft rule, git-based note dates, the `ContentItem` model for posts and notes, project sorting and related reading |
| `src/utils/socialIcons.ts` | lookup of the local social icon by name; throws on a missing file | A typo in the socials list fails the build instead of silently dropping a profile |
| `src/components/ArticleEnhancements.astro` | status region and inline script moved verbatim out of the post page; site design: the top scroll-progress bar is removed, the copy button joins the `.code-block` wrapper (creating one for unhighlighted blocks), the lightbox close button draws an SVG cross instead of a text glyph | Shared by post and note pages |
| `src/components/EmptyState.astro` | heading, sentence and next-step link | One empty-state pattern for every list route |
| `src/components/RelatedContent.astro` | Related reading list under a post; site design: leader rows with the kind column, optional heading (project pages reuse it) | Posts and notes that share tags (PUB-08) |
| `src/components/IndexRow.astro` | one leader-list row: optional kind column, title, dev-only draft word, dotted leader, right-aligned date, status or count | The one list pattern of the site design, used by every listing |
| `src/components/ItemRow.astro` | `IndexRow` for a `ContentItem` (ISO date in the item's timezone, view-transition name shared with the page h1) | Posts and notes in every list |
| `src/components/ProjectRow.astro` | `IndexRow` for a project with its status | `/projects/`, `/lab/` and the homepage |
| `src/components/Badge88.astro` | one 88x31 pixel badge drawn as SVG at build time (bevelled frame, icon, label, `title` and screen-reader name) | Footer badges without images or client JS |
| `src/palettes.ts` | dark and light colour palettes (from starglow) and the CSS they emit | One place for every colour, chosen in the config |
| `src/components/PreviewPanel.astro` | live palette and effects switcher (`appearance.preview`, off on this site) | Kept identical to starglow for easy merging |
| `src/utils/badges.ts` | the 13 badge icon bitmaps (11x11, ported cell for cell from the approved badge sheet; the sheet's "glowing" icon is the generic `sparkle` type) plus a generic `link` icon for unknown types, default labels and titles, and the `rel="me"` profile types | One place for badge icons; colours stay CSS tokens |
| `src/components/Statusline.astro` | vim-style status bar on post and note pages: mode, source path relative to the content folder, `[RO]`, file type, Top/NN%/Bot/All from a passive scroll listener re-bound on `astro:page-load` | `appearance.statusline`; decorative and `aria-hidden` |
| `src/utils/rehypeBlockLabels.ts` | rehype plugin: wraps Shiki blocks in `div.code-block` with a language label, and marks callout titles that only repeat the type | Notched block labels without client JS; the copy button joins the same wrapper |
| `src/components/SocialList.astro` | contact methods from the socials config; site design: leader rows (label, leader, bare URL) | `/contact/` lists only configured profiles |
| `src/pages/notes/` | `[...page].astro` list, `[year]/[slug].astro` note page and `[year]/[slug]/index.png.ts` OG image; site design: leader-row list; the note page renders through `Main` with the shared `PostMeta` line, a dev-only draft notice and the post foot | Notes at `/notes/YYYY/<slug>/`; Phase 3 adds the OG image, Article JSON-LD and the share row |
| `src/pages/projects/` | `index.astro` leader list (was a card grid), `[slug].astro` metadata-only project page and `[slug]/index.png.ts` OG image | Projects at `/projects/<slug>/`; Phase 3 adds the OG image and SoftwareSourceCode JSON-LD |
| `src/pages/lab/` | `index.astro` listing experiment projects; site design: leader rows with status | `/lab/` is a filtered view of projects with status experiment |
| `src/pages/contact.astro` | renders `src/content/pages/contact.md` plus the configured contact methods; Phase 3: passes `data.canonicalUrl` to the layout; site design: breadcrumb removed | Contact page without invented details; follows the frontmatter key rename |
| `src/content/notes/` | three `[DEMO]` draft notes, 2025 and 2026 | Exercise notes, tags and related reading; visible in dev, never in production builds |
| `src/content/projects/` | four `[DEMO]` draft projects (active featured, maintained, experiment featured, archived) | Exercise projects, lab and the homepage; visible in dev, never in production builds |
| `src/content/pages/home.md` | `[[TODO: …]]` intro and specialties markers, and a YAML comment listing PROJECT.md focus areas as suggestions (Phase 4 replaced the Phase 2 placeholder text) | Homepage intro Andrii writes; nothing invented |
| `src/content/pages/contact.md` | one `[[TODO: …]]` marker (Phase 4 replaced the Phase 2 placeholder text) | Contact intro Andrii writes |
| `src/assets/icons/socials/mastodon.svg` | Tabler `brand-mastodon`, byte-identical copy | Local icon for a configurable social profile; see Provenance |
| `src/assets/icons/socials/bluesky.svg` | Tabler `brand-bluesky`, byte-identical copy | Local icon for a configurable social profile; see Provenance |
| `src/assets/icons/socials/reddit.svg` | Tabler `brand-reddit`, byte-identical copy | Local icon for a configurable social profile; see Provenance |
| `src/assets/icons/socials/medium.svg` | Tabler `brand-medium`, byte-identical copy | Local icon for a configurable social profile; see Provenance |
| `src/assets/icons/socials/devto.svg` | Simple Icons `devdotto`, edited root attributes | Local icon for a configurable social profile; see Provenance |
| `src/assets/icons/socials/lemmy.svg` | Simple Icons `lemmy`, edited root attributes | Local icon for a configurable social profile; see Provenance |
| `src/assets/icons/socials/LICENSE-tabler-icons.txt` | Tabler Icons MIT license text, copied from `package/LICENSE` of `@tabler/icons@3.50.0` | MIT requires the copyright and permission notice to ship with the four copied Tabler icons |
| `src/assets/icons/socials/PROVENANCE.md` | short note naming the source package, version and license of each added icon | Keeps the origin next to the files; the full table is in this file |
| `scripts/` | `build-search-index.ts` (Pagefind index over the content routes), `verify-dist.ts` (assertions over `dist/`: previews, JSON-LD, share row, sitemap, robots, search index, third-party hosts) and `draft-assets.ts` (draft-only image detector and prune); Phase 4: `check-markers.ts` (lists unfilled markers in the sources and, as a backstop, literal ones in the built `dist/`; warns or with `--strict` fails) and more `verify-dist.ts` checks (routes, the retired `/posts/` route, type scale), with output `verify-dist: all {n} checks passed.` or one `verify-dist: FAIL {check}: ...` line per failure; site design: the type-scale check follows the new scale (Tailwind size utilities plus every font size and weight written in CSS and Astro `<style>`), and `build-search-index.ts` syncs `public/pagefind` in place instead of deleting it, so a running dev server keeps serving the new index | Search index, release gate and draft-image prune with `node:` builtins only; `pnpm verify` must pass before publishing, and the strict marker check gates the deploy |
| `src/utils/og/` | `renderOg.ts`, the shared OG renderer (satori and sharp, vendored Inter Latin and Cyrillic files as two font families), and `fontCoverage.ts`, a `cmap` reader (WOFF and TrueType, formats 4 and 12) that tells which characters the fonts draw | One renderer for the site, post, note and project OG images. A title with a character no font draws gets a plain-text stand-in for common arrows and comparisons (`→` is `->`, `≥` is `>=`), and any other character fails the build with its code point and the title, because satori would draw an empty box |
| `src/utils/jsonLd.ts` | escaping serializer and the Person, WebSite, BlogPosting, Article and SoftwareSourceCode builders | Structured data is built only from page data and never contains a hand-written string |
| `src/components/CopyLink.astro` | a Permalink link enhanced to a Copy link button when the clipboard API exists | Replaces the third-party share links (D-09) |
| `src/components/Syndication.astro` | "Also on" line with `rel="syndication"` links from the `syndication` frontmatter | Publish on the site first, then link the copies (POSSE) |
| `src/assets/icons/IconLink.svg` | Tabler `link`, byte-identical copy; see Provenance | Icon of the Copy link control |
| `src/assets/icons/PROVENANCE.md` | names the source, version and license of `IconLink.svg` and points at the Tabler MIT notice | The MIT notice in `src/assets/icons/socials/LICENSE-tabler-icons.txt` covers this icon too |
| `.github/actions/site-checks/action.yml` | composite action: install, format check, lint, `astro check`, build, offline lychee, `pnpm verify`, marker check, with a `strict-markers` input | One definition of the check set, shared by `checks.yml` and `deploy.yml`; every `uses:` is SHA-pinned |
| `.github/workflows/checks.yml` | pull requests to `main` and pushes to other branches (not Dependabot's) run the shared action; `contents: read` only | Pull-request gate (D-06); checkout uses `fetch-depth: 0` because note dates come from git |
| `.github/workflows/deploy.yml` | push to `main` and manual dispatch (both jobs run only on `refs/heads/main`): build job with the strict marker check, then a deploy job with `pages: write` and `id-token: write` through the official Pages actions | Publishes only a fully checked `dist/` (D-07, D-08); never run during M001 |
| `.github/dependabot.yml` | weekly `npm` and `github-actions` updates, grouped, seven-day cooldown, TypeScript majors ignored | Version updates (D-09); security updates need the repository setting listed in the README |
| `.github/zizmor.yml` | disables zizmor's `self-repository` rule | The rule is a help-level finding that asks for `uses: $/...`, which actionlint 1.7.12 rejects. Without the file zizmor reports 2 findings for the local `./.github/actions/site-checks` reference. Re-enable the rule when actionlint accepts the `$/` syntax |
| `lychee.toml` | offline mode, anchor-only fragments, `index.html` as the index file, no host | Shared by lychee-action and `./dev.sh links`; the root directory comes from the command line |
| `templates/` | `post.md`, `note.md` and `project.md` frontmatter templates with every optional key as a commented line and `[[TODO: …]]` markers | Outside `src/`, so never built; `./dev.sh new` copies them (D-10, D-11) |
| `src/utils/rehypeTodoMarkers.ts` | rehype plugin turning body markers into `<mark class="todo-marker">TODO: …</mark>` at build time, skipping code, `pre`, `script` and `style`; `todoMarkerText` for frontmatter values that are one marker | A rehype plugin, not the remark plugin UI-SPEC suggested: it matches the existing `unified({ rehypePlugins })` pipeline and `rehypeTableWrapper`, and runs after the callout plugin so alert text is covered |

## Provenance

- Fonts: `@fontsource/inter@5.3.0` and `@fontsource/jetbrains-mono@5.3.0`, SIL OFL-1.1. Fetched with `npm pack --ignore-scripts` inside the dev image, nothing added to `package.json`. The license texts are `src/assets/fonts/OFL-Inter.txt` and `src/assets/fonts/OFL-JetBrains-Mono.txt`.
  - SHA-256 of the vendored files:
    - inter-cyrillic-400-normal.woff `6e441a6c94788318fa02b6d0a633aa29eebe27b69c6567eb1e59b4edc68ed70e`
    - inter-cyrillic-600-normal.woff `cc190ed1b64eb650a4ad7e97c7a668cb8b34acd9c4c7f7bf4372c0cbacd35795`
    - inter-latin-400-italic.woff2 `7ea9d2f1274cebee837f0c6eebb426c18fbb2333a6b6da4d02ec5cf47db7fb8e`
    - inter-latin-400-normal.woff `e20fa0b4fd2dd26e4d14b3ac3cc922509c3a63fa5e910e90c614544aa042dd45`
    - inter-latin-400-normal.woff2 `8909904ab6c872eb994093482a88a28eca2cd95912d7b6fecd72103b0dc07edc`
    - inter-latin-600-italic.woff2 `c45ec86655c4614e7db0b9d2ea00303c1b252dae5671227aae5955f696069de6`
    - inter-latin-600-normal.woff `6a9cb3a509b4eeaf12b7dda6c4aacac3e85d07f4201bf4dd716e332e692b87bd`
    - inter-latin-600-normal.woff2 `f9a06e79cd3a2a20951c0f0e28f66dd0e6d3fda73911d640a2125c8fcb78f21a`
    - jetbrains-mono-latin-400-italic.woff2 `87ddac4a62229787528cf4ac3fa58137b62a9aec364c44fc0f40470bcda9efba`
    - jetbrains-mono-latin-400-normal.woff2 `14425ba9c695763c1547f48a206b7aa60350a33ae23de09f0407877f3fcd89eb`
  - The two Inter Cyrillic files were added after the Phase 3 code review so Cyrillic titles render in OG images. Same package and version (`@fontsource/inter@5.3.0`, tarball SHA-256 `02034af8d41dcc67ac8eab88f642e129bb8a2e8922abf30229c32725f54d8fd6`), same method (`npm pack --ignore-scripts` inside the dev image, in a scratch directory that was deleted afterwards; only the two `.woff` files were extracted and nothing was installed, so `package.json` and the lockfile are unchanged). They are the `cyrillic` subset (U+0400-045F, U+0490-0491, U+04B0-04B1, U+0301, U+2116), which holds every Ukrainian letter. The `cyrillic-ext` subset is not vendored. The license is SIL OFL-1.1, the same text as `src/assets/fonts/OFL-Inter.txt`, which is byte-identical to `package/LICENSE` of the tarball.
- Wordmark font (site design): `pixelify-sans-latin-400-normal.woff2` is the Latin subset of Pixelify Sans 400 as Google Fonts serves it (`https://fonts.gstatic.com/s/pixelifysans/v3/CHy2V-3HFUT7aC4iv1TxGDR9DHEserHN25py2TTp0E1fZZM.woff2`, listed by the `css2?family=Pixelify+Sans:wght@400` stylesheet), downloaded once and served from the site; SHA-256 `d830612ac9131788ebae754b9268f83f7c1d3ffa9bc0f9a5514207a8283fe71e`. Licence SIL OFL-1.1: `src/assets/fonts/OFL-Pixelify-Sans.txt` is `OFL.txt` from the upstream repository `eifetx/Pixelify-Sans` (main branch), SHA-256 `b66ba46f511a851ab09998b5a5a9fdbb102545a3864cb993095e1745996873a7`. Nothing was added to `package.json`.
- Social icons (Phase 2): six files in `src/assets/icons/socials/`, fetched as tarballs with `npm pack --ignore-scripts` inside the dev image, in a scratch directory that was deleted afterwards. Only the six SVGs were copied and nothing was installed.
  - Tabler Icons (MIT, `Copyright (c) 2020-2026 Paweł Kuna`) from `@tabler/icons@3.50.0`: byte-identical copies. The license text ships next to them as `src/assets/icons/socials/LICENSE-tabler-icons.txt`, copied from `package/LICENSE` of that package.
  - Simple Icons (CC0-1.0, public-domain dedication, no notice required) from `simple-icons@16.36.0`: edited by removing `role="img"` and the `<title>` element and adding `fill="currentColor" width="24" height="24"` to the root; path data is unchanged.

  | Icon | Source package@version | Source path | License | SHA-256 of the source file |
  |------|------------------------|-------------|---------|----------------------------|
  | mastodon.svg | `@tabler/icons@3.50.0` | `package/icons/outline/brand-mastodon.svg` | MIT | ccb3f9da6a935db17cb4715d7fb69f9d1f30a6c22c09bfc7da50c575a29e6733 |
  | bluesky.svg | `@tabler/icons@3.50.0` | `package/icons/outline/brand-bluesky.svg` | MIT | 72dd2c390571f20095dd763610897bd85c0e9fe384bfa150898866714614d609 |
  | reddit.svg | `@tabler/icons@3.50.0` | `package/icons/outline/brand-reddit.svg` | MIT | 8888efb03eab09945135431f9a909462cb3a6ae3acfa1ac64b98c3862bedb53a |
  | medium.svg | `@tabler/icons@3.50.0` | `package/icons/outline/brand-medium.svg` | MIT | 1819bec83f56d1b99bca30c929df3073ecdcb4fa2821e6728350ffa76cae915f |
  | devto.svg | `simple-icons@16.36.0` | `package/icons/devdotto.svg` | CC0-1.0 | c50c14c6dfcb6109d09421c92370c363fb61163abf7e348eb45656d36f6dc1ec |
  | lemmy.svg | `simple-icons@16.36.0` | `package/icons/lemmy.svg` | CC0-1.0 | f9d182f4a03a579ba8fce21fbb200a40e3d761c915cce6a743fa4600a1feee45 |

  - SHA-256 of the two edited files as committed: devto.svg `2d27e41b646ceabb1757cd4fc8abe074ae2f6d6e67a619255810e7b5b55ba200`, lemmy.svg `969bf175e98b5d3b3ea10de0c900687817d4cb3604cca3e6fe860b09111d9385`.
- Copy link icon (Phase 3): `src/assets/icons/IconLink.svg` is `package/icons/outline/link.svg` from `@tabler/icons@3.50.0` (MIT), a byte-identical copy, fetched the same way as the Phase 2 icons (`npm pack --ignore-scripts` in the dev image as the host UID, tarball only, scratch directory deleted). SHA-256 of the source and of the copy: `63c88f996a6c8c3a1687b92f75ef11cab9a549a1408f9ed85d7baf78c7cad12d`. The Tabler MIT notice is `src/assets/icons/socials/LICENSE-tabler-icons.txt` and covers this file as well; `src/assets/icons/PROVENANCE.md` points at it from the directory that holds the icon.
- Base image: `node:22-slim@sha256:e9f565d32859f0cbfb52125eafe8be39390f24dac302dc3cdf566e8ba3ab21ee`, Node v22.23.5 (`.node-version` matches).
- pnpm: `11.28.13`, pinned through `packageManager` in `package.json` and provided by corepack. `pnpm-workspace.yaml` is unchanged from upstream.
- Dependencies added: `rehype-autolink-headings@7.1.0` in Phase 1. Phases 2, 3 and 4 added nothing to `package.json` dependencies or `pnpm-lock.yaml` (Phase 3 changed only the `build` and `verify` scripts, Phase 4 only the `build`, `build:site` and `markers` scripts).
- Pinned tools (Phase 4), as pulled by digest in `dev.sh` and used by `./dev.sh links` and `./dev.sh workflows`:
  - `lycheeverse/lychee:0.24.2@sha256:e2d19e57cf6ab037026f20b8e449a1f30d9d7f81eef4194763aab2eab20bd28d` (the lychee version bundled by the pinned lychee-action)
  - `rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667`
  - `ghcr.io/zizmorcore/zizmor:1.33.1@sha256:ecd3ffe6158de1322e05a044ed43749bee12b1dccb7e1a7859bc6ac4b2a1c516`
- Actions pinned to commit SHAs in `.github/` (Phase 4), each with its version in a trailing comment:
  - `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1` (v7.0.1)
  - `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1` (v7.1.0)
  - `pnpm/action-setup@73e46992e05b19abd31f2f3c20e0e7370d762115` (v6.1.1)
  - `lycheeverse/lychee-action@e7477775783ea5526144ba13e8db5eec57747ce8` (v2.9.0)
  - `actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9` (v5.0.0)
  - `actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d` (v6.0.0)
  - `actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346` (v5.0.1)
- Placeholder markers (Phase 4) are highlighted by a rehype plugin, not a remark plugin: see the `src/utils/rehypeTodoMarkers.ts` row under "Added".
- Dependencies removed: `remark-toc`, `remark-collapse` (deprecated upstream, unused) and `@shikijs/transformers` (unused once the Shiki transformers were dropped).
- Core packages kept from upstream: `astro@7.4.12` and `@astrojs/mdx@8.1.6` (both flagged "too new" by the package-legitimacy check and approved by Andrii before the first install).
- Palette: every colour lives in `src/palettes.ts` (ported from starglow), selected with `appearance.palette` in `astro-paper.config.ts` (this site: `glowing`, the glowing.space logo colours). `site-theme.css` only derives tokens from the palette variables; `pnpm verify` (palettes) checks WCAG AA for every shipped palette.

## Upgrade cautions

- Keep TypeScript below 7: `astro check` refuses TypeScript 7 (`typescript` is `^6.0.3`). `.github/dependabot.yml` ignores TypeScript major versions for this reason; remove that entry only after `astro check` supports TypeScript 7.
- Keep the Markdown pipeline in `unified({...})` in `astro.config.ts` and keep `@astrojs/markdown-remark` installed; removing it makes config validation throw.
- Keep `postFilter` as the only draft gate. Pages must not filter with `!data.draft` themselves; the dev-versus-production difference lives in one place.
- Keep `src/styles/theme.css` byte-identical to upstream (`typography.css` differs only in its two `.astro-code` colour rules) and put every visual override in `src/styles/site-theme.css`. `theme.css` still contains upstream's dead `--font-app: var(--font-google-sans-code)` line; the later `@theme inline` block in `site-theme.css` redefines `--font-app`, and no Google font reference reaches `dist/`.
- Post URLs are built only by `getPostUrl`, and the year segment comes from the content folder. Do not reintroduce the `posts` route literal.
- Upstream keeps AstroPaper branding in several places (README, sample posts, About page, OG image, LICENSE holder); do not merge those hunks back.
- The `upstream` remote must stay push-disabled (`git remote get-url --push upstream` prints `DISABLED`).
- `postFilter` (posts) and `isVisible` in `src/utils/content/visibility.ts` (notes and projects) are the only draft gates. Lists come from `src/utils/content/items.ts` (`getPostItems`, `getNoteItems`, `getAllItems`) and `src/utils/content/projects.ts`; pages must not filter on `draft` themselves.
- Note and project URLs are built only by `getNoteUrl` and `getProjectUrl`. Do not write `notes/${...}` or `projects/${...}` templates elsewhere.
- Note dates come from git history: CI must check out with `fetch-depth: 0` (Phase 4). Squashing to one init commit gives every pre-launch note that commit's date unless the note sets `updated` (RESEARCH Pitfall 1).
- Every font size and weight comes from the `--t-*` tokens in `site-theme.css` (sizes 10 for badge text only, then 12, 13, 14, 15, 16, 18, 20, 24, 28 and 32px; weights 400 and 600); `pnpm verify` (type-scale) fails on anything else in CSS or Astro `<style>`.
- The header wordmark face is the `--font-wordmark` entry in `astro.config.ts`; swap its `name` and `src` (and ship its licence next to it) to change it.
- A running `astro dev` keeps Markdown plugin modules and rendered entries cached; restart it after changing a file in `src/utils/rehype*`.
- `site.sourceBanner` is written into an HTML comment; it must never contain `--` (the config resolver throws).
- The back-to-top button sits above the statusline (`body:has(.statusline) .post-fab`); keep the two in step when either moves.
- Fork-owned `.astro` files use only `font-normal` and `font-semibold`. Check with `grep -rnE --include='*.astro' 'font-(light|medium|bold|extrabold)' src`; it must print nothing.
- Never copy the four Tabler icons without `src/assets/icons/socials/LICENSE-tabler-icons.txt`: the MIT notice has to ship with them.
- The search index is built only by `scripts/build-search-index.ts` with the content-route glob. Never go back to upstream's bare Pagefind CLI and copy step: it fails at zero pages and leaks stale fragments.
- `./dev.sh pnpm verify` must pass before publishing.
- Code highlighting uses Shiki's css-variables theme (`astro.config.ts`), mapped to the palette in `site-theme.css`; `typography.css` uses `--shiki-background` / `--shiki-foreground` instead of the dual-theme variables.
- The frontmatter key is `canonicalUrl` while Layout's prop stays `canonicalURL`; do not merge upstream hunks that rename one to the other.
- JSON-LD is built only through `src/utils/jsonLd.ts` from page data, never from hand-written strings.
- Never reintroduce share-intent links or third-party share widgets; `pnpm verify` fails on them.
- The build prunes images that only drafts reference (`scripts/draft-assets.ts --prune`); keep post images next to the content (for example in `_assets/`) so the detector can see who uses them.
- The container image digests (`node:22-slim` in the `Dockerfile`, lychee, actionlint and zizmor in `dev.sh`) are not covered by Dependabot. Refresh them by hand as the README's Maintenance section describes, and keep the lychee image at the version CI passes to lychee-action as `lycheeVersion`.
- Never merge upstream's `.github/`: it uses tag-pinned actions and a different Node and pnpm setup.
- Every `uses:` in `.github/` stays pinned to a full commit SHA with a version comment, including the one in the composite action. Dependabot updates both.
- `./dev.sh ci` and `./dev.sh workflows` must pass before publishing.
- Unfilled `[[TODO: …]]` markers block the deploy by design (`./dev.sh pnpm markers --strict`); they only warn in builds and pull requests.
