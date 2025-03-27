"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";


const Navbar = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isScrolledDown = prevScrollPos < currentScrollPos;
      const isAboveThreshold = currentScrollPos > 100;
      setVisible(!isScrolledDown || !isAboveThreshold);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);
   return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[95rem]">
        <div className="backdrop-blur-md bg-white/70 rounded-2xl mt-4 shadow-lg">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between p-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent ">
                  Treato+
                  
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-8">
              {["About", "Features", "Pricing"].map((item) => (
                <motion.a
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-gray-600 text-[18px] hover:text-blue-600 font-medium transition-colors hover:bg-white px-4 py-2 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600  px-4 py-2 rounded-full font-medium transition-colors hover:bg-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                href="http://localhost:3000/"
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Doctors
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between p-4">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Treato<span className="text-blue-600">+</span>
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Menu */}
            <motion.div
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              variants={{
                open: { opacity: 1, height: "auto" },
                closed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {["About", "Features", "Pricing", "Login"].map((item) => (
                  <motion.a
                    key={item}
                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="block py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <Link
                  href="/register"
                  className="block w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-xl font-medium text-center hover:shadow-lg transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
