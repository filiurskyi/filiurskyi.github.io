---
title: Self-hosting fonts in Astro
description: How starglow ships Inter, JetBrains Mono and a pixel face from its own folder with the Astro fonts API, and which two files get preloaded.
pubDatetime: 2025-10-14T19:40:00+01:00
tags: [astro, typography, fonts]
---

For years I loaded fonts from a CDN because it was one line of HTML. Then a client's legal team asked me where visitors' IP addresses went when the page loaded, and I didn't have a good answer. Since then every font I use lives in the repository next to the code.

Astro has a fonts API that makes this less tedious than it used to be. starglow uses it for all three of its faces.

## The files

The fonts sit in `src/assets/fonts/`, each next to its licence text. They're all under the SIL Open Font License, which allows exactly this.

| Face           | Role                 | Weights and styles    | Size (woff2) |
| :------------- | :------------------- | :-------------------- | -----------: |
| Inter          | Body text, headings  | 400, 600, both italic |       ~99 KB |
| JetBrains Mono | Code, dates, labels  | 400 and 400 italic    |       ~43 KB |
| Pixelify Sans  | Wordmark, badge text | 400                   |       7.7 KB |

Only the Latin subset ships. If you write in another script, you'll need to swap in the matching files.

## The config

Each face is one entry under `fonts` in `astro.config.ts`. This is the wordmark face, which is the shortest:

```ts
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [
    {
      name: "Pixelify Sans",
      cssVariable: "--font-wordmark",
      provider: fontProviders.local(),
      fallbacks: ["monospace"],
      display: "swap",
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/pixelify-sans-latin-400-normal.woff2"],
          },
        ],
      },
    },
  ],
});
```

Astro copies the file into the build with a hashed name and writes the `@font-face` rule. The CSS only ever refers to the variable, so swapping the face later is a two-line change in the config and nothing in the stylesheets.

## Preloading two files, not seven

The `<Font>` component goes in the page head, once per face. By default it only emits the CSS. With `preload` it also adds a `<link rel="preload">`, which makes the browser fetch the file before it has parsed any CSS.

```astro
<Font cssVariable="--font-inter" preload={[{ weight: 400, style: "normal" }]} />
<Font cssVariable="--font-jetbrains-mono" />
<Font cssVariable="--font-wordmark" preload />
```

I preload regular Inter because every page has body text, and the pixel face because the wordmark is the first thing in the header and it looks wrong in a fallback font. That's about 31 KB before first paint. Italic, semibold and the mono face load when a page actually uses them, which on a short note might be never.

My first attempt preloaded everything. Lighthouse was happy with the font score and unhappy with everything else, because 150 KB of fonts were competing with the CSS.

## Fallbacks

`display: "swap"` shows text in the fallback straight away and swaps when the file arrives. Astro also generates a fallback face with adjusted metrics, so the swap moves the text much less than it used to. It's not zero: on a slow connection you can still see the wordmark jump by a pixel or two. I've stopped worrying about it.
