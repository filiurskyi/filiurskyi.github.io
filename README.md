# personal blog

Personal site: a portfolio, a technical blog, short notes and projects. A static Astro build on the [starglow](https://github.com/glowing-space/starglow) theme; `dist/` is plain static files anyone can reuse.

## Quickstart

Docker with the Compose plugin is the only requirement on the host.

```sh
./dev.sh              # dev server at http://localhost:4321/, drafts visible
./dev.sh new post <slug>
./dev.sh build        # production build into dist/
./dev.sh ci           # the same checks GitHub runs; run before pushing
```

## Theme updates

```sh
git remote add starglow https://github.com/glowing-space/starglow.git   # once per clone
git fetch starglow
git merge starglow/main
```

Keep personal changes in `starglow.config.ts`, `src/custom/` and `src/content/`, so merges stay clean. Exception: image badges (the Cookie Zero badge) patch `Badge88.astro`, `Footer.astro`, `src/types/config.ts` and `site-theme.css`; expect conflicts there. Provenance of the theme and its AstroPaper origin is in [NOTICE](NOTICE).

## License

Code: MIT ([LICENSE](LICENSE)). Content in `src/content/`: CC BY 4.0, with the exceptions listed in [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
