import { describe, expect, it } from "vitest";
import { OBSIDIAN_CALLOUT_ALIASES } from "@/utils/remarkObsidian";

const GITHUB = ["note", "tip", "important", "warning", "caution"];
// Obsidian's built-in callout types (help.obsidian.md, Callouts)
const OBSIDIAN = [
  "note", "abstract", "summary", "tldr", "info", "todo", "tip", "hint",
  "important", "success", "check", "done", "question", "help", "faq",
  "warning", "caution", "attention", "failure", "fail", "missing", "danger",
  "error", "bug", "example", "quote", "cite",
];

describe("OBSIDIAN_CALLOUT_ALIASES", () => {
  const aliases = Object.values(OBSIDIAN_CALLOUT_ALIASES).flat();

  it("maps only onto the GitHub alert types", () => {
    expect(Object.keys(OBSIDIAN_CALLOUT_ALIASES).sort()).toEqual(
      [...GITHUB].sort()
    );
  });

  it("never aliases a GitHub type or repeats an alias", () => {
    expect(aliases.filter(a => GITHUB.includes(a))).toEqual([]);
    expect(new Set(aliases).size).toBe(aliases.length);
  });

  it("covers every Obsidian callout type", () => {
    const covered = new Set([...GITHUB, ...aliases]);
    expect(OBSIDIAN.filter(type => !covered.has(type))).toEqual([]);
  });

  it("renders attention as a warning", () => {
    expect(OBSIDIAN_CALLOUT_ALIASES.warning).toContain("attention");
  });
});
