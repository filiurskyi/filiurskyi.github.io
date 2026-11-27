import { describe, expect, it } from "vitest";
import { decodeEmail, encodeEmail, spellEmail } from "@/utils/hiddenEmail";

describe("hidden email", () => {
  it("encodes the mailto: target without the plain address", () => {
    const target = "hi@example.com?subject=Hello";
    const encoded = encodeEmail(target);
    expect(encoded).not.toContain("@");
    expect(encoded).not.toContain("example");
    expect(decodeEmail(encoded)).toBe(target);
  });

  it("spells the address without the query", () => {
    expect(spellEmail("hi@mail.example.com?subject=x")).toBe(
      "hi [at] mail [dot] example [dot] com"
    );
  });
});
