import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { applyEmbedWidths, convertObsidian } from "@/utils/remarkObsidian";

const dir = mkdtempSync(join(tmpdir(), "starglow-obsidian-"));
mkdirSync(join(dir, "_assets"));
writeFileSync(join(dir, "_assets", "shot.png"), "");
const file = join(dir, "post.md");

describe("image embeds", () => {
  it("passes a size part on as the requested width", () => {
    expect(convertObsidian("![[shot.png|A shot|600]]", file)).toBe(
      "![A shot](<_assets/shot.png#obsidian-width=600>)"
    );
    expect(convertObsidian("![[shot.png|300x200|A shot]]", file)).toBe(
      "![A shot](<_assets/shot.png#obsidian-width=300>)"
    );
    expect(convertObsidian("![[shot.png|A shot]]", file)).toBe(
      "![A shot](<_assets/shot.png>)"
    );
  });

  it("moves the width from the URL to the image properties", () => {
    const sized = { type: "image", url: "_assets/shot.png#obsidian-width=600" };
    const plain = { type: "image", url: "_assets/shot.png" };
    applyEmbedWidths({
      type: "root",
      children: [{ type: "paragraph", children: [sized, plain] }],
    });
    expect(sized).toEqual({
      type: "image",
      url: "_assets/shot.png",
      data: { hProperties: { width: 600 } },
    });
    expect(plain).toEqual({ type: "image", url: "_assets/shot.png" });
  });
});
