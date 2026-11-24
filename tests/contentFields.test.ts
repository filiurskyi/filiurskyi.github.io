import { describe, expect, it } from "vitest";
import { TITLE_MAX, tagList, title } from "@/utils/content/fields";

const messages = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map(issue => issue.message) ?? [];

describe("title", () => {
  it(`accepts up to ${TITLE_MAX} characters`, () => {
    expect(title().safeParse("x".repeat(TITLE_MAX)).success).toBe(true);
    expect(messages(title().safeParse("x".repeat(TITLE_MAX + 1)))).toEqual([
      `title has ${TITLE_MAX + 1} characters; keep it to ${TITLE_MAX} or fewer`,
    ]);
  });

  it("rejects an empty title", () => {
    expect(title().safeParse("").success).toBe(false);
  });
});

describe("tagList", () => {
  it("accepts lowercase tags, each once", () => {
    expect(tagList().parse(["css", "static-sites", "привіт"])).toEqual([
      "css",
      "static-sites",
      "привіт",
    ]);
  });

  it("rejects uppercase tags without rewriting them", () => {
    expect(messages(tagList().safeParse(["CSS"]))).toEqual([
      'tag "CSS" must be lowercase: write "css"',
    ]);
  });

  it("rejects a tag without a letter or digit", () => {
    expect(messages(tagList().safeParse(["!!!", "...", "🦀"]))).toEqual([
      'tag "!!!" needs at least one letter or digit',
      'tag "..." needs at least one letter or digit',
      'tag "🦀" needs at least one letter or digit',
    ]);
  });

  it("accepts letters and digits in any script", () => {
    const tags = ["c++", "привіт", "日本語", "한국어", "العربية", "2026"];
    expect(tagList().parse(tags)).toEqual(tags);
  });

  it("rejects a tag listed twice", () => {
    const result = tagList().safeParse(["css", "svg", "css"]);
    expect(messages(result)).toEqual(['tag "css" is listed twice']);
    expect(result.error?.issues[0]?.path).toEqual([2]);
  });
});
