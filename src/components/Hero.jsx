import React from "react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="h-screen flex flex-col items-center justify-center relative">
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
            src="macbook_animation.mp4" // Use "/macbook_animation.mp4" if placed in public/
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
    </section>
  );
};

export default Hero;
