---
title: A vim statusline in 60 lines
description: The status bar at the bottom of starglow posts shows the source file and a vim-style ruler, and lets j, k, h and l move around. The whole script fits on one screen.
pubDatetime: 2026-07-22T21:40:00+01:00
tags: [starglow, javascript, accessibility]
---

I've used vim for long enough that I press `j` in every text field I see. So when I was building starglow I gave posts a statusline, the bar vim shows at the bottom of the window. Look down: this post has one.

![The bottom of a post page in the dark starglow palette. A full-width bar along the bottom edge reads NORMAL in a pink block, then a file path, then [RO], and on the right the file type and a scroll percentage. Above it are the preview tab and the end of a callout.](./_assets/statusline.webp)

_The statusline under a post. The left part is the mode and the file, the right part is the file type and the ruler._

## What's in the bar

From left to right:

- `NORMAL`, because a blog is read-only and you're never in insert mode.
- The source file relative to the content folder, for example `blog/2026/vim-statusline-in-60-lines.md`.
- `[RO]`.
- The file type, `markdown` or `mdx`.
- The ruler: `Top`, a percentage, `Bot`, or `All` when the page doesn't scroll.

Everything except the ruler is rendered at build time. The file path comes straight from the content entry, so it's always the real file, and an MDX post really says `mdx`.

## The ruler

This is vim's logic, more or less:

```ts
function update(): void {
  if (!pos) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  pos.textContent =
    max <= 0
      ? "All"
      : scrollY <= 0
        ? "Top"
        : scrollY >= max - 1
          ? "Bot"
          : `${Math.round((scrollY / max) * 100)}%`;
}
```

The `- 1` is there because some browsers stop scrolling half a pixel short of the bottom on zoomed pages, and the bar would sit at 100% forever instead of saying `Bot`.

It listens to `scroll` and `resize`, both passive. I thought about throttling it and then measured: setting one `textContent` per scroll event doesn't show up in a performance profile at all.

## The keys

While the bar is on the page, `j` and `k` scroll by 64 pixels, and `h` and `l` follow the links to the previous and next post. The part that took the longest was deciding when not to react:

```ts
if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey)
  return;
if (!document.querySelector(".statusline") || isTyping(event.target)) return;
if (document.querySelector("dialog[open]")) return;
```

No modifiers, so `Ctrl+L` still focuses the address bar. Nothing while you're typing in an input, a textarea, a select or anything `contenteditable`, so you can search for "jk" without being scrolled away. Nothing while a dialog is open. And `h` and `l` ignore key repeat, because holding `l` for half a second shouldn't skip you through six posts.

## Accessibility

The bar is decorative. It's `aria-hidden`, so screen readers skip it, and it's left out of the search index. Everything in it is available elsewhere: the title is in the heading, the date is under it, and the previous and next links are real links at the end of the post.

The keys are the part I worried about. Single-letter shortcuts can clash with screen reader and speech input commands, which is why WCAG wants a way to turn them off. Here that's the `statusline` option: with the bar off, the keys are off too. On my own site it stays on.

## Counting

The `<script>` block is 62 lines including blank ones and comments. The title rounds down. The whole component, with the markup, is 94.
