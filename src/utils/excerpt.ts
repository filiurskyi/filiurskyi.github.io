/**
 * The opening prose of a Markdown body as plain text, cut at a word near
 * `max` characters: the meta description of an entry that has none.
 */
export function excerpt(
  markdown: string | undefined,
  max = 160
): string | undefined {
  if (!markdown) return undefined;
  const prose = markdown
    .replace(/(```|~~~)[\s\S]*?\1/g, "\n\n")
    .replace(/<!--[\s\S]*?-->|%%[\s\S]*?%%/g, "")
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(
      block =>
        block &&
        !/^(#|>|\||[-*+]\s|\d+\.\s|<|!\[|import\s|export\s)/.test(block)
    )
    .join(" ")
    .replace(/!\[[^\]]*\]\([^)]*\)|!\[\[[^\]]*\]\]/g, "")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__|\*|~~)(\S[\s\S]*?)\1/g, "$2")
    .replace(/\s+/g, " ")
    .trim();
  if (!prose) return undefined;
  if (prose.length <= max) return prose;
  const cut = prose.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.]+$/, "")}…`;
}
