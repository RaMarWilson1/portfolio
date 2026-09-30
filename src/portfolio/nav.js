// Single source of truth for site navigation.
//   section → a homepage section, linked as "/#id" so it works from any page
//   to      → a client-side route
//   href    → an external file / URL
//   event   → optional analytics event fired on click
import { SITE } from "../content/site";

export const NAV_ITEMS = [
  { label: "Work", section: "work" },
  { label: "Experience", section: "experience" },
  { label: "About", section: "about" },
  { label: "Newsletter", to: "/newsletter" },
  { label: "Photography", to: "/photography" },
  { label: "Poetry", to: "/poetry" },
  { label: "Résumé", href: SITE.resume, variant: "rez", event: "resume_opened" },
  { label: "Contact", section: "contact", event: "contact_clicked" },
];

export const SECTION_IDS = NAV_ITEMS.filter((i) => i.section).map((i) => i.section);

export const sectionLink = (id) => ({ pathname: "/", hash: `#${id}` });

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scrolls to a section and moves focus there (so keyboard users land in the right
// place). Returns false if the section is not in the DOM yet.
export function scrollToSection(id, { smooth = true } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  return true;
}
