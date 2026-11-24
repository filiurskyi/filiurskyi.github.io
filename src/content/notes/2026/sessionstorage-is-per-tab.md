---
title: sessionStorage is per tab, not per session
description: What survives a reload, what doesn't, and the duplicate-tab surprise.
tags: [javascript, browsers]
updated: 2026-04-09
---

The name made me think it lasted as long as the browser was open. It doesn't. Each tab gets its own `sessionStorage`. It survives reloads and navigation inside that tab, and it's gone when the tab closes.

Duplicating a tab copies it, so the new tab starts with the same values and then goes its own way. Opening the same URL in a fresh tab starts empty.

That's what I wanted for the starglow preview panel. Someone trying out palettes on the demo shouldn't come back a week later to a site that still looks like their experiment.
