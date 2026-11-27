import { beforeEach, describe, expect, it, vi } from "vitest";
import { STARGLOW_REPO } from "@/types/config";
import { getFooterLinks } from "@/utils/footer";
import { BUTTON_LABEL_PLACEHOLDER } from "@/utils/markers";

const state = vi.hoisted(() => ({
  contact: true,
  sections: { posts: true, notes: false },
  config: {
    site: { sourceUrl: undefined as string | undefined },
    links: [] as { type: string; url: string }[],
    webrings: [] as { name: string; url: string }[],
    button: { icon: "sparkle", label: "" },
    footer: {
      credit: true,
      links: [] as { label: string; href: string }[],
      legal: [] as { label: string; href: string }[],
    },
  },
}));

vi.mock("@/config", () => ({ default: state.config }));
vi.mock("@/utils/content/sections", () => ({
  getSections: async () => state.sections,
  getContactPage: async () => (state.contact ? {} : undefined),
}));

const labels = { contact: "contact", smallWeb: "small web", source: "source" };
const footer = () => getFooterLinks("en", labels);

beforeEach(() => {
  state.contact = true;
  state.sections = { posts: true, notes: false };
  Object.assign(state.config, {
    site: { sourceUrl: undefined },
    links: [],
    webrings: [],
    button: { icon: "sparkle", label: BUTTON_LABEL_PLACEHOLDER },
    footer: { credit: true, links: [], legal: [] },
  });
});

describe("getFooterLinks", () => {
  it("lists contact, small web and footer.links as pages", async () => {
    state.config.webrings = [{ name: "Ring", url: "https://ring.example/" }];
    state.config.footer.links = [{ label: "uses", href: "/uses/" }];
    const { pages, legal } = await footer();
    expect(pages).toEqual([
      { label: "contact", href: "/contact/" },
      { label: "small web", href: "/small-web/" },
      { label: "uses", href: "/uses/" },
    ]);
    expect(legal).toEqual([]);
  });

  it("keeps footer.legal apart from the pages", async () => {
    state.contact = false;
    state.config.footer.legal = [
      { label: "impressum", href: "/impressum/" },
      { label: "terms", href: "https://legal.example/terms" },
    ];
    const { pages, legal } = await footer();
    expect(pages).toEqual([]);
    expect(legal).toEqual([
      { label: "impressum", href: "/impressum/" },
      { label: "terms", href: "https://legal.example/terms" },
    ]);
  });

  it("links each URL once, the earlier group first", async () => {
    state.config.site.sourceUrl = STARGLOW_REPO;
    state.config.links = [
      { type: "nocookies", url: "/privacy/" },
      { type: "github", url: `${STARGLOW_REPO}/` },
    ];
    state.config.footer.links = [
      { label: "contact me", href: "/contact" },
      { label: "impressum", href: "/impressum/" },
    ];
    state.config.footer.legal = [
      { label: "privacy", href: "/privacy/" },
      { label: "impressum", href: "/impressum/index.html" },
    ];
    const { credit, badges, pages, legal, source } = await footer();
    expect(credit).toBe(STARGLOW_REPO);
    expect(badges.map(badge => badge.type)).toEqual(["nocookies"]);
    expect(pages.map(link => link.label)).toEqual(["contact me", "impressum"]);
    expect(legal).toEqual([]);
    expect(source).toBeUndefined();
  });

  it("keeps the contact link beside a mailto: email badge only", async () => {
    state.config.links = [{ type: "email", url: "/contact/#email" }];
    expect((await footer()).pages).toEqual([]);
    state.config.links = [{ type: "email", url: "mailto:" }];
    const { badges, pages } = await footer();
    expect(badges.map(badge => badge.url)).toEqual(["mailto:"]);
    expect(pages).toEqual([{ label: "contact", href: "/contact/" }]);
  });

  it("links the source when no other link has its URL", async () => {
    state.config.footer.credit = false;
    state.config.site.sourceUrl = "https://git.example/me/site";
    const { credit, source } = await footer();
    expect(credit).toBeUndefined();
    expect(source).toEqual({
      label: "source",
      href: "https://git.example/me/site",
    });
  });

  it("holds the rss badge back until something is published", async () => {
    state.config.links = [
      { type: "rss", url: "/rss.xml" },
      { type: "mastodon", url: "https://host.example/@me" },
    ];
    state.sections = { posts: false, notes: false };
    expect((await footer()).badges).toEqual([
      { type: "mastodon", url: "https://host.example/@me", rel: "me" },
    ]);
    state.sections = { posts: false, notes: true };
    expect((await footer()).badges.map(badge => badge.type)).toEqual([
      "rss",
      "mastodon",
    ]);
  });
});
