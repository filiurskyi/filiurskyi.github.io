import type { APIRoute, GetStaticPaths } from "astro";
import config from "@/config";
import { renderButton } from "@/utils/siteButton";
import { hasSmallWebPage } from "@/utils/smallWeb";

export const getStaticPaths = (() =>
  hasSmallWebPage(config)
    ? [{ params: { button: "88x31" } }]
    : []) satisfies GetStaticPaths;

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await renderButton(config.button)), {
    headers: { "Content-Type": "image/png" },
  });
