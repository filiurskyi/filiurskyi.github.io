import { describe, expect, it } from "vitest";
import {
  decodeEmail,
  encodeEmail,
  hiddenTarget,
  isEncodedEmail,
  spellEmail,
} from "@/utils/hiddenEmail";

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

  it("accepts only an encoded address", () => {
    expect(isEncodedEmail(encodeEmail("hi@example.com"))).toBe(true);
    expect(isEncodedEmail(encodeEmail("hi@example.com?subject=x"))).toBe(true);
    expect(isEncodedEmail("hi@example.com")).toBe(false);
    expect(isEncodedEmail(encodeEmail("example.com"))).toBe(false);
    expect(isEncodedEmail("not base64!")).toBe(false);
  });

  it("takes the target from encodedAddress or the mailto: url", () => {
    const encoded = encodeEmail("hi@example.com");
    expect(hiddenTarget({ url: "mailto:hi@example.com" })).toBeUndefined();
    expect(
      hiddenTarget({ url: " MAILTO:hi@example.com ", hideAddress: true })
    ).toBe(encoded);
    expect(
      hiddenTarget({
        url: "mailto:",
        hideAddress: true,
        encodedAddress: encoded,
      })
    ).toBe(encoded);
  });
});
