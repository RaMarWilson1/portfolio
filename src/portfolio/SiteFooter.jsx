import React from "react";
import { Link } from "react-router-dom";
import { SITE } from "../content/site";
import { sectionLink } from "./nav";
import { trackClick } from "../lib/analytics";

const ext = { target: "_blank", rel: "noopener noreferrer" };

// Shared footer: the site's own pages on the left, ways to reach Ra'Mar on the right.
export default function SiteFooter() {
  return (
    <footer className="sitefoot">
      <div className="sf-wrap">
        <div className="sf-row">
          <nav aria-label="Footer" className="sf-links">
            <Link to="/">Home</Link>
            <Link to={sectionLink("work")}>Work</Link>
            <Link to="/poetry">Poetry</Link>
            <Link to="/photography">Photography</Link>
            <Link to="/newsletter">Newsletter</Link>
          </nav>
          <div className="sf-links">
            <a href={SITE.github} {...ext} onClick={trackClick("github_opened", { location: "footer" })}>GitHub</a>
            <a href={SITE.linkedin} {...ext} onClick={trackClick("linkedin_opened", { location: "footer" })}>LinkedIn</a>
            <a href={"mailto:" + SITE.email} onClick={trackClick("contact_clicked", { method: "email", location: "footer" })}>Email</a>
            <a href={SITE.resume} {...ext} onClick={trackClick("resume_opened", { location: "footer" })}>Résumé</a>
          </div>
        </div>
        <p className="sf-fine">
          © {new Date().getFullYear()} Ra’Mar Wilson · Mays Landing → Philadelphia → New York · Skyline photography via Wikimedia Commons (CC BY-SA).
        </p>
      </div>
    </footer>
  );
}
