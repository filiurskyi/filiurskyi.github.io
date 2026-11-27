import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CORE_CODEPOINTS,
  FONT_DIR,
  splitFont,
  subsetPath,
  unicodeRange,
} from "@/utils/fontSubset";
import { cmapCodepoints, decodeWoff2, encodeWoff2 } from "@/utils/woff2";
import { corePreloads } from "@/utils/fontPreloads";

const sources = readdirSync(FONT_DIR)
  .filter(f => f.endsWith(".woff2"))
  .map(f => f.slice(0, -".woff2".length));

describe("unicodeRange", () => {
  it("joins runs and keeps single code points", () => {
    expect(unicodeRange([0x41, 0x20, 0x21, 0x22, 0x2026, 0x42])).toEqual([
      "U+20-22",
      "U+41-42",
      "U+2026",
    ]);
  });

  it("rejects an empty set", () => {
    expect(() => unicodeRange([])).toThrow();
  });
});

describe("woff2", () => {
  it("round-trips every vendored font", () => {
    for (const name of sources) {
      const sfnt = decodeWoff2(readFileSync(join(FONT_DIR, `${name}.woff2`)));
      expect(decodeWoff2(encodeWoff2(sfnt)).equals(sfnt), name).toBe(true);
    }
  });
});

describe("font subsets", () => {
  it("are up to date with their sources (pnpm fonts)", async () => {
    for (const name of sources) {
      const { core, rest } = await splitFont(
        readFileSync(join(FONT_DIR, `${name}.woff2`))
      );
      for (const [part, built] of [
        ["core", core],
        ["rest", rest],
      ] as const) {
        const committed = readFileSync(subsetPath(name, part));
        expect(
          decodeWoff2(committed).equals(decodeWoff2(built)),
          `${name} ${part}`
        ).toBe(true);
      }
    }
  });

  it("split each font into core and rest without losing a character", () => {
    const core = new Set(CORE_CODEPOINTS);
    for (const name of sources) {
      const full = cmapCodepoints(
        decodeWoff2(readFileSync(join(FONT_DIR, `${name}.woff2`)))
      );
      const parts = (["core", "rest"] as const).map(part =>
        cmapCodepoints(decodeWoff2(readFileSync(subsetPath(name, part))))
      );
      expect(
        parts[0].every(cp => core.has(cp)),
        name
      ).toBe(true);
      expect(
        parts[1].some(cp => core.has(cp)),
        name
      ).toBe(false);
      expect(
        [...parts[0], ...parts[1]].sort((a, b) => a - b),
        name
      ).toEqual(full);
    }
  });
});

describe("corePreloads", () => {
  const face = (weight: string, style: string, url: string) => ({
    weight,
    style,
    src: [{ url, format: "woff2" }],
  });
  const faces = [
    face("400", "normal", "/a-core"),
    face("400", "normal", "/a-rest"),
    face("400", "italic", "/b-core"),
    face("400", "italic", "/b-rest"),
  ];

  it("keeps the first face per weight and style", () => {
    expect(corePreloads(faces).map(p => p.url)).toEqual(["/a-core", "/b-core"]);
  });

  it("filters by weight and style", () => {
    expect(corePreloads(faces, [{ weight: "400", style: "italic" }])).toEqual([
      { url: "/b-core", type: "woff2" },
    ]);
  });

  it("returns nothing for a missing family", () => {
    expect(corePreloads(undefined)).toEqual([]);
  });
});
