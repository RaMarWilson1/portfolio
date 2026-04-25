import React, { useEffect, useRef, useMemo } from "react";

// Pre-generate stable random values so particles don't shift on re-render
function useParticles(count) {
  return useMemo(
    () =>
      Array.from({ length: count }, () => ({
        top:      Math.random() * 100,
        left:     Math.random() * 100,
        duration: Math.random() * 15 + 10,
        delay:    Math.random() * 10,
        size:     Math.random() * 3 + 1,
      })),
    [count]
  );
}

const BackgroundAnimation = () => {
  const containerRef = useRef(null);
  const particles = useParticles(20); // reduced from 30

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId;
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    const dots = container.querySelectorAll(".bg-particle");

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      // Lerp toward mouse — smooth lag effect
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      dots.forEach((dot, i) => {
        const factor = (i % 5 + 1) * 0.003;
        dot.style.transform = `translate(${currentX * factor}px, ${currentY * factor}px)`;
      });

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{ zIndex: -1, pointerEvents: "none" }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="bg-particle absolute rounded-full bg-gray-600"
          style={{
            top: `${p.top}vh`,
            left: `${p.left}vw`,
            width: p.size,
            height: p.size,
            opacity: 0.12,
            willChange: "transform",
            animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
          }}
        />
      ))}

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) }
          50%  { opacity: 0.25; }
          100% { transform: translateY(-100vh); opacity: 0.05; }
        }
      `}</style>
    </div>
  );
};

export default BackgroundAnimation;