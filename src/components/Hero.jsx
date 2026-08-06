import React from "react";
import { motion } from "framer-motion";

const GRADIENT = "linear-gradient(90deg, #ef4444, #3b82f6)";

const stats = [
  { value: "2", label: "products shipped solo" },
  { value: "1,500+", label: "automated tests" },
  { value: "95+", label: "users · 50% retention" },
  { value: "3", label: "platforms — web · iOS · Android" },
];

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative py-28 gap-10">
      {/* Gradient Background Frame */}
      <motion.div
        className="relative w-[95%] max-w-5xl h-[400px] md:h-[300px] rounded-xl bg-gradient-to-r from-red-500 to-blue-500 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Black Rectangle Inside */}
        <div className="w-[90%] h-[90%] bg-black rounded-lg flex items-center justify-center overflow-hidden">
          {/* Animated Video */}
          <video
            src="macbook_animation.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* Name - Responsive Layout */}
        <div className="absolute flex flex-col items-center w-full px-6 md:flex-row md:justify-between">
          <motion.span
            className="text-white text-3xl md:text-5xl font-bold"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            RA'MAR
          </motion.span>
          <motion.span
            className="text-white text-3xl md:text-5xl font-bold mt-2 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            WILSON
          </motion.span>
        </div>
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="text-center text-lg md:text-2xl text-gray-200 max-w-3xl px-6 leading-snug"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        Product engineer who ships end-to-end — and owns the{" "}
        <span
          className="bg-clip-text text-transparent font-semibold"
          style={{ backgroundImage: GRADIENT }}
        >
          product decisions
        </span>{" "}
        behind the code. Barber of six years turned founder.
      </motion.p>

      {/* Stats strip */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p
              className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: GRADIENT }}
            >
              {s.value}
            </p>
            <p className="text-xs md:text-sm text-gray-400">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default Hero;
