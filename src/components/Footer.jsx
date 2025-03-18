import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-400 text-center py-6">
      <p>&copy; {new Date().getFullYear()} Ra'Mar Wilson. All Rights Reserved.</p>
      <p className="text-sm">Built with React, TailwindCSS, and Framer Motion.</p>
    </footer>
  );
};

export default Footer;
