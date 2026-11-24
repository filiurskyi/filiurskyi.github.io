# Writing

What Markdown and MDX turn into in starglow. For the collections and their frontmatter, see [The content model](./03-content-model.md).

## Code blocks

Fenced code blocks are highlighted by Shiki at build time, so no highlighting script runs in the browser. Write the language after the opening fence:

````md
```rust
fn main() {}
```
````

- Each block gets a label with its language and a copy button. A block without a language, or with `text`, gets the label `text`.
- Long lines scroll inside the block; the page never gets wider.
- Inline code uses the same monospace font at body size, and wraps on narrow screens.
- Code blocks are left out of the search index, so search results quote your prose.

## Callouts

Callouts use the GitHub alert syntax, so the same Markdown renders on GitHub too. The five types are `NOTE`, `TIP`, `IMPORTANT`, `WARNING` and `CAUTION`; each is tinted with its own colour from the palette.

```md
> [!TIP]
> Optional information to help a reader be more successful.
```

A title can follow the type on the same line: `> [!TIP] Faster builds`. GitHub ignores it, starglow shows it. A callout can hold several paragraphs, lists and inline code.

## Headings

Every heading from `##` down gets a link anchor at build time. The table of contents is built from the `h2` and `h3` headings, see [`features.toc`](./02-configuration.md#features).

## Tables

Tables use the usual Markdown pipe syntax. Colons in the separator row set the alignment of each column. A table wider than the text column scrolls sideways inside its box.

## Images

Put images next to the post, in a folder whose name starts with `_`, such as `_assets/`. Astro optimises them at build time, and the underscore keeps the folder out of the content loader.

```md
![Three boxes joined by arrows, from left to right](./_assets/three-boxes.svg)

_Figure 1: an italic line under the image works as a caption._
```

- Every image needs alt text that describes what it shows. `pnpm verify` fails on an image without it.
- Images in posts open in a larger preview on click.
- A post's social image is generated from its title. To use your own, set `ogImage: ./_assets/cover.png` in the frontmatter.

## MDX

Name a post `.mdx` instead of `.md` to use MDX: expressions such as `{6 + 7}` and components work, and everything from Markdown still does. Plain Markdown is easier to read, diff and move to another tool, so use MDX only when a post needs a component.

## Obsidian

Set `features.obsidian: true` in `starglow.config.ts` to copy posts, notes and projects from an Obsidian vault unchanged. The build converts Obsidian syntax in `.md` files and never rewrites them. MDX files are left alone.

- `[[Note]]`, `[[Note|text]]` and `[[Note#Heading]]` link to the post, note or project with that file name, `title` or alias (case-insensitive). With no match they render as plain text. In a production build, drafts and posts scheduled for later count as no match.
- `![[Note]]` renders as a link, not as an embedded note.
- `![[image.png|alt text]]` embeds an image from `_assets/` next to the file. Copy images there by hand from the vault. A size such as `|400` is ignored. The build fails when the alt text is missing or the file is not in `_assets/`, and on any embed other than an image or a note.
- `%%comments%%` are removed. Code blocks and inline code are left as written.
- The Obsidian-only properties `aliases`, `alias`, `cssclasses`, `cssclass`, `publish`, `permalink`, `created` and `modified` are accepted and dropped. Any other unknown property still fails the build. `tags: rust`, `#rust` and an empty `tags:` are accepted; tags must still be lowercase.

### Templates in Obsidian

The files in `templates/` explain every key in YAML comments. Obsidian's Properties editor removes YAML comments, so a template for the Templater plugin works better without them:

- Write only the required keys and the ones you fill in: `title`, `description`, `pubDatetime` and `draft` for a post; `title` and `draft` for a note; `title`, `description`, `status` and `draft` for a project.
- Leave an optional key out rather than empty. An empty `description:` or `githubUrl:` is `null`, and the strict schema rejects it.
- Write `pubDatetime` with an offset: `<% tp.date.now("YYYY-MM-DDTHH:mm:ssZ") %>`.
- Keep `draft: true` in the template and switch it to `false` when the entry is ready.
- A list of the remaining optional keys fits in a `%%comment%%` in the body of a post or note; the build removes it. A project must have no body at all, not even a comment.

A post template that asks for the title, description and tags:

```text
<%*
const ask = async q => ((await tp.system.prompt(q)) ?? "").trim();
const title = (await ask("Title")) || tp.file.title;
const description = await ask("Description");
const tags = (await ask("Tags")).split(/[\s,]+/).filter(Boolean);
-%>
---
title: <% JSON.stringify(title) %>
description: <% JSON.stringify(description) %>
pubDatetime: <% tp.date.now("YYYY-MM-DDTHH:mm:ssZ") %>
tags: [<% tags.join(", ") %>]
draft: true
---

%% optional keys: modDatetime, hideToc, hideEditPost, ogImage, timezone, canonicalUrl, syndication, author %%
```

For a project, ask for the status with `tp.system.suggester(["active", "maintained", "archived"], ["active", "maintained", "archived"])`. Copy the finished file to the right folder in the repository: a post into `src/content/blog/<year>/`, where the year matches `pubDatetime`.

`./dev.sh ci` checks the formatting of `src/content/` with Prettier. If Obsidian's formatting gets in the way, add `/src/content/` to `.prettierignore`.
