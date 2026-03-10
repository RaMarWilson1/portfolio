import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FILTERS = [
  { key: "all",    label: "All" },
  { key: "cars",   label: "Cars" },
  { key: "street", label: "Street" },
  { key: "sports", label: "Sports" },
  { key: "misc",   label: "Misc" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const Photography = () => {
  const [photos, setPhotos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [active, setActive]     = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => setPhotos(data.photos))
      .catch(() => setError("Couldn't load photos. Check your Cloudinary env vars."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = active === "all"
    ? photos
    : photos.filter((p) => p.category === active);

  const currentIndex = selected
    ? filtered.findIndex((p) => p.id === selected.id)
    : -1;

  return (
    <div className="min-h-screen w-full pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">

        {/* ── Header ──────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <motion.p
            {...fadeUp(0)}
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              fontFamily: "monospace",
            }}
          >
            Visual Archive
          </motion.p>
          <motion.h1
            {...fadeUp(0.1)}
            className="text-white font-bold leading-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Through the{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #ef4444, #3b82f6)" }}
            >
              lens.
            </span>
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-gray-400 text-base max-w-lg">
            Cars, courts, streets, and everything in between.
            Captured whenever life looks worth saving.
          </motion.p>
        </div>

        {/* ── Filters ─────────────────────────────────── */}
        <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200"
              style={{
                background: active === key
                  ? "linear-gradient(135deg, #ef4444, #3b82f6)"
                  : "rgba(255,255,255,0.05)",
                color: active === key ? "#fff" : "rgba(255,255,255,0.4)",
                border: active === key
                  ? "1px solid transparent"
                  : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* ── Loading ─────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: "#ef4444", borderRightColor: "#3b82f6" }}
            />
            <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontSize: 12 }}>
              Loading photos...
            </p>
          </div>
        )}

        {/* ── Error ───────────────────────────────────── */}
        {error && (
          <div
            className="p-6 rounded-xl text-center"
            style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}
          >
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* ── Masonry grid ────────────────────────────── */}
        {!loading && !error && (
          <>
            <motion.div
              layout
              style={{ columns: 3, columnGap: 12 }}
              className="photography-grid"
            >
              <AnimatePresence>
                {filtered.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    onClick={() => setSelected(photo)}
                    className="relative overflow-hidden rounded-xl cursor-pointer"
                    style={{
                      breakInside: "avoid",
                      marginBottom: 12,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    whileHover="hover"
                  >
                    <motion.img
                      src={photo.thumb}
                      alt={photo.title}
                      variants={{ hover: { scale: 1.05 } }}
                      transition={{ duration: 0.4 }}
                      className="w-full block"
                    />
                    <motion.div
                      variants={{ hover: { opacity: 1 } }}
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 flex flex-col justify-end p-4"
                      style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)",
                      }}
                    >
                      <p className="text-white text-sm font-semibold capitalize">{photo.title}</p>
                      {photo.location && (
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>
                          {photo.location}
                        </p>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filtered.length === 0 && (
              <p className="text-center text-gray-600 py-20">Nothing here yet.</p>
            )}
          </>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.92)" }}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              <img
                src={selected.src}
                alt={selected.title}
                className="w-full rounded-xl object-contain"
                style={{ maxHeight: "80vh" }}
              />

              <div className="flex justify-between items-center mt-4 px-1">
                <div>
                  <p className="text-white font-semibold text-sm capitalize">{selected.title}</p>
                  {selected.location && (
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                      {selected.location}
                    </p>
                  )}
                </div>
                <p style={{ color: "rgba(255,255,255,0.25)", fontFamily: "monospace", fontSize: 11 }}>
                  {currentIndex + 1} / {filtered.length}
                </p>
              </div>

              {currentIndex > 0 && (
                <button
                  onClick={() => setSelected(filtered[currentIndex - 1])}
                  className="absolute left-[-52px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                >‹</button>
              )}

              {currentIndex < filtered.length - 1 && (
                <button
                  onClick={() => setSelected(filtered[currentIndex + 1])}
                  className="absolute right-[-52px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                >›</button>
              )}

              <button
                onClick={() => setSelected(null)}
                className="absolute -top-4 -right-4 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              >✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) { .photography-grid { columns: 2 !important; } }
        @media (max-width: 480px) { .photography-grid { columns: 1 !important; } }
      `}</style>
    </div>
  );
};

export default Photography;