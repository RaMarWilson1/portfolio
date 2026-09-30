import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE } from "../content/site";
import { fetchJson } from "../lib/fetchJson";
import { track } from "../lib/analytics";
import { useDialog } from "../lib/useDialog";
import { byEpisodeDesc, episodeAria, episodeLabel, formatEpisode, inSeries, latestReading, platformLabel } from "../lib/ncv";

// /poetry — home of No Clean Version, Ra'Mar's poetry and spoken-reading series.
// Two orderings live here on purpose:
//   • poems from /api/poems arrive in general chronology (featured → newest)
//   • the Episodes list re-sorts series installments by episode, highest first

// "" = same-origin (this deployment's own /api). Override with VITE_API_URL for local dev.
const API_BASE = import.meta.env.VITE_API_URL ?? "";
const ext = { target: "_blank", rel: "noopener noreferrer" };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const fmtDate = (iso) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : new Date(t).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
};

// Visible "NCV — 003", announced as "No Clean Version, episode 3".
function Episode({ n, series, short = false, className = "ncv-ep" }) {
  return (
    <span className={className}>
      <span aria-hidden="true">{short ? formatEpisode(n) : episodeLabel(n, series.title)}</span>
      <span className="sr-only">{episodeAria(n, series.title)}</span>
    </span>
  );
}

function ReadingLink({ poem, location, className = "ncv-watch" }) {
  return (
    <a
      className={className}
      href={poem.readingUrl}
      {...ext}
      onClick={() =>
        track("poem_reading_opened", {
          poem: poem.title,
          seriesNumber: poem.seriesNumber ?? undefined,
          platform: poem.readingPlatform || "other",
          location,
        })
      }
    >
      Watch the reading<span className="sr-only"> of “{poem.title}”{poem.readingPlatform ? ` on ${platformLabel(poem.readingPlatform)}` : ""} (opens in a new tab)</span> →
    </a>
  );
}

function PoemDialog({ poem, series, numbering, onClose }) {
  const ref = useRef(null);
  useDialog(!!poem, ref, onClose);
  return (
    <AnimatePresence>
      {poem && (
        <motion.div
          key="poem-dialog"
          className="ncv-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="poem-dialog-title"
            tabIndex={-1}
            className="ncv-dialog"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="ncv-close" onClick={onClose} aria-label="Close poem" data-autofocus>✕</button>
            {numbering && inSeries(poem) && <Episode n={poem.seriesNumber} series={series} />}
            <h2 id="poem-dialog-title" className="ncv-dtitle">{poem.title}</h2>
            {poem.date && <p className="ncv-meta">{poem.date}</p>}
            <div className="ncv-body">{poem.body}</div>
            {poem.readingUrl && (
              <div className="ncv-dfoot"><ReadingLink poem={poem} location="poem" /></div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Poetry = () => {
  const [poems, setPoems] = useState([]);
  const [series, setSeries] = useState(SITE.noCleanVersion);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    fetchJson(`${API_BASE}/api/poems`)
      .then((data) => {
        setPoems(Array.isArray(data.poems) ? data.poems : []);
        if (data.series) setSeries(data.series);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const numbering = series.numberingEnabled !== false;
  const featured = poems.find((p) => p.featured) ?? null;
  const latest = latestReading(poems);
  const episodes = numbering ? poems.filter(inSeries).sort(byEpisodeDesc) : [];

  const open = (poem, location) => {
    setSelected(poem);
    track("poem_opened", { poem: poem.title, seriesNumber: poem.seriesNumber ?? undefined, featured: !!poem.featured, location });
  };
  const close = useCallback(() => setSelected(null), []);

  // Title styling: last word gets the gradient ("NO CLEAN <VERSION>").
  const words = series.title.trim().split(/\s+/);
  const titleHead = words.slice(0, -1).join(" ");
  const titleTail = words[words.length - 1];
  const subtitle = /[.!?]$/.test(series.subtitle) ? series.subtitle : `${series.subtitle}.`;

  return (
    <div className="ncv">
      {/* ── Series header ─────────────────────────────── */}
      <header className="ncv-hero">
        <motion.p {...fadeUp(0)} className="ncv-k">Poetry</motion.p>
        <motion.h1 {...fadeUp(0.05)} className="ncv-title">
          {titleHead && <>{titleHead} </>}<span>{titleTail}</span>
        </motion.h1>
        <motion.p {...fadeUp(0.1)} className="ncv-sub">{subtitle}</motion.p>
        {series.description && <motion.p {...fadeUp(0.15)} className="ncv-desc">{series.description}</motion.p>}
        {series.links?.length > 0 && (
          <motion.ul {...fadeUp(0.2)} className="ncv-links" aria-label={`${series.title} elsewhere`}>
            {series.links.map((l) => (
              <li key={l.url}><a href={l.url} {...ext}>{l.label} ↗</a></li>
            ))}
          </motion.ul>
        )}
      </header>

      {status === "loading" && (
        <div className="ncv-state" role="status">
          <span className="ncv-spinner" aria-hidden="true" />
          Loading poems…
        </div>
      )}

      {status === "error" && (
        <div className="ncv-state" role="alert">
          <p>The poems aren’t loading right now. Give it a moment and try again.</p>
          <button className="ncv-btn" onClick={load}>Try again</button>
        </div>
      )}

      {status === "ready" && poems.length === 0 && (
        <div className="ncv-state"><p>New poems are on the way.</p></div>
      )}

      {status === "ready" && poems.length > 0 && (
        <>
          {/* ── Latest reading (only when one exists) ──── */}
          {latest && (
            <motion.section {...fadeUp(0)} className="ncv-latest" aria-labelledby="ncv-latest-h">
              <p className="ncv-k">Latest reading</p>
              {numbering && inSeries(latest) && <Episode n={latest.seriesNumber} series={series} />}
              <h2 id="ncv-latest-h" className="ncv-ltitle">{latest.title}</h2>
              {(latest.readingPublishedAt || latest.date) && (
                <p className="ncv-meta">{fmtDate(latest.readingPublishedAt) || latest.date}</p>
              )}
              <div className="ncv-acts">
                <button className="ncv-btn solid" onClick={() => open(latest, "latest_reading")}>Read poem</button>
                <ReadingLink poem={latest} location="latest_reading" className="ncv-btn" />
              </div>
            </motion.section>
          )}

          {/* ── Featured poem, in full ─────────────────── */}
          {featured && (
            <motion.article {...fadeUp(0)} className="ncv-featured" aria-labelledby="ncv-featured-h">
              <div className="ncv-frow">
                <span className="ncv-badge">Featured</span>
                {numbering && inSeries(featured) && <Episode n={featured.seriesNumber} series={series} />}
                {featured.date && <span className="ncv-meta">{featured.date}</span>}
              </div>
              <h2 id="ncv-featured-h" className="ncv-ftitle">{featured.title}</h2>
              <div className="ncv-body">{featured.body}</div>
              {featured.readingUrl && <ReadingLink poem={featured} location="featured" />}
            </motion.article>
          )}

          {/* ── Series installments, highest episode first ── */}
          {episodes.length > 0 && (
            <section className="ncv-section" aria-labelledby="ncv-eps-h">
              <h2 id="ncv-eps-h" className="ncv-k">Episodes</h2>
              <ol className="ncv-eps">
                {episodes.map((p) => (
                  <li key={p.id}>
                    <button className="ncv-eprow" onClick={() => open(p, "episodes")}>
                      <Episode n={p.seriesNumber} series={series} short className="ncv-epno" />
                      <span className="ncv-eptitle">{p.title}</span>
                    </button>
                    {p.readingUrl && <ReadingLink poem={p} location="episodes" className="ncv-epwatch" />}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ── Every poem, general chronology ─────────── */}
          <section className="ncv-section" aria-labelledby="ncv-all-h">
            <h2 id="ncv-all-h" className="ncv-k">All poems</h2>
            <ul className="ncv-grid">
              {poems.map((poem) => (
                <li key={poem.id}>
                  <button className="ncv-card" onClick={() => open(poem, "grid")}>
                    <span className="ncv-cmeta">
                      {numbering && inSeries(poem) ? <Episode n={poem.seriesNumber} series={series} short className="ncv-cep" /> : null}
                      {poem.date && <span>{poem.date}</span>}
                    </span>
                    <span className="ncv-ctitle">{poem.title}</span>
                    <span className="ncv-cbody" aria-hidden="true">{poem.body}</span>
                    <span className="ncv-cread" aria-hidden="true">Read →</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <PoemDialog poem={selected} series={series} numbering={numbering} onClose={close} />
    </div>
  );
};

export default Poetry;
