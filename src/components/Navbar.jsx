import React, { useState } from "react";
import { Link } from "react-scroll";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const SCROLL_LINKS = ["About", "Skills", "Projects", "Experience", "Contact"];
const PAGE_LINKS = [
  { label: "Newsletter", path: "/newsletter" },
  { label: "Photography", path: "/photography" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handlePageLink = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleScrollLink = (item) => {
    setMenuOpen(false);
    if (!isHome) {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(item.toLowerCase());
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full bg-black p-4 z-50 shadow-md flex justify-between items-center">
        {/* Logo */}
        <a
          href="/"
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-blue-500 text-white font-bold rounded-lg cursor-pointer hover:scale-105 transition duration-300 shadow-lg"
        >
          RaMarWilson.com
        </a>

        {/* Hamburger (mobile) */}
        <button
          className="text-white text-3xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center flex-wrap justify-end gap-2">
          {/* Resume */}
          <li>
            <a
              href="RaMarWilson_Resume_Feb_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold hover:scale-105 transition duration-300 shadow-lg inline-block"
            >
              Resume
            </a>
          </li>

          {/* Scroll links */}
          {SCROLL_LINKS.map((item) =>
            isHome ? (
              <li key={item}>
                <Link
                  to={item.toLowerCase()}
                  smooth={true}
                  duration={800}
                  offset={-70}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold cursor-pointer hover:scale-105 transition duration-300 shadow-lg inline-block"
                >
                  {item}
                </Link>
              </li>
            ) : (
              <li key={item}>
                <button
                  onClick={() => handleScrollLink(item)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold cursor-pointer hover:scale-105 transition duration-300 shadow-lg"
                >
                  {item}
                </button>
              </li>
            )
          )}

          {/* Page links — outlined to distinguish from scroll links */}
          {PAGE_LINKS.map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <li key={label}>
                <button
                  onClick={() => handlePageLink(path)}
                  className="px-4 py-2 rounded-lg text-white font-semibold hover:scale-105 transition duration-300"
                  style={{
                    background: active
                      ? "linear-gradient(to right, #ef4444, #3b82f6)"
                      : "transparent",
                    border: "1.5px solid #ef4444",
                    boxShadow: active ? "0 0 12px rgba(239,68,68,0.3)" : "none",
                  }}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 bg-black p-8 z-[100] transform ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 md:hidden`}
      >
        <button
          className="absolute top-4 right-6 text-white text-3xl"
          onClick={() => setMenuOpen(false)}
        >
          <FaTimes />
        </button>

        <ul className="flex flex-col space-y-6 mt-12 text-center">
          <li>
            <a
              href="RaMarWilson_Resume_Feb_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white text-2xl font-semibold hover:text-blue-400 transition"
            >
              Resume
            </a>
          </li>

          {SCROLL_LINKS.map((item) => (
            <li key={item}>
              {isHome ? (
                <Link
                  to={item.toLowerCase()}
                  smooth={true}
                  duration={800}
                  offset={-70}
                  className="block text-white text-2xl font-semibold hover:text-blue-400 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </Link>
              ) : (
                <button
                  onClick={() => handleScrollLink(item)}
                  className="block w-full text-white text-2xl font-semibold hover:text-blue-400 transition"
                >
                  {item}
                </button>
              )}
            </li>
          ))}

          {/* Gradient divider */}
          <li>
            <div
              className="w-full h-px"
              style={{ background: "linear-gradient(to right, #ef4444, #3b82f6)" }}
            />
          </li>

          {/* Page links */}
          {PAGE_LINKS.map(({ label, path }) => (
            <li key={label}>
              <button
                onClick={() => handlePageLink(path)}
                className="block w-full text-2xl font-semibold transition hover:opacity-80"
                style={{
                  background: "linear-gradient(90deg, #ef4444, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Navbar;