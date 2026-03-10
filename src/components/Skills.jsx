import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FaJs, FaPython, FaReact, FaNodeJs, FaJava,
  FaBootstrap, FaHtml5, FaCss3, FaGitAlt, FaDatabase,
} from "react-icons/fa";
import {
  SiNextdotjs, SiFlask, SiTailwindcss, SiFramer,
  SiPostgresql, SiMongodb, SiVercel, SiFirebase, SiFigma,
  SiTypescript, SiAnthropic, SiStripe, SiDrizzle, SiGoogle, SiClerk,
} from "react-icons/si";

const CLUSTERS = [
  {
    label: "Languages",
    accent: "#ef4444",
    gradientTo: "#a855f7",
    skills: [
      { name: "JavaScript", icon: <FaJs />,        color: "#facc15" },
      { name: "TypeScript", icon: <SiTypescript />, color: "#3b82f6" },
      { name: "Python",     icon: <FaPython />,     color: "#60a5fa" },
      { name: "Java",       icon: <FaJava />,       color: "#f87171" },
      { name: "HTML",       icon: <FaHtml5 />,      color: "#f97316" },
      { name: "CSS",        icon: <FaCss3 />,       color: "#818cf8" },
    ],
  },
  {
    label: "Frameworks",
    accent: "#a855f7",
    gradientTo: "#3b82f6",
    skills: [
      { name: "React",         icon: <FaReact />,       color: "#22d3ee" },
      { name: "Next.js",       icon: <SiNextdotjs />,   color: "#ffffff" },
      { name: "Node.js",       icon: <FaNodeJs />,      color: "#4ade80" },
      { name: "Flask",         icon: <SiFlask />,       color: "#d1d5db" },
      { name: "Tailwind",      icon: <SiTailwindcss />, color: "#7dd3fc" },
      { name: "Bootstrap",     icon: <FaBootstrap />,   color: "#818cf8" },
      { name: "Framer Motion", icon: <SiFramer />,      color: "#f472b6" },
    ],
  },
  {
    label: "Tools & DB",
    accent: "#3b82f6",
    gradientTo: "#06b6d4",
    skills: [
      { name: "PostgreSQL",  icon: <SiPostgresql />, color: "#60a5fa" },
      { name: "MongoDB",     icon: <SiMongodb />,    color: "#4ade80" },
      { name: "Git",         icon: <FaGitAlt />,     color: "#f97316" },
      { name: "Azure",       icon: <FaDatabase />,   color: "#3b82f6" },
      { name: "Vercel",      icon: <SiVercel />,     color: "#ffffff" },
      { name: "Firebase",    icon: <SiFirebase />,   color: "#fb923c" },
      { name: "Figma",       icon: <SiFigma />,      color: "#f472b6" },
      { name: "Claude Code",  icon: <SiAnthropic />, color: "#cc785c" },
      { name: "Drizzle ORM",  icon: <SiDrizzle />,   color: "#c5f74f" },
      { name: "Stripe",       icon: <SiStripe />,    color: "#635bff" },
      { name: "Google OAuth", icon: <SiGoogle />,    color: "#ea4335" },
      { name: "Clerk",        icon: <SiClerk />,     color: "#6c47ff" },
    ],
  },
];

function useFloatParams(count) {
  return useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x:        +(Math.random() * 24 - 12).toFixed(1),
        y:        +(Math.random() * 24 - 12).toFixed(1),
        rotate:   +(Math.random() * 12 - 6).toFixed(1),
        duration: +(3.5 + Math.random() * 2.5).toFixed(2),
        delay:    +(Math.random() * 1.5).toFixed(2),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count],
  );
}

const Bubble = ({ skill, fp, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ x: [0, fp.x, 0], y: [0, fp.y, 0], rotate: [0, fp.rotate, 0] }}
        transition={{
          duration: fp.duration,
          delay: fp.delay,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          cursor: "default",
          background: hovered
            ? `radial-gradient(circle at 40% 35%, ${skill.color}22, transparent 70%), rgba(255,255,255,0.09)`
            : "rgba(255,255,255,0.05)",
          border: `1px solid ${hovered ? skill.color + "66" : "rgba(255,255,255,0.1)"}`,
          boxShadow: hovered
            ? `0 0 22px ${skill.color}44, inset 0 0 10px ${skill.color}11`
            : "0 2px 10px rgba(0,0,0,0.35)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "background 0.25s, border 0.25s, box-shadow 0.25s",
        }}
      >
        <span
          style={{
            fontSize: 22,
            color: skill.color,
            filter: hovered ? `drop-shadow(0 0 6px ${skill.color})` : "none",
            transform: hovered ? "scale(1.18)" : "scale(1)",
            transition: "filter 0.25s, transform 0.25s",
            display: "flex",
          }}
        >
          {skill.icon}
        </span>
        <span
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: "0.03em",
            color: hovered ? "#fff" : "rgba(255,255,255,0.5)",
            textAlign: "center",
            lineHeight: 1.2,
            padding: "0 4px",
            transition: "color 0.2s",
          }}
        >
          {skill.name}
        </span>
      </motion.div>
    </motion.div>
  );
};

const Cluster = ({ cluster, index }) => {
  const floatParams = useFloatParams(cluster.skills.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      style={{
        position: "relative",
        flex: "1 1 300px",
        padding: "36px 20px 28px",
        borderRadius: 20,
        background: `radial-gradient(ellipse at 50% 0%, ${cluster.accent}0e, transparent 65%), rgba(255,255,255,0.025)`,
        border: `1px solid ${cluster.accent}2e`,
      }}
    >
      {/* Pill label */}
      <div
        style={{
          position: "absolute",
          top: -13,
          left: 20,
          padding: "3px 16px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#fff",
          background: `linear-gradient(90deg, ${cluster.accent}, ${cluster.gradientTo})`,
          boxShadow: `0 4px 16px ${cluster.accent}55`,
        }}
      >
        {cluster.label}
      </div>

      {/* Bubbles */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
        {cluster.skills.map((skill, i) => (
          <Bubble key={skill.name} skill={skill} fp={floatParams[i]} index={i} />
        ))}
      </div>
    </motion.div>
  );
};

const Skills = () => (
  <section
    style={{
      width: "100%",
      padding: "96px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 48,
    }}
  >
    {/* Header */}
    <div style={{ textAlign: "center" }}>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: 12,
        }}
      >
        What I work with
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1.1,
        }}
      >
        Skills &{" "}
        <span
          style={{
            backgroundImage: "linear-gradient(90deg, #ef4444, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Stack
        </span>
      </motion.h2>
    </div>

    {/* Three clusters */}
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 20,
        width: "100%",
        maxWidth: 1100,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {CLUSTERS.map((cluster, i) => (
        <Cluster key={cluster.label} cluster={cluster} index={i} />
      ))}
    </div>
  </section>
);

export default Skills;