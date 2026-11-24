---
title: Squeezing SVG text with textLength
description: Two attributes that fit a long label into a fixed width without changing the font size.
tags: [svg]
updated: 2026-01-27
---

`textLength` sets how wide an SVG `<text>` element should be. `lengthAdjust` says how to get there: `spacing` only changes the gaps between letters, `spacingAndGlyphs` narrows the letters too.

```html
<text
  x="59"
  y="19.5"
  text-anchor="middle"
  textLength="52"
  lengthAdjust="spacingAndGlyphs"
>
  no cookies
</text>
```

Only set it when the text is too long. On a short label it stretches the letters apart instead, which looks worse than you'd expect.
