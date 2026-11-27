import { describe, expect, it } from "vitest";
import { BADGE_ICONS } from "@/utils/badges";
import { BUTTON_LABEL_PLACEHOLDER } from "@/utils/markers";
import {
  buttonIcon,
  buttonText,
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
