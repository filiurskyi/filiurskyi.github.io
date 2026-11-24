---
title: Text sizes in rem, borders in px
description: The split I use so that browser zoom settings scale text but not hairlines.
tags: [css, accessibility]
updated: 2025-11-20
---

Some people raise the default font size in their browser settings instead of zooming. Text sized in `rem` follows that setting. Text in `px` ignores it, and to those readers your site looks tiny.

Borders are the opposite case. A 1px rule should stay a hairline when the font gets bigger, so I keep it in `px`:

```css
:root {
  --text-base: 1rem;
}

.card {
  font-size: var(--text-base);
  border: 1px solid var(--border);
}
```

Spacing I go back and forth on. Right now it's `px`, on a 4px grid.
