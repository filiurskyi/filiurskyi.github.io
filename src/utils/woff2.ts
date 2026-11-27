import { brotliCompressSync, brotliDecompressSync, constants } from "node:zlib";

const KNOWN_TAGS: string[] =
  "cmapheadhheahmtxmaxpnameOS/2postcvt fpgmglyflocaprepCFF VORGEBDTEBLCgasphdmxkernLTSHPCLTVDMXvheavmtxBASEGDEFGPOSGSUBEBSCJSTFMATHCBDTCBLCCOLRCPALSVG sbixacntavarbdatblocbslncvarfdscfeatfmtxfvargvarhstyjustlcarmortmorxopbdproptrakZapfSilfGlatGlocFeatSill".match(
    /.{4}/g
  ) ?? [];

export type Table = { tag: string; data: Buffer };

const pad4 = (n: number) => (n + 3) & ~3;

class Reader {
  buf: Buffer;
  pos: number;
  constructor(buf: Buffer, start = 0) {
    this.buf = buf;
    this.pos = start;
  }
  u8() {
    return this.buf.readUInt8(this.pos++);
  }
  u16() {
    const v = this.buf.readUInt16BE(this.pos);
    this.pos += 2;
    return v;
  }
  i16() {
    const v = this.buf.readInt16BE(this.pos);
    this.pos += 2;
    return v;
  }
  u32() {
    const v = this.buf.readUInt32BE(this.pos);
    this.pos += 4;
    return v;
  }
  bytes(n: number) {
    const v = this.buf.subarray(this.pos, this.pos + n);
    this.pos += n;
    return v;
  }
  base128() {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const b = this.u8();
      v = v * 128 + (b & 0x7f);
      if (!(b & 0x80)) return v;
    }
    throw new Error("woff2: bad UIntBase128");
  }
  u255() {
    const code = this.u8();
    if (code === 253) return this.u16();
    if (code === 255) return this.u8() + 253;
    if (code === 254) return this.u8() + 506;
    return code;
  }
}

const isGlyfLoca = (tag: string) => tag === "glyf" || tag === "loca";

function checksum(data: Buffer) {
  const padded = Buffer.concat([
    data,
    Buffer.alloc(pad4(data.length) - data.length),
  ]);
  let sum = 0;
  for (let i = 0; i < padded.length; i += 4) {
    sum = (sum + padded.readUInt32BE(i)) >>> 0;
  }
  return sum;
}

export function buildSfnt(tables: Table[], flavor = 0x00010000): Buffer {
  const sorted = [...tables].sort((a, b) => (a.tag < b.tag ? -1 : 1));
  const n = sorted.length;
  const entrySelector = Math.floor(Math.log2(n));
  const searchRange = 2 ** entrySelector * 16;
  const header = Buffer.alloc(12 + 16 * n);
  header.writeUInt32BE(flavor, 0);
  header.writeUInt16BE(n, 4);
  header.writeUInt16BE(searchRange, 6);
  header.writeUInt16BE(entrySelector, 8);
  header.writeUInt16BE(n * 16 - searchRange, 10);
  let offset = header.length;
  const bodies: Buffer[] = [];
  sorted.forEach((t, i) => {
    const at = 12 + 16 * i;
    header.write(t.tag, at, 4, "latin1");
    header.writeUInt32BE(checksum(t.data), at + 4);
    header.writeUInt32BE(offset, at + 8);
    header.writeUInt32BE(t.data.length, at + 12);
    const padded = Buffer.alloc(pad4(t.data.length));
    t.data.copy(padded);
    bodies.push(padded);
    offset += padded.length;
  });
  return Buffer.concat([header, ...bodies]);
}

export function readSfnt(sfnt: Buffer): Table[] {
  const r = new Reader(sfnt, 4);
  const n = r.u16();
  return Array.from({ length: n }, (_, i) => {
    const at = 12 + 16 * i;
    const offset = sfnt.readUInt32BE(at + 8);
    return {
      tag: sfnt.toString("latin1", at, at + 4),
      data: sfnt.subarray(offset, offset + sfnt.readUInt32BE(at + 12)),
    };
  });
}

function triplet(flag: number, r: Reader): [number, number] {
  const sign = (f: number, v: number) => (f & 1 ? v : -v);
  if (flag < 10) return [0, sign(flag, ((flag & 14) << 7) + r.u8())];
  if (flag < 20) return [sign(flag, (((flag - 10) & 14) << 7) + r.u8()), 0];
  if (flag < 84) {
    const b0 = flag - 20;
    const b1 = r.u8();
    return [
      sign(flag, 1 + (b0 & 0x30) + (b1 >> 4)),
      sign(flag >> 1, 1 + ((b0 & 0x0c) << 2) + (b1 & 0x0f)),
    ];
  }
  if (flag < 120) {
    const b0 = flag - 84;
    const x = r.u8();
    const y = r.u8();
    return [
      sign(flag, 1 + (Math.floor(b0 / 12) << 8) + x),
      sign(flag >> 1, 1 + (((b0 % 12) >> 2) << 8) + y),
    ];
  }
  if (flag < 124) {
    const b0 = r.u8();
    const b1 = r.u8();
    const b2 = r.u8();
    return [
      sign(flag, (b0 << 4) + (b1 >> 4)),
      sign(flag >> 1, ((b1 & 0x0f) << 8) + b2),
    ];
  }
  const x = r.u16();
  return [sign(flag, x), sign(flag >> 1, r.u16())];
}

function encodeSimpleGlyph(
  endPts: number[],
  points: { dx: number; dy: number; on: boolean }[],
  instructions: Buffer,
  bbox: number[],
  overlap: boolean
) {
  const flags: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of points) {
    let f = p.on ? 0x01 : 0;
    if (p.dx === 0) f |= 0x10;
    else if (Math.abs(p.dx) < 256) {
      f |= 0x02 | (p.dx > 0 ? 0x10 : 0);
      xs.push(Math.abs(p.dx));
    } else xs.push(0x10000 | (p.dx & 0xffff));
    if (p.dy === 0) f |= 0x20;
    else if (Math.abs(p.dy) < 256) {
      f |= 0x04 | (p.dy > 0 ? 0x20 : 0);
      ys.push(Math.abs(p.dy));
    } else ys.push(0x10000 | (p.dy & 0xffff));
    flags.push(f);
  }
  if (overlap && flags.length) flags[0] |= 0x40;
  const flagBytes: number[] = [];
  for (let i = 0; i < flags.length;) {
    let run = 1;
    while (i + run < flags.length && flags[i + run] === flags[i] && run < 256)
      run++;
    if (run > 1) {
      flagBytes.push(flags[i] | 0x08, run - 1);
    } else flagBytes.push(flags[i]);
    i += run;
  }
  const coord = (vals: number[]) =>
    vals.flatMap(v => (v & 0x10000 ? [(v >> 8) & 0xff, v & 0xff] : [v]));
  const head = Buffer.alloc(10 + 2 * endPts.length + 2);
  head.writeInt16BE(endPts.length, 0);
  bbox.forEach((v, i) => head.writeInt16BE(v, 2 + 2 * i));
  endPts.forEach((v, i) => head.writeUInt16BE(v, 10 + 2 * i));
  head.writeUInt16BE(instructions.length, 10 + 2 * endPts.length);
  return Buffer.concat([
    head,
    instructions,
    Buffer.from(flagBytes),
    Buffer.from(coord(xs)),
    Buffer.from(coord(ys)),
  ]);
}

function compositeLength(buf: Buffer, start: number) {
  let pos = start;
  let instructions = false;
  for (;;) {
    const flags = buf.readUInt16BE(pos);
    pos += 4 + (flags & 0x0001 ? 4 : 2);
    if (flags & 0x0008) pos += 2;
    else if (flags & 0x0040) pos += 4;
    else if (flags & 0x0080) pos += 8;
    if (flags & 0x0100) instructions = true;
    if (!(flags & 0x0020)) return { length: pos - start, instructions };
  }
}

function reconstructGlyf(data: Buffer) {
  const r = new Reader(data);
  r.u16();
  const options = r.u16();
  const numGlyphs = r.u16();
  const indexFormat = r.u16();
  const sizes = Array.from({ length: 7 }, () => r.u32());
  let at = r.pos;
  const streams = sizes.map(size => {
    const s = new Reader(data.subarray(at, at + size));
    at += size;
    return s;
  });
  const [nContour, nPoints, flagS, glyphS, compositeS, bboxS, instrS] = streams;
  const overlapMap =
    options & 1 ? data.subarray(at, at + ((numGlyphs + 7) >> 3)) : null;
  const bboxMap = bboxS.bytes(((numGlyphs + 31) >> 5) << 2);
  const hasBbox = (i: number) => bboxMap[i >> 3] & (0x80 >> (i & 7));
  const glyphs: Buffer[] = [];
  for (let i = 0; i < numGlyphs; i++) {
    const contours = nContour.i16();
    if (contours === 0) {
      glyphs.push(Buffer.alloc(0));
      continue;
    }
    if (contours < 0) {
      const { length, instructions } = compositeLength(
        compositeS.buf,
        compositeS.pos
      );
      const head = Buffer.alloc(10);
      head.writeInt16BE(-1, 0);
      for (let k = 0; k < 4; k++) head.writeInt16BE(bboxS.i16(), 2 + 2 * k);
      const parts = [head, compositeS.bytes(length)];
      if (instructions) {
        const n = glyphS.u255();
        const len = Buffer.alloc(2);
        len.writeUInt16BE(n);
        parts.push(len, instrS.bytes(n));
      }
      glyphs.push(Buffer.concat(parts));
      continue;
    }
    const endPts: number[] = [];
    let total = 0;
    for (let c = 0; c < contours; c++) {
      total += nPoints.u255();
      endPts.push(total - 1);
    }
    const points = [];
    let x = 0;
    let y = 0;
    let xMin = Infinity;
    let yMin = Infinity;
    let xMax = -Infinity;
    let yMax = -Infinity;
    for (let p = 0; p < total; p++) {
      const flag = flagS.u8();
      const [dx, dy] = triplet(flag & 0x7f, glyphS);
      x += dx;
      y += dy;
      xMin = Math.min(xMin, x);
      yMin = Math.min(yMin, y);
      xMax = Math.max(xMax, x);
      yMax = Math.max(yMax, y);
      points.push({ dx, dy, on: !(flag & 0x80) });
    }
    const instructions = instrS.bytes(glyphS.u255());
    const bbox = hasBbox(i)
      ? [bboxS.i16(), bboxS.i16(), bboxS.i16(), bboxS.i16()]
      : [xMin, yMin, xMax, yMax];
    const overlap = overlapMap
      ? Boolean(overlapMap[i >> 3] & (0x80 >> (i & 7)))
      : false;
    glyphs.push(encodeSimpleGlyph(endPts, points, instructions, bbox, overlap));
  }
  const offsets = [0];
  const padded = glyphs.map(g => {
    const out = Buffer.alloc(pad4(g.length));
    g.copy(out);
    offsets.push(offsets[offsets.length - 1] + out.length);
    return out;
  });
  const loca = Buffer.alloc(offsets.length * (indexFormat ? 4 : 2));
  offsets.forEach((o, i) =>
    indexFormat
      ? loca.writeUInt32BE(o, i * 4)
      : loca.writeUInt16BE(o / 2, i * 2)
  );
  return { glyf: Buffer.concat(padded), loca };
}

export function decodeWoff2(woff2: Buffer): Buffer {
  const r = new Reader(woff2);
  if (r.u32() !== 0x774f4632) throw new Error("woff2: bad signature");
  const flavor = r.u32();
  r.u32();
  const numTables = r.u16();
  r.pos = 48;
  const entries = Array.from({ length: numTables }, () => {
    const flags = r.u8();
    const tag =
      (flags & 0x3f) === 0x3f
        ? r.bytes(4).toString("latin1")
        : KNOWN_TAGS[flags & 0x3f];
    const version = flags >> 6;
    const origLength = r.base128();
    const transformed = isGlyfLoca(tag) ? version === 0 : version !== 0;
    const length = transformed ? r.base128() : origLength;
    if (transformed && !isGlyfLoca(tag))
      throw new Error(`woff2: unsupported ${tag} transform`);
    return { tag, transformed, length };
  });
  const stream = brotliDecompressSync(woff2.subarray(r.pos));
  let at = 0;
  const raw = new Map<string, { data: Buffer; transformed: boolean }>();
  for (const e of entries) {
    raw.set(e.tag, {
      data: stream.subarray(at, at + e.length),
      transformed: e.transformed,
    });
    at += e.length;
  }
  const tables: Table[] = [];
  for (const [tag, { data, transformed }] of raw) {
    if (tag === "loca" && transformed) continue;
    if (tag === "glyf" && transformed) {
      const { glyf, loca } = reconstructGlyf(data);
      tables.push({ tag: "glyf", data: glyf }, { tag: "loca", data: loca });
    } else tables.push({ tag, data: Buffer.from(data) });
  }
  return buildSfnt(tables, flavor);
}

const base128 = (n: number) => {
  const out = [n & 0x7f];
  for (n = Math.floor(n / 128); n > 0; n = Math.floor(n / 128))
    out.unshift((n & 0x7f) | 0x80);
  return out;
};

const u255 = (n: number) => {
  if (n < 253) return [n];
  if (n < 506) return [255, n - 253];
  if (n < 762) return [254, n - 506];
  return [253, n >> 8, n & 0xff];
};

function encodeTriplet(
  on: boolean,
  x: number,
  y: number,
  flags: number[],
  out: number[]
) {
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const onBit = on ? 0 : 128;
  const xs = x < 0 ? 0 : 1;
  const ys = y < 0 ? 0 : 1;
  const xy = xs + 2 * ys;
  if (x === 0 && ay < 1280) {
    flags.push(onBit + ((ay & 0xf00) >> 7) + ys);
    out.push(ay & 0xff);
  } else if (y === 0 && ax < 1280) {
    flags.push(onBit + 10 + ((ax & 0xf00) >> 7) + xs);
    out.push(ax & 0xff);
  } else if (ax < 65 && ay < 65) {
    flags.push(onBit + 20 + ((ax - 1) & 0x30) + (((ay - 1) & 0x30) >> 2) + xy);
    out.push((((ax - 1) & 0xf) << 4) | ((ay - 1) & 0xf));
  } else if (ax < 769 && ay < 769) {
    flags.push(
      onBit +
        84 +
        12 * (((ax - 1) & 0x300) >> 8) +
        (((ay - 1) & 0x300) >> 6) +
        xy
    );
    out.push((ax - 1) & 0xff, (ay - 1) & 0xff);
  } else if (ax < 4096 && ay < 4096) {
    flags.push(onBit + 120 + xy);
    out.push(ax >> 4, ((ax & 0xf) << 4) | (ay >> 8), ay & 0xff);
  } else {
    flags.push(onBit + 124 + xy);
    out.push(ax >> 8, ax & 0xff, ay >> 8, ay & 0xff);
  }
}

function transformGlyf(
  glyf: Buffer,
  loca: Buffer,
  numGlyphs: number,
  indexFormat: number
) {
  const offset = (i: number) =>
    indexFormat ? loca.readUInt32BE(i * 4) : loca.readUInt16BE(i * 2) * 2;
  const nContour: number[] = [];
  const nPoints: number[] = [];
  const flagS: number[] = [];
  const glyphS: number[] = [];
  const compositeS: number[] = [];
  const bboxMap = Buffer.alloc(((numGlyphs + 31) >> 5) << 2);
  const bboxS: number[] = [];
  const instrS: number[] = [];
  const overlapMap = Buffer.alloc((numGlyphs + 7) >> 3);
  let overlaps = false;
  const i16 = (v: number) => [(v >> 8) & 0xff, v & 0xff];
  for (let g = 0; g < numGlyphs; g++) {
    const start = offset(g);
    if (offset(g + 1) === start) {
      nContour.push(...i16(0));
      continue;
    }
    const r = new Reader(glyf, start);
    const contours = r.i16();
    const bbox = [r.i16(), r.i16(), r.i16(), r.i16()];
    nContour.push(...i16(contours));
    if (contours < 0) {
      const { length, instructions } = compositeLength(glyf, r.pos);
      compositeS.push(...glyf.subarray(r.pos, r.pos + length));
      r.pos += length;
      bboxMap[g >> 3] |= 0x80 >> (g & 7);
      bboxS.push(...bbox.flatMap(i16));
      if (instructions) {
        const n = r.u16();
        glyphS.push(...u255(n));
        instrS.push(...r.bytes(n));
      }
      continue;
    }
    const endPts = Array.from({ length: contours }, () => r.u16());
    endPts.forEach((e, c) =>
      nPoints.push(...u255(e + 1 - (c ? endPts[c - 1] + 1 : 0)))
    );
    const instructions = r.bytes(r.u16());
    const total = endPts[contours - 1] + 1;
    const flags: number[] = [];
    while (flags.length < total) {
      const f = r.u8();
      flags.push(f);
      if (f & 0x08) for (let k = r.u8(); k > 0; k--) flags.push(f);
    }
    if (flags[0] & 0x40) {
      overlaps = true;
      overlapMap[g >> 3] |= 0x80 >> (g & 7);
    }
    const coords = (short: number, same: number) =>
      flags.map(f =>
        f & short ? (f & same ? r.u8() : -r.u8()) : f & same ? 0 : r.i16()
      );
    const dxs = coords(0x02, 0x10);
    const dys = coords(0x04, 0x20);
    let x = 0;
    let y = 0;
    const box = [Infinity, Infinity, -Infinity, -Infinity];
    for (let p = 0; p < total; p++) {
      x += dxs[p];
      y += dys[p];
      box[0] = Math.min(box[0], x);
      box[1] = Math.min(box[1], y);
      box[2] = Math.max(box[2], x);
      box[3] = Math.max(box[3], y);
      encodeTriplet(Boolean(flags[p] & 0x01), dxs[p], dys[p], flagS, glyphS);
    }
    glyphS.push(...u255(instructions.length));
    instrS.push(...instructions);
    if (box.some((v, k) => v !== bbox[k])) {
      bboxMap[g >> 3] |= 0x80 >> (g & 7);
      bboxS.push(...bbox.flatMap(i16));
    }
  }
  const streams = [
    nContour,
    nPoints,
    flagS,
    glyphS,
    compositeS,
    [...bboxMap, ...bboxS],
    instrS,
  ];
  const header = Buffer.alloc(36);
  header.writeUInt16BE(overlaps ? 1 : 0, 2);
  header.writeUInt16BE(numGlyphs, 4);
  header.writeUInt16BE(indexFormat, 6);
  streams.forEach((s, k) => header.writeUInt32BE(s.length, 8 + 4 * k));
  return Buffer.concat([
    header,
    ...streams.map(s => Buffer.from(s)),
    ...(overlaps ? [overlapMap] : []),
  ]);
}

export function encodeWoff2(sfnt: Buffer): Buffer {
  const tables = readSfnt(sfnt).sort((a, b) => (a.tag < b.tag ? -1 : 1));
  const find = (tag: string) => tables.find(t => t.tag === tag)?.data;
  const glyf = find("glyf");
  const loca = find("loca");
  const head = find("head");
  const maxp = find("maxp");
  if (glyf && loca) {
    tables.splice(
      tables.findIndex(t => t.tag === "loca"),
      1
    );
    tables.splice(tables.findIndex(t => t.tag === "glyf") + 1, 0, {
      tag: "loca",
      data: loca,
    });
  }
  const transformed =
    glyf && loca && head && maxp
      ? transformGlyf(glyf, loca, maxp.readUInt16BE(4), head.readInt16BE(50))
      : null;
  const directory: number[] = [];
  const stream: Buffer[] = [];
  for (const t of tables) {
    const known = KNOWN_TAGS.indexOf(t.tag);
    const version = isGlyfLoca(t.tag) && !transformed ? 0xc0 : 0;
    if (known >= 0) directory.push(known | version);
    else directory.push(0x3f | version, ...Buffer.from(t.tag, "latin1"));
    directory.push(...base128(t.data.length));
    if (transformed && t.tag === "glyf") {
      directory.push(...base128(transformed.length));
      stream.push(transformed);
    } else if (transformed && t.tag === "loca") directory.push(...base128(0));
    else stream.push(t.data);
  }
  const data = Buffer.concat(stream);
  const compressed = brotliCompressSync(data, {
    params: {
      [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_FONT,
      [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
      [constants.BROTLI_PARAM_LGWIN]: constants.BROTLI_MAX_WINDOW_BITS,
      [constants.BROTLI_PARAM_SIZE_HINT]: data.length,
    },
  });
  const headerLength = 48 + directory.length;
  const length = pad4(headerLength + compressed.length);
  const header = Buffer.alloc(48);
  header.writeUInt32BE(0x774f4632, 0);
  header.writeUInt32BE(sfnt.readUInt32BE(0), 4);
  header.writeUInt32BE(length, 8);
  header.writeUInt16BE(tables.length, 12);
  header.writeUInt32BE(
    12 +
      16 * tables.length +
      tables.reduce((s, t) => s + pad4(t.data.length), 0),
    16
  );
  header.writeUInt32BE(compressed.length, 20);
  header.writeUInt16BE(1, 24);
  const out = Buffer.alloc(length);
  header.copy(out);
  Buffer.from(directory).copy(out, 48);
  compressed.copy(out, headerLength);
  return out;
}

export function cmapCodepoints(sfnt: Buffer): number[] {
  const cmap = readSfnt(sfnt).find(t => t.tag === "cmap")?.data;
  if (!cmap) return [];
  const r = new Reader(cmap, 2);
  const subtables = Array.from({ length: r.u16() }, () => ({
    platform: r.u16(),
    encoding: r.u16(),
    offset: r.u32(),
  }));
  const pick =
    subtables.find(s => s.platform === 3 && s.encoding === 10) ??
    subtables.find(s => s.platform === 3 && s.encoding === 1) ??
    subtables.find(s => s.platform === 0);
  if (!pick) return [];
  const t = new Reader(cmap, pick.offset);
  const format = t.u16();
  const cps = new Set<number>();
  if (format === 12) {
    t.pos += 10;
    const groups = t.u32();
    for (let g = 0; g < groups; g++) {
      const start = t.u32();
      const end = t.u32();
      const gid = t.u32();
      for (let c = start; c <= end; c++) if (gid + c - start) cps.add(c);
    }
  } else if (format === 4) {
    t.pos += 4;
    const segs = t.u16() / 2;
    const base = t.pos + 6;
    const at = (table: number, i: number) =>
      cmap.readUInt16BE(base + table * segs * 2 + (table ? 2 : 0) + i * 2);
    for (let i = 0; i < segs; i++) {
      const end = at(0, i);
      const start = at(1, i);
      const delta = at(2, i);
      const rangeOffset = at(3, i);
      for (let c = start; c <= end && c !== 0xffff; c++) {
        let gid: number;
        if (rangeOffset === 0) gid = (c + delta) & 0xffff;
        else {
          const pos =
            base + 3 * segs * 2 + 2 + i * 2 + rangeOffset + (c - start) * 2;
          const raw = cmap.readUInt16BE(pos);
          gid = raw ? (raw + delta) & 0xffff : 0;
        }
        if (gid) cps.add(c);
      }
    }
  } else throw new Error(`cmap format ${format} is not supported`);
  return [...cps].sort((a, b) => a - b);
}
