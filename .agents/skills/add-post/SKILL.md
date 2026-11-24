---
name: add-post
description: Add a blog post to a starglow site. Use when asked to write, draft or publish a post.
---

# Add a post

1. `./dev.sh new post <slug>` (slug: lowercase letters, digits, single hyphens). It creates `src/content/blog/<year>/<slug>.md` from `templates/post.md`, with `pubDatetime` set to now in the site timezone and `draft: true`. It runs on the host and needs GNU `date`.
2. Fill `title` (at most 100 characters), `description` (one sentence) and the body. Replace every `[[TODO: …]]` marker; the deploy fails while one remains.
3. `tags`: lowercase, each once, for example `[css, static-sites]`. Uppercase or a repeat fails the build.
4. Images go in `_assets/` next to the post, `![alt text](./_assets/name.webp)`. Every image needs real alt text; `pnpm verify` fails on an empty one.
5. Optional keys are listed, commented out, in the template. The schema in `src/content.config.ts` is strict: an unknown key fails the build.
6. The folder year must equal the `pubDatetime` year in the post's timezone. A future `pubDatetime` is built only from that day on.
7. Keep `draft: true` until the user says it is ready; then set `draft: false`.
8. `./dev.sh ci` must pass. Commit locally only (see AGENTS.md); never push.

Never invent facts, quotes or experiences for the user. Leave a `[[TODO: …]]` marker where the user has to write.
