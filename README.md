# starglow

A minimal, developer-flavoured Astro theme for blogs, notes and projects.
Dark first, its own colour palettes, a little 2000s glow.

<picture>
  <source media="(prefers-color-scheme: light)" srcset=".github/assets/home-light.png">
  <img alt="Home page of the demo site in the dark starglow palette: a pink pixel wordmark under a softly glowing header band, a short intro, a row of specialties in monospace, a list of posts and notes with their dates, and the preview tab in the bottom left corner" src=".github/assets/home-dark.png">
</picture>

**[Live demo](https://glowing-space.github.io/starglow/)** · [Docs](docs/README.md) · [Releases](https://github.com/glowing-space/starglow/releases)

## Features

- Posts, short notes and projects, with tags and related content
- Banded page header with an optional ambient glow and a pixel wordmark
- Labelled code, table and callout blocks; GitHub alert callouts; MDX
- Optional Obsidian-flavoured Markdown: wikilinks, image embeds, comments
- Vim-style statusline on posts and notes with h/j/k/l keys (off on touch screens and phones), 88x31 footer badges that list each link once, a terminal-style 404 page
- Pagefind search, RSS, sitemap, generated Open Graph images, JSON-LD
- 4 dark and 5 light palettes, chosen separately; your own in a few lines; WCAG AA checked at build
- A live preview panel for demos: palette, ambient light, glow, statusline
- Almost no client JavaScript; plain static `dist/` for any host
- One typed config file, `starglow.config.ts`, checked on every build: a typo fails and names the key you meant
- Unit tests, and checks over every build: routes, canonical URLs, search index and links

## Screenshots

| Dark                                                                                                                                                                                                       | Light                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| ![A post in the dark starglow palette: the five callouts (note, tip, important, warning, caution), each with a tinted background and border, above the vim-style statusline](.github/assets/post-dark.png) | ![The same part of the post in the light sand palette](.github/assets/post-light.png) |

![The same post section, with its five tinted callouts and the statusline, in all nine palettes, three by three: dark starglow, void, aurora and ember, then light starglow, paper, petal, frost and sand](.github/assets/palettes.png)

![The bottom of the home page in the dark starglow palette: the writing list, the Projects section with two projects and their status, then the footer with the copyright line, the "powered by starglow" credit, a contact link, three 88x31 badges (rss, astro, no cookies) and an impressum link](.github/assets/footer.png)

![The preview panel open on the home page in the dark aurora palette, with selects for the dark and light palette and the ambient light, checkboxes for wordmark glow and statusline, and a reset button](.github/assets/preview-open.png)

## Get started

Start with [Install](docs/01-getting-started.md). The [docs](docs/README.md) go on
from there: configure, write, customise, deploy, develop and
[upgrade](UPGRADING.md).

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md)
first; security issues go through [SECURITY.md](SECURITY.md).

## Credits

<img alt="glowing.space" src=".github/assets/glowing-space.png" width="228">

Made by [Andrii Filiurskyi](https://github.com/filiurskyi), a
[glowing.space](https://glowing.space) project.

Originally based on [AstroPaper](https://github.com/satnaing/astro-paper) by
Sat Naing. Fonts: Inter, JetBrains Mono and Pixelify Sans (SIL OFL). See [NOTICE](NOTICE).

## Licence

[MIT](LICENSE). Keeping the "powered by starglow" footer credit is
appreciated, not required.
