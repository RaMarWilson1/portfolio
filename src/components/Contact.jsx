import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaYoutube, FaInstagram, FaDiscord, FaEnvelope } from "react-icons/fa";

const Contact = () => {
  return (
    <section className="w-full py-16 flex flex-col items-center text-center space-y-6">
      <h2 className="text-4xl font-bold text-white">Let's Connect</h2>
      <p className="text-gray-400 max-w-lg">
        Feel free to reach out via email or connect with me on social media!
      </p>

      {/* Email Link with Animation */}
      <motion.a
        href="mailto:ramarwilson1@gmail.com"
        className="flex items-center space-x-2 text-lg text-white hover:text-blue-400 transition"
        whileHover={{ scale: 1.1, x: 5, boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.4)" }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FaEnvelope className="text-2xl" />
        <span>ramarwilson1@gmail.com</span>
      </motion.a>

      {/* Social Media Links with Animations */}
      <div className="flex space-x-6 text-3xl">
        {[
          { href: "https://github.com/ramarwilson1", icon: <FaGithub />, color: "text-white" },
          { href: "https://www.linkedin.com/in/ramar-wilson-181049274/", icon: <FaLinkedin />, color: "text-blue-400" },
          { href: "https://www.youtube.com/@ramarwilson1", icon: <FaYoutube />, color: "text-red-500" },
          { href: "https://www.instagram.com/ramarwilson1", icon: <FaInstagram />, color: "text-pink-500" },
        ].map((social, index) => (
          <motion.a
            key={index}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${social.color} hover:text-gray-400 transition`}
            whileHover={{ scale: 1.2, y: -5, boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.6)" }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {social.icon}
          </motion.a>
        ))}

        {/* Discord Invite Link */}
        <motion.a
          href="Khttps://discord.gg/TeKDhaqMqb" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-gray-400 transition flex flex-col items-center"
          whileHover={{ scale: 1.2, y: -5, boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.6)" }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <FaDiscord />
          <span className="text-sm text-white">Join CodeCollab</span>
        </motion.a>
      </div>
    </section>
  );
};

export default Contact;
