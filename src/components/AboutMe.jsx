import React from "react";
import { motion } from "framer-motion";
import TitleCards from "./TitleCards";

const AboutMe = () => {
  return (
    <section className="w-full py-16 flex flex-col items-center text-center space-y-12">
      {/* Full-Width About Me Section */}
      <motion.div
        className="w-[90%] max-w-4xl text-white text-lg bg-gray-900 p-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-4xl font-bold text-white mb-4">About Me</h2>
        <p>
          Hey, I’m <strong>Ra’Mar!</strong> A passionate <strong>Software Engineer, Designer, and Innovator</strong> who loves building intuitive and visually engaging digital experiences. I enjoy crafting seamless user interfaces, developing innovative solutions, and pushing the boundaries of web design. Whether it’s designing a sleek website, coding interactive UI elements, or developing full-scale applications, I’m always striving to bring ideas to life with clean, efficient code.  

          Beyond tech, I share my journey as a <strong>software engineer</strong> through social media, documenting my growth, projects, and daily life. I have a deep passion for <strong>content creation</strong>, blending storytelling with technology to inspire others. When I’m not coding, you can find me on the <strong>basketball court</strong>, staying active, or working toward my <strong>fitness goals</strong>. I’m always looking for ways to challenge myself and grow, both in tech and in life.  
      </p>

      </motion.div>

      {/* Centered Title Cards */}
      <div className="w-[90%] max-w-5xl flex flex-col items-center justify-center">
        <TitleCards />
      </div>
    </section>
  );
};

export default AboutMe;

