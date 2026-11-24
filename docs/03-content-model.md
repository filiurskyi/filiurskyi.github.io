# The content model

Everything you write is Markdown in `src/content/`. There are four collections. Their schemas are in `src/content.config.ts`, and they are strict: an unknown or misspelled frontmatter key fails `astro check`.

## Replace the demo content

starglow ships with the demo site's content. To start your own:

- Delete the posts in `src/content/blog/`, the notes in `src/content/notes/` and the projects in `src/content/projects/`, with their `_assets/` folders.
- Rewrite `home.md` and `about.md` in `src/content/pages/`.
- Rewrite `contact.md`, or delete it: `/contact/` then lists only your profile badges, and without those there is no contact page.
- Rewrite or delete `impressum.md` and `privacy.md`, and their `footer.links` entries in `starglow.config.ts`.

Sections without published content stay hidden: no nav entry, no search icon and no filler text. An empty site shows its intro, the about page and the footer.

## Posts

Posts are the long-form writing. They live in a year folder:

```text
src/content/blog/2026/my-first-post.md   →   /blog/2026/my-first-post/
```

The filename must be lowercase kebab-case, and the folder year must match the year of `pubDatetime` in the site timezone. That rule keeps the URL year honest.

### Required post fields

| Field         | Type   | Notes                                                             |
| :------------ | :----- | :---------------------------------------------------------------- |
| `title`       | string | Page heading, list title and browser tab. At most 100 characters. |
| `description` | string | One sentence. List summary and meta description.                  |
| `pubDatetime` | date   | With an offset, for example `2026-11-09T10:00:00+01:00`.          |

### Optional post fields

| Field          | Notes                                                             |
| :------------- | :---------------------------------------------------------------- |
| `modDatetime`  | Shown as "Updated" when later than `pubDatetime`.                 |
| `tags`         | Lowercase labels, each once; each gets a page under `/tags/`.     |
| `draft`        | `true` keeps the post out of production builds.                   |
| `hideToc`      | Hides the table of contents on the post.                          |
| `hideEditPost` | Hides the edit link when `features.editPost` is enabled.          |
| `ogImage`      | A custom social image next to the post. Default: a generated one. |
| `canonicalUrl` | Where the post was first published.                               |
| `syndication`  | Other places the post was published, shown as an "Also on" line.  |
| `timezone`     | IANA zone for the post's dates.                                   |
| `author`       | Defaults to `site.author`.                                        |

A post with a `pubDatetime` in the future is built only from that day on.

Each tag gets a page at `/tags/<slug>/`. Tags must be lowercase, listed once per entry and contain at least one letter or digit, in any script (`привіт` and `日本語` are fine): `CSS`, a repeated tag or a tag made only of symbols, such as `!!!`, fails the build with a message that names the tag and the file; it is not rewritten. Two spellings that share a slug, such as `static sites` and `static-sites`, fail the build with the files that use them, so spell each tag one way everywhere.

A `title` in any collection may have at most 100 characters; longer ones are cut off in search results and link previews.

A date without a time, such as `pubDatetime: 2026-01-01`, means midnight of that day in the post's timezone (its `timezone`, else the site timezone), not midnight UTC. The same goes for `modDatetime` and a note's `updated`. Only a bare `YYYY-MM-DD` counts: a value with a time, such as `2026-01-01T00:00:00Z`, is that exact instant, midnight UTC included.

## Notes

Notes are short, self-contained pieces: a command, a fix, a finding. They also live in year folders and are served at `/notes/<year>/<slug>/`.

Notes have no date field. Their dates come from the file's git history, so a note shows when it was first committed and last changed. An optional `updated` date overrides the git date. Other fields: `description` (without it, the meta description is the note's opening words), `tags`, `canonicalUrl`, `syndication` and `draft`. Only `title` is required.

## Projects

Projects are one Markdown file each, directly in `src/content/projects/`, and they are served at `/projects/<slug>/`. A project page is built from frontmatter only, so the file has no body. A body fails the build.

| Field                                | Notes                                                  |
| :----------------------------------- | :----------------------------------------------------- |
| `title`, `description`               | Required.                                              |
| `status`                             | Required: `active`, `maintained` or `archived`.        |
| `stack`                              | Technologies shown as chips.                           |
| `githubUrl`, `docsUrl`, `websiteUrl` | Optional links.                                        |
| `featured`                           | Lists the project on the homepage and sorts it first.  |
| `relatedPosts`                       | Post ids as `YYYY/slug`, linked from the project page. |

All projects are listed on `/projects/`: featured first, then by status (active, maintained, archived) and title.

## Pages

`src/content/pages/` holds the text of the homepage intro, `home.md` (with an optional `specialties` list), and of `about.md`. Edit them in place.

`/contact/` lists your [profile badges](./02-configuration.md#links) with their URLs, under the text of the optional `contact.md`. The page exists, and is linked from the footer and the about page, when `contact.md` exists or `links` has a profile badge; without either there is no contact page and no link. Without `contact.md` it is titled "Contact" and shows only the list. Write in `contact.md` what the badges do not show, such as an email address or how you prefer to be reached.

Any other file there becomes a standalone page at `/<name>/`, laid out like the about page: `privacy.md` is published at `/privacy/` and `impressum.md` at `/impressum/`. A file in a folder keeps the folder in its URL, and a name starting with `_` is skipped. Standalone pages are listed in the sitemap but not in search. A name whose first part the theme already uses stops the build: `404`, `blog`, `notes`, `og.png`, `pagefind`, `projects`, `robots.txt`, `rss.xml`, `search`, `tags`, or a folder named `home` or `about`. Link the pages from the footer with [`footer.links`](./02-configuration.md#footer).

| Key            | What it does                                                                                                        |
| :------------- | :------------------------------------------------------------------------------------------------------------------ |
| `title`        | Required. Page title and heading.                                                                                   |
| `description`  | Meta description and the line under the heading. Without it, the meta description is the opening words of the text. |
| `ogImage`      | Social preview image, instead of the site default.                                                                  |
| `canonicalUrl` | Canonical URL, when the text is published elsewhere first.                                                          |

## Creating content

`templates/` holds a commented starting file for each type: `post.md`, `note.md` and `project.md`. Every optional key is listed there with its default and an explanation, so you can uncomment what you need. With Docker set up, one command copies a template:

```bash
./dev.sh new post my-first-post    # src/content/blog/<year>/my-first-post.md
./dev.sh new note a-handy-command  # src/content/notes/<year>/a-handy-command.md
./dev.sh new project my-tool       # src/content/projects/my-tool.md
```

It sets the date to now in the site timezone and marks the entry as a draft. It needs GNU `date`.

In VS Code, `.vscode/starglow.code-snippets` adds the snippets `frontmatter` (post), `note-frontmatter` and `project-frontmatter`. For templates in Obsidian, see [Templates in Obsidian](./04-writing.md#templates-in-obsidian).

### Drafts

`draft: true` entries are visible on the dev server with a Draft badge, and they never reach a production build. Images that only drafts use are removed from the build as well. Files and folders whose name starts with `_` are never loaded at all, which is handy for assets such as `_assets/`.

### Placeholder markers

The templates mark the text you still have to write with a placeholder marker:

```md
[[TODO: one-sentence summary]]
```

In a page body a marker renders as a highlighted `TODO:` note, so you can spot it while writing. `pnpm markers` lists every remaining marker. A normal build only warns. The deploy workflow runs the check in strict mode and fails until every marker is gone.

#### Showing the syntax

Markers inside code spans and code blocks are ignored.
