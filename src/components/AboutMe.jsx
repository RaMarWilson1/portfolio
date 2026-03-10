
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TitleCards from "./TitleCards";

const PREVIEW_PHOTOS = [
  
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80",
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&q=80",
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

const AboutMe = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full py-24 flex flex-col items-center space-y-20 px-6">

      {/* ── Two-column bio ─────────────────────────────── */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* Left — profile image */}
        <motion.div {...fadeUp(0)} className="relative w-full">
          <div
            className="rounded-2xl p-[2px]"
            style={{ background: "linear-gradient(135deg, #ef4444, #3b82f6)" }}
          >
            <div className="rounded-2xl overflow-hidden bg-black">
              {/* Replace src with your actual headshot */}
              <img
                src="03B77C77-08B5-4849-9587-75632D12316B_1_105_c.jpeg"
                alt="Ra'Mar Wilson"
                className="w-full h-[380px] object-cover object-top"
                style={{ filter: "grayscale(20%) contrast(1.05)" }}
              />
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl text-white text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "linear-gradient(135deg, #ef4444, #3b82f6)",
              boxShadow: "0 8px 32px rgba(239,68,68,0.35)",
            }}
          >
            SJU '26
          </motion.div>
        </motion.div>

        {/* Right — copy */}
        <div className="flex flex-col space-y-6">
          <motion.h2
            {...fadeUp(0.1)}
            className="text-4xl font-bold text-white leading-tight"
          >
            About{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #ef4444, #3b82f6)" }}
            >
              Me
            </span>
          </motion.h2>

          <motion.p
            {...fadeUp(0.2)}
            className="text-gray-300 text-base leading-relaxed text-left"
          >
            Hey, I'm <strong className="text-white">Ra'Mar</strong> — a Software Engineer,
            Designer, and Innovator who loves building intuitive, visually engaging digital
            experiences. Whether it's crafting seamless UIs or developing full-scale
            applications, I'm always pushing to bring ideas to life with clean, efficient code.
          </motion.p>

          <motion.p
            {...fadeUp(0.3)}
            className="text-gray-400 text-base leading-relaxed text-left"
          >
            Beyond tech, I share my journey through social media, blending storytelling with
            technology. When I'm not building, you'll find me on the{" "}
            <strong className="text-white">basketball court</strong>, chasing the next goal,
            or{" "}
            <button
              onClick={() => navigate("/photography")}
              className="font-semibold transition-opacity hover:opacity-75"
              style={{
                background: "linear-gradient(90deg, #ef4444, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              behind a lens →
            </button>
          </motion.p>

          {/* Stat chips */}
          <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-3 pt-2">
            {[
              { label: "CS Senior",  sub: "Saint Joseph's University" },
              { label: "60+ Users",  sub: "One More Day" },
              { label: "Full-Stack", sub: "React · Next · Node" },
            ].map(({ label, sub }) => (
              <div
                key={label}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-left"
              >
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-gray-500 text-xs">{sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Photography strip ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        {/* Strip header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-white text-sm font-semibold tracking-wide">
            Through the lens
          </p>
          <button
            onClick={() => navigate("/photography")}
            className="text-xs font-semibold tracking-widest uppercase hover:opacity-70 transition-opacity"
            style={{
              background: "linear-gradient(90deg, #ef4444, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            View Gallery →
          </button>
        </div>

        {/* 4-photo grid — 2 cols on mobile, 4 on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PREVIEW_PHOTOS.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate("/photography")}
              className="relative overflow-hidden rounded-xl cursor-pointer aspect-square"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <img
                src={src}
                alt={`preview ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              {/* Red→blue overlay on hover */}
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(59,130,246,0.25))",
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Title Cards ────────────────────────────────── */}
      <div className="w-[90%] max-w-5xl flex flex-col items-center justify-center">
        <TitleCards />
      </div>
    </section>
  );
};

export default AboutMe;