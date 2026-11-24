/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Astro's Vite setup, so `@/` paths and `astro:*` modules resolve as in the site.
export default getViteConfig({
  test: { include: ["tests/**/*.test.ts"] },
});
