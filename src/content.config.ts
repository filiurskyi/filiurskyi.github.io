import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";
import { postEntryId } from "@/utils/postEntryId";
import {
  NOTE_PATH,
  PROJECT_PATH,
  noteEntryId,
  projectEntryId,
} from "@/utils/content/entryIds";

export const BLOG_PATH = "src/content/blog";

// Properties Obsidian writes that the site has no use for: accepted, then
// dropped, with `features.obsidian` on.
const OBSIDIAN_ONLY = [
  "aliases",
  "alias",
  "cssclasses",
  "cssclass",
  "publish",
  "permalink",
  "created",
  "modified",
] as const;

const frontmatter = <T extends z.ZodRawShape>(shape: T) =>
  config.features.obsidian
    ? z
        .strictObject({
          ...shape,
          ...Object.fromEntries(
            OBSIDIAN_ONLY.map(key => [key, z.unknown().optional()])
          ),
        })
        .transform(data => {
          const out: Record<string, unknown> = { ...data };
          for (const key of OBSIDIAN_ONLY) delete out[key];
          return out as z.output<z.ZodObject<T>>;
        })
    : z.strictObject(shape);

// Obsidian also writes `tags: rust`, `#rust` or an empty `tags:`.
const normaliseTags = (value: unknown): unknown => {
  if (value === null) return [];
  const list = typeof value === "string" ? value.split(/[\s,]+/) : value;
  if (!Array.isArray(list)) return value;
  return list
    .map(tag => (typeof tag === "string" ? tag.replace(/^#/, "") : tag))
    .filter(tag => tag !== "");
};
const tags = () =>
  (config.features.obsidian
    ? z.preprocess(normaliseTags, z.array(z.string()))
    : z.array(z.string())
  ).default([]);

const posts = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${BLOG_PATH}`,
    generateId: ({ entry, data }) =>
      postEntryId(entry, data, config.site.timezone),
  }),
  schema: ({ image }) =>
    frontmatter({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      draft: z.boolean().optional(),
      tags: tags(),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalUrl: z.httpUrl().optional(),
      syndication: z.array(z.httpUrl()).default([]),
      hideEditPost: z.boolean().optional(),
      hideToc: z.boolean().optional(),
      // An empty value means "not set", so the site timezone applies.
      timezone: z
        .string()
        .optional()
        .transform(tz => tz || undefined),
    }),
});

const notes = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${NOTE_PATH}`,
    generateId: ({ entry }) => noteEntryId(entry),
  }),
  schema: frontmatter({
    title: z.string(),
    description: z.string().optional(),
    tags: tags(),
    updated: z.date().optional(),
    canonicalUrl: z.httpUrl().optional(),
    syndication: z.array(z.httpUrl()).default([]),
    draft: z.boolean().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${PROJECT_PATH}`,
    generateId: ({ entry }) => projectEntryId(entry),
  }),
  schema: frontmatter({
    title: z.string(),
    description: z.string(),
    stack: z.array(z.string()).default([]),
    status: z.enum(["active", "maintained", "archived", "experiment"]),
    githubUrl: z.httpUrl().optional(),
    docsUrl: z.httpUrl().optional(),
    websiteUrl: z.httpUrl().optional(),
    featured: z.boolean().default(false),
    relatedPosts: z.array(reference("posts")).default([]),
    draft: z.boolean().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.strictObject({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalUrl: z.httpUrl().optional(),
    specialties: z.array(z.string()).optional(),
  }),
});

export const collections = { posts, notes, projects, pages };
