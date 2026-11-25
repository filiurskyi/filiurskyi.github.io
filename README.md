# personal blog

Personal engineering site: a portfolio, a technical blog, short notes and open-source projects, on Embedded Linux, Yocto, Linux systems, Rust, Python and hardware. A static Astro build on the [starglow](https://github.com/glowing-space/starglow) theme; `dist/` is plain static files any host can serve.

## Quickstart

Docker with the Compose plugin is the only requirement on the host.

```sh
./dev.sh              # dev server at http://localhost:4321/, drafts visible
./dev.sh new post <slug>
./dev.sh build        # production build into dist/
./dev.sh ci           # the same checks GitHub runs; run before pushing
```

## Theme updates

The site is based on starglow through a git remote. To take theme updates:

```sh
git fetch starglow
git merge starglow/main
```

Keep personal changes in `starglow.config.ts`, `src/custom/` and `src/content/`, so merges stay clean. Provenance of the theme and its AstroPaper origin is in [NOTICE](NOTICE).

## License

Code is MIT-licensed (see [LICENSE](LICENSE)). Written content and its images (`src/content/`) are CC BY 4.0 (see [LICENSE-CONTENT.md](LICENSE-CONTENT.md)). The glowing colour palette and the glowing.space name and logos are all rights reserved.
