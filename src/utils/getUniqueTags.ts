import type { ContentItem } from "./content/items";
import { hasLetterOrDigit, slugifyStr } from "./slugify";

type Tag = {
  tag: string;
  tagName: string;
};

/**
 * Fails the build when a tag has no letter or digit (no usable slug), or when two spellings share
 * one slug (they would share one tag page under one arbitrary label).
 */
function assertTagSlugs(items: ContentItem[]): void {
  const spellings = new Map<string, Map<string, string[]>>();
  for (const item of items) {
    for (const name of item.tags) {
      const slug = slugifyStr(name);
      if (!slug || !hasLetterOrDigit(name)) {
        throw new Error(
          `[tags] "${name}" in ${item.url} has no usable URL slug. Use at least one letter or digit in the tag.`
        );
      }
      const names = spellings.get(slug) ?? new Map<string, string[]>();
      names.set(name, [...(names.get(name) ?? []), item.url]);
      spellings.set(slug, names);
    }
  }
  for (const [slug, names] of spellings) {
    if (names.size < 2) continue;
    const list = [...names]
      .map(([name, urls]) => `"${name}" (${urls.join(", ")})`)
      .join(" and ");
    throw new Error(
      `[tags] ${list} all map to /tags/${slug}/. Spell the tag one way everywhere.`
    );
  }
}

/** Sorted tags of already-visible items, unique by slug (`tag`); `tagName` is the label. */
export function getUniqueTags(items: ContentItem[]) {
  assertTagSlugs(items);
  const tags: Tag[] = items
    .flatMap(item => item.tags)
    .map(tag => ({ tag: slugifyStr(tag), tagName: tag }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
  return tags;
}
