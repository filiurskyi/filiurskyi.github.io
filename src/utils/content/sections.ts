import { getEntry } from "astro:content";
import config from "@/config";
import { profileLinks } from "@/utils/badges";
import { getUniqueTags } from "@/utils/getUniqueTags";
import { getNoteItems, getPostItems } from "./items";
import { getVisibleProjects } from "./projects";

/** Which sections have published content. Empty ones get no nav entry or link. */
export async function getSections() {
  const [posts, notes, projects] = await Promise.all([
    getPostItems(),
    getNoteItems(),
    getVisibleProjects(),
  ]);
  return {
    posts: posts.length > 0,
    notes: notes.length > 0,
    projects: projects.length > 0,
    tags: getUniqueTags([...posts, ...notes]).length > 0,
  };
}

/**
 * /contact/ is built and linked when contact.md exists or `links` has a
 * profile badge or a `hideAddress` email badge. The page lists every
 * profile, even those the footer dedupes, and the hidden address.
 */
export async function getContactPage() {
  const entry = await getEntry("pages", "contact");
  const profiles = profileLinks(config.links);
  const email = config.links.find(link => link.email);
  return entry || profiles.length > 0 || email
    ? { entry, profiles, email }
    : undefined;
}
