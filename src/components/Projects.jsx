import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// Placeholder image
const placeholderImage = "https://via.placeholder.com/400x250?text=Project+Image";

// Projects with links
const projects = [
  {
    title: "BookBetter",
    description: "A seamless booking platform with Stripe integration.",
    image: "BookBetter_Logo.jpg",
    link: "https://github.com/RaMarWilson1/BookBetter",
  },
  {
    title: "Luxury Tattoo",
    description: "A stylish tattoo booking website with artist pages.",
    image: "LuxuryTats.JPG",
    link: "https://luxurytattoo.com",
  },
  {
    title: "Portfolio Website",
    description: "My personal portfolio built with React and TailwindCSS.",
    image: "logo.png",
    link: "https://ramarwilson.com",
  },
  {
    title: "Hero Chat",
    description: "Collaborated with 2 others to create Hero Chat. Hero chat is a support chat bot that allows you to ask 'JARVIS' anything about super heroes, created with Nextjs, React, Llama 3 and Firebase.",
    image: "HeroChat.png",
    link: "https://github.com/Oscar-999/ChatSupport",
  },
  {
    title: "OpenRuns Shot Clock",
    description: " A html code file for basketball shot clock and score tracking.",
    image: "ShotClock.png",
    link: "https://github.com/RaMarWilson1/Openruns",
  },
  {
    title: "GenAI Projects",
    description: " Collection of Jupyter notebooks exploring generative AI.",
    image: "genAi.jpg",
    link: "https://github.com/RaMarWilson1/GenAI",
  },
];

const Projects = () => {
  const [scrollX, setScrollX] = useState(0);
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll effect with infinite looping
  useEffect(() => {
    if (isHovered) return; // Pause scrolling when hovered

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollBy({ left: 2, behavior: "smooth" });

      const currentIndex = Math.round(scrollRef.current.scrollLeft / 400) % projects.length;
      setActiveIndex(currentIndex);
    }, 20);

    return () => clearInterval(interval);
  }, [isHovered]);

  // Manual scroll functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
      updateActiveIndex(-1);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
      updateActiveIndex(1);
    }
  };

  // Update active project index manually
  const updateActiveIndex = (change) => {
    setActiveIndex((prevIndex) => {
      let newIndex = prevIndex + change;
      if (newIndex < 0) newIndex = projects.length - 1;
      if (newIndex >= projects.length) newIndex = 0;
      return newIndex;
    });
  };

  return (
    <section
      className="w-full py-16 text-center relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="text-4xl font-bold text-white mb-8">My Projects</h2>

      {/* Left Scroll Arrow */}
      <button
        onClick={scrollLeft}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"
      >
        <FaArrowLeft size={24} />
      </button>

      {/* Projects Carousel */}
      <div className="overflow-hidden w-full max-w-6xl mx-auto" ref={scrollRef}>
        <motion.div className="flex space-x-6 p-4">
          {projects.map((project, index) => (
            <motion.a
              key={index}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-w-[300px] md:min-w-[400px] h-[250px] rounded-lg overflow-hidden relative shadow-lg cursor-pointer transition duration-300 ${
                activeIndex === index
                  ? "bg-gradient-to-r from-red-500 to-blue-500 scale-105" // Active Project Styling
                  : "bg-gray-900"
              }`}
              whileHover={{ scale: 1.1 }}
            >
              <img
                src={project.image || placeholderImage}
                alt={project.title}
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition duration-300"
              />
              <div className="absolute bottom-0 bg-black/60 w-full p-4 text-white text-left">
                <h3 className="text-xl font-bold">{project.title}</h3>
                <p className="text-sm">{project.description}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Right Scroll Arrow */}
      <button
        onClick={scrollRight}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"
      >
        <FaArrowRight size={24} />
      </button>
    </section>
  );
};

export default Projects;
