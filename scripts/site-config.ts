// The parsed starglow.config.ts for scripts run by node. Run directly, it
// prints `site.base`: node scripts/site-config.ts
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = pathToFileURL("src/").href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    const target = specifier.startsWith("@/")
      ? SRC + specifier.slice(2)
      : specifier;
    if (!/^(\.{1,2}\/|file:)/.test(target) || !context.parentURL)
      return nextResolve(target, context);
    const url = new URL(target, context.parentURL);
    const path = fileURLToPath(url);
    const extensionless = !existsSync(path) && existsSync(`${path}.ts`);
    return nextResolve(extensionless ? `${url.href}.ts` : url.href, context);
  },
});
const { default: userConfig } = await import("../starglow.config.ts");
const { parseStarglowConfig } = await import("../src/types/config.ts");

export const config = parseStarglowConfig(userConfig);

if (process.argv[1] === fileURLToPath(import.meta.url))
  process.stdout.write(config.site.base);
