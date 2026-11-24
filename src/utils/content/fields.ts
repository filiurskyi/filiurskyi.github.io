import { z } from "astro/zod";
import { hasLetterOrDigit } from "../slugify";

/** Longer titles get cut off in search results, link previews and OG images. */
export const TITLE_MAX = 100;

export const title = () =>
  z
    .string()
    .min(1)
    .max(TITLE_MAX, {
      error: issue =>
        `title has ${String(issue.input).length} characters; keep it to ${TITLE_MAX} or fewer`,
    });

/**
 * Lowercase tags, each once, with at least one letter or digit (in any
 * script). Mistakes fail instead of being rewritten.
 */
export const tagList = () =>
  z.array(z.string().min(1)).superRefine((tags, ctx) => {
    tags.forEach((tag, index) => {
      if (!hasLetterOrDigit(tag)) {
        ctx.addIssue({
          code: "custom",
          path: [index],
          message: `tag "${tag}" needs at least one letter or digit`,
        });
      } else if (tag !== tag.toLowerCase()) {
        ctx.addIssue({
          code: "custom",
          path: [index],
          message: `tag "${tag}" must be lowercase: write "${tag.toLowerCase()}"`,
        });
      } else if (tags.indexOf(tag) !== index) {
        ctx.addIssue({
          code: "custom",
          path: [index],
          message: `tag "${tag}" is listed twice`,
        });
      }
    });
  });
