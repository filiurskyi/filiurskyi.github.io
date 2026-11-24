# Develop

The commands, checks and CI behind a starglow site.

## Docker

`./dev.sh` runs the container as your host user and keeps `node_modules/` in the repository directory, so no files end up owned by root.

| Command                          | What it does                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `./dev.sh`                       | Same as `./dev.sh dev`: dev server on port 4321, drafts are visible                                     |
| `./dev.sh build`                 | Installs from the lockfile, runs `astro check`, builds `dist/` and ends with the marker check           |
| `./dev.sh check`                 | Installs from the lockfile and runs `astro check` only                                                  |
| `./dev.sh test`                  | Installs from the lockfile and runs the unit tests in `tests/` (Vitest)                                 |
| `./dev.sh preview`               | Serves the existing `dist/` on port 4321 (run `./dev.sh build` first)                                   |
| `./dev.sh ci`                    | The pull-request check set: format, lint, unit tests, `astro check`, build, links, dist, markers        |
| `./dev.sh links`                 | Offline link and anchor check over an existing `dist/` (lychee)                                         |
| `./dev.sh workflows`             | Audits `.github/` with actionlint and zizmor                                                            |
| `./dev.sh new <type> <slug>`     | Scaffolds a draft post, note or project, see [Creating content](./03-content-model.md#creating-content) |
| `./dev.sh pnpm verify`           | Runs the assertions over an existing `dist/` (`pnpm verify`)                                            |
| `./dev.sh pnpm markers`          | Lists unfilled `[[TODO: …]]` markers (`pnpm markers`)                                                   |
| `./dev.sh pnpm markers --strict` | The same list, failing while any marker remains (what the deploy runs; needs a built `dist/`)           |
| `./dev.sh shell`                 | Opens a bash shell in the dev container                                                                 |
| `./dev.sh pnpm <...>`            | Runs any pnpm command in the container, for example `./dev.sh pnpm add <package>`                       |

`./dev.sh new` is the only command that runs on the host without Docker. It needs GNU `date` (GNU coreutils: standard on Linux, `brew install coreutils` and its `gnubin` first in `PATH` on macOS) and the system time zone database (`tzdata`).

### Testing on a phone over the LAN

The dev server listens on all interfaces. Open `http://<your-computer-ip>:4321/` on the phone, using the IP address of the computer (for example from `ip addr`). Host names other than `localhost` are rejected by the Vite host check, so use the IP address.

Do not run the dev server on an untrusted network, such as public Wi-Fi: it binds to `0.0.0.0` and everyone on the network can reach it, drafts included.

## Without Docker

Install an official Node.js 22 build of version 22.23.4 or newer (from nodejs.org or through fnm, nvm or mise) and enable corepack. A distribution package that is older than 22.23.4 fails Astro's engine check and cannot run the TypeScript scripts in `scripts/`. The version used by the Docker image is in `.node-version`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm run test         # unit tests (Vitest)
pnpm exec astro check
pnpm run build:site   # astro build, draft-asset prune, Pagefind index
pnpm run verify       # assertions over dist/
pnpm run markers      # list unfilled [[TODO: …]] markers
pnpm build            # astro check + build:site + markers, the full local build
```

corepack provides the pnpm version pinned in `packageManager` in `package.json`. Locally, lychee, actionlint and zizmor run only as pinned containers, through `./dev.sh links` and `./dev.sh workflows`; in CI lychee comes from the SHA-pinned lychee-action.

If you switch between the Docker and the native install, remove `node_modules` first (`rm -rf node_modules`), because native packages are installed per platform and per Node version.

If you never use Docker, you can delete `Dockerfile`, `compose.yaml`, `.dockerignore` and `dev.sh`. You lose `./dev.sh new` and the local link and workflow checks; `pnpm verify` and `pnpm markers` need only Node.

## Content cache

Astro caches parsed and rendered content in `node_modules/.astro/data-store.json` and clears it when the Astro config changes, but it cannot see inside Markdown plugins or schema helpers. starglow adds a hash of the files that shape content (`astro.config.ts`, `starglow.config.ts`, `package.json`, `pnpm-lock.yaml`, `src/config.ts`, `src/i18n/`, `src/types/` and `src/utils/`) to the config, so a change to any of them, an upgrade included, rebuilds every entry on the next build or dev start (the log says "Astro config changed"). Edits to those files while the dev server runs apply after a restart.

## Checks and CI

`.github/workflows/checks.yml` runs on pull requests to `main` and on pushes to every other branch (except Dependabot's). It calls one shared action, `.github/actions/site-checks`, which runs in this order:

1. Install from the lockfile
2. Prettier format check
3. ESLint
4. Unit tests (`pnpm run test`)
5. `astro check`
6. Build (`pnpm run build:site`)
7. Offline link and anchor check over `dist/` (lychee)
8. `pnpm verify`: assertions over `dist/` (routes, canonical URLs, no drafts or demo content, search index, structured data), ending with `verify-dist: all {n} checks passed.`
9. The marker check, which only warns

`.github/workflows/deploy.yml` runs the same set with the strict marker check before it publishes, see [Deploy](./06-deploying.md).

`./dev.sh ci` runs the same steps locally, in the same order. `./dev.sh pnpm markers --strict` reproduces the deploy's marker gate, and `./dev.sh workflows` audits the workflow files.

## Unit tests

`tests/*.test.ts` covers the pure helpers in `src/utils/` (slugs, reading time, the table of contents, the publish filter, timezones and calendar dates, tag slug collisions), the frontmatter title and tag rules in `src/utils/content/fields.ts` and the config schema in `src/types/config.ts`, palettes included. `vitest.config.ts` uses Astro's `getViteConfig`, so `@/` imports and `astro:*` modules resolve as in the site. Run them with `./dev.sh test` or `pnpm test`; `pnpm exec vitest` watches.

## Maintenance

Dependabot proposes updates weekly for npm and for GitHub Actions, in grouped pull requests with a seven-day cooldown. TypeScript major versions are ignored, because `astro check` does not support TypeScript 7 yet.

The container image digests are not covered by Dependabot: the `node:22-slim` digest in the `Dockerfile` and the lychee, actionlint and zizmor digests in `dev.sh`. To refresh one:

```sh
docker pull node:22-slim
docker inspect --format '{{index .RepoDigests 0}}' node:22-slim
```

Replace the old `tag@sha256:…` reference with the printed one. Keep the lychee image at the same version as the lychee that CI installs: `LYCHEE_IMAGE` in `dev.sh` and `lycheeVersion` in `.github/actions/site-checks/action.yml` must name the same version (`0.24.2` and `v0.24.2` today). A lychee-action bump does not change the CI version, because it is passed explicitly.

## AI coding agents

`AGENTS.md` tells coding agents how the theme is laid out, which checks must pass and how to commit. `.agents/skills/` holds three short recipes: `add-post`, `add-project` and `deploy`. Both are theme files; delete them if you do not use agents.
