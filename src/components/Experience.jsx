import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Placeholder logo
const placeholderLogo = "https://via.placeholder.com/80x80?text=Logo";

// Company Logos (Use placeholders if logos are missing)
const experiences = [
  {
    title: "Founder & Product Engineer",
    company: "Bontro",
    period: "Jan 2026 – Present",
    description:
      "Architected and shipped a zero-commission booking & payments SaaS solo — web, native iOS/Android, and a PIN-gated in-shop kiosk. Defined the pricing model, instrumented the full funnel, and secured pre-seed funding.",
    logo: "Bontro_Logo.png",
  },
  {
    title: "Product Engineer",
    company: "One More Day",
    period: "Jun 2025 – Present",
    description:
      "Built a dual-layer AI moderation pipeline and COPPA-compliant onboarding for a peer-support app, plus a crisis-detection intervention flow — reached 95+ users at 50% retention.",
    logo: "OMDLogo.png",
  },
  {
    title: "Software Engineer Intern",
    company: "Medidata Solutions",
    period: "May 2025 – Aug 2025",
    description:
      "Led architecture for an internal analytics app built for C-suite executives; shipped 3 interactive dashboards and improved QA decision-making efficiency by 25%.",
    logo: "medidata.png",
  },
  {
    title: "Software Engineer Fellow",
    company: "HeadStarter AI",
    period: "Jul 2024 – Aug 2024",
    description:
      "Built AI-powered apps with Next.js, OpenAI, and Stripe in Agile teams alongside industry mentors.",
    logo: "headstarter.jpg",
  },
  {
    title: "IT Technician",
    company: "Saint Joseph's University",
    period: "May 2024 – May 2026",
    description:
      "Maintained Microsoft Azure infrastructure serving 19,000+ students, handling data security and system upkeep.",
    logo: "SJU.jpg",
  },
];

const Experience = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto-rotate effect (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % experiences.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-16 flex flex-col items-center text-center space-y-12">
      <h2 className="text-4xl font-bold text-white">Work Experience</h2>

      {/* Experience Cards */}
      <div className="relative w-full max-w-4xl flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-6">
        {/* Experience List (Side Panel for Manual Selection) */}
        <div className="flex flex-col space-y-4">
          {experiences.map((exp, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`p-3 w-64 text-left rounded-lg transition-all ${
                selectedIndex === index ? "bg-gradient-to-r from-red-500 to-blue-500 text-white font-bold scale-105" : "bg-gray-800 text-gray-300"
              } hover:bg-gray-700`}
            >
              <span className="ml-2">{exp.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Experience Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            className="w-80 md:w-[500px] p-6 bg-gray-900 rounded-lg shadow-lg text-white flex flex-col items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Company Logo with Placeholder */}
            <img
              src={experiences[selectedIndex].logo || placeholderLogo}
              alt={experiences[selectedIndex].company}
              className="w-20 h-20 mb-4 object-contain"
            />

            <h3 className="text-2xl font-bold">{experiences[selectedIndex].title}</h3>
            <p className="text-lg text-gray-400">{experiences[selectedIndex].company}</p>
            <p className="text-sm text-gray-300 mb-4">{experiences[selectedIndex].period}</p>
            <p className="text-md">{experiences[selectedIndex].description}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Experience;
