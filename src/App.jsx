import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Home from "./portfolio/Home";
import SiteNav from "./portfolio/SiteNav";
import SiteFooter from "./portfolio/SiteFooter";
import RouteScroll from "./portfolio/RouteScroll";
import RouteMeta from "./portfolio/RouteMeta";
import ErrorBoundary from "./portfolio/ErrorBoundary";
import NotFound from "./portfolio/NotFound";
import Studio from "./portfolio/Studio";
import Newsletter from "./components/Newsletter";
import Photography from "./components/Photography";
import Poetry from "./components/Poetry";

// Sub-pages share the portfolio dark theme, nav and footer with the homepage.
const Sub = ({ children }) => (
  <div style={{ minHeight: "100vh", background: "#070A18", color: "#EEF1FA" }}>
    <SiteNav />
    <main id="main">{children}</main>
    <SiteFooter />
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      {/* Framer Motion animations respect prefers-reduced-motion site-wide. */}
      <MotionConfig reducedMotion="user">
        <Router>
          <RouteScroll />
          <RouteMeta />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/newsletter" element={<Sub><Newsletter /></Sub>} />
            <Route path="/photography" element={<Sub><Photography /></Sub>} />
            <Route path="/poetry" element={<Sub><Poetry /></Sub>} />
            <Route path="/studio" element={<Studio />} />
            <Route path="*" element={<Sub><NotFound /></Sub>} />
          </Routes>
        </Router>
      </MotionConfig>
    </ErrorBoundary>
  );
};

export default App;
