import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { COLUMN_WIDTH, imageProps, remarkImages } from "@/utils/remarkImages";

const options = { maxWidth: 1200, format: "webp", quality: 80 } as const;

describe("imageProps", () => {
  it("caps a large original at maxWidth with a column and a full candidate", () => {
    expect(imageProps(1600, undefined, options)).toEqual({
      width: 1200,
      widths: [COLUMN_WIDTH, 1200],
      sizes: `(min-width: ${COLUMN_WIDTH}px) ${COLUMN_WIDTH}px, 100vw`,
      format: "webp",
      quality: 80,
    });
  });

  it("keeps a small original and never upscales", () => {
    expect(imageProps(400, undefined, options)).toMatchObject({
      width: 400,
      widths: [400],
      sizes: "(min-width: 400px) 400px, 100vw",
    });
    expect(imageProps(400, 600, options).width).toBe(400);
  });

  it("uses a requested width, capped by maxWidth", () => {
    expect(imageProps(1600, 300, options)).toMatchObject({
      width: 300,
      widths: [300],
    });
    expect(imageProps(3000, 2000, options).width).toBe(1200);
    expect(imageProps(3000, 2000, { ...options, maxWidth: 800 }).width).toBe(
      800
    );
  });
});

describe("remarkImages", () => {
  const dir = mkdtempSync(join(tmpdir(), "starglow-images-"));
  const file = join(dir, "post.md");

  it("sets image properties on local raster images only", async () => {
    writeFileSync(
      join(dir, "big.png"),
      await sharp({
        create: { width: 2000, height: 1000, channels: 3, background: "#000" },
      })
        .png()
        .toBuffer()
    );
    const local = { type: "image", url: "big.png" };
    const sized = {
      type: "image",
      url: "big.png",
      data: { hProperties: { width: 500 } },
    };
    const remote = { type: "image", url: "https://example.org/a.png" };
    const svg = { type: "image", url: "a.svg" };
    const tree = {
      type: "root",
      children: [{ type: "paragraph", children: [local, sized, remote, svg] }],
    };
    await remarkImages(options)(tree, { path: file });
    expect(local).toMatchObject({
      data: { hProperties: { width: 1200, widths: [COLUMN_WIDTH, 1200] } },
    });
    expect(sized).toMatchObject({
      data: { hProperties: { width: 500, widths: [500] } },
    });
    expect(remote).not.toHaveProperty("data");
    expect(svg).not.toHaveProperty("data");
  });
});
