import { useEffect, useLayoutEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Modal behavior for a dialog element: focus moves in on open, Tab stays inside,
// Escape closes, focus returns to whatever opened it, and the page can't scroll.
// `onKey` receives other keydown events (e.g. arrow keys in a lightbox).
export function useDialog(open, ref, onClose, onKey) {
  // Latest callbacks, so changing them (e.g. next/prev photo) doesn't re-run the effect.
  const cb = useRef({ onClose, onKey });
  useLayoutEffect(() => {
    cb.current = { onClose, onKey };
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      const el = ref.current;
      (el?.querySelector("[data-autofocus]") || el?.querySelector(FOCUSABLE) || el)?.focus();
    });

    const handler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cb.current.onClose();
        return;
      }
      if (e.key === "Tab" && ref.current) {
        const els = [...ref.current.querySelectorAll(FOCUSABLE)].filter((x) => x.offsetParent !== null);
        if (!els.length) return e.preventDefault();
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && (document.activeElement === first || !ref.current.contains(document.activeElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !ref.current.contains(document.activeElement))) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      cb.current.onKey?.(e);
    };
    document.addEventListener("keydown", handler);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
      if (opener && typeof opener.focus === "function") opener.focus({ preventScroll: true });
    };
  }, [open, ref]);
}
