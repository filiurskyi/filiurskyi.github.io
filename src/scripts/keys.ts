/** Shared guards for the site's single-key shortcuts ("/", h j k l). */

/** True while the key goes to a text field or an editable element. */
export function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select, [contenteditable='true']") !==
        null)
  );
}

/** True while a modal (the image lightbox, an open dialog) owns the keyboard. */
export function isModalOpen(): boolean {
  return document.querySelector('[aria-modal="true"], dialog[open]') !== null;
}

/**
 * True when the statusline is switched on and on screen: the page has one,
 * `html[data-statusline]` is set (config or preview panel) and CSS does not
 * hide it (touch and narrow screens).
 */
export function statuslineActive(): boolean {
  const bar = document.querySelector<HTMLElement>(".statusline");
  return (
    bar !== null &&
    document.documentElement.hasAttribute("data-statusline") &&
    bar.getClientRects().length > 0
  );
}

/** True for a plain key press: no modifier, not already handled. */
export function isPlainKey(event: KeyboardEvent): boolean {
  return !(
    event.defaultPrevented ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  );
}
