# Upgrading starglow

Your site is a copy of starglow; each release is merged into it. Keep your
changes in the files below and an upgrade stays a small diff.

## Files that are yours

| File                       | Use it for                                         |
| -------------------------- | -------------------------------------------------- |
| `starglow.config.ts`       | All site settings                                  |
| `src/content/**`           | Your posts, notes, projects and pages              |
| `src/custom/Head.astro`    | Extra tags in `<head>`: analytics, fonts, meta     |
| `src/custom/BodyEnd.astro` | Scripts or widgets at the end of `<body>`          |
| `src/custom/PostEnd.astro` | Comments, newsletter or author bio after each post |
| `public/**`                | Favicon, static OG image and other static files    |

New config keys get a default. A removed key fails the build and names its
replacement.

## How to upgrade

Sites cloned as in [Get started](README.md#get-started) have the `starglow`
remote. Other sites add it once:

```sh
git remote add starglow https://github.com/glowing-space/starglow.git
```

Then, for each release:

```sh
git fetch starglow --tags
git merge vX.Y.Z    # first time on a site not cloned from starglow: add --allow-unrelated-histories
./dev.sh ci         # or: pnpm install && pnpm build
```

Resolve conflicts with your version for the files above and the theme's
version elsewhere. Before merging, follow the upgrade steps in the
[release notes](https://github.com/glowing-space/starglow/releases) of every
release you skip.
