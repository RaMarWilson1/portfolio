import React from "react";
import { Link } from "react-router-dom";
import { sectionLink } from "./nav";

export default function NotFound() {
  return (
    <section className="pf-state" aria-labelledby="nf-h">
      <p className="pf-state-k">404 · Wrong turn</p>
      <h1 id="nf-h">This page doesn’t exist.</h1>
      <p>The link might be old, or the address has a typo. Here’s where things actually are:</p>
      <div className="pf-state-acts">
        <Link className="pf-state-btn solid" to="/">Back home</Link>
        <Link className="pf-state-btn" to={sectionLink("work")}>Work</Link>
        <Link className="pf-state-btn" to="/poetry">Poetry</Link>
        <Link className="pf-state-btn" to="/photography">Photography</Link>
        <Link className="pf-state-btn" to="/newsletter">Newsletter</Link>
      </div>
    </section>
  );
}
