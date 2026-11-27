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

describe("missing alt text", () => {
  it("names the file, line, embed and the fix", () => {
    const post = join(dir, "no-alt.md");
    writeFileSync(post, "---\ntitle: x\n---\n\nText\n\n![[shot.png|600]]\n");
    expect(() => convertObsidian("Text\n\n![[shot.png|600]]\n", post)).toThrow(
      /no-alt\.md:7: !\[\[shot\.png\|600\]\] has no alt text\. Replace it with !\[\[shot\.png\|600\|what the image shows\]\], describing the image: alt text is required for screen readers\.$/
    );
  });

  it("keeps the escaped bar inside a table", () => {
    expect(() => convertObsidian("| ![[shot.png\\|]] |", file)).toThrow(
      "Replace it with ![[shot.png\\|what the image shows]]"
    );
  });
});
