const THEME_KEY = "theme";
const LIGHT = "light";
const DARK = "dark";

// Set by the inline script in Layout.astro.
const boot = (
  window as unknown as { __theme?: { value: string; mode: string } }
).__theme;
const defaultMode = boot?.mode ?? DARK;
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

function getPreferredTheme(): string {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  if (defaultMode === "system") return systemDark.matches ? DARK : LIGHT;
  return defaultMode;
}

let themeValue: string = boot?.value ?? getPreferredTheme();

function persist(): void {
  localStorage.setItem(THEME_KEY, themeValue);
  reflect();
}

function reflect(): void {
  const root = document.firstElementChild;
  root?.setAttribute("data-theme", themeValue);
  root?.classList.toggle("dark", themeValue === DARK);
  document
    .querySelector("#theme-btn")
    ?.setAttribute("aria-pressed", String(themeValue === DARK));

  // Android's browser chrome follows theme-color.
  const bg = window.getComputedStyle(document.body).backgroundColor;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", bg);
}

function setup(): void {
  reflect();
  document.querySelector("#theme-btn")?.addEventListener("click", () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    persist();
  });
}

setup();

document.addEventListener("astro:after-swap", setup);

// The preview panel's session-only mode; null restores the visitor's own.
document.addEventListener("starglow:theme", event => {
  themeValue =
    (event as CustomEvent<string | null>).detail ?? getPreferredTheme();
  reflect();
});

// Carries theme-color across navigations, or Android's bar flashes.
document.addEventListener("astro:before-swap", event => {
  const color = document
    .querySelector("meta[name='theme-color']")
    ?.getAttribute("content");
  if (color) {
    (event as { newDocument: Document }).newDocument
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", color);
  }
});

// Follows the OS only in "system" mode and until the visitor toggles.
systemDark.addEventListener("change", ({ matches }) => {
  if (defaultMode !== "system" || localStorage.getItem(THEME_KEY)) return;
  themeValue = matches ? DARK : LIGHT;
  reflect();
});
