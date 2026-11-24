/**
 * Replace `{{key}}` placeholders in UI strings.
 * Translators can reorder placeholders freely within the sentence.
 */
export function tplStr(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value !== undefined && value !== null ? String(value) : "";
  });
}

export type TextPart = string | { href: string; label: string };

/**
 * `template` split around its `{{sections}}` token, which becomes the
 * `links` as a list in the locale's style ("a, b and c" or "a, b or c").
 */
export function listParts(
  template: string,
  links: { href: string; label: string }[],
  locale: string,
  type: "conjunction" | "disjunction"
): TextPart[] {
  const list = new Intl.ListFormat(locale, { type })
    .formatToParts(links.map(link => link.label))
    .map((part, index, parts) =>
      part.type === "element"
        ? links[parts.slice(0, index).filter(p => p.type === "element").length]
        : part.value
    );
  return template
    .split(/(\{\{sections\}\})/)
    .flatMap(part => (part === "{{sections}}" ? list : [part]))
    .filter(part => part !== "");
}
