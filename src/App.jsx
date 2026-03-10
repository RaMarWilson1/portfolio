import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutMe from "./components/AboutMe";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import BackgroundAnimation from "./components/BackgroundAnimation";
import Newsletter from "./components/NewsLetter";
import Photography from "./components/Photography";

// Home page — all the existing sections
const Home = () => (
  <>
    <section id="hero"><Hero /></section>
    <section id="about"><AboutMe /></section>
    <section id="skills"><Skills /></section>
    <section id="projects"><Projects /></section>
    <section id="experience"><Experience /></section>
    <section id="contact"><Contact /></section>
    <Footer />
  </>
);

const App = () => {
  return (
    <Router>
      <div className="relative min-h-screen text-white">
        <BackgroundAnimation />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/photography" element={<Photography />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;