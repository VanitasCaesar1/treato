"use client";
import Link from 'next/link';
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Shield,
  Activity,
  Heart,
  Stethoscope,
  Calendar,
  ChartLine,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "./HeroSection";
import AnimatedPricing from "./PricingSection";

// Custom hooks
const useParallax = (value, distance) => {
  return useTransform(value, [0, 1], [-distance, distance]);
};

const useIntersectionObserver = (ref) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return isIntersecting;
};

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const features = [
    {
      title: "24/7 Care Access",
      description:
        "Connect with healthcare professionals anytime, anywhere with instant virtual consultations. Our platform ensures you never have to wait for essential medical advice.",
      Icon: Stethoscope,
      color: "#FF6B6B",
      stats: "99.9% uptime",
    },
    {
      title: "Smart Scheduling",
      description:
        "AI-powered appointment system that adapts to your schedule and preferences. Reduce wait times and find the perfect slot that works for you.",
      Icon: Calendar,
      color: "#4ECDC4",
      stats: "90% reduction in scheduling conflicts",
    },
    {
      title: "Medical Records Analytics",
      description:
        "Advanced analytics powered by machine learning to provide personalized health insights and predict potential health risks before they become serious.",
      Icon: ChartLine,
      color: "#45B7D1",
      stats: "93% prediction accuracy",
    },
    {
      title: "Secure Platform",
      description:
        "Enterprise-grade security ensuring your health data stays private and protected. HIPAA-compliant, with robust encryption and access controls.",
      Icon: Shield,
      color: "#96CEB4",
      stats: "Military-grade encryption",
    },
    {
      title: "Vital Monitoring",
      description:
        "Real-time monitoring of vital signs with instant alerts and analysis. Connect your wearable devices for comprehensive health tracking.",
      Icon: Activity,
      color: "#FFB347",
      stats: "24/7 monitoring",
    },
    {
      title: "Wellness Programs",
      description:
        "Personalized wellness plans designed around your health goals, with progress tracking and expert guidance every step of the way.",
      Icon: Heart,
      color: "#FF7F50",
      stats: "87% success rate",
    },
  ];

  const FeatureCard = ({ feature, index }) => {
    const ref = useRef(null);
    const isVisible = useIntersectionObserver(ref);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"],
    });
  
    const y = useParallax(scrollYProgress, 30);
    const opacity = useTransform(
      scrollYProgress,
      [0, 0.3, 0.7, 1],
      [0.3, 1, 1, 0.3],
    );
  
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group"
      >
        <Link href="/features">
          <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#37AFE1]/20">
            <CardContent className="p-8">
              <div className="mb-6 flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="p-3 rounded-full bg-gradient-to-br from-[#37AFE1]/10 to-[#37AFE1]/20"
                >
                  <feature.Icon size={40} color={feature.color} />
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold text-[#37AFE1] mb-4 group-hover:text-[#2490C4] transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-sm font-semibold text-[#37AFE1]">
                  {feature.stats}
                </span>
                <Button
                  variant="ghost"
                  className="text-[#37AFE1] hover:text-[#2490C4] p-0 h-auto"
                >
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 min-h-screen px-4 bg-gradient-to-b from-[#37AFE1]/50 via-white to-[#37AFE1]/10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-block px-6 py-2 bg-[#37AFE1]/10 rounded-full mb-6"
            >
              <span className="text-[#37AFE1] font-semibold">
                Powerful Features
              </span>
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-[#37AFE1] mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Comprehensive Healthcare Features
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Experience healthcare reimagined with our suite of innovative
              features, designed to provide you with the best possible care
              experience.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            <AnimatePresence>
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      <AnimatedPricing />

      {/* About Section */}
      <section className="py-24 bg-gradient-to-b from-white to-[#37AFE1]/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 bg-[#37AFE1]/10 rounded-full mb-6"
          >
            <span className="text-[#37AFE1] font-semibold">Our Mission</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#37AFE1] mb-8">
            About Treato
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing healthcare access through an innovative platform
            that combines cutting-edge technology with compassionate care
            delivery. Our mission is to make quality healthcare accessible,
            affordable, and convenient for everyone.
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
