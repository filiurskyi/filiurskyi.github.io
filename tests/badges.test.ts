import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BADGE_ICONS } from "@/utils/badges";
import { contrast } from "@/utils/contrast";

const css = readFileSync(
  join(import.meta.dirname, "../src/styles/site-theme.css"),
  "utf8"
);
const token = (name: string) =>
  new RegExp(`${name}:\\s*(#[0-9a-f]{6})\\b`, "i").exec(css)?.[1];

describe("badge icons", () => {
  it("draws every bitmap on 11x11 cells", () => {
    for (const [type, icon] of Object.entries(BADGE_ICONS)) {
      expect(icon.bitmap, type).toHaveLength(11);
      for (const row of icon.bitmap) expect(row, type).toMatch(/^[#.]{11}$/);
    }
  });

  it("draws a no cookies badge", () => {
    expect(BADGE_ICONS.nocookies).toMatchObject({
      label: "no cookies",
      title: "No cookies",
    });
  });

  it("gives every type a colour token that clears 3:1 on the icon well", () => {
    const well = token("--b-icon");
    expect(well).toBeDefined();
    for (const type of Object.keys(BADGE_ICONS)) {
      const colour = token(`--badge-${type}`);
      expect(colour, type).toBeDefined();
      expect(contrast(colour!, well!), type).toBeGreaterThanOrEqual(3);
    }
  });
});
