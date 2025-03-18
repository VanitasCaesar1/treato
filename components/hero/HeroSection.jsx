"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Heart, Activity, Plus } from "lucide-react";

const FloatingIcon = ({ icon: Icon, className, delay = 0 }) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.2, 1],
      y: [0, -10, 0],
    }}
    transition={{ duration: 4, delay, repeat: Infinity }}
  >
    <Icon className="opacity-20" size={32} />
  </motion.div>
);

const CTAButton = ({ primary, children }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`
      px-8 py-4 rounded-xl text-lg font-semibold
      ${
        primary
          ? "bg-red-500 text-[#FFF5CD] border border-[#FFB347]"
          : "border-2 border-[#FFF5CD] text-[#FFF5CD]"
      }
    `}
  >
    {children}
  </motion.button>
);

const SpinningPlus = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  >
    <Plus size={20} className="text-red-500" />
  </motion.div>
);

const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const y = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const FLOATING_ICONS = [
    {
      Icon: Heart,
      className: "left-[15%] top-[30%]",
      color: "text-[#FF6B6B]",
      delay: 0,
    },
    {
      Icon: Plus,
      className: "right-[15%] top-[40%]",
      color: "text-[#96CEB4]",
      delay: 0.5,
    },
    {
      Icon: Activity,
      className: "left-[25%] bottom-[30%]",
      color: "text-[#4ECDC4]",
      delay: 1,
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#37AFE1] flex justify-center items-center">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-red-500 origin-[0%] z-50"
        style={{ scaleX: y }}
      />

      {/* Background Icons */}
      {FLOATING_ICONS.map(({ Icon, className, color, delay }, index) => (
        <FloatingIcon
          key={index}
          icon={Icon}
          className={`${className} ${color}`}
          delay={delay}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-4">
        {/* Promotion Banner */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-16"
        >
          <div className="px-8 py-3 rounded-full border border-[#FFB347] bg-white/10 backdrop-blur-sm">
            <span className="text-[#FFF5CD] text-lg font-medium flex items-center gap-2">
              <SpinningPlus />
              Special Launch Offer | Save 20% Today
            </span>
          </div>
        </motion.div>

        {/* Hero Content */}
        <div className="text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-7xl font-bold text-[#FFF5CD] mb-8"
          >
            Your Hospitals Healthcare{" "}
            <span className="text-red-500">Simplified</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#FFF5CD]/90 mb-12 leading-relaxed"
          >
            Experience healthcare reimagined with personalized diagnosis
            templates. Our platform empowers hospitals to streamline operations,
            enhance patient care, and drive innovation in healthcare delivery.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <CTAButton primary>Start Your Free Trial</CTAButton>
            <CTAButton>Schedule Demo</CTAButton>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="#2D8CB3"
          fillOpacity="0.3"
          d="M0,96L48,85.3C96,75,192,53,288,53.3C384,53,480,75,576,90.7C672,107,768,117,864,112C960,107,1056,85,1152,74.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
        />
      </svg>
    </div>
  );
};

export default HeroSection;
