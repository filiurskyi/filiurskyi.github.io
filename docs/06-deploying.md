# Deploy

`pnpm build` writes the site to `dist/` as plain static files. Any static host works.

## GitHub Pages

The included `.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on every push to `main`.

1. Create an empty repository named `<username>.github.io`.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**. Without it, the first deploy fails at its Pages configuration step.
3. Settings → Secrets and variables → Actions → Variables: add `SITE_URL` with `https://<username>.github.io`. For a repository with another name, served at `https://<username>.github.io/<repo>/`, also add `BASE_PATH` with `/<repo>`.
4. Work through [Before the first push](#before-the-first-push), then push:

   ```sh
   git remote add origin https://github.com/<username>/<username>.github.io.git
   git push -u origin main
   ```

The deploy runs the same checks as pull requests (see [Checks and CI](./07-development.md#checks-and-ci)), with the placeholder check in strict mode, so it fails while any `[[TODO: …]]` marker is left. Only then it uploads `dist/`. A manual run from another branch publishes nothing.

## Before the first push

The repository cannot do these for you. Set them by hand in GitHub.

- [ ] Settings → Environments → `github-pages`: limit deployment branches to `main`, so only the default branch can deploy.
- [ ] Settings → Actions → General: set workflow permissions to "Read repository contents". Optionally also require actions to be pinned to a full-length commit SHA: every action here already is.
- [ ] Turn on Dependabot alerts and Dependabot security updates (under Settings → Advanced Security). `.github/dependabot.yml` only configures version updates.
- [ ] Optional: a ruleset on `main` that requires a pull request and the passing status check `Format, lint, check, build, links, dist assertions` (the `checks` job in `.github/workflows/checks.yml`).
- [ ] Fill every `[[TODO: …]]` marker (`./dev.sh pnpm markers` lists them).
- [ ] Settings → Security: turn on private vulnerability reporting, which `SECURITY.md` links to.
- [ ] Optional, Search Console: add the repository variable `PUBLIC_GOOGLE_SITE_VERIFICATION` with the verification value (Settings → Secrets and variables → Actions → Variables). It is a public meta value, so a variable, not a secret. The deploy build forwards it.
- [ ] Optional, Cloudflare Web Analytics (cookieless visitor counts): add the site in the Cloudflare dashboard (Analytics & Logs → Web Analytics → Add a site, without DNS changes) and put its token into the repository variable `PUBLIC_CF_WEB_ANALYTICS_TOKEN`, or into `analytics.cloudflareToken` in `starglow.config.ts`. `deploy.yml` forwards the variable, and `compose.yaml` passes it from the host shell into the container (key only, so an unset variable stays unset). Unset means no script.
- [ ] Route-name reservation: a repository owned by the account is served under the same host, so never create one named after a top-level path of this site: `404.html`, `_astro`, `about`, `blog`, `contact`, `favicon.svg`, `impressum`, `notes`, `og.png`, `pagefind`, `privacy`, `projects`, `robots.txt`, `rss.xml`, `search`, `sitemap-0.xml`, `sitemap-index.xml`, `tags`. `pagefind` and `_astro` hold build output, the rest are routes and files; `impressum` and `privacy` are the demo's standalone pages. Regenerate the list with `ls dist` after `./dev.sh build` when you add sections or pages.

## Other hosts

Cloudflare Pages, Netlify and others: build command `pnpm build`, output directory `dist`, and `SITE_URL` set to your origin in the host's environment. The not-found page is `dist/404.html`; GitHub Pages, Cloudflare Pages and Netlify serve it for unknown paths.
