import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { cmapCodepoints, decodeWoff2, encodeWoff2 } from "./woff2.ts";

const codepoints = (spec: string) =>
  spec.split(" ").flatMap(part => {
    const [from, to = from] = part.split("-").map(h => parseInt(h, 16));
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  });

export const CORE_CODEPOINTS: readonly number[] = codepoints(
  "20-7e a0 a9 ab ae b0 b7 bb e1 e9 2013-2014 2018-2019 201c-201d 2022 2026 2122 2212"
);

export function unicodeRange(
  codepoints: readonly number[]
): [string, ...string[]] {
  const sorted = [...new Set(codepoints)].sort((a, b) => a - b);
  const hex = (n: number) => n.toString(16).toUpperCase();
  const out: string[] = [];
  for (let i = 0; i < sorted.length;) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    out.push(
      i === j ? `U+${hex(sorted[i])}` : `U+${hex(sorted[i])}-${hex(sorted[j])}`
    );
    i = j + 1;
  }
  if (!out.length) throw new Error("unicodeRange: no codepoints");
  return out as [string, ...string[]];
}

export function fontUnicodeRange(woff2Path: string): [string, ...string[]] {
  return unicodeRange(cmapCodepoints(decodeWoff2(readFileSync(woff2Path))));
}

type HbExports = {
  memory: WebAssembly.Memory;
  malloc(n: number): number;
  free(p: number): void;
  hb_blob_create(
    p: number,
    n: number,
    mode: number,
    u: number,
    d: number
  ): number;
  hb_blob_destroy(b: number): void;
  hb_blob_get_data(b: number, n: number): number;
  hb_blob_get_length(b: number): number;
  hb_face_create(b: number, i: number): number;
  hb_face_destroy(f: number): void;
  hb_face_reference_blob(f: number): number;
  hb_set_add(s: number, v: number): void;
  hb_set_clear(s: number): void;
  hb_set_invert(s: number): void;
  hb_subset_input_create_or_fail(): number;
  hb_subset_input_destroy(i: number): void;
  hb_subset_input_set(i: number, kind: number): number;
  hb_subset_or_fail(f: number, i: number): number;
};

let hb: Promise<HbExports> | undefined;

function harfbuzz() {
  hb ??= (async () => {
    const wasm = readFileSync(
      createRequire(import.meta.url).resolve("harfbuzzjs/hb-subset.wasm")
    );
    const { instance } = await WebAssembly.instantiate(wasm);
    return instance.exports as unknown as HbExports;
  })();
  return hb;
}

const HB_SET_UNICODE = 1;
const HB_SET_NAME_ID = 4;
const HB_SET_NAME_LANG_ID = 5;
const HB_SET_LAYOUT_FEATURE_TAG = 6;

export async function subsetSfnt(
  sfnt: Buffer,
  codepoints: readonly number[],
  invert = false
): Promise<Buffer> {
  const ex = await harfbuzz();
  const ptr = ex.malloc(sfnt.length);
  new Uint8Array(ex.memory.buffer).set(sfnt, ptr);
  const blob = ex.hb_blob_create(ptr, sfnt.length, 2, 0, 0);
  const face = ex.hb_face_create(blob, 0);
  ex.hb_blob_destroy(blob);
  const input = ex.hb_subset_input_create_or_fail();
  const unicodes = ex.hb_subset_input_set(input, HB_SET_UNICODE);
  for (const cp of codepoints) ex.hb_set_add(unicodes, cp);
  if (invert) ex.hb_set_invert(unicodes);
  for (const kind of [
    HB_SET_NAME_ID,
    HB_SET_NAME_LANG_ID,
    HB_SET_LAYOUT_FEATURE_TAG,
  ]) {
    const set = ex.hb_subset_input_set(input, kind);
    ex.hb_set_clear(set);
    ex.hb_set_invert(set);
  }
  const subset = ex.hb_subset_or_fail(face, input);
  ex.hb_subset_input_destroy(input);
  try {
    if (!subset) throw new Error("harfbuzz: subsetting failed");
    const result = ex.hb_face_reference_blob(subset);
    const at = ex.hb_blob_get_data(result, 0);
    const out = Buffer.from(
      new Uint8Array(ex.memory.buffer, at, ex.hb_blob_get_length(result))
    );
    ex.hb_blob_destroy(result);
    if (!out.length) throw new Error("harfbuzz: empty subset");
    return out;
  } finally {
    if (subset) ex.hb_face_destroy(subset);
    ex.hb_face_destroy(face);
    ex.free(ptr);
  }
}

export const FONT_DIR = "src/assets/fonts";
export const SUBSET_DIR = `${FONT_DIR}/subsets`;
export const SUBSET_PARTS = ["core", "rest"] as const;

export const subsetPath = (name: string, part: (typeof SUBSET_PARTS)[number]) =>
  `${SUBSET_DIR}/${name}-${part}.woff2`;

export async function splitFont(woff2: Buffer) {
  const sfnt = decodeWoff2(woff2);
  return {
    core: encodeWoff2(await subsetSfnt(sfnt, CORE_CODEPOINTS)),
    rest: encodeWoff2(await subsetSfnt(sfnt, CORE_CODEPOINTS, true)),
  };
}

export function splitVariant(
  name: string,
  weight: number,
  style: "normal" | "italic"
) {
  const face = (part: (typeof SUBSET_PARTS)[number]) => ({
    weight,
    style,
    src: [`./${subsetPath(name, part)}`] as [string],
    unicodeRange: fontUnicodeRange(subsetPath(name, part)),
  });
  return [face("core"), face("rest")] as const;
}
