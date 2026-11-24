import { describe, expect, it } from "vitest";
import type { ContentItem } from "@/utils/content/items";
import { getUniqueTags } from "@/utils/getUniqueTags";

const item = (url: string, tags: string[]) =>
  ({ url, tags }) as unknown as ContentItem;

describe("getUniqueTags", () => {
  it("returns tags sorted and unique by slug", () => {
    const tags = getUniqueTags([
      item("/a/", ["Rust", "css"]),
      item("/b/", ["css"]),
    ]);
    expect(tags).toEqual([
      { tag: "css", tagName: "css" },
      { tag: "rust", tagName: "Rust" },
    ]);
  });

  it("fails when two spellings share a slug", () => {
    expect(() =>
      getUniqueTags([
        item("/a/", ["Static Sites"]),
        item("/b/", ["static-sites"]),
      ])
    ).toThrow(/all map to \/tags\/static-sites\//);
  });

  it("fails on a tag without a slug", () => {
    expect(() => getUniqueTags([item("/a/", ["?"])])).toThrow(
      /no usable URL slug/
    );
  });

  it("fails on a symbol-only tag whose slug is not empty", () => {
    expect(() => getUniqueTags([item("/a/", ["!!!"])])).toThrow(
      /"!!!" in \/a\/ has no usable URL slug/
    );
  });
});
