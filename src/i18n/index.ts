import type { UIStrings } from "./types";
import config from "@/config";

export { listParts, tplStr } from "./format";

const modules = import.meta.glob<{ default: UIStrings }>("./lang/*.ts", {
  eager: true,
});

const translations: Record<string, UIStrings> = {};
for (const [path, mod] of Object.entries(modules)) {
  const locale = path.slice("./lang/".length, -".ts".length);
  translations[locale] = mod.default;
}

/**
 * The locale of the page being rendered. Astro derives its locales from
 * `site.lang` (see astro.config.ts), so this is `site.lang` unless a route
 * sets another one.
 */
export function useLocale(astro: { currentLocale?: string }): string {
  return astro.currentLocale ?? config.site.lang;
}

/** Returns UI strings for the given locale, falling back to `site.lang`. */
export function useTranslations(locale: string = config.site.lang): UIStrings {
  return translations[locale] ?? translations[config.site.lang];
}
