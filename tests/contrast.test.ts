import { describe, expect, it } from "vitest";
import { contrast, luminance } from "@/utils/contrast";

describe("contrast", () => {
  it("is 21:1 for black on white, in either order", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrast("#ffffff", "#000000")).toBeCloseTo(21);
  });

  it("is 1:1 for a colour on itself", () => {
    expect(contrast("#f78ed6", "#f78ed6")).toBe(1);
  });

  it("matches the WCAG ratio of a known pair", () => {
    expect(contrast("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });
});

describe("luminance", () => {
  it("reads short and alpha hex colours as their six-digit form", () => {
    expect(luminance("#fff")).toBe(luminance("#ffffff"));
    expect(luminance("#1a2b3c80")).toBe(luminance("#1a2b3c"));
  });
});
