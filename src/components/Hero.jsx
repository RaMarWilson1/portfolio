import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="h-screen flex flex-col items-center justify-center relative">
      {/* Gradient Background Frame (Larger) */}
      <motion.div
        className="relative w-[95%] max-w-5xl h-[400px] rounded-xl bg-gradient-to-r from-red-500 to-blue-500 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Black Rectangle Inside (Larger) */}
        <div className="w-[90%] h-[90%] bg-black rounded-lg flex items-center justify-center overflow-hidden">
          {/* Animated Video */}
          <video
            src="/macbook_animation.mp4" // Use "/macbook_animation.mp4" if placed in public/
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* Name - "Ra'Mar" on the Left, "Wilson" on the Right */}
        <motion.span
          className="absolute left-6 text-white text-5xl font-bold"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          RA'MAR
        </motion.span>
        <motion.span
          className="absolute right-6 text-white text-5xl font-bold"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          WILSON
        </motion.span>
      </motion.div>
    </section>
  );
};

export default Hero;
