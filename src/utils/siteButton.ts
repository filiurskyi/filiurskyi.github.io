import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { BADGE_ICONS, BADGE_TEXT, badgeIcon, badgeRects } from "@/utils/badges";
import { isPlaceholder } from "@/utils/markers";
import { codePointCoverage } from "@/utils/og/fontCoverage";
import { cmapCodepoints, decodeWoff2, readSfnt } from "@/utils/woff2";

export const BUTTON_WIDTH = 88;
export const BUTTON_HEIGHT = 31;
const FONT_SIZE = 10;
const TEXT_CANVAS = 400;

type ButtonConfig = { label: string; icon: string | string[] };

const PNG_SIGNATURE = "89504e470d0a1a0a";

/** Width and height from a PNG's IHDR chunk, or undefined if it is no PNG. */
export function pngSize(data: Uint8Array): [number, number] | undefined {
  const bytes = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  if (bytes.length < 24) return undefined;
  if (bytes.subarray(0, 8).toString("hex") !== PNG_SIGNATURE) return undefined;
  if (bytes.subarray(12, 16).toString("latin1") !== "IHDR") return undefined;
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

/**
 * Bytes of a button image under public/, given as a site path such as
 * "/button.png". Throws unless the file exists and is an 88x31 PNG.
 */
export async function readButtonImage(
  path: string,
  key = "button.image",
  root = process.cwd()
): Promise<Buffer> {
  const file = join(root, "public", path);
  let data: Buffer;
  try {
    data = await readFile(file);
  } catch {
    throw new Error(`[button] ${key} "${path}": public${path} is missing`);
  }
  const size = pngSize(data);
  if (!size)
    throw new Error(`[button] ${key} "${path}": public${path} is not a PNG`);
  if (size[0] !== BUTTON_WIDTH || size[1] !== BUTTON_HEIGHT)
    throw new Error(
      `[button] ${key} "${path}": public${path} is ${size[0]}x${size[1]}, expected ${BUTTON_WIDTH}x${BUTTON_HEIGHT}`
    );
  return data;
}

export function buttonIcon(icon: ButtonConfig["icon"]): {
  bitmap: string[];
  fill: string;
} {
  if (Array.isArray(icon)) return { bitmap: icon, fill: "--badge-link" };
  const known = Object.hasOwn(BADGE_ICONS, icon);
  return {
    bitmap: badgeIcon(icon).bitmap,
    fill: `--badge-${known ? icon : "link"}`,
  };
}

export const buttonText = (label: string): string =>
  isPlaceholder(label) ? "[[TODO]]" : label;

export function themeTokens(css: string): Map<string, string> {
  return new Map(
    [
      ...css.matchAll(/(--b-[\w-]+|--badge-[\w-]+):\s*(#[0-9a-f]{3,8})\b/gi),
    ].map(([, name = "", value = ""]) => [name, value])
  );
}

export function textBounds(
  alpha: Uint8Array,
  width: number,
  height: number
): [number, number] | undefined {
  let first = -1;
  let last = -1;
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      if ((alpha[y * width + x] ?? 0) === 0) continue;
      if (first === -1) first = x;
      last = x;
      break;
    }
  }
  return first === -1 ? undefined : [first, last + 1];
}

async function loadFonts() {
  const dir = join(process.cwd(), "src/assets/fonts");
  const pixel = decodeWoff2(
    await readFile(join(dir, "pixelify-sans-latin-400-normal.woff2"))
  );
  const fallbacks = await Promise.all(
    ["inter-latin-400-normal.woff", "inter-cyrillic-400-normal.woff"].map(
      file => readFile(join(dir, file))
    )
  );
  const tables = new Map(readSfnt(pixel).map(table => [table.tag, table.data]));
  const head = tables.get("head");
  const hhea = tables.get("hhea");
  if (!head || !hhea) throw new Error("[button] wordmark font has no metrics");
  const unitsPerEm = head.readUInt16BE(18);
  const ascent = hhea.readInt16BE(4) / unitsPerEm;
  const descent = hhea.readInt16BE(6) / unitsPerEm;
  const fonts = [pixel, ...fallbacks];
  const pixelPoints = new Set(cmapCodepoints(pixel));
  const lookups = [
    (codePoint: number) => pixelPoints.has(codePoint),
    ...fallbacks.map(font => codePointCoverage(font)),
  ];
  return {
    fonts: fonts.map((data, index) => ({
      name: ["Pixelify Sans", "Inter", "Inter Cyrillic"][index] ?? "Inter",
      data,
      weight: 400 as const,
      style: "normal" as const,
    })),
    ascent,
    lineHeight: ascent - descent,
    covers: (codePoint: number) => lookups.some(lookup => lookup(codePoint)),
  };
}

async function renderText(text: string, colour: string) {
  const { fonts, ascent, lineHeight, covers } = await loadFonts();
  for (const character of text) {
    if (/\s/u.test(character) || covers(character.codePointAt(0) ?? 0))
      continue;
    throw new Error(
      `[button] button.label "${text}" holds "${character}", which the vendored fonts cannot draw`
    );
  }
  const svg = await satori(
    {
      type: "div",
      key: null,
      props: {
        style: { display: "flex", width: TEXT_CANVAS, height: BUTTON_HEIGHT },
        children: {
          type: "div",
          key: null,
          props: {
            style: {
              position: "absolute",
              left: 0,
              top: Math.round(BADGE_TEXT.y - ascent * FONT_SIZE),
              fontFamily: "Pixelify Sans, Inter, Inter Cyrillic",
              fontSize: FONT_SIZE,
              lineHeight: `${lineHeight * FONT_SIZE}px`,
              color: colour,
              whiteSpace: "nowrap",
            },
            children: text,
          },
        },
      },
    } as Parameters<typeof satori>[0],
    { width: TEXT_CANVAS, height: BUTTON_HEIGHT, fonts }
  );
  const { data } = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .extractChannel("alpha")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bounds = textBounds(new Uint8Array(data), TEXT_CANVAS, BUTTON_HEIGHT);
  if (!bounds) throw new Error(`[button] button.label "${text}" draws nothing`);
  const [left, right] = bounds;
  const layer = sharp(Buffer.from(svg)).extract({
    left,
    top: 0,
    width: right - left,
    height: BUTTON_HEIGHT,
  });
  const width =
    text.length > BADGE_TEXT.squeezeAbove
      ? Math.min(right - left, BADGE_TEXT.width)
      : right - left;
  const input = await layer
    .resize({ width, height: BUTTON_HEIGHT, fit: "fill" })
    .png()
    .toBuffer();
  return { input, left: Math.round(BADGE_TEXT.x - width / 2), top: 0 };
}

export async function renderButton(button: ButtonConfig): Promise<Buffer> {
  const tokens = themeTokens(
    await readFile(join(process.cwd(), "src/styles/site-theme.css"), "utf8")
  );
  const colour = (name: string) => {
    const value = tokens.get(name);
    if (!value) throw new Error(`[button] site-theme.css has no ${name}`);
    return value;
  };
  const { bitmap, fill } = buttonIcon(button.icon);
  const rects = badgeRects(bitmap, fill)
    .map(
      ({ x, y, width, height, fill: token }) =>
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${colour(token)}"/>`
    )
    .join("");
  const frame = `<svg xmlns="http://www.w3.org/2000/svg" width="${BUTTON_WIDTH}" height="${BUTTON_HEIGHT}" shape-rendering="crispEdges">${rects}</svg>`;
  const text = await renderText(buttonText(button.label), colour("--b-text"));
  return sharp(Buffer.from(frame))
    .composite([text])
    .png({ compressionLevel: 9 })
    .toBuffer();
}
