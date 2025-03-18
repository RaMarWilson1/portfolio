import React from "react";
import { motion } from "framer-motion";
import { FaJs, FaPython, FaReact, FaNodeJs, FaJava, FaBootstrap, FaHtml5, FaCss3 } from "react-icons/fa";
import { SiMongodb, SiTailwindcss, SiFirebase, SiCplusplus, SiFigma } from "react-icons/si";

// Updated skill set with icons
const skills = [
  { name: "JavaScript", icon: <FaJs />, color: "text-yellow-400" },
  { name: "Python", icon: <FaPython />, color: "text-blue-400" },
  { name: "React", icon: <FaReact />, color: "text-cyan-400" },
  { name: "Node.js", icon: <FaNodeJs />, color: "text-green-400" },
  { name: "MongoDB", icon: <SiMongodb />, color: "text-green-600" },
  { name: "TailwindCSS", icon: <SiTailwindcss />, color: "text-blue-300" },
  { name: "Firebase", icon: <SiFirebase />, color: "text-orange-400" },
  { name: "C++", icon: <SiCplusplus />, color: "text-purple-400" },
  { name: "Java", icon: <FaJava />, color: "text-red-500" },
  { name: "HTML", icon: <FaHtml5 />, color: "text-orange-500" },
  { name: "CSS", icon: <FaCss3 />, color: "text-blue-500" },
  { name: "Bootstrap", icon: <FaBootstrap />, color: "text-indigo-500" },
  { name: "Figma", icon: <SiFigma />, color: "text-pink-500" },
];

// Floating and rotating motion
const randomMotion = (index) => ({
  initial: { x: 0, y: 0, rotate: 0 },
  animate: {
    x: [Math.random() * 40 - 20, Math.random() * 40 - 20],
    y: [Math.random() * 40 - 20, Math.random() * 40 - 20],
    rotate: [0, Math.random() * 15 - 7.5, 0], // Rotating effect
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    repeatType: "reverse",
    delay: index * 0.2,
  },
});

const Skills = () => {
  return (
    <section className="w-full py-16 flex flex-col items-center text-center space-y-12">
      {/* Title */}
      <h2 className="text-4xl font-bold text-white">Skills</h2>

      {/* Floating Bubbles Container */}
      <div className="relative w-full max-w-5xl h-[500px] flex flex-wrap justify-center items-center gap-6">
        {skills.map((skill, index) => (
          <motion.div
            key={index}
            className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full shadow-xl bg-white/10 backdrop-blur-md border border-white/20 ${skill.color} text-3xl md:text-4xl transition-all duration-300`}
            {...randomMotion(index)}
            whileHover={{ scale: 1.2, boxShadow: "0px 0px 20px rgba(255, 255, 255, 0.5)" }} // Hover effect
          >
            {skill.icon}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
