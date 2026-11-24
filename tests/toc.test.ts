import { describe, expect, it } from "vitest";
import { buildTocTree, hasToc } from "@/utils/buildTocTree";

const h = (depth: number, slug: string) => ({ depth, slug, text: slug });

describe("buildTocTree", () => {
  it("nests h3 under the h2 before it", () => {
    const tree = buildTocTree([h(2, "a"), h(3, "a1"), h(2, "b")]);
    expect(tree.map(item => item.slug)).toEqual(["a", "b"]);
    expect(tree[0]?.children.map(item => item.slug)).toEqual(["a1"]);
  });

  it("drops h1 and headings deeper than maxDepth", () => {
    const tree = buildTocTree([h(1, "t"), h(2, "a"), h(4, "deep")]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.children).toEqual([]);
  });

  it("nests a skipped level under the closest shallower heading", () => {
    const tree = buildTocTree([h(2, "a"), h(4, "a-deep")], 4);
    expect(tree[0]?.children.map(item => item.slug)).toEqual(["a-deep"]);
  });

  it("puts a leading h3 at the top level", () => {
    const tree = buildTocTree([h(3, "first"), h(2, "a")]);
    expect(tree.map(item => item.slug)).toEqual(["first", "a"]);
  });
});

describe("hasToc", () => {
  it("needs two headings in range", () => {
    expect(hasToc([h(2, "a")])).toBe(false);
    expect(hasToc([h(1, "t"), h(2, "a"), h(4, "d")])).toBe(false);
    expect(hasToc([h(2, "a"), h(3, "b")])).toBe(true);
  });
});
