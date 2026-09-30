import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion, scrollToSection } from "./nav";

// The one place scroll position is handled on navigation:
//   "/#work" (from anywhere) → scroll to that section once it has rendered
//   a new page without a hash → start at the top
export default function RouteScroll() {
  const { pathname, hash, key } = useLocation();
  const prevPath = useRef(null);

  useEffect(() => {
    const firstLoad = prevPath.current === null;
    const samePage = prevPath.current === pathname;
    prevPath.current = pathname;
    const smooth = samePage && !prefersReducedMotion();

    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      let raf;
      const attempt = () => {
        if (scrollToSection(id, { smooth })) return;
        if (++tries < 30) raf = requestAnimationFrame(attempt);
      };
      attempt();
      return () => cancelAnimationFrame(raf);
    }
    // Leave the browser's own restoration alone on a hard load/refresh.
    if (!firstLoad) window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  }, [pathname, hash, key]);

  return null;
}
