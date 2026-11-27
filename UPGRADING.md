# Upgrading starglow

Your site is a copy of starglow; each release is merged into it. Keep your
changes in the files below and an upgrade stays a small diff.

## Files that are yours

| File                       | Use it for                                         |
| -------------------------- | -------------------------------------------------- |
| `starglow.config.ts`       | All site settings                                  |
| `src/content/**`           | Your posts, notes, projects and pages              |
| `src/custom/Head.astro`    | Extra tags in `<head>`: analytics, fonts, meta     |
| `src/custom/BodyEnd.astro` | Scripts or widgets at the end of `<body>`          |
| `src/custom/PostEnd.astro` | Comments, newsletter or author bio after each post |
| `public/**`                | Favicon, static OG image and other static files    |

New config keys get a default. A removed key fails the build and names its
replacement.

## How to upgrade

Sites cloned as in [Get started](README.md#get-started) have the `starglow`
remote. Other sites add it once:

```sh
git remote add starglow https://github.com/glowing-space/starglow.git
```

Then, for each release:

```sh
git fetch starglow --tags
git merge vX.Y.Z    # first time on a site not cloned from starglow: add --allow-unrelated-histories
./dev.sh ci         # or: pnpm install && pnpm build
```

Resolve conflicts with your version for the files above and the theme's
version elsewhere. Follow the steps of every release you skip.

## Upgrade steps

### v0.2.1

- Build values live in `starglow.config.ts`. Move each one from `.env` or a
  repository variable to its key, then delete the `.env` file and the
  repository variables (Settings → Secrets and variables → Actions →
  Variables):

  | Old variable                      | New key                     |
  | --------------------------------- | --------------------------- |
  | `SITE_URL`                        | `site.url` (required)       |
  | `BASE_PATH`                       | `site.base`                 |
  | `PUBLIC_CF_WEB_ANALYTICS_TOKEN`   | `analytics.cloudflareToken` |
  | `PUBLIC_GOOGLE_SITE_VERIFICATION` | `site.googleVerification`   |

### v0.2.0

- Translations: add the new `footer.smallWeb`, `footer.legal` and
  `smallWeb.*` strings to your `src/i18n/lang/<lang>.ts` (copy them from
  `en.ts`).
- Legal links: move impressum, privacy and similar pages from `footer.links`
  to the new `footer.legal`, which sits right-aligned on the pages row.
- A "no cookies" link badge: replace
  `{ type: "link", url: "/privacy/", label: "no cookies" }` with
  `{ type: "nocookies", url: "/privacy/" }`. The build then fails when a page
  loads a resource from another origin (the Cloudflare beacon excepted) or a
  script uses `document.cookie` or `cookieStore`.
- Replaced fonts: keep your `.woff2` in `src/assets/fonts/` under the
  theme's file name, run `pnpm fonts` and commit the files it writes to
  `src/assets/fonts/subsets/`.
- Content images are resized to at most 1200px wide and get a `srcset`.
  Tune it with `images` in the config. The width in `![[img.png|alt|600]]`
  now sets the output width.
- The guides in `docs/`, `AGENTS.md` and `.agents/` are gone from the theme;
  the merge deletes your copies unless you changed them. Config docs are the
  hover text of each key in `starglow.config.ts`.

### v0.1.1

Run `./dev.sh build` after merging and fix what it lists.

- Config is checked by a strict schema. These fail the build with the key
  path: an unknown key (with the closest valid key for a typo), `site.url`
  (the origin comes from `SITE_URL`), an unknown `site.timezone`, an empty
  `site.title`, a non-http(s) `site.sourceUrl`, a custom palette with a bad
  name, colour or key set, a footer link with an empty `label` or `href`, and
  `posts.perPage` or `posts.perIndex` below 1 or fractional.
- Removed keys:

  | Old key                 | New                                                                          |
  | ----------------------- | ---------------------------------------------------------------------------- |
  | `socials`               | profile badges in `links`: `{ type: "github", url: "https://github.com/you" }` |
  | `person.description`    | `site.description`                                                           |
  | `site.fediverseCreator` | a mastodon badge, `{ type: "mastodon", url: "https://instance/@you" }`       |
  | `features.editPost.url` | `site.sourceUrl` plus `features.editPost.path` (default `"edit/main/"`; GitLab: `"-/edit/main/"`) |

  A Mastodon URL of another shape: keep the `fediverse:creator` meta in
  `src/custom/Head.astro`.
- Frontmatter: tags are lowercase, unique per entry and contain a letter or
  digit (any script); `title` is 1 to 100 characters; two tags with the same
  URL slug (`web dev`, `web-dev`) fail the build.
- A bare date in `pubDatetime`, `modDatetime` or `updated` (`2026-01-01`) is
  midnight in the entry's timezone, else `site.timezone`. A post whose folder
  year no longer matches fails the build.
- `/contact/` comes from `src/pages/[...page].astro` and lists every profile
  badge. Delete your `src/pages/contact.astro` and `SocialList.astro`.
- RSS: keep `{ type: "rss", url: "/rss.xml" }` in `links`; the footer text
  link is gone.
- The Lab section and project status `experiment` are gone. Point `/lab/`
  links at `/projects/`; set such projects to `active`, `maintained` or
  `archived`.
- `site.lang` sets Astro's i18n locale; `src/i18n/lang/<lang>.ts` must exist.
  In a translation, drop `nav.lab`, `pages.labTitle`, `pages.labDesc`,
  `project.status.experiment`, `home.archive`, `contact.noMethods`,
  `footer.rss`, `pages.tagDesc`, `pages.tagsDesc`, `pages.postsDesc`,
  `pages.notesDesc`, `pages.projectsDesc`, `pages.searchDesc`,
  `search.emptyBrowse` and the `empty` group; add `home.allPosts`,
  `home.allNotes`, `contact.title` and the `a11y` keys `zoomImage`,
  `zoomImageAlt`, `imagePreview`, `imagePreviewAlt`, `closeImagePreview` and
  `themePreview`; write `search.noscript` and `search.noResults` with one
  `{{sections}}` token; keep `notFound.body` to one sentence.
- Body text is 17px. A raw `16px` in your CSS fails `pnpm verify`: use a
  `--t-*` token or 17px.
- The merge adds the new demo content under `src/content/`; delete what you
  do not want.

### v0.1.0

First version.
