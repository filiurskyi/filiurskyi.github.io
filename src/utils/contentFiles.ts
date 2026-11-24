/**
 * Reads content sources the way Astro does, for the build scripts in scripts/
 * (verify-dist, draft-assets, check-markers). Plain Node: no `astro:` imports
 * and explicit `.ts` paths, so Node strips the types and runs it directly.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter } from "@astrojs/markdown-remark";
import { isAlias, isMap, isScalar, parseDocument } from "yaml";

/** Every file under `dir`, depth first, in a stable (code point) order. */
export function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  );
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

/**
 * The parsed YAML frontmatter of a Markdown source, with Astro's own parser,
 * so comments, quoting and dates read exactly as the content layer reads
 * them. `{}` when there is none.
 */
export function frontmatterOf(source: string): Record<string, unknown> {
  return parseFrontmatter(source).frontmatter as Record<string, unknown>;
}

const YAML_FENCE = /(?:^\uFEFF?|^\s*\n)---/;
const BARE_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Top-level YAML frontmatter keys written as a bare `YYYY-MM-DD`, without a
 * time. The parsed frontmatter cannot tell them apart from midnight UTC, so
 * this reads the source text of each value.
 */
export function dateOnlyKeys(source: string): Set<string> {
  const keys = new Set<string>();
  const { rawFrontmatter } = parseFrontmatter(source);
  if (!rawFrontmatter || !YAML_FENCE.test(source)) return keys;
  // The options Astro parses frontmatter with.
  const doc = parseDocument(rawFrontmatter, {
    customTags: ["timestamp"],
    merge: true,
    schema: "core",
  });
  if (!isMap(doc.contents)) return keys;
  for (const { key, value } of doc.contents.items) {
    const node = isAlias(value) ? value.resolve(doc) : value;
    if (
      isScalar(key) &&
      isScalar(node) &&
      node.type === "PLAIN" &&
      node.value instanceof Date &&
      node.range &&
      BARE_DATE.test(rawFrontmatter.slice(node.range[0], node.range[1]))
    )
      keys.add(String(key.value));
  }
  return keys;
}

/** True when the entry sets `draft: true` (any YAML spelling of true). */
export function isDraft(source: string): boolean {
  return frontmatterOf(source).draft === true;
}

/** A string frontmatter value, trimmed; undefined when absent or empty. */
export function stringField(
  data: Record<string, unknown>,
  key: string
): string | undefined {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
