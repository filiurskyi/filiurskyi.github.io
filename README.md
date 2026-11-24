# Andrii Filiurskyi — Engineering Hub

Personal engineering site: a portfolio, a technical blog, short notes, a lab of experiments and open-source projects, on Embedded Linux, Yocto, Linux systems, Rust, Python and hardware. A static Astro build on the [starglow](https://github.com/glowing-space/starglow) theme; `dist/` is plain static files any host can serve.

## Quickstart

Docker with the Compose plugin is the only requirement on the host.

```sh
./dev.sh              # dev server at http://localhost:4321/, drafts visible
./dev.sh new post <slug>
./dev.sh build        # production build into dist/
./dev.sh ci           # the same checks GitHub runs; run before pushing
```

Commands, authoring rules and configuration are in the starglow docs, copied into [docs/](docs/): [development](docs/07-development.md), [content model](docs/03-content-model.md), [writing](docs/04-writing.md), [configuration](docs/02-configuration.md). Site settings live in `starglow.config.ts`; the glowing palette in `src/custom/palettes.ts`.

## Writing in Obsidian

`features.obsidian` is on: posts and notes can be copied from the vault unchanged (wikilinks, `![[image.png|alt]]` embeds, `%%comments%%`, Obsidian properties). See [docs/04-writing.md](docs/04-writing.md#writing-in-obsidian). Copy images by hand from the vault's `_storage/` into `_assets/` next to the post. `src/content/` is not format-checked.

## Before the first push

None of this is done by the repository. Do it by hand in the GitHub settings of `filiurskyi/filiurskyi.github.io`.

- [ ] Settings → Pages → Build and deployment → Source: **GitHub Actions**, otherwise the deploy fails at its Pages configuration step.
- [ ] Settings → Environments → `github-pages`: limit deployment branches to `main`.
- [ ] Settings → Actions → General: workflow permissions "Read repository contents". Optionally require actions pinned to a full commit SHA: every action here already is.
- [ ] Settings → Advanced Security: turn on Dependabot alerts and security updates (`.github/dependabot.yml` only configures version updates).
- [ ] Optional: a ruleset on `main` that requires the status check `Format, lint, check, build, links, dist assertions` (`.github/workflows/checks.yml`).
- [ ] After the first deploy, press Verify in Search Console (the verification value and the Cloudflare Web Analytics token are in `starglow.config.ts`).

Publishing rules:

- Pushing `main` deploys. Agents only commit locally; Andrii reviews and pushes.
- A deploy fails while any `[[TODO: …]]` marker remains (`./dev.sh pnpm markers` lists them).
- Never create a repository named after a top-level path of this site (it would be served under the same host): `404.html`, `_astro`, `about`, `blog`, `contact`, `favicon.svg`, `impressum`, `lab`, `notes`, `og.png`, `pagefind`, `privacy`, `projects`, `robots.txt`, `rss.xml`, `search`, `sitemap-0.xml`, `sitemap-index.xml`, `tags`. Regenerate the list with `ls dist` after `./dev.sh build`.

Later: Giscus comments (needs GitHub Discussions and the Giscus app).

## Theme updates

The site is based on starglow through a git remote. To take theme updates:

```sh
git fetch starglow
git merge starglow/main
```

Keep personal changes in `starglow.config.ts`, `src/custom/` and `src/content/`, so merges stay clean. Provenance of the theme and its AstroPaper origin is in [NOTICE](NOTICE).

## License

Code is MIT-licensed (see [LICENSE](LICENSE)). Written content and its images (`src/content/`) are CC BY 4.0 (see [LICENSE-CONTENT.md](LICENSE-CONTENT.md)). The glowing colour palette and the glowing.space name and logos are all rights reserved.
