import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROUTES, headTags } from "./src/content/seo.js";

// Bakes route-specific <head> tags into the HTML so link previews and crawlers
// that don't run JavaScript still see the right title/description/image.
// "/" goes into index.html; other routes get their own file (e.g. dist/poetry.html),
// which vercel.json rewrites to. Client-side navigation is handled by RouteMeta.
const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
const block = (path) => `<!--seo:start-->\n    ${headTags(path)}\n    <!--seo:end-->`;

function seoPages() {
  let outDir = "dist";
  return {
    name: "seo-pages",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return html.replace(SEO_BLOCK, block("/"));
    },
    closeBundle() {
      const index = readFileSync(resolve(outDir, "index.html"), "utf8");
      for (const path of Object.keys(ROUTES)) {
        if (path === "/") continue;
        writeFileSync(resolve(outDir, `${path.slice(1)}.html`), index.replace(SEO_BLOCK, block(path)));
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoPages()],
  base: "/",
});
