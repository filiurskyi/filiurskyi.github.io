import { describe, expect, it } from "vitest";
import { renderOgImage } from "@/utils/og/renderOg";

describe("generated Open Graph image", () => {
  it("is a 1200x630 PNG", async () => {
    const response = await renderOgImage({
      typeLabel: "Post",
      title: "Hello, world",
      date: "2 Jan, 2026",
    });
    const png = Buffer.from(await response.arrayBuffer());
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  }, 30_000);
});
