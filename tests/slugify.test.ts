import { describe, expect, it } from "vitest";
import { hasLetterOrDigit, slugifyAll, slugifyStr } from "@/utils/slugify";

describe("slugifyStr", () => {
  it("lowercases and hyphenates Latin text", () => {
    expect(slugifyStr("Static Sites")).toBe("static-sites");
    expect(slugifyStr("CSS & HTML")).toBe("css-and-html");
  });

  it("keeps non-Latin characters", () => {
    expect(slugifyStr("Привіт світ")).toBe("привіт-світ");
  });

  it("keeps CJK characters", () => {
    expect(slugifyStr("日本語")).toBe("日本語");
    expect(slugifyStr("中文 标签")).toBe("中文-标签");
  });

  it("maps each entry of a list", () => {
    expect(slugifyAll(["A B", "c"])).toEqual(["a-b", "c"]);
  });
});

describe("hasLetterOrDigit", () => {
  it("is true for letters or digits in any script", () => {
    for (const text of ["a", "7", "привіт", "日本", "c++"]) {
      expect(hasLetterOrDigit(text)).toBe(true);
    }
  });

  it("is false for symbols only", () => {
    for (const text of ["!!!", "...", "$$", "---", "🦀", ""]) {
      expect(hasLetterOrDigit(text)).toBe(false);
    }
  });
});
