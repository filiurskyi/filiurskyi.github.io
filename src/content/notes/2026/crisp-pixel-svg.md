---
title: Keep pixel art crisp in SVG
description: One attribute for the shapes and one CSS property for the element.
tags: [svg, css]
updated: 2026-10-02
---

Rectangles on whole-number coordinates still get anti-aliased edges once the SVG is scaled by a fractional amount, for example at 110% zoom. For pixel art that means soft grey fringes. Turn it off on the SVG:

```html
<svg viewBox="0 0 88 31" shape-rendering="crispEdges">
  <rect x="5" y="5" width="10" height="2" fill="currentColor" />
</svg>
```

The badges in starglow also get this in CSS. I'm honestly not sure it changes anything on top of `crispEdges` in current browsers, but it doesn't hurt:

```css
.b88 svg {
  image-rendering: pixelated;
}
```

Don't put `crispEdges` on anything with curves or diagonal lines. They come out jagged.
