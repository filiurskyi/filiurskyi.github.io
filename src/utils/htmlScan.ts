/** A numeric character reference; an out-of-range value reads as U+FFFD. */
function fromCodePoint(value: number): string {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff
    ? String.fromCodePoint(value)
    : "\uFFFD";
}

export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec: string) => fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Value of one attribute of an opening tag, entities decoded, or undefined.
 * Attributes are read in order with their quoted values consumed whole, so
 * `name=` text inside another attribute's value stays part of that value.
 */
export function attr(tag: string, name: string): string | undefined {
  const wanted = name.toLowerCase();
  const rest = tag.replace(/^<[^\s>/]+/, "");
  for (const [, key, double, single, bare] of rest.matchAll(
    /[\s/]+([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))|[\s/]+[^\s"'<>/=]+/g
  )) {
    if (key?.toLowerCase() !== wanted) continue;
    const value = double ?? single ?? bare;
    return value === undefined ? undefined : decodeEntities(value);
  }
  return undefined;
}

export function relations(tag: string): string[] {
  return (attr(tag, "rel") ?? "").toLowerCase().split(/\s+/);
}

/** The rest of an opening tag: a quoted value may hold `<` and `>`. */
const TAG_REST = String.raw`(?:[^>"']|"[^"]*"|'[^']*')*`;

/**
 * Removes whole elements by name. Tags are consumed one at a time with their
 * quoted values, so `<script>` text inside an attribute stays attribute text.
 */
function removeElements(html: string, names: string[]): string {
  const pattern = new RegExp(
    String.raw`<!--[\s\S]*?-->|<(${names.join("|")})\b${TAG_REST}>[\s\S]*?<\/\1\s*>|<[a-z][a-z0-9-]*\b${TAG_REST}>`,
    "gi"
  );
  return html.replace(pattern, (match, name: string | undefined) =>
    name ? "" : match
  );
}

/** Page markup with the contents of script, style, template and noscript removed. */
export function visibleMarkup(html: string): string {
  return removeElements(html, ["script", "style", "template", "noscript"]);
}

export function plainText(markup: string): string {
  return decodeEntities(markup.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

export function headOf(html: string): string {
  const open = new RegExp(String.raw`<head\b${TAG_REST}>`, "i").exec(html);
  if (!open) return "";
  const rest = removeElements(html.slice(open.index + open[0].length), [
    "script",
    "style",
  ]);
  const end = new RegExp(
    String.raw`<[a-z][a-z0-9-]*\b${TAG_REST}>|<\/head\s*>`,
    "gi"
  );
  for (const match of rest.matchAll(end))
    if (match[0].startsWith("</")) return rest.slice(0, match.index);
  return "";
}

export function footerOf(html: string): string {
  return /<footer\b[\s\S]*?<\/footer>/i.exec(html)?.[0] ?? "";
}

/** The `data-badge` types of the badges in some markup. */
export function badgeTypesIn(markup: string): Set<string> {
  return new Set(
    [
      ...markup.matchAll(
        new RegExp(String.raw`<[a-z][a-z0-9-]*\b${TAG_REST}>`, "gi")
      ),
    ]
      .map(([tag]) => attr(tag, "data-badge"))
      .filter((type): type is string => Boolean(type))
  );
}

export type Meta = { key: string; content: string };

export function metaTags(head: string): Meta[] {
  const metas: Meta[] = [];
  for (const [tag] of head.matchAll(
    new RegExp(String.raw`<meta\b${TAG_REST}>`, "gi")
  )) {
    const key = attr(tag, "property") ?? attr(tag, "name");
    if (key) metas.push({ key, content: attr(tag, "content") ?? "" });
  }
  return metas;
}

export type PageTag = {
  tag: string;
  name: string;
  body?: string;
};

const PAGE_ELEMENTS = new RegExp(
  String.raw`<!--[\s\S]*?-->|(<(script|style)\b${TAG_REST}>)([\s\S]*?)<\/\2\s*>|(<[a-z][a-z0-9-]*\b${TAG_REST}>)`,
  "gi"
);

/** The opening tags of a page outside comments, script text and style text. */
export function pageTags(html: string): PageTag[] {
  const tags: PageTag[] = [];
  for (const [, textTag, , body, plainTag] of html.matchAll(PAGE_ELEMENTS)) {
    const tag = textTag ?? plainTag;
    if (tag === undefined) continue;
    const name = /^<([a-z][a-z0-9-]*)/i.exec(tag)?.[1]?.toLowerCase() ?? "";
    tags.push({ tag, name, body: textTag === undefined ? undefined : body });
  }
  return tags;
}
