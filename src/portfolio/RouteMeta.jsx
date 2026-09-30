import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { metaFor, serializeJsonLd, absoluteUrl } from "../content/seo";
import { track } from "../lib/analytics";

// Keeps <head> in sync on client-side navigation. The first load already has the
// right tags baked in at build time (see vite.config.js); this mirrors them.

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!value) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!href) return el?.remove();
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(data) {
  document.head.querySelectorAll("script[data-route-jsonld]").forEach((s) => s.remove());
  if (!data) return;
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.setAttribute("data-route-jsonld", "");
  s.textContent = serializeJsonLd(data);
  document.head.appendChild(s);
}

const PAGE_EVENTS = {
  "/newsletter": "newsletter_opened",
  "/photography": "photography_opened",
  "/poetry": "poetry_opened",
};

export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const m = metaFor(pathname);
    const indexable = !m.noindex;
    const image = indexable ? absoluteUrl(m.image) : null;
    document.title = m.title;
    setMeta("name", "description", m.description);
    setMeta("name", "robots", indexable ? null : "noindex");
    setCanonical(indexable ? m.canonical : null);
    setMeta("property", "og:title", indexable && m.title);
    setMeta("property", "og:description", indexable && m.description);
    setMeta("property", "og:url", indexable && m.canonical);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:alt", indexable && m.imageAlt);
    setMeta("name", "twitter:title", indexable && m.title);
    setMeta("name", "twitter:description", indexable && m.description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:image:alt", indexable && m.imageAlt);
    setJsonLd(indexable ? m.jsonLd : null);

    if (indexable) {
      track("$pageview", {});
      if (PAGE_EVENTS[pathname]) track(PAGE_EVENTS[pathname], { source: "page" });
    }
  }, [pathname]);

  return null;
}
