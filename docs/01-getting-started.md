# Install

This guide takes you from an empty folder to starglow running on your machine.

## Requirements

- Node.js 22.23.4 or later. The version used in CI is in `.node-version`.
- pnpm. The version is pinned in the `packageManager` field of `package.json`; `corepack enable` provides it.
- Git. Note dates come from git history, so the site must live in a repository.

Instead of Node and pnpm, you can use Docker with the compose plugin: `./dev.sh` runs every command in a container. See [Develop](./07-development.md).

## Create the site

Clone starglow and keep it as a remote named `starglow`, so you can merge theme updates later:

```bash
git clone https://github.com/glowing-space/starglow.git my-site
cd my-site
git remote rename origin starglow
```

`npm create astro@latest -- --template glowing-space/starglow` and GitHub's "Use this template" button also work. They copy the files without starglow's history, so your first upgrade starts with a large merge.

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:4321/
```

With Docker, `./dev.sh dev` starts the same dev server.

The dev server shows drafts with a Draft badge. Drafts never reach a production build.

## Make it yours

1. Set your details in `starglow.config.ts`. See [Configure](./02-configuration.md).
2. Set `SITE_URL` to your origin before you publish. See [Environment variables](./02-configuration.md#environment-variables).
3. Replace the demo content with your own. See [Replace the demo content](./03-content-model.md#replace-the-demo-content).
4. Publish. See [Deploy](./06-deploying.md).
