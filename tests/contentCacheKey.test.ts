import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { unified } from "@astrojs/markdown-remark";
import {
  contentCacheKey,
  contentCacheKeyPlugin,
} from "@/utils/contentCacheKey";

let root = "";
afterEach(() => rmSync(root, { recursive: true, force: true }));

const project = () => {
  root = mkdtempSync(join(tmpdir(), "starglow-cache-"));
  mkdirSync(join(root, "src/utils"), { recursive: true });
  writeFileSync(join(root, "package.json"), '{"version":"1.0.0"}');
  writeFileSync(join(root, "src/utils/plugin.ts"), "export const a = 1;");
  return root;
};

describe("contentCacheKey", () => {
  it("is stable while the inputs stay the same", () => {
    const dir = project();
    expect(contentCacheKey(dir)).toBe(contentCacheKey(dir));
  });

  it("changes with theme code, settings or the version", () => {
    const dir = project();
    const keys = new Set([contentCacheKey(dir)]);
    writeFileSync(join(dir, "src/utils/plugin.ts"), "export const a = 2;");
    keys.add(contentCacheKey(dir));
    writeFileSync(join(dir, "starglow.config.ts"), "export default {};");
    keys.add(contentCacheKey(dir));
    writeFileSync(join(dir, "package.json"), '{"version":"1.0.1"}');
    keys.add(contentCacheKey(dir));
    expect(keys.size).toBe(4);
  });

  it("ends up in the part of the config Astro serialises", () => {
    const processor = unified({
      rehypePlugins: [[contentCacheKeyPlugin, { key: "abc123" }]],
    });
    expect(JSON.stringify(processor)).toContain('"key":"abc123"');
  });
});
