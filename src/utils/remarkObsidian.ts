/**
 * Obsidian-flavoured Markdown for `.md` content, applied to the source right
 * before remark parses it (the file on disk is never rewritten). Enabled by
 * `features.obsidian`.
 *
 * - `%%comments%%` are removed (an unclosed one runs to the end, as in Obsidian)
 * - `[[Note]]`, `[[Note#Heading|text]]` link to the matching post, note or
 *   project (file name, title or alias, case-insensitive), else plain text
 * - `![[img.png|alt|400]]` becomes `![alt](_assets/img.png)` at most 400px
 *   wide (the height of `400x300` is ignored), alt text is required,
 *   `![[Note]]` renders as a wikilink
 *
 * Fenced code blocks and inline code spans are left alone, and so are
 * placeholder markers (scripts/check-markers.ts reports them).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { parseFrontmatter } from "@astrojs/markdown-remark";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { entryTimezone, withCalendarDays } from "./calendarDate";
import { resolveTimezone } from "./resolveTimezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type Options = { timezone?: string };
type Target = { url: string };
type Index = { names: Map<string, Target>; titles: Map<string, Target> };

const state = { root: process.cwd(), base: "", production: false };

/** Records the project root, base path and whether this is a production build. */
export const obsidianIntegration = (): AstroIntegration => ({
  name: "obsidian-markdown",
  hooks: {
    "astro:config:setup": ({ command, config }) => {
      state.root = fileURLToPath(config.root);
      state.base = config.base.replace(/\/+$/, "");
      state.production = command === "build";
    },
  },
});

const IMAGE = /\.(png|jpe?g|gif|webp|avif|svg|tiff?)$/i;
const SIZE = /^\d+(x\d+)?$/;
const WIDTH_MARK = "#obsidian-width=";
const FENCE = /^(?:[ \t]*>)*[ \t]*(`{3,}|~{3,})/;
const PARAGRAPH = /[^\n]*\S[^\n]*(?:\n[^\n]*\S[^\n]*)*/g;
const TOKEN =
  /(\\?\[\\?\[TODO\b(?:(?!\\?\]\\?\])[\s\S])*\\?\]\\?\])|%%[\s\S]*?(?:%%|$)|(?<!\\)(!?)\[\[([^[\]\n\0]+)\]\]/g;
const SLUG = "([a-z0-9]+(?:-[a-z0-9]+)*)";
const SOURCES = [
  {
    dir: "blog",
    entry: new RegExp(`^(\\d{4})/${SLUG}\\.mdx?$`),
    url: "/blog/$1/$2/",
  },
  {
    dir: "notes",
    entry: new RegExp(`^(\\d{4})/${SLUG}\\.mdx?$`),
    url: "/notes/$1/$2/",
  },
  {
    dir: "projects",
    entry: new RegExp(`^${SLUG}\\.md$`),
    url: "/projects/$1/",
  },
];

const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Heading id as github-slugger (used by Astro) builds it. */
const headingId = (heading: string): string =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");

const escapeMarkdown = (text: string): string =>
  text.replace(/[\\`*_[\]<>!#|~&]/g, "\\$&");

/** Same length as `text`, with code spans and fenced blocks replaced by NUL. */
function maskCode(text: string): string {
  let fence: string | undefined;
  const lines = text.split("\n").map(line => {
    const open = FENCE.exec(line)?.[1];
    if (fence) {
      if (
        open?.[0] === fence[0] &&
        open.length >= fence.length &&
        line.trim().endsWith(open)
      )
        fence = undefined;
      return "\0".repeat(line.length);
    }
    if (open) {
      fence = open;
      return "\0".repeat(line.length);
    }
    return line;
  });
  return lines.join("\n").replace(PARAGRAPH, paragraph => {
    let out = "";
    for (let i = 0; i < paragraph.length;) {
      if (paragraph[i] === "\\") {
        out += paragraph.slice(i, i + 2);
        i += 2;
        continue;
      }
      if (paragraph[i] !== "`") {
        out += paragraph[i++];
        continue;
      }
      const run = /^`+/.exec(paragraph.slice(i))![0];
      const close = new RegExp(`(?<!\`)${run}(?!\`)`, "g");
      close.lastIndex = i + run.length;
      const end = close.exec(paragraph);
      const stop = end ? end.index + run.length : i + run.length;
      out += end
        ? paragraph.slice(i, stop).replace(/[^\n]/g, "\0")
        : paragraph.slice(i, stop);
      i = stop;
    }
    return out;
  });
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/\.mdx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

/** Visible in this build: drafts and future posts only in dev. */
function isPublished(
  dir: string,
  data: Record<string, unknown>,
  source: string,
  siteTimezone?: string
): boolean {
  if (!state.production) return true;
  if (data.draft === true) return false;
  if (dir !== "blog") return true;
  const tz = resolveTimezone(entryTimezone(data, siteTimezone));
  const raw = withCalendarDays(data, source, tz).pubDatetime as string | Date;
  const published = dayjs(raw);
  return (
    !published.isValid() ||
    !published.tz(tz).startOf("day").isAfter(dayjs().tz(tz).startOf("day"))
  );
}

let cached: { key: string; index: Index } | undefined;

function loadIndex(siteTimezone?: string): Index {
  const files = SOURCES.flatMap(source =>
    walk(join(state.root, "src/content", source.dir)).map(path => ({
      source,
      path,
    }))
  );
  const key = `${state.production}:${state.base}:${files.map(f => `${f.path}@${statSync(f.path).mtimeMs}`).join("|")}`;
  if (cached?.key === key) return cached.index;

  const index: Index = { names: new Map(), titles: new Map() };
  for (const { source, path } of files) {
    const entry = relative(join(state.root, "src/content", source.dir), path)
      .split(sep)
      .join("/");
    if (!source.entry.test(entry)) continue;
    const text = readFileSync(path, "utf8");
    let data: Record<string, unknown>;
    try {
      data = parseFrontmatter(text).frontmatter;
    } catch {
      continue;
    }
    if (!isPublished(source.dir, data, text, siteTimezone)) continue;
    const target = {
      url: state.base + entry.replace(source.entry, source.url),
    };
    const name = basename(path).replace(/\.mdx?$/, "");
    if (!index.names.has(name)) index.names.set(name, target);
    const aliases = Array.isArray(data.aliases) ? data.aliases : [];
    for (const title of [data.title, ...aliases]) {
      const k = typeof title === "string" && title.trim().toLowerCase();
      if (k && !index.titles.has(k)) index.titles.set(k, target);
    }
  }
  cached = { key, index };
  return index;
}

function resolve(index: Index, note: string): Target | undefined {
  const name = basename(note.replace(/\\/g, "/"))
    .replace(/\.mdx?$/i, "")
    .trim()
    .toLowerCase();
  return (
    index.names.get(name) ??
    index.titles.get(name) ??
    index.names.get(slugify(name))
  );
}

function wikilink(index: Index, inner: string): string {
  const [link, label] = inner.split(/\\?\|/);
  const [note, ...headings] = link.replace(/\^[^#]*$/, "").split("#");
  const heading = headings.filter(Boolean).at(-1)?.trim();
  const text = (
    label?.trim() || [note.trim(), heading].filter(Boolean).join(" > ")
  ).trim();
  const hash = heading ? `#${headingId(heading)}` : "";
  if (!note.trim()) return hash ? `[${escapeMarkdown(text)}](${hash})` : text;
  const target = resolve(index, note);
  return target
    ? `[${escapeMarkdown(text)}](${target.url}${hash})`
    : escapeMarkdown(text);
}

function embed(file: string, inner: string): string | undefined {
  const [link, ...rest] = inner.split(/\\?\|/);
  const name = basename(link.split("#")[0].replace(/\\/g, "/")).trim();
  if (!IMAGE.test(name)) {
    if (/\.[a-z0-9]+$/i.test(name) && !/\.md$/i.test(name)) {
      throw new Error(
        `![[${inner}]]: only images and notes can be embedded, link to the file instead`
      );
    }
    return undefined;
  }
  const alt = rest
    .map(part => part.trim())
    .filter(part => part && !SIZE.test(part))
    .join(" ");
  if (!alt) {
    throw new Error(
      `![[${inner}]] needs alt text, e.g. ![[${name}|what the image shows]]`
    );
  }
  if (!existsSync(join(dirname(file), "_assets", name))) {
    throw new Error(
      `![[${inner}]]: _assets/${name} not found next to ${basename(file)}`
    );
  }
  const width = rest.map(part => part.trim()).find(part => SIZE.test(part));
  const mark = width ? `${WIDTH_MARK}${parseInt(width, 10)}` : "";
  return `![${escapeMarkdown(alt)}](<_assets/${name}${mark}>)`;
}

type MdNode = {
  type: string;
  url?: string;
  data?: { hProperties?: Record<string, unknown> };
  children?: MdNode[];
};

export function applyEmbedWidths(node: MdNode): void {
  const at = node.type === "image" ? (node.url?.indexOf(WIDTH_MARK) ?? -1) : -1;
  if (node.url && at >= 0) {
    const width = Number(node.url.slice(at + WIDTH_MARK.length));
    node.url = node.url.slice(0, at);
    node.data = {
      ...node.data,
      hProperties: { ...node.data?.hProperties, width },
    };
  }
  node.children?.forEach(applyEmbedWidths);
}

/** Converts Obsidian syntax in a Markdown body to CommonMark. */
export function convertObsidian(
  source: string,
  file: string,
  siteTimezone?: string
): string {
  const masked = maskCode(source);
  let index: Index | undefined;
  let out = "";
  let last = 0;
  for (const match of masked.matchAll(TOKEN)) {
    const [whole, todo, bang, inner] = match;
    const at = match.index;
    out += source.slice(last, at);
    last = at + whole.length;
    if (todo) out += source.slice(at, last);
    else if (inner === undefined) continue;
    else if (/^TODO\b/.test(inner)) out += whole;
    else {
      index ??= loadIndex(siteTimezone);
      out += (bang && embed(file, inner)) || wikilink(index, inner);
    }
  }
  return out + source.slice(last);
}

export function remarkObsidian(this: unknown, options: Options) {
  const self = this as {
    parser: (doc: string, file: { path?: string }) => unknown;
  };
  const parse = self.parser;
  if (!parse) return;
  self.parser = (doc, file) => {
    if (!file.path?.endsWith(".md")) return parse(doc, file);
    const tree = parse(
      convertObsidian(String(doc), file.path, options.timezone),
      file
    ) as MdNode;
    applyEmbedWidths(tree);
    return tree;
  };
}
