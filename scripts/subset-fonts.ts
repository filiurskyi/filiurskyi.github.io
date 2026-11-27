import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  FONT_DIR,
  SUBSET_DIR,
  splitFont,
  subsetPath,
} from "../src/utils/fontSubset.ts";

mkdirSync(SUBSET_DIR, { recursive: true });
for (const file of readdirSync(FONT_DIR).filter(f => f.endsWith(".woff2"))) {
  const name = file.slice(0, -".woff2".length);
  const { core, rest } = await splitFont(readFileSync(join(FONT_DIR, file)));
  writeFileSync(subsetPath(name, "core"), core);
  writeFileSync(subsetPath(name, "rest"), rest);
  console.log(`${name}: core ${core.length} B, rest ${rest.length} B`);
}
