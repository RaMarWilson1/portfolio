import React, { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS, SECTION_IDS, sectionLink, scrollToSection } from "./nav";
import { track } from "../lib/analytics";
import "./portfolio.css";

const DESKTOP_QUERY = "(min-width: 981px)";

function NavItem({ item, pathname, activeSection, onNavigate, index }) {
  const onClick = () => {
    if (item.event) track(item.event, { location: index !== undefined ? "menu" : "nav", ...(item.event === "contact_clicked" ? { method: "nav" } : {}) });
    onNavigate?.();
  };
  const num = index !== undefined ? <span className="sn-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span> : null;

  if (item.href) {
    return (
      <a className={item.variant === "rez" ? "rez" : undefined} href={item.href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {num}
        <span className="sn-label">{item.label}</span>
        {num && <span className="sn-ext" aria-hidden="true">↗</span>}
      </a>
    );
  }
  const active = item.section ? pathname === "/" && activeSection === item.section : pathname === item.to;
  return (
    <Link
      to={item.section ? sectionLink(item.section) : item.to}
      className={active ? "active" : undefined}
      aria-current={active ? (item.section ? "location" : "page") : undefined}
      onClick={onClick}
    >
      {num}
      <span className="sn-label">{item.label}</span>
    </Link>
  );
}

export default function SiteNav() {
  const { pathname, key } = useLocation();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const toggleRef = useRef(null);
  const drawerRef = useRef(null);
  const drawerId = useId();

  // Close the menu whenever the location changes (link click, back/forward).
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setOpen(false);
  }

  // Transparent over the hero, solid once content scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy for homepage sections.
  useEffect(() => {
    setActiveSection(null);
    if (!isHome || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome]);

  // While open: lock page scroll, trap focus, Escape closes, desktop resize closes.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector("a,button")?.focus();

    const focusables = () => [toggleRef.current, ...drawerRef.current.querySelectorAll("a[href],button")].filter(Boolean);
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      } else if (e.key === "Tab") {
        const els = focusables();
        const i = els.indexOf(document.activeElement);
        const next = e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : i === els.length - 1 ? 0 : i + 1;
        e.preventDefault();
        els[next].focus();
      }
    };
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onMq = (e) => e.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  const solid = open || scrolled || !isHome;
  const close = () => setOpen(false);

  return (
    <>
      <a
        className="sn-skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("main", { smooth: false });
        }}
      >
        Skip to content
      </a>
      <nav className={"sitenav" + (solid ? " solid" : "")} aria-label="Primary">
        <Link className="sn-brand" to="/">RA’MAR WILSON</Link>
        <ul className="sn-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <NavItem item={item} pathname={pathname} activeSection={activeSection} />
            </li>
          ))}
        </ul>
        <button
          ref={toggleRef}
          type="button"
          className={"sn-toggle" + (open ? " open" : "")}
          aria-expanded={open}
          aria-controls={drawerId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sn-bars" aria-hidden="true"><span /><span /><span /></span>
        </button>
      </nav>

      <div className={"sn-backdrop" + (open ? " open" : "")} onClick={close} aria-hidden="true" />
      <div id={drawerId} ref={drawerRef} className={"sn-drawer" + (open ? " open" : "")}>
        <nav aria-label="Menu">
          <ul className="sn-dlist">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.label}>
                <NavItem item={item} index={i} pathname={pathname} activeSection={activeSection} onNavigate={close} />
              </li>
            ))}
          </ul>
        </nav>
        <p className="sn-foot">Mays Landing → Philadelphia → New York</p>
      </div>
    </>
  );
}
