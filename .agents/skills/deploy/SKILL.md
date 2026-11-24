---
name: deploy
description: Check and publish a starglow site. Use when asked to deploy, publish or release the site.
---

# Deploy

Publishing is a push to `main`: `.github/workflows/deploy.yml` builds and deploys to GitHub Pages. Agents never push or merge to `main`; prepare the commit and hand over to the human.

1. `MARKERS_STRICT=true ./dev.sh ci` must pass. It runs the deploy's checks: format, lint, unit tests, `astro check`, build, links, `pnpm verify` and the strict placeholder check, which fails while any `[[TODO: …]]` marker remains.
2. Check that the drafts meant to go live have `draft: false`. Drafts never reach a production build.
3. The origin comes from the `SITE_URL` repository variable (`BASE_PATH` for a project site), never from a file. Unset, the default in `astro.config.ts` is used.
4. First deploy only: the GitHub settings in `docs/08-deploying.md` (Pages source "GitHub Actions", the `github-pages` environment limited to `main`, the variables). They are manual; list them for the user, do not change settings yourself.
5. Commit locally (see AGENTS.md) and tell the user the site is ready to push. Other static hosts: build command `pnpm build`, output directory `dist`.
