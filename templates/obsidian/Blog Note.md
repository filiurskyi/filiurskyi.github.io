<%*
// Helpers shared by the Blog templates. Prompts return null on Escape, so every value goes through clean().
const clean = s => (s ?? "").trim();
const words = s => clean(s).split(/[\s,]+/).map(t => t.replace(/^#/, "")).filter(Boolean);
const items = s => clean(s).split(",").map(t => t.trim()).filter(Boolean);
const scalar = s => /^[A-Za-z][\w ./+-]*$/.test(s) && !/^(true|false|yes|no|on|off|null|y|n)$/i.test(s) ? s : JSON.stringify(s);
const yamlList = list => list.length ? "\n" + list.map(i => `  - ${scalar(i)}`).join("\n") : " []";
const url = s => /^https?:\/\/\S+$/.test(clean(s)) ? clean(s) : "";
// The path is the URL: posts and notes go to <folder>/<year>/<slug>.md, projects to projects/<slug>.md.
// The slug comes from the title; asked for only when the title has no Latin letters.
const slugify = s => clean(s).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const file = tp.config.target_file;
let title = tp.file.title;
if (title.startsWith("Untitled")) title = clean(await tp.system.prompt("Title"));
if (!title) { await app.vault.delete(file); throw new Error("No title, nothing created"); }
let slug = slugify(title) || slugify(await tp.system.prompt("Slug: latin letters, digits and hyphens", ""));
if (!slug) { await app.vault.delete(file); throw new Error("No slug, nothing created"); }
const dir = "src/content/notes/" + tp.date.now("YYYY");
if (!app.vault.getAbstractFileByPath(dir)) await app.vault.createFolder(dir);
for (let n = 2, base = slug; app.vault.getAbstractFileByPath(`${dir}/${slug}.md`) && file.path !== `${dir}/${slug}.md`; n++) slug = `${base}-${n}`;
if (file.path !== `${dir}/${slug}.md`) await tp.file.move(`${dir}/${slug}`);
const description = clean(await tp.system.prompt("Description: one sentence (optional)"));
const tags = words(await tp.system.prompt("Tags, comma or space separated (optional)"));
-%>
---
title: <% JSON.stringify(title) %>
<%* if (description) tR += `description: ${JSON.stringify(description)}\n`; -%>
tags:<% yamlList(tags) %>
draft: true
---

%% optional keys: description, updated, canonicalUrl, syndication. Dates come from git. %%
