import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlobImage from "../lib/BlobImage";
import { fetchJson } from "../lib/fetchJson";
import { track } from "../lib/analytics";
import { useDialog } from "../lib/useDialog";

// "" = same-origin (this deployment's own /api). Override with VITE_API_URL for local dev.
const API_BASE = import.meta.env.VITE_API_URL ?? "";
const BATCH_SIZE = 9;
const FALLBACK_RATIO = "4 / 3"; // until real dimensions arrive

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// Filenames like "nature_ - 12" leave titles that are just numbers; don't show those.
const titleOf = (p) => (p.title && /[A-Za-z]/.test(p.title) ? p.title : "");
const ratioOf = (p) => (p.width && p.height ? `${p.width} / ${p.height}` : FALLBACK_RATIO);
const altOf = (p) => (p.category && p.category !== "misc" ? `${cap(p.category)} photograph by Ra’Mar Wilson` : "Photograph by Ra’Mar Wilson");

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

function Lightbox({ photo, index, total, onClose, onPrev, onNext }) {
  const ref = useRef(null);
  const onKey = useCallback(
    (e) => {
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    },
    [onPrev, onNext]
  );
  useDialog(!!photo, ref, onClose, onKey);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="lb-overlay"
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={`Photo ${index + 1} of ${total}`}
            tabIndex={-1}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="lb-dialog"
          >
            <div className="lb-frame" style={{ aspectRatio: ratioOf(photo) }}>
              <BlobImage
                key={photo.id}
                src={photo.src}
                alt={altOf(photo)}
                widths={[960, 1600, 2400]}
                sizes="(min-width: 960px) 896px, 100vw"
                quality={80}
                decoding="async"
                className="lb-img"
              />
            </div>

            <div className="lb-meta">
              <p className="lb-title">{titleOf(photo)}</p>
              <div className="lb-right">
                <a className="lb-orig" href={photo.src} target="_blank" rel="noopener noreferrer">View original ↗</a>
                <span className="lb-count" aria-hidden="true">{index + 1} / {total}</span>
              </div>
            </div>

            {onPrev && <button className="lb-nav lb-prev" onClick={onPrev} aria-label="Previous photo">‹</button>}
            {onNext && <button className="lb-nav lb-next" onClick={onNext} aria-label="Next photo">›</button>}
            <button className="lb-close" onClick={onClose} aria-label="Close photo" data-autofocus>✕</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Photography = () => {
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [active, setActive] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const loaderRef = useRef(null);

  const load = useCallback(() => {
    setStatus("loading");
    fetchJson(`${API_BASE}/api/photos`)
      .then((data) => {
        const list = Array.isArray(data.photos) ? data.photos : [];
        setPhotos(list);
        setStatus("ready");
        // Dimensions come from a separate, long-cached response when not inline.
        if (data.dimsVersion && list.some((p) => !p.width)) {
          fetchJson(`${API_BASE}/api/photos?dims=${encodeURIComponent(data.dimsVersion)}`, { timeout: 12000 })
            .then((d) => {
              if (!d.dims) return;
              setPhotos((cur) => cur.map((p) => (d.dims[p.id] ? { ...p, width: d.dims[p.id][0], height: d.dims[p.id][1] } : p)));
            })
            .catch(() => {});
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [active]);

  const filters = ["all", ...Array.from(new Set(photos.map((p) => p.category).filter(Boolean)))];
  const filtered = active === "all" ? photos : photos.filter((p) => p.category === active);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll. Re-observing after each batch means a loader that's still on
  // screen (short batch) triggers again instead of stalling.
  useEffect(() => {
    const el = loaderRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisibleCount((c) => c + BATCH_SIZE),
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  const currentIndex = selectedId ? filtered.findIndex((p) => p.id === selectedId) : -1;
  const selected = currentIndex >= 0 ? filtered[currentIndex] : null;

  const openPhoto = (photo) => {
    setSelectedId(photo.id);
    track("photo_opened", { photo: photo.id.split("/").pop(), category: photo.category });
  };
  const close = useCallback(() => setSelectedId(null), []);
  const prev = currentIndex > 0 ? () => setSelectedId(filtered[currentIndex - 1].id) : null;
  const next = currentIndex >= 0 && currentIndex < filtered.length - 1 ? () => setSelectedId(filtered[currentIndex + 1].id) : null;

  return (
    <div className="min-h-screen w-full pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <motion.p {...fadeUp(0)} className="ph-eyebrow">Visual Archive</motion.p>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-white font-bold leading-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Through the{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(120deg, #F2B85C, #F2765C)" }}
            >
              lens.
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-base max-w-lg" style={{ color: "#A6AFCE" }}>
            Cars, courts, streets, and everything in between.
            Captured whenever life looks worth saving.
          </motion.p>
        </div>

        {/* ── Filters ─────────────────────────────────── */}
        {filters.length > 2 && (
          <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-2" role="group" aria-label="Filter photos by category">
            {filters.map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                aria-pressed={active === key}
                className="ph-filter px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200"
                style={{
                  background: active === key ? "linear-gradient(120deg, #F2B85C, #F2765C)" : "rgba(255,255,255,0.05)",
                  color: active === key ? "#0b0b0b" : "#C9D0E6",
                  border: active === key ? "1px solid transparent" : "1px solid rgba(255,255,255,0.14)",
                }}
              >
                {key === "all" ? "All" : cap(key)}
              </button>
            ))}
          </motion.div>
        )}

        {/* ── Loading ─────────────────────────────────── */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-32 gap-4" role="status">
            <div
              className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: "#F2B85C", borderRightColor: "#F2765C" }}
              aria-hidden="true"
            />
            <p style={{ color: "#A6AFCE", fontFamily: "monospace", fontSize: 12 }}>Loading photos…</p>
          </div>
        )}

        {/* ── Error ───────────────────────────────────── */}
        {status === "error" && (
          <div className="ncv-state" role="alert">
            <p>The gallery isn’t loading right now. Give it a moment and try again.</p>
            <button className="ncv-btn" onClick={load}>Try again</button>
          </div>
        )}

        {/* ── Masonry grid ────────────────────────────── */}
        {status === "ready" && (
          <>
            <ul className="photography-grid" style={{ columns: 3, columnGap: 12, listStyle: "none", margin: 0, padding: 0 }}>
              <AnimatePresence>
                {visible.map((photo, i) => (
                  <motion.li
                    key={photo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, delay: (i % BATCH_SIZE) * 0.03 }}
                    style={{ breakInside: "avoid", marginBottom: 12 }}
                  >
                    <button
                      className="ph-tile"
                      onClick={() => openPhoto(photo)}
                      style={{ aspectRatio: ratioOf(photo) }}
                      aria-label={`Open ${altOf(photo).toLowerCase()}${titleOf(photo) ? ` — ${titleOf(photo)}` : ""}`}
                    >
                      <BlobImage
                        src={photo.thumb}
                        alt=""
                        widths={[384, 640, 960]}
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 380px"
                        loading="lazy"
                        decoding="async"
                        className="ph-img"
                      />
                      {titleOf(photo) && <span className="ph-over" aria-hidden="true"><span>{titleOf(photo)}</span></span>}
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center py-8" aria-hidden="true">
                <div
                  className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: "#F2B85C", borderRightColor: "#F2765C" }}
                />
              </div>
            )}

            {filtered.length === 0 && (
              <p className="text-center py-20" style={{ color: "#A6AFCE" }}>Nothing here yet.</p>
            )}
          </>
        )}
      </div>

      <Lightbox photo={selected} index={currentIndex} total={filtered.length} onClose={close} onPrev={prev} onNext={next} />

    </div>
  );
};

export default Photography;
