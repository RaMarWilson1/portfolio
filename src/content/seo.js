// ============================================================
// ROUTE METADATA — one source for:
//   • the static <head> baked into each route's HTML at build time
//     (vite.config.js → seoPages), so link previews work without JS
//   • the runtime <head> updates on client-side navigation (RouteMeta)
// Plain data + pure functions only: this file is also imported by Node.
// ============================================================
import { SITE } from "./site.js";

const ORIGIN = SITE.url;
const abs = (path) => (path.startsWith("http") ? path : ORIGIN + path);

const person = {
  "@type": "Person",
  "@id": `${ORIGIN}/#person`,
  name: "Ra’Mar Wilson",
  url: `${ORIGIN}/`,
  image: abs("/og-image.jpg"),
  jobTitle: "Software Engineer",
  description: "Software engineer and founder of Bontro, from Mays Landing, New Jersey.",
  alumniOf: { "@type": "CollegeOrUniversity", name: "Saint Joseph’s University" },
  homeLocation: { "@type": "Place", name: "Mays Landing, New Jersey" },
  knowsAbout: ["Software Engineering", "Full-Stack Development", "TypeScript", "React", "Next.js", "PostgreSQL", "React Native"],
  sameAs: [SITE.github, SITE.linkedin, ...SITE.profiles],
};

// Public, indexable routes. Order is the sitemap order.
export const ROUTES = {
  "/": {
    title: "Ra’Mar Wilson — Software Engineer, Builder, Founder",
    description:
      "Software engineer from Mays Landing, NJ. Founder of Bontro, builder of One More Day, and a Computer Science graduate looking for the right engineering team in NYC or Northern New Jersey.",
    image: "/og-image.jpg",
    imageAlt: "Ra’Mar Wilson",
    jsonLd: { "@context": "https://schema.org", ...person },
  },
  "/poetry": {
    title: "No Clean Version — Poetry by Ra’Mar Wilson",
    description:
      "No Clean Version is Ra’Mar Wilson’s poetry and spoken-reading series. Written raw, read the same way.",
    image: "/og/poetry.jpg",
    imageAlt: "No Clean Version — Poetry by Ra’Mar Wilson",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWorkSeries",
      name: SITE.noCleanVersion.title,
      description: "A poetry and spoken-reading series by Ra’Mar Wilson.",
      url: `${ORIGIN}/poetry`,
      genre: "Poetry",
      inLanguage: "en",
      author: { "@type": "Person", "@id": `${ORIGIN}/#person`, name: "Ra’Mar Wilson", url: `${ORIGIN}/` },
    },
  },
  "/photography": {
    title: "Photography by Ra’Mar Wilson",
    description: "Landscapes and light, mostly. Photographs Ra’Mar Wilson takes to get out of his head.",
    image: "/og/photography.jpg",
    imageAlt: "A photograph by Ra’Mar Wilson",
  },
  "/newsletter": {
    title: "Between Commits — Ra’Mar Wilson",
    description:
      "A newsletter about building Bontro, becoming a better engineer, cars, creativity, and whatever Ra’Mar Wilson is working through between commits.",
    image: "/og/newsletter.png",
    imageAlt: "Between Commits — life, code, photography, cars",
  },
};

// Routes that exist but must never be indexed or previewed.
const PRIVATE = {
  title: "Studio",
  description: "",
  noindex: true,
};

export const NOT_FOUND = {
  title: "Page not found — Ra’Mar Wilson",
  description: "This page doesn’t exist.",
  noindex: true,
};

export function metaFor(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (ROUTES[path]) return { ...ROUTES[path], canonical: ORIGIN + (path === "/" ? "/" : path) };
  if (path === "/studio") return PRIVATE;
  return NOT_FOUND;
}

// JSON-LD must never be able to close its own <script> tag.
export const serializeJsonLd = (data) =>
  JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Static <head> tags for a route (used at build time).
export function headTags(pathname) {
  const m = metaFor(pathname);
  const tags = [`<title>${esc(m.title)}</title>`];
  if (m.description) tags.push(`<meta name="description" content="${esc(m.description)}" />`);
  if (m.noindex) {
    tags.push(`<meta name="robots" content="noindex" />`);
    return tags.join("\n    ");
  }
  const image = abs(m.image);
  tags.push(
    `<link rel="canonical" href="${esc(m.canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Ra’Mar Wilson" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(m.canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:alt" content="${esc(m.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(m.imageAlt)}" />`
  );
  if (m.jsonLd) tags.push(`<script type="application/ld+json" data-route-jsonld>${serializeJsonLd(m.jsonLd)}</script>`);
  return tags.join("\n    ");
}

export { abs as absoluteUrl };
