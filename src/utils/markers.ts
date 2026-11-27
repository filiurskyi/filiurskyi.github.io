/**
 * Placeholder markers that must never reach structured data or the built
 * site. Shared by src/config.ts and scripts/verify-dist.ts.
 */
export const DEMO_MARKER = "[DEMO]";
export const PLACEHOLDER_MARKERS = ["[PLACEHOLDER]", "[[TODO", DEMO_MARKER];

export const BUTTON_LABEL_PLACEHOLDER = `${"[".repeat(2)}TODO: set button.label in starglow.config.ts${"]".repeat(2)}`;

export const isPlaceholder = (text: string): boolean =>
  PLACEHOLDER_MARKERS.some(marker => text.includes(marker));
