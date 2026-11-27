import { dirname, resolve } from "node:path";
import sharp from "sharp";
import type { ParsedStarglowConfig } from "../types/config";

export const COLUMN_WIDTH = 576;

const RASTER = /\.(png|jpe?g|webp|avif|gif|tiff?)$/i;

type ImageOptions = ParsedStarglowConfig["images"];
type Node = {
  type: string;
  url?: string;
  data?: { hProperties?: Record<string, unknown> };
  children?: Node[];
};

export function imageProps(
  natural: number,
  requested: number | undefined,
  options: ImageOptions
) {
  const width = Math.min(requested ?? natural, natural, options.maxWidth);
  const shown = Math.min(width, COLUMN_WIDTH);
  return {
    width,
    widths: [...new Set([shown, width])],
    sizes: `(min-width: ${shown}px) ${shown}px, 100vw`,
    format: options.format,
    quality: options.quality,
  };
}

const images = (node: Node): Node[] =>
  node.type === "image" ? [node] : (node.children ?? []).flatMap(images);

const isLocalRaster = (url: string) =>
  RASTER.test(url) && !URL.canParse(url) && !url.startsWith("/");

export function remarkImages(options: ImageOptions) {
  return async (tree: Node, file: { path?: string }) => {
    const path = file.path;
    if (!path) return;
    await Promise.all(
      images(tree)
        .filter(node => isLocalRaster(node.url ?? ""))
        .map(async node => {
          const meta = await sharp(
            resolve(dirname(path), decodeURI(node.url ?? ""))
          ).metadata();
          const natural = meta.autoOrient?.width ?? meta.width;
          const requested = Number(node.data?.hProperties?.width) || undefined;
          node.data = {
            ...node.data,
            hProperties: {
              ...node.data?.hProperties,
              ...imageProps(natural, requested, options),
            },
          };
        })
    );
  };
}
