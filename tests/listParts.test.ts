import { describe, expect, it } from "vitest";
import { listParts } from "@/i18n/format";

const blog = { href: "/blog/", label: "blog" };
const notes = { href: "/notes/", label: "notes" };
const tags = { href: "/tags/", label: "tags" };

describe("listParts", () => {
  it("turns {{sections}} into links in a locale list", () => {
    expect(
      listParts("Browse the {{sections}}.", [blog, notes], "en", "conjunction")
    ).toEqual(["Browse the ", blog, " and ", notes, "."]);
    expect(
      listParts(
        "Or the {{sections}}.",
        [tags, blog, notes],
        "en",
        "disjunction"
      )
    ).toEqual(["Or the ", tags, ", ", blog, ", or ", notes, "."]);
  });

  it("links a single section without a separator", () => {
    expect(
      listParts("Browse the {{sections}}.", [notes], "en", "conjunction")
    ).toEqual(["Browse the ", notes, "."]);
  });

  it("follows the locale's list style", () => {
    expect(
      listParts("{{sections}}", [blog, notes], "de", "conjunction")
    ).toEqual([blog, " und ", notes]);
  });
});
