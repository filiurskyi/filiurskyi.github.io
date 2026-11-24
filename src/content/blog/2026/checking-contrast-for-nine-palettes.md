---
title: Checking contrast for nine palettes at build time
description: starglow's build reads every shipped palette back out of the HTML and checks 45 colour pairs per palette against WCAG AA. Here's what it checks and what it skips.
pubDatetime: 2026-05-12T19:20:00+01:00
tags: [accessibility, colour, starglow]
---

starglow has four dark palettes and five light ones. Each has eleven colours that can end up as text and four surfaces that text sits on. I used to check them with a browser extension, one page at a time, and I'd always miss one.

Now the build does it. If a palette falls under 4.5:1 anywhere, `pnpm verify` fails and the site doesn't deploy.

![A three by three grid of the same post section, one tile per palette: dark starglow, void, aurora and ember, then light starglow, paper, petal, frost and sand. Each tile shows the five callouts (note, tip, important, warning, caution) and the statusline in that palette's colours.](./_assets/palettes.webp)

_The same section of a post in all nine palettes._

## What counts as a pair

The text colours are the body text, the muted text for dates and labels, the accent, the code comment colour and seven syntax hues from red to purple. The surfaces are the page background, two offset surfaces for the header band and code blocks, and the muted surface behind inline code and badges.

Eleven times four is 44 pairs. One more checks the text that sits on an accent background. So it's 45 per palette and 405 for the whole set.

That's more than strictly needed. Nobody puts a code comment on the header band. But working out which pairs really occur would mean keeping a second list in sync with the CSS, and I trust myself to forget that much more than I trust myself to pick colours that pass everywhere.

## Reading the palettes back from the build

The check doesn't import `src/palettes.ts`. It reads the inline `<style>` in the built `index.html`, where every palette is one rule keyed by an attribute on `<html>`:

```css
html[data-dark="ember"][data-theme="dark"] {
  --background: #17120e;
  --foreground: #efe2d3;
  /* and the rest */
}
```

I did it this way so that palettes defined in `starglow.config.ts` get checked as well. If someone adds a palette called `swamp` in their own config, it's in the HTML, so it's in the check. It also means the check sees what visitors get, not what I meant to ship.

The maths is the WCAG 2 formula, a few lines of TypeScript with no dependencies:

```ts
function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? [...value].map(c => c + c).join("")
      : value.slice(0, 6);
  const channel = (offset: number): number => {
    const c = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}
```

The contrast ratio is then `(lighter + 0.05) / (darker + 0.05)`.

## How close it gets

Some palettes pass with room to spare. Some don't:

| Palette        | Tightest pair    | Ratio |
| :------------- | :--------------- | ----: |
| dark starglow  | comment on muted |  5.04 |
| dark ember     | comment on muted |  4.54 |
| light starglow | green on crust   |  4.51 |
| light petal    | orange on crust  |  4.51 |
| light paper    | comment on crust |  4.57 |

4.51 is a pass, and I'll take it. Getting the light greens and oranges over the line was most of the work. A green that's dark enough to read on a pale lilac crust stops looking green fairly quickly, so in the light starglow palette it's closer to teal.

A failure looks like this, one line per pair:

```text
verify-dist: FAIL palettes: palette: light palette "starglow" --green on --crust is 4.39:1, below 4.5
```

## What it doesn't check

Borders. They're 1px rules, not text, and in every palette they sit around 1.4:1 against the background, well under the 3:1 that WCAG asks of meaningful UI parts. I've decided that's fine because no border carries meaning on its own: a focused link gets a solid 2px outline in the accent colour, and the accent is checked.

It also doesn't look at images or the header glow, and anything a post author writes in their own CSS is on them, me included.
