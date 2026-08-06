import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./portfolio/Home";
import SubNav from "./portfolio/SubNav";
import Studio from "./portfolio/Studio";
import Newsletter from "./components/Newsletter";
import Photography from "./components/Photography";
import Poetry from "./components/Poetry";

// Sub-pages share the portfolio dark theme + a matching nav.
const Sub = ({ children }) => (
  <div style={{ minHeight: "100vh", background: "#070A18", color: "#EEF1FA" }}>
    <SubNav />
    {children}
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/newsletter" element={<Sub><Newsletter /></Sub>} />
        <Route path="/photography" element={<Sub><Photography /></Sub>} />
        <Route path="/poetry" element={<Sub><Poetry /></Sub>} />
        <Route path="/studio" element={<Studio />} />
      </Routes>
    </Router>
  );
};

export default App;
