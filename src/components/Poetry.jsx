import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://www.ramarwilson.com";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const Poetry = () => {
  const [poems, setPoems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/poems`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.poems ?? [];
        setPoems(list);
        // Auto-select featured poem or first poem
        const featured = list.find((p) => p.featured) ?? list[0];
        if (featured) setSelected(featured);
      })
      .catch(() => setPoems([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = poems.find((p) => p.featured) ?? poems[0];
  const rest = poems.filter((p) => p.id !== featured?.id);

  return (
    <div className="min-h-screen w-full pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-16">

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
            Written Word
          </motion.p>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-white font-bold leading-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
          >
            Between the{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #ef4444, #3b82f6)" }}
            >
              lines.
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-gray-400 text-base max-w-lg">
            Thoughts that didn't fit in code. Words that needed somewhere to go.
          </motion.p>
        </div>

        {/* ── Loading ─────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: "#ef4444", borderRightColor: "#3b82f6" }}
            />
            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontFamily: "monospace",
                fontSize: 12,
              }}
            >
              Loading poems...
            </p>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────── */}
        {!loading && poems.length === 0 && (
          <div
            className="p-8 rounded-xl text-center border border-white/[0.07]"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-gray-500 text-sm">
              No poems yet. Upload a JSON file to your Vercel Blob under the{" "}
              <code className="text-gray-400">poetry/</code> prefix.
            </p>
          </div>
        )}

        {!loading && poems.length > 0 && (
          <>
            {/* ── Featured Poem ───────────────────────── */}
            {featured && (
              <motion.div
                {...fadeUp(0)}
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  padding: "2px",
                  background: "linear-gradient(135deg, #ef4444, #3b82f6)",
                }}
              >
                <div
                  className="w-full rounded-2xl p-8 md:p-12 flex flex-col gap-6"
                  style={{ background: "#0f0f0f" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #ef4444, #3b82f6)",
                        color: "#fff",
                        fontFamily: "monospace",
                      }}
                    >
                      Featured
                    </span>
                    {featured.date && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.3)",
                          fontFamily: "monospace",
                        }}
                      >
                        {featured.date}
                      </span>
                    )}
                  </div>

                  <h2
                    className="text-white font-bold"
                    style={{
                      fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                      lineHeight: 1.2,
                    }}
                  >
                    {featured.title}
                  </h2>

                  <div
                    className="text-gray-300 leading-loose whitespace-pre-line"
                    style={{ fontSize: "1.05rem", maxWidth: "65ch" }}
                  >
                    {featured.body}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── All Poems Grid ──────────────────────── */}
            {rest.length > 0 && (
              <div className="flex flex-col gap-8">
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "monospace",
                  }}
                >
                  More poems
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((poem, i) => (
                    <motion.div
                      key={poem.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      onClick={() => setSelected(poem)}
                      className="flex flex-col gap-3 p-5 rounded-xl cursor-pointer transition-all duration-200"
                      style={{
                        border:
                          selected?.id === poem.id
                            ? "1px solid rgba(239,68,68,0.5)"
                            : "1px solid rgba(255,255,255,0.07)",
                        background:
                          selected?.id === poem.id
                            ? "rgba(239,68,68,0.05)"
                            : "rgba(255,255,255,0.02)",
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {poem.date && (
                        <p
                          style={{
                            fontSize: 10,
                            color: "rgba(255,255,255,0.25)",
                            fontFamily: "monospace",
                          }}
                        >
                          {poem.date}
                        </p>
                      )}
                      <p className="text-white font-semibold text-sm">
                        {poem.title}
                      </p>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 whitespace-pre-line">
                        {poem.body}
                      </p>
                      <span
                        className="text-xs font-semibold mt-auto"
                        style={{
                          background: "linear-gradient(90deg, #ef4444, #3b82f6)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Read →
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Full Poem Modal ──────────────────────────────── */}
      <AnimatePresence>
        {selected && selected.id !== featured?.id && (
          <motion.div
            key="poem-modal"
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
              className="relative w-full max-w-2xl rounded-2xl p-8 md:p-12 flex flex-col gap-6 overflow-y-auto"
              style={{
                background: "#0f0f0f",
                border: "1px solid rgba(255,255,255,0.1)",
                maxHeight: "85vh",
              }}
            >
              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                ✕
              </button>

              {selected.date && (
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "monospace",
                  }}
                >
                  {selected.date}
                </p>
              )}

              <h2
                className="text-white font-bold"
                style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
              >
                {selected.title}
              </h2>

              <div
                className="text-gray-300 leading-loose whitespace-pre-line"
                style={{ fontSize: "1rem" }}
              >
                {selected.body}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Poetry;