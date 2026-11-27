# Upgrading starglow

starglow is a template: your site is a copy of the theme, and upgrades are
merged into it. Keep your changes in the places starglow never overwrites,
and an upgrade stays a small, reviewable diff.

## Files that are yours

starglow never changes these after release:

| File                       | Use it for                                          |
| -------------------------- | --------------------------------------------------- |
| `starglow.config.ts`       | All site settings                                   |
| `src/content/**`           | Your posts, notes, projects and pages               |
| `src/custom/Head.astro`    | Extra tags in `<head>`: analytics, fonts, meta      |
| `src/custom/BodyEnd.astro` | Scripts or widgets at the end of `<body>`           |
| `src/custom/PostEnd.astro` | Comments, newsletter or author bio after each post  |
| `public/**`                | Favicon, static OG image and other static files     |

New config keys always get a default, so an existing `starglow.config.ts`
keeps working. A key that is removed or merged into another fails the
build with a message that names its replacement, and the release notes
below say how to move it.

## How to upgrade

If you cloned starglow as in [Get started](README.md#get-started), the
`starglow` remote is already there. Sites created another way (the npm template, "Use this template") add
it once:

```sh
git remote add starglow https://github.com/glowing-space/starglow.git
```

Then, for each release:

```sh
git fetch starglow --tags
git merge vX.Y.Z    # add --allow-unrelated-histories the first time, for sites not cloned from starglow
./dev.sh ci         # or: pnpm install && pnpm build
```

Resolve conflicts in favour of your version for the files above, and of the
theme's version everywhere else. Read the section for every release you
skip below.

## Release notes with upgrade steps

### v0.1.1

Breaking changes first. Run `./dev.sh build` after merging and fix what it
lists.

- `starglow.config.ts` is validated by a strict schema on every build.
  Settings that used to be ignored or silently fixed now fail the build
  with the key path and, for a typo, the closest valid key:
  - an unknown key anywhere, for example `site.titel` or a nested key
    inside `features.editPost` or a footer link;
  - `site.url`, which was ignored (the origin comes from `SITE_URL`);
  - a `site.timezone` that is not a known IANA zone (it fell back to UTC
    with a warning);
  - an empty `site.title`, and a `site.sourceUrl` that is not an http(s)
    URL;
  - a custom palette with a name other than letters, digits, `_` and `-`,
    a colour that is not an opaque hex value, a missing colour or an
    extra key;
  - a footer link with an empty `label` or `href`;
  - `posts.perPage` or `posts.perIndex` that is not a whole number above 0.
- Four config keys are merged into the key that owns the same value. The
  build fails while one is still set, and names the replacement:
  - `socials` is gone. Add each profile you filled in to `links` as a
    badge: `{ name: "github", label: "GitHub", url: "https://github.com/you" }`
    becomes `{ type: "github", url: "https://github.com/you" }` (`label`
    becomes the badge `title` if you want it). Profile badges are the
    `rel="me"` links and the homepage `sameAs`, as socials were.
  - `person.description` is gone. `site.description` describes the site;
    the Person keeps `jobTitle`.
  - `site.fediverseCreator` is gone. Add a mastodon badge,
    `{ type: "mastodon", url: "https://instance/@you" }`, and the
    `fediverse:creator` meta reads `@you@instance` from it. If your Mastodon
    URL has another shape, keep the meta tag in `src/custom/Head.astro`.
  - `features.editPost.url` is gone. Set `site.sourceUrl` to the
    repository and keep `editPost: { enabled: true }`; the link is
    `sourceUrl` + `path` + the file path, with `path` defaulting to
    `"edit/main/"`. For `https://github.com/you/site/edit/main/` set
    `sourceUrl: "https://github.com/you/site"`; for GitLab add
    `path: "-/edit/main/"`.
- Content frontmatter is stricter. These used to build and now fail with
  the file and the field:
  - a tag with uppercase letters (`CSS`): write it in lowercase;
  - the same tag twice in one entry;
  - a tag without a letter or digit, such as `!!!`; letters in any script,
    such as `привіт`, are fine;
  - a `title` longer than 100 characters, or an empty one.
- A `pubDatetime`, `modDatetime` or note `updated` written as a bare date
  (`2026-01-01`) now means midnight of that day in the entry's timezone
  (its `timezone`, else `site.timezone`), not midnight UTC. West of UTC,
  such posts show the date you wrote instead of the day before. A value
  with a time is that exact instant, midnight UTC included. If a post's
  folder year no longer matches, the build says so.
- `/contact/` lists the profile badges of `links` (label and URL, with
  `rel="me"`), all of them, even those the footer leaves out as
  duplicates. It is built, and linked from the footer and the about page,
  when `src/content/pages/contact.md` exists or `links` has a profile
  badge; without either there is no contact page. Without `contact.md` the
  page is titled "Contact" and shows only the list. The page now comes
  from `src/pages/[...page].astro`: `src/pages/contact.astro` and
  `SocialList.astro` are gone.
- The footer's text "rss" link is gone: the `rss` badge is the only RSS
  link. Keep `{ type: "rss", url: "/rss.xml" }` in `links` if you want it.
- Listing pages (blog, notes, projects, tags, search, 404) have no meta
  description, and `src/custom/Head.astro` gets an empty `description`
  there.
- The Lab section is gone: there is no `/lab/` page, nav entry, `lab`
  template or `./dev.sh new lab` any more. If you linked to `/lab/`, point
  the link at `/projects/` or add a redirect at your host.
- The project status `experiment` is gone: set such projects to `active`,
  `maintained` or `archived`, or the build fails. The CSS variable
  `--status-experiment` no longer exists.
- `site.lang` now also sets Astro's i18n locale, and the build fails when
  `src/i18n/lang/<lang>.ts` is missing instead of falling back to English.
  A translated strings file:
  - drops `nav.lab`, `pages.labTitle`, `pages.labDesc`,
    `project.status.experiment`, `home.archive`, `contact.noMethods`,
    `footer.rss`, `pages.tagDesc`, `pages.tagsDesc`, `pages.postsDesc`,
    `pages.notesDesc`, `pages.projectsDesc`, `pages.searchDesc`,
    `search.emptyBrowse` and the whole `empty` group;
  - needs `home.allPosts`, `home.allNotes`, `contact.title` and the `a11y` keys
    `zoomImage`, `zoomImageAlt`, `imagePreview`, `imagePreviewAlt`,
    `closeImagePreview` and `themePreview` (copy them from `en.ts`);
  - writes `search.noscript` and `search.noResults` with one
    `{{sections}}` token instead of `{{blog}}`, `{{notes}}`,
    `{{projects}}` and `{{tags}}`;
  - has a one-sentence `notFound.body`.

  In your own components, `useTranslations(useLocale(Astro))` from
  `@/i18n` gets the page's strings.
- Two tag spellings that share a URL slug (`web dev` and `web-dev`) fail
  the build.
- Body text and `h3` are 17px on a 28px line (were 16/26), and the
  type-scale check now allows 17 instead of 16. A raw `16px` font size in
  your own CSS fails `pnpm verify`: use a `--t-*` token or 17px.
- The demo content is new (a different fictional owner). The merge adds its
  posts, notes, projects and `_assets/` under `src/content/`; delete the
  ones you do not want. Keep your version of `starglow.config.ts` and of your
  pages.

Other changes:

- The footer lists each URL once. A badge, a `footer.links` entry or the
  `source` link whose URL the footer already has is left out (credit first,
  then badges, `footer.links`, contact, source). The `rss` badge shows once
  a post or note is published. `/contact/` is not part of this: it lists
  every profile badge.
- Only the home page uses `site.description` as its meta description.
  Notes and pages without a `description` use their opening words.
- Empty sections are hidden: Blog, Notes and Projects leave the header nav,
  and search its icon, until something is published. The "No posts yet"
  boxes and the lines under the listing headings ("All posts, newest
  first.") are gone, and so is the 404 page's list of links that repeated
  the header. The search page's no-JavaScript and no-results text links
  only to sections with published content, joined in the locale's style
  (for English with a serial comma: "blog, notes, and projects").
- The home writing list links "all posts" and "all notes" instead of
  "archive". Kind labels (post, note) show only in lists that hold both.
- The back link on posts and notes reads "Home" until the visitor has come
  from a page of this site, then "Back".
- Code blocks are no longer in the search index.
- Astro's content cache (`node_modules/.astro/data-store.json`) is cleared
  automatically when theme code, `starglow.config.ts` or a dependency
  changes, so an upgrade no longer leaves stale search excerpts or
  rendered Markdown. The first build after this upgrade renders every
  entry once.
- Unit tests run with Vitest (`pnpm test`, `./dev.sh test`) as part of
  `./dev.sh ci` and the checks workflow. They live in `tests/`; delete a
  test there if you remove the helper it covers.
- The Inter files are new (a subset of Inter 4.1 with a tailed `l` and a
  serif `I` as default glyphs). If you replaced Inter, keep your files.

### v0.1.0

First version, nothing to migrate.
