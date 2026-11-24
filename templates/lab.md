---
# A lab entry is a project with status experiment: it is listed on /lab/ instead of /projects/.
# Required. Shown as the card and page heading.
title: "[[TODO: experiment name]]"
# Required. One sentence: what the experiment tries or shows. The summary on cards and the meta description.
description: "[[TODO: one-sentence description of the experiment]]"
# Required. Keep experiment for a lab entry. Change it to active, maintained or archived to move the entry to /projects/.
status: experiment
# true keeps the entry out of production builds (the dev server still shows it with a Draft badge).
# Change it to false when the entry is ready to publish.
draft: true
# Optional keys. Remove the leading "# " to use one. The schema is strict, so a typo fails `astro check`.
# stack: [rust, wasm]                        # Technologies shown as chips. Default: none.
# websiteUrl: https://example.org/demo       # Live demo or write-up (http or https). Default: none.
# githubUrl: https://example.org/repository  # Source link (http or https). Default: none.
# docsUrl: https://example.org/docs          # Documentation link (http or https). Default: none.
# featured: true                             # Lists the entry under "Featured projects" on the homepage and sorts it first. Default: false.
# relatedPosts:                              # Posts about this experiment, as post ids "YYYY/slug". Default: none.
#   - 2026/post-slug
# Lab pages render metadata only: leave the file empty below the closing ---. A Markdown body fails the build.
# Write about the experiment in a post and list it under relatedPosts.
---
