import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SITE } from "../content/site";
import { fetchJson } from "../lib/fetchJson";
import { trackClick } from "../lib/analytics";

const WHAT_TO_EXPECT = [
  { emoji: "💻", label: "Code",        desc: "What I'm building, shipping, and learning. No fluff." },
  { emoji: "📷", label: "Photography", desc: "Shots from wherever life takes me — streets, courts, open roads." },
  { emoji: "🚗", label: "Cars",        desc: "The Mustang, car culture, and everything on four wheels." },
  { emoji: "🔖", label: "Life",        desc: "Real thoughts on growth, goals, and figuring it out." },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

// Inject Beehiiv script once
const useBeehiivScript = () => {
  useEffect(() => {
    const SCRIPT_SRC = "https://subscribe-forms.beehiiv.com/embed.js";
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      const el = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
      if (el) el.remove();
    };
  }, []);
};

// Static issues from site config, numbered newest-first, for when Beehiiv is unreachable.
const FALLBACK_POSTS = SITE.newsletter.issues.map((it, i, all) => ({
  id: it.url,
  title: it.title,
  date: it.date,
  url: it.url,
  issueNumber: all.length - i,
}));

const Newsletter = () => {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false); // showing the static fallback list
  useBeehiivScript();

  useEffect(() => {
    fetchJson("/api/posts")
      .then((data) => {
        const list = Array.isArray(data.posts) ? data.posts.filter((p) => p && p.url && p.title) : [];
        setPosts(list);
      })
      .catch(() => {
        setPosts(FALLBACK_POSTS);
        setOffline(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen w-full pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-20">

        {/* ── Hero ──────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <motion.div {...fadeUp(0)}>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-white font-bold leading-tight"
            style={{ fontSize: "clamp(2.4rem, 7vw, 4.5rem)" }}
          >
            Life. Code.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(120deg, #F2B85C, #F2765C)" }}
            >
              Everything
            </span>
            <br />
            between.
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-lg leading-relaxed max-w-xl" style={{ color: "#A6AFCE" }}>
            A personal newsletter by <strong className="text-white">Ra'Mar Wilson</strong>.
            Photography, cars, code, and real life — shipped to your inbox whenever
            something feels worth saying.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-3 pt-1">
            {["No spam, ever", "Always free", "Real talk only"].map((chip) => (
              <span
                key={chip}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10"
                style={{ color: "#C9D0E6", background: "rgba(255,255,255,0.03)" }}
              >
                {chip}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Beehiiv Embed ─────────────────────────────── */}
        <motion.div
          {...fadeUp(0.1)}
          className="w-full rounded-2xl overflow-hidden"
          style={{ padding: "2px", }}
        >
          <div className="w-full rounded-2xl flex items-center justify-center overflow-hidden" style={{ minHeight: 340 }}>
            <iframe
              src="https://subscribe-forms.beehiiv.com/5e20b655-bf2c-4a0e-beca-7d8373d7c38a"
              className="beehiiv-embed"
              data-test-id="beehiiv-embed"
              title="Subscribe to Between Commits"
              loading="lazy"
              frameBorder="0"
              scrolling="no"
              style={{
                width: "100%",
                maxWidth: 594,
                height: 339,
                margin: 0,
                backgroundColor: "transparent",
                boxShadow: "none",
              }}
            />
          </div>
        </motion.div>

        {/* ── What's inside ─────────────────────────────── */}
        <motion.div {...fadeUp(0)} className="flex flex-col gap-8">
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A6AFCE", fontFamily: "monospace", marginBottom: 10 }}>
              What's inside
            </p>
            <h2 className="text-white text-2xl font-bold">Every issue, you get:</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHAT_TO_EXPECT.map(({ emoji, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex gap-4 p-5 rounded-xl border border-white/[0.07]"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <span className="text-2xl leading-none pt-0.5" aria-hidden="true">{emoji}</span>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#A6AFCE" }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Divider ───────────────────────────────────── */}
        <div className="w-full h-px" style={{ background: "linear-gradient(to right, #F2B85C, transparent, #F2765C)" }} />

        {/* ── Issues archive ────────────────────────────── */}
        <motion.div {...fadeUp(0)} className="flex flex-col gap-6">
          <h2 style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A6AFCE", fontFamily: "monospace", fontWeight: 400 }}>
            Latest issues
          </h2>
          {offline && (
            <p className="text-sm" style={{ color: "#A6AFCE" }}>
              The live archive isn’t loading right now, so here are recent issues.{" "}
              <a href={SITE.newsletter.home} target="_blank" rel="noopener noreferrer" style={{ color: "#F2B85C" }}>
                See every issue on Beehiiv ↗
              </a>
            </p>
          )}

          {loading && (
            <div className="flex items-center gap-3 py-8">
              <div
                className="w-6 h-6 rounded-full border-2 border-transparent animate-spin shrink-0"
                style={{ borderTopColor: "#F2B85C", borderRightColor: "#F2765C" }}
              />
              <p style={{ color: "#A6AFCE", fontFamily: "monospace", fontSize: 12 }}>
                Loading issues...
              </p>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div
              className="flex flex-col gap-3 p-6 rounded-xl border border-white/[0.07] items-center text-center"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "linear-gradient(120deg, #F2B85C, #F2765C)", color: "#fff", fontFamily: "monospace" }}
              >
                Coming Soon
              </span>
              <p className="text-white font-semibold">Issue #01 drops soon</p>
              <p className="text-sm max-w-sm" style={{ color: "#A6AFCE" }}>
                Subscribe above to be the first to read it.
              </p>
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="flex flex-col gap-4">
              {posts.map((post, i) => (
                <motion.a
                  key={post.id}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackClick("newsletter_issue_opened", { issue: post.title, issueNumber: post.issueNumber, location: "newsletter_page" })}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ scale: 1.01 }}
                  className="flex gap-4 p-5 rounded-xl border border-white/[0.07] transition-all duration-200 group"
                  style={{ background: "rgba(255,255,255,0.02)", textDecoration: "none" }}
                >
                  {/* Thumbnail */}
                  {post.thumbnail && (
                    <img
                      src={post.thumbnail}
                      alt=""
                      width={80}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                    />
                  )}

                  <div className="flex flex-col gap-1 min-w-0">
                    <p style={{ color: "#A6AFCE", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em" }}>
                      {post.issueNumber ? `ISSUE ${String(post.issueNumber).padStart(2, "0")} · ` : ""}{post.date}
                      {i === 0 && <span style={{ marginLeft: 8, color: "#070A18", background: "#F2B85C", padding: "2px 6px", borderRadius: 4, fontSize: 9 }}>LATEST</span>}
                    </p>
                    <p className="text-white font-semibold text-sm group-hover:text-[#F2B85C] transition-colors truncate">
                      {post.title}
                    </p>
                    {post.previewText && (
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#A6AFCE" }}>
                        {post.previewText}
                      </p>
                    )}
                    <span
                      className="text-xs font-semibold mt-1 w-fit"
                      style={{
                        background: "linear-gradient(120deg, #F2B85C, #F2765C)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Read →
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Newsletter;