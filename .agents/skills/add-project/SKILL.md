---
name: add-project
description: Add a project page to a starglow site. Use when asked to list, add or feature a project.
---

# Add a project

1. `./dev.sh new project <slug>` creates `src/content/projects/<slug>.md` from `templates/project.md`, with `draft: true`. Projects are top-level Markdown files only (no folders, no `.mdx`).
2. Fill `title`, `description` (one sentence) and `status`: `active`, `maintained` or `archived`.
3. Optional: `stack` (chips), `githubUrl`, `docsUrl`, `websiteUrl` (http or https), `featured: true` (homepage, sorted first), `relatedPosts` as post ids `YYYY/slug` that must exist.
4. The page is built from frontmatter only. Leave the file empty below the closing `---`: a body fails the build.
5. Replace every `[[TODO: …]]` marker, then set `draft: false` when the user says it is ready.
6. `./dev.sh ci` must pass. Commit locally only (see AGENTS.md); never push.

Use only real project facts from the user or the project's repository; never invent them.
