export type SizeClub = {
  type: string;
  name: string;
  limit: number;
  compressed: boolean;
};
export const SIZE_CLUBS: SizeClub[] = [
  {
    type: "512kb-green",
    name: "512kb club green team",
    limit: 100_000,
    compressed: false,
  },
  {
    type: "512kb-orange",
    name: "512kb club orange team",
    limit: 250_000,
    compressed: false,
  },
  {
    type: "512kb-blue",
    name: "512kb club blue team",
    limit: 512_000,
    compressed: false,
  },
  { type: "250kb", name: "250kb club", limit: 256_000, compressed: true },
  { type: "1mb", name: "1mb club", limit: 1_000_000, compressed: false },
];

export const sizeClub = (type: string): SizeClub | undefined =>
  SIZE_CLUBS.find(club => club.type === type);

export type PageWeight = { raw: number; gzip: number };

export const LOADING_RELATIONS = [
  "stylesheet",
  "icon",
  "apple-touch-icon",
  "preload",
  "modulepreload",
];

const kb = (bytes: number) => `${(bytes / 1000).toFixed(1)} KB`;

const fits = (club: SizeClub, weight: PageWeight) =>
  (club.compressed ? weight.gzip : weight.raw) < club.limit;
export function sizeClubProblem(
  club: SizeClub,
  weight: PageWeight
): string | undefined {
  if (fits(club, weight)) return undefined;
  const measured = club.compressed
    ? `${kb(weight.gzip)} gzip`
    : `${kb(weight.raw)} uncompressed`;
  const fitting = SIZE_CLUBS.find(other => fits(other, weight));
  return `the homepage loads ${measured}, over the ${kb(club.limit)} of the ${club.name}; ${
    fitting
      ? `it fits the ${fitting.name} (${fitting.type})`
      : "it fits no size club"
  }`;
}
export function parseUnicodeRange(value: string): [number, number][] {
  const ranges: [number, number][] = [];
  for (const part of value.split(",")) {
    const token = part.trim().replace(/^u\+/i, "");
    if (!token) continue;
    const [start = "", end] = token.split("-");
    if (end !== undefined) {
      ranges.push([parseInt(start, 16), parseInt(end, 16)]);
    } else if (start.includes("?")) {
      ranges.push([
        parseInt(start.replace(/\?/g, "0"), 16),
        parseInt(start.replace(/\?/g, "f"), 16),
      ]);
    } else {
      const point = parseInt(start, 16);
      ranges.push([point, point]);
    }
  }
  return ranges.filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
}
export function rangesMatch(
  ranges: [number, number][],
  codePoints: Set<number>
): boolean {
  if (ranges.length === 0) return codePoints.size > 0;
  for (const point of codePoints)
    if (ranges.some(([a, b]) => point >= a && point <= b)) return true;
  return false;
}
export function cssUrls(css: string): string[] {
  return [...css.matchAll(/url\(\s*(["']?)([^"')]+?)\1\s*\)/gi)].map(
    ([, , url = ""]) => url
  );
}
export function cssSubresources(css: string): string[] {
  const imports = [...css.matchAll(/@import\s+(["'])([^"']+)\1/gi)].map(
    ([, , url = ""]) => url
  );
  return [...imports, ...cssUrls(css)].filter(
    url => url && !url.startsWith("data:")
  );
}
export function cssRequests(css: string, codePoints: Set<number>): string[] {
  const requests: string[] = [];
  const rest = css.replace(/@font-face\s*\{[^}]*\}/gi, face => {
    const range = /unicode-range\s*:\s*([^;}]+)/i.exec(face)?.[1] ?? "";
    if (rangesMatch(parseUnicodeRange(range), codePoints))
      requests.push(...cssUrls(face));
    return "";
  });
  requests.push(...cssSubresources(rest));
  return requests.filter(url => !url.startsWith("data:"));
}
export function scriptImports(js: string): string[] {
  return [...js.matchAll(/(?:\bfrom|\bimport)\s*(["'`])([^"'`\n]+)\1/g)].map(
    ([, , url = ""]) => url
  );
}
export function codePointsOf(text: string): Set<number> {
  const points = new Set<number>();
  for (const char of text) points.add(char.codePointAt(0) ?? 0);
  return points;
}
