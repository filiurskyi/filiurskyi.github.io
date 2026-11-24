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

Commands, authoring rules and configuration are documented in the starglow docs: [development](https://starglow.glowing.space/blog/2026/development/), [content model](https://starglow.glowing.space/blog/2026/content-model/), [configuration](https://starglow.glowing.space/blog/2026/configuration/).

## External setup checklist

None of this is done by the repository. Do it by hand in the GitHub settings of `filiurskyi/filiurskyi.github.io` before the first push to `main`.

- [ ] Settings → Pages → Build and deployment → Source: **GitHub Actions**. Do this before the first push to `main`, otherwise the deploy fails at its Pages configuration step.
- [ ] Settings → Environments → `github-pages`: limit deployment branches to `main`, so only the default branch can deploy.
- [ ] Settings → Actions → General: set workflow permissions to "Read repository contents". Optionally also require actions to be pinned to a full-length commit SHA: every action here already is.
- [ ] Turn on Dependabot alerts and Dependabot security updates (under Settings → Advanced Security). `.github/dependabot.yml` only configures version updates.
- [ ] Optional: a ruleset on `main` that requires a pull request and the passing status check `Format, lint, check, build, links, dist assertions` (the `checks` job in `.github/workflows/checks.yml`).
- [ ] Fill every `[[TODO: …]]` marker (`./dev.sh pnpm markers` lists them). The first deploy fails until they are gone, by design.
- [ ] Optional, Search Console: add the repository variable `PUBLIC_GOOGLE_SITE_VERIFICATION` with the verification value (Settings → Secrets and variables → Actions → Variables). It is a public meta value, so a variable, not a secret. The deploy build forwards it.
- [ ] Route-name reservation: a repository owned by the account is served under the same host, so never create one named after a top-level path of this site: `404.html`, `_astro`, `about`, `blog`, `contact`, `favicon.svg`, `lab`, `notes`, `og.png`, `pagefind`, `projects`, `robots.txt`, `rss.xml`, `search`, `sitemap-0.xml`, `sitemap-index.xml`, `tags`. `pagefind` and `_astro` hold build output, the rest are routes and files. Regenerate the list with `ls dist` after `./dev.sh build` when sections are added.
- [ ] Publishing: Andrii squashes `gsd/M001-website` into `main` and pushes. Nothing publishes automatically before that.

Later:

- Giscus comments (needs GitHub Discussions and the Giscus app)
- Cloudflare Web Analytics (needs its token)
- Impressum and Datenschutz pages, before commercial use or before enabling either of the two above

## Fork notes

[FORK-NOTES.md](FORK-NOTES.md) records the upstream commit this site was forked from, every file that differs from it with the reason, the pinned tools, the provenance of vendored assets and the cautions for upgrading from upstream.

## License

Code is MIT-licensed (see [LICENSE](LICENSE)). Written content and images (`src/content/`, post assets) © Andrii Filiurskyi. All rights reserved.
