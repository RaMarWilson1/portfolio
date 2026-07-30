import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SITE } from "../content/site";

const mono = {
  fontFamily: 'ui-monospace,"SF Mono",Menlo,"Courier New",monospace',
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  textDecoration: "none",
};

const links = [
  { to: "/", label: "Home" },
  { to: "/photography", label: "Photography" },
  { to: "/poetry", label: "Poetry" },
  { to: "/newsletter", label: "Newsletter" },
];

export default function SubNav() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px clamp(20px,5vw,48px)",
        background: "linear-gradient(rgba(7,10,24,.82),rgba(7,10,24,.35))",
        backdropFilter: "blur(6px)",
      }}
    >
      <Link to="/" style={{ fontWeight: 800, letterSpacing: ".01em", fontSize: 14.5, textDecoration: "none", color: "#EEF1FA" }}>
        RA’MAR WILSON
      </Link>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            style={{ ...mono, color: pathname === l.to ? "#F2B85C" : "rgba(238,241,250,.72)" }}
          >
            {l.label}
          </Link>
        ))}
        <a
          href={SITE.resume}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...mono, color: "#F2B85C", border: "1px solid #F2B85C", padding: "7px 13px", borderRadius: 8 }}
        >
          Résumé
        </a>
      </div>
    </nav>
  );
}
