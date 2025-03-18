import React, { useState } from "react";
import { Link } from "react-scroll";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full bg-black p-4 z-50 shadow-md flex justify-between items-center">
        {/* Left Side - RaMarWilson.com Button */}
        <a
          href="https://RaMarWilson.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-blue-500 text-white font-bold rounded-lg cursor-pointer hover:scale-105 transition duration-300 shadow-lg"
        >
          RaMarWilson.com
        </a>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="text-white text-3xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Links (Desktop) */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <a
              href="/resume.pdf" // Opens resume in a new tab
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold cursor-pointer hover:scale-105 transition duration-300 shadow-lg"
            >
              Resume
            </a>
          </li>
          {["About", "Skills", "Projects", "Experience", "Contact"].map((item) => (
            <li key={item}>
              <Link
                to={item.toLowerCase()}
                smooth={true}
                duration={800}
                offset={-70}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-blue-500 text-white font-semibold cursor-pointer hover:scale-105 transition duration-300 shadow-lg cursor-pointer"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Menu (Slide-In) */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 bg-black p-8 transform ${
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
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white text-2xl font-semibold hover:text-blue-400 transition"
            >
              Resume
            </a>
          </li>
          {["About", "Skills", "Projects", "Experience", "Contact"].map((item) => (
            <li key={item}>
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
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Navbar;
