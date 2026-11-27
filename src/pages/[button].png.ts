import type { APIRoute, GetStaticPaths } from "astro";
import config from "@/config";
import { readButtonImage, renderButton } from "@/utils/siteButton";
import {
  type ButtonFile,
  buttonFiles,
  buttonSource,
  hasSmallWebPage,
} from "@/utils/smallWeb";

export const getStaticPaths = (() =>
  hasSmallWebPage(config)
    ? buttonFiles(config.button).map(button => ({ params: { button } }))
    : []) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const file = params.button as ButtonFile;
  const source = buttonSource(config.button, file);
  const png = source
    ? await readButtonImage(
        source,
        file === "88x31" ? "button.image" : "button.imageLight"
      )
    : await renderButton(config.button);
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
