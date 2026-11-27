/** Resolved config with defaults applied. Edit `starglow.config.ts`, not this file. */
import userConfig from "@/starglow.config";
import {
  parseStarglowConfig,
  type BadgeLink,
  type ResolvedStarglowConfig,
} from "./types/config";

// public/default-og.jpg is intentionally absent. It is only used when
// `dynamicOgImage` is false; add a real image here before turning that off.
const DEFAULT_OG_IMAGE = "default-og.jpg";

/** `@user@host` from a Mastodon profile URL such as https://host/@user. */
function fediverseHandle(links: BadgeLink[]): string | undefined {
  const url = links.find(link => link.type === "mastodon")?.url?.trim();
  if (!url) return undefined;
  try {
    const { host, pathname } = new URL(url);
    const user = /^\/@([^/@]+)\/?$/.exec(pathname)?.[1];
    return user ? `@${user}@${host}` : undefined;
  } catch {
    return undefined;
  }
}

function resolveEditPost(
  editPost: { enabled: boolean; path?: string } | undefined,
  sourceUrl: string | undefined
): ResolvedStarglowConfig["features"]["editPost"] {
  if (!editPost?.enabled || !sourceUrl) return { enabled: false };
  const path = (editPost.path ?? "edit/main/").replace(/^\/+|\/+$/g, "");
  return { enabled: true, url: `${sourceUrl.replace(/\/+$/, "")}/${path}/` };
}

/** Badges with a URL; the schema has already checked its form. */
const resolveLinks = (list: BadgeLink[]) =>
  list.flatMap(entry => {
    const url = entry.url?.trim();
    return url ? [{ ...entry, url }] : [];
  });

const parsed = parseStarglowConfig(userConfig);
const sourceUrl = parsed.site.sourceUrl?.trim() || undefined;

const config: ResolvedStarglowConfig = {
  site: {
    ...parsed.site,
    ogImage: parsed.site.ogImage ?? DEFAULT_OG_IMAGE,
    googleVerification: parsed.site.googleVerification?.trim() || undefined,
    sourceUrl,
    fediverseCreator: fediverseHandle(parsed.links),
    wordmark: parsed.site.wordmark?.trim() || parsed.site.title,
  },
  person: {
    jobTitle: parsed.person.jobTitle?.trim() || undefined,
  },
  posts: parsed.posts,
  features: {
    ...parsed.features,
    editPost: resolveEditPost(parsed.features.editPost, sourceUrl),
  },
  appearance: parsed.appearance,
  links: resolveLinks(parsed.links),
  webrings: parsed.webrings,
  button: parsed.button,
  footer: parsed.footer,
  images: parsed.images,
  analytics: {
    cloudflareToken: parsed.analytics.cloudflareToken?.trim() || undefined,
  },
};

export default config;
