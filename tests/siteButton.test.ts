import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { BADGE_ICONS } from "@/utils/badges";
import { BUTTON_LABEL_PLACEHOLDER } from "@/utils/markers";
import {
  buttonIcon,
  buttonText,
  pngSize,
  readButtonImage,
  renderButton,
  textBounds,
  themeTokens,
} from "@/utils/siteButton";
import { buttonSnippet } from "@/utils/smallWeb";

describe("site button", () => {
  it("takes the icon and colour of a badge type, or a bitmap", () => {
    expect(buttonIcon("rss")).toEqual({
      bitmap: BADGE_ICONS.rss!.bitmap,
      fill: "--badge-rss",
    });
    expect(buttonIcon("nope").fill).toBe("--badge-link");
    const own = Array(11).fill("#.#.#.#.#.#");
    expect(buttonIcon(own)).toEqual({ bitmap: own, fill: "--badge-link" });
  });

  it("draws a placeholder label as [[TODO]]", () => {
    expect(buttonText(BUTTON_LABEL_PLACEHOLDER)).toBe("[[TODO]]");
    expect(buttonText("my site")).toBe("my site");
  });

  it("reads the badge tokens of the theme", () => {
    const tokens = themeTokens(":root{--b-face: #24232e;--badge-rss:#ffa040;}");
    expect(tokens.get("--b-face")).toBe("#24232e");
    expect(tokens.get("--badge-rss")).toBe("#ffa040");
  });

  it("finds the drawn columns of a text layer", () => {
    const alpha = new Uint8Array([0, 0, 9, 0, 0, 0, 0, 0, 0, 9, 0, 0]);
    expect(textBounds(alpha, 6, 2)).toEqual([2, 4]);
    expect(textBounds(new Uint8Array(12), 6, 2)).toBeUndefined();
  });

  it("renders an 88x31 PNG", async () => {
    const png = await renderButton({ label: "my site", icon: "sparkle" });
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([88, 31]);
  }, 30_000);

  it("escapes the label in the copy-paste HTML", () => {
    expect(
      buttonSnippet(
        "https://me.example/",
        "https://me.example/88x31.png",
        'a "b" <c>'
      )
    ).toBe(
      '<a href="https://me.example/"><img src="https://me.example/88x31.png" width="88" height="31" alt="a &quot;b&quot; &lt;c&gt;"></a>'
    );
  });
});

const blank = (width: number, height: number) =>
  sharp({
    create: { width, height, channels: 4, background: "#000" },
  })
    .png()
    .toBuffer();

describe("own button image", () => {
  it("reads the size of a PNG", async () => {
    expect(pngSize(await blank(88, 31))).toEqual([88, 31]);
    expect(pngSize(Buffer.from("GIF89a, not a png at all"))).toBeUndefined();
    expect(pngSize(new Uint8Array(4))).toBeUndefined();
  });

  it("serves an 88x31 PNG from public/ and rejects anything else", async () => {
    const root = await mkdtemp(join(tmpdir(), "starglow-button-"));
    await mkdir(join(root, "public/b"), { recursive: true });
    const good = await blank(88, 31);
    await writeFile(join(root, "public/b/ok.png"), good);
    await writeFile(join(root, "public/big.png"), await blank(88, 32));
    await writeFile(join(root, "public/fake.png"), "not a png");
    expect(await readButtonImage("/b/ok.png", "button.image", root)).toEqual(
      good
    );
    await expect(
      readButtonImage("/gone.png", "button.image", root)
    ).rejects.toThrow('button.image "/gone.png": public/gone.png is missing');
    await expect(
      readButtonImage("/big.png", "button.imageLight", root)
    ).rejects.toThrow("is 88x32, expected 88x31");
    await expect(
      readButtonImage("/fake.png", "button.image", root)
    ).rejects.toThrow("public/fake.png is not a PNG");
  });
});
