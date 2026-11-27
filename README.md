# starglow

A minimal, developer-flavoured Astro theme for blogs, notes and projects.
Dark first, its own colour palettes, a little 2000s glow.

<picture>
  <source media="(prefers-color-scheme: light)" srcset=".github/assets/home-light.png">
  <img alt="Home page of the demo site in the dark starglow palette: a pink pixel wordmark under a softly glowing header band, a short intro, a row of specialties in monospace, a list of posts and notes with their dates, and the preview tab in the bottom left corner" src=".github/assets/home-dark.png">
</picture>

**[Live demo](https://glowing-space.github.io/starglow/)** · [Releases](https://github.com/glowing-space/starglow/releases)

## Features

- Posts, notes and projects, with tags and related content
- Banded header with an optional ambient glow and a pixel wordmark
- Labelled code, table and callout blocks; GitHub alerts; MDX; optional Obsidian syntax
- Vim-style statusline with h/j/k/l, 88x31 footer badges, a terminal-style 404
- Pagefind search, RSS, sitemap, generated Open Graph images, JSON-LD
- 4 dark and 5 light palettes, or your own, checked for WCAG AA; a live preview panel for demos
- Almost no client JavaScript; a static `dist/` for any host
- One typed, validated config file: a typo fails the build and names the key you meant

## Screenshots

| Dark                                                                                                                                                                                                       | Light                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| ![A post in the dark starglow palette: the five callouts (note, tip, important, warning, caution), each with a tinted background and border, above the vim-style statusline](.github/assets/post-dark.png) | ![The same part of the post in the light sand palette](.github/assets/post-light.png) |

![The same post section, with its five tinted callouts and the statusline, in all nine palettes, three by three: dark starglow, void, aurora and ember, then light starglow, paper, petal, frost and sand](.github/assets/palettes.png)

![The bottom of the home page in the dark starglow palette: the writing list, the Projects section with two projects and their status, then the footer with the copyright line, the "powered by starglow" credit, a contact link, three 88x31 badges (rss, astro, no cookies) and an impressum link](.github/assets/footer.png)

![The preview panel open on the home page in the dark aurora palette, with selects for the dark and light palette and the ambient light, checkboxes for wordmark glow and statusline, and a reset button](.github/assets/preview-open.png)

## Get started

```bash
git clone https://github.com/glowing-space/starglow.git my-site
cd my-site
git remote rename origin starglow   # keeps upgrades a merge, see UPGRADING.md
pnpm install
pnpm dev                            # http://localhost:4321/
```

Edit `starglow.config.ts` (hover a key for its docs), set `SITE_URL` to your origin, replace the demo content in `src/content/` and push: the GitHub Pages workflow deploys `dist/`.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md)
first; security issues go through [SECURITY.md](SECURITY.md).

## Credits

<img alt="glowing.space" src=".github/assets/glowing-space.png" width="228">

Made by [Andrii Filiurskyi](https://github.com/filiurskyi), a
[glowing.space](https://glowing.space) project.

Originally inspired by [AstroPaper](https://github.com/satnaing/astro-paper).
Thanks, Sat Naing. Fonts: Inter, JetBrains Mono and Pixelify Sans (SIL OFL). See [NOTICE](NOTICE).

## Licence

[MIT](LICENSE). Keeping the "powered by starglow" footer credit is
appreciated, not required.
