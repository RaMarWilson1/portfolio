import React, { useState, useEffect } from "react";
import { FaCloud, FaCode, FaBook, FaMedal, FaUsers, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const titles = [
  { name: "Dreamer", icon: <FaCloud className="text-6xl text-white" /> },
  { name: "Software Engineer", icon: <FaCode className="text-6xl text-white" /> },
  { name: "Mentor", icon: <FaUsers className="text-6xl text-white" /> },
  { name: "Learner", icon: <FaBook className="text-6xl text-white" /> },
  { name: "Achiever", icon: <FaMedal className="text-6xl text-white" /> },
];

const TitleCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % titles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextCard = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % titles.length);
  const prevCard = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + titles.length) % titles.length);

  return (
    <div className="relative flex items-center justify-center w-full h-[300px]">
      {/* Left Arrow */}
      <button onClick={prevCard} className="absolute left-10 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition">
        <FaArrowLeft size={24} />
      </button>

      {/* Card Container */}
      <div className="relative w-[80%] h-full bg-gradient-to-r from-red-500 to-blue-500 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={titles[currentIndex].name}
            className="flex flex-col items-center text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {titles[currentIndex].icon}
            <h2 className="text-4xl font-bold mt-4">{titles[currentIndex].name}</h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Arrow */}
      <button onClick={nextCard} className="absolute right-10 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 transition">
        <FaArrowRight size={24} />
      </button>
    </div>
  );
};

export default TitleCards;
