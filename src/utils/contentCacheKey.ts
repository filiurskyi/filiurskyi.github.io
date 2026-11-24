/**
 * Astro keeps parsed and rendered entries in `node_modules/.astro/data-store.json`
 * and clears it when the serialisable Astro config changes. Plugin functions
 * serialise to nothing, so a changed Markdown plugin or schema helper would
 * leave stale entries. The key, a hash of the files that shape entries, goes
 * into the config as the option of a no-op Markdown plugin.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { walk } from "./contentFiles";

/** Files and folders, relative to the project root, that shape entries. */
export const CACHE_INPUTS = [
  "astro.config.ts",
  "starglow.config.ts",
  "package.json",
  "pnpm-lock.yaml",
  "src/config.ts",
  "src/i18n",
  "src/types",
  "src/utils",
];

export function contentCacheKey(root: string): string {
  const hash = createHash("sha256");
  for (const input of CACHE_INPUTS) {
    const path = join(root, input);
    if (!existsSync(path)) continue;
    const files = statSync(path).isDirectory() ? walk(path) : [path];
    for (const file of files) {
      hash.update(relative(root, file).split(sep).join("/"));
      hash.update("\0");
      hash.update(readFileSync(file));
      hash.update("\0");
    }
  }
  return hash.digest("hex").slice(0, 16);
}

/** Does nothing; its `key` option is what Astro compares. */
export function contentCacheKeyPlugin(options: { key: string }): undefined {
  void options;
}
