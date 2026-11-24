# Customising starglow

Most changes need no theme code at all: the config file covers the switches, and three slot files cover your own markup. This guide covers what to edit when you want more.

## Where to change what

| I want to change…                                 | Edit                                                                                       |
| :------------------------------------------------ | :----------------------------------------------------------------------------------------- |
| Site title, description, author                   | `site` in `starglow.config.ts`                                                             |
| Header wordmark text                              | `site.wordmark` in `starglow.config.ts`                                                    |
| The HTML comment at the top of every page         | `site.sourceBanner` in `starglow.config.ts`                                                |
| The site URL or a project-site subpath            | `SITE_URL` and `BASE_PATH` in the environment, see [Configuration](./02-configuration.md)  |
| Colours                                           | `appearance.palette` and `appearance.palettes`; built-in palettes are in `src/palettes.ts` |
| First-visit mode, header glow, statusline         | `appearance` in `starglow.config.ts`                                                       |
| Fonts, including the wordmark face                | `fonts` in `astro.config.ts` and the files in `src/assets/fonts/`, see [Fonts](#fonts)     |
| Type sizes and spacing                            | The `--t-*` and `--s*` tokens in `src/styles/site-theme.css`                               |
| Prose styles: headings, lists, code in posts      | `src/styles/typography.css`                                                                |
| Interface strings, or the language                | `src/i18n/lang/<lang>.ts` and `site.lang`, see [Language](#language)                       |
| Homepage intro and specialties                    | `src/content/pages/home.md`                                                                |
| The about, contact or another standalone page     | `src/content/pages/<name>.md`, see [Content model](./03-content-model.md#pages)            |
| Entries per page, featured projects on the home   | `posts.perPage` and `posts.perIndex` in `starglow.config.ts`                               |
| Footer badges and `rel="me"` profiles             | `links` in `starglow.config.ts`; badge icons are in `src/utils/badges.ts`                  |
| Footer text links (Impressum, privacy, …)         | `footer.links` in `starglow.config.ts`                                                     |
| The footer credit                                 | `footer.credit: false` in `starglow.config.ts`                                             |
| Extra `<head>` tags                               | `src/custom/Head.astro`                                                                    |
| Analytics                                         | `analytics.cloudflareToken`, or another script in `src/custom/Head.astro`                  |
| Scripts or widgets at the end of every page       | `src/custom/BodyEnd.astro`                                                                 |
| Comments, a newsletter or a bio under posts       | `src/custom/PostEnd.astro`                                                                 |
| The favicon                                       | `public/favicon.svg`                                                                       |
| The default social image                          | `site.ogImage` and a file in `public/`, or `features.dynamicOgImage`                       |
| The layout of generated social images             | `src/utils/og/renderOg.ts`                                                                 |
| Search, table of contents, back link, edit link   | `features` in `starglow.config.ts`                                                         |
| Frontmatter fields and their rules                | `src/content.config.ts`                                                                    |
| What `./dev.sh new` writes                        | `templates/post.md`, `templates/note.md`, `templates/project.md`                           |
| Markdown and MDX plugins                          | `markdown.processor` in `astro.config.ts`                                                  |
| Remove search, social images or the example posts | [Removing features](./06-removing-features.md)                                             |

Header navigation needs no edit: Blog, Notes and Projects appear once their section has published content, next to About.

## Slot files

`src/custom/` holds three components that the theme renders but never changes after a release. Put your own markup there, and theme updates will not conflict with it.

| File                       | Rendered                                          | Typical use                                |
| :------------------------- | :------------------------------------------------ | :----------------------------------------- |
| `src/custom/Head.astro`    | In `<head>` on every page, after the theme's tags | Analytics, verification tags, stylesheets  |
| `src/custom/BodyEnd.astro` | Right before `</body>` on every page              | Scripts and widgets                        |
| `src/custom/PostEnd.astro` | On post pages, before the previous and next links | Comments, a newsletter form, an author bio |

`Head.astro` receives the page `title` and `description` (empty on pages without one, such as listings), and `PostEnd.astro` receives the `post` entry, so you can skip some posts:

```astro
---
import type { CollectionEntry } from "astro:content";
type Props = { post: CollectionEntry<"posts"> };
const { post } = Astro.props;
---

{!post.data.tags.includes("no-comments") && <section>Comments go here</section>}
```

## Extra pages

Pages such as an Impressum or a privacy policy need no theme code: add `impressum.md` or `privacy.md` to `src/content/pages/` (see [Content model](./03-content-model.md#pages)) and link them from the footer with `footer.links` in `starglow.config.ts`.

## Colours

Colours come in palettes, and dark and light palettes are chosen separately in `starglow.config.ts`:

```ts
appearance: {
  palette: { dark: "aurora", light: "paper" },
},
```

Built in are four dark palettes, `starglow` (the default), `void`, `aurora` and `ember`, and five light ones, `starglow`, `paper`, `petal`, `frost` and `sand`. The demo's preview panel, bottom left, switches between them live.

To use your own colours, add a palette under `appearance.palettes` and select it. A palette is 18 colours; everything else (code highlighting, callouts, status colours, badges, social images) is derived from them:

```ts
appearance: {
  palette: { dark: "midnight", light: "paper" },
  palettes: {
    dark: {
      midnight: {
        label: "Midnight",
        bg: "#0f1117", mantle: "#0b0d12", crust: "#08090d",
        muted: "#1a1d26", border: "#2a2f3c",
        fg: "#dde3ee", mutedFg: "#9aa3b5",
        accent: "#7cc4ff", accentFg: "#0f1117", comment: "#8089a0",
        red: "#ff8080", orange: "#ffb070", yellow: "#f0d070",
        green: "#80d890", cyan: "#70d0e0", blue: "#80a8ff",
        purple: "#c0a0ff", glow: "#7cc4ff",
      },
    },
  },
},
```

The fields are documented in `src/palettes.ts`, next to the built-in palettes. A palette name may use letters, digits, `_` and `-`, and every colour must be an opaque hex value (`#rgb` or `#rrggbb`); anything else fails the build. `pnpm verify` checks that every shipped palette meets WCAG AA: each text colour on each surface, and the accent foreground on the accent.

## Type and spacing

The theme uses a short type scale, 10, 12, 13, 14, 15, 17, 18, 20, 24, 28 and 32 px, and two weights, 400 and 600. Each use has a `--t-*` token at the top of `site-theme.css`, for example `--t-body` for reading text, `--t-meta` for dates and paths, `--t-action` for small text links and buttons such as the back link and `--t-credit` for the footer credit. Use a token rather than a raw size.

`pnpm verify` rejects any other size or weight in `src/`: in stylesheets, in Astro `<style>` blocks and in Tailwind classes such as `text-[19px]`. That check is deliberate: it keeps a customised site from slowly collecting one-off sizes. Add a size to the scale (`SCALE_SIZES` in `scripts/verify-dist.ts`) and to `site-theme.css` together if you need one.

## Fonts

Three self-hosted fonts are loaded through the Astro fonts API in `astro.config.ts`:

- **Inter** for reading text.
- **JetBrains Mono** for code and data such as dates and paths.
- **Pixelify Sans** for the header wordmark, the footer credit and the badge text.

The font files and their SIL Open Font License texts are in `src/assets/fonts/`. To swap a font, replace the files and the matching entry in the `fonts` list. The CSS reads them through `--font-inter`, `--font-jetbrains-mono` and `--font-wordmark`.

The Inter files are a Latin subset of the static Inter 4.1 release (`Inter-4.1.zip` from github.com/rsms/inter, `extras/ttf`), with the `cv05` (lowercase l with a tail) and `cv08` (capital I with serifs) alternates made the default glyphs, so `Il1` stays distinguishable. The alternates are in the files rather than in `font-feature-settings` because every `font: var(--t-*)` shorthand resets that property; this way they apply wherever Inter is used and nowhere else. The subset keeps the same characters as before and the `calt`, `ccmp`, `locl`, `frac`, `numr`, `dnom`, `pnum`, `tnum`, `kern` and `mark` features. To rebuild them, remap the cmap entries of `cv05` and `cv08` to their target glyphs with fontTools, then run `pyftsubset` with `--no-hinting` and `--flavor=woff2` (and `woff` for the 400 and 600 uprights, which the OG images use).

## Language

The interface strings (navigation, labels, screen-reader text) live in `src/i18n/lang/<lang>.ts`; starglow ships `en.ts`. To translate them, copy `en.ts` to, say, `de.ts`, translate the values and set `site.lang: "de"`. `site.lang` sets the `lang` attribute, Astro's i18n locale (a single locale, with no prefix in URLs) and the labels added at build time. The build fails if the matching file is missing, and `astro check` fails if a key is missing from it.

The search page strings `search.noscript` and `search.noResults` hold one `{{sections}}` token. It becomes links to the sections that have published content, joined as a list in the style of `site.lang` (`Intl.ListFormat`), so a site without notes never links to an empty notes page.

In your own components, get the strings for the current page like this:

```astro
---
import { useLocale, useTranslations } from "@/i18n";
const t = useTranslations(useLocale(Astro));
---
```

## Checking your changes

Run the full check set before you publish:

```bash
./dev.sh ci
```

It runs the formatter check, the linter, the unit tests, `astro check`, the build, an offline link check, `pnpm verify` on the built site and the placeholder check. `pnpm verify` covers things like canonical links, heading order, the search index, structured data and the type scale.
