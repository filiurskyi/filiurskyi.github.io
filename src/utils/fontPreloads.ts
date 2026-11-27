import type { FontData } from "astro:assets";

type FaceFilter = { weight?: string; style?: string };

export function corePreloads(
  faces: readonly FontData[] = [],
  filters: readonly FaceFilter[] = [{}]
) {
  const seen = new Set<string>();
  return faces.flatMap(face => {
    const key = `${face.weight} ${face.style}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const src = face.src[0];
    const wanted = filters.some(
      f =>
        (f.weight === undefined || f.weight === face.weight) &&
        (f.style === undefined || f.style === face.style)
    );
    return wanted && src ? [{ url: src.url, type: src.format ?? "woff2" }] : [];
  });
}
