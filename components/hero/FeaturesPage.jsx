"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Stethoscope, 
  ShieldCheck, 
  ChartLine, 
  Calendar, 
  Heart, 
  Activity 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "./Navbar";
import Link from "next/link";

const FeaturesPage = () => {
  const features = [
    {
      title: "24/7 Virtual Care",
      description: "Connect with healthcare professionals anytime, anywhere through instant virtual consultations.",
      icon: Stethoscope,
      color: "#FF6B6B",
      details: [
        "Instant video consultations",
        "Access to specialized doctors",
        "Comprehensive medical advice"
      ]
    },
    {
      title: "Advanced Health Analytics",
      description: "Machine learning-powered insights to predict and prevent health risks.",
      icon: ChartLine,
      color: "#4ECDC4",
      details: [
        "Personalized health risk assessment",
        "Predictive health modeling",
        "Comprehensive health trend tracking"
      ]
    },
    {
      title: "Secure Health Platform",
      description: "Enterprise-grade security ensuring your health data remains completely private and protected.",
      icon: ShieldCheck,
      color: "#96CEB4",
      details: [
        "HIPAA-compliant infrastructure",
        "Military-grade encryption",
        "Strict access controls"
      ]
    },
    {
      title: "Smart Scheduling",
      description: "AI-powered appointment system that adapts to your schedule and preferences.",
      icon: Calendar,
      color: "#45B7D1",
      details: [
        "Intelligent slot recommendations",
        "Minimal wait times",
        "Flexible rescheduling"
      ]
    },
    {
      title: "Wellness Tracking",
      description: "Real-time monitoring of vital signs with instant alerts and comprehensive analysis.",
      icon: Activity,
      color: "#FFB347",
      details: [
        "Continuous health monitoring",
        "Wearable device integration",
        "Personalized wellness insights"
      ]
    },
    {
      title: "Personalized Care Plans",
      description: "Tailored wellness programs designed around your unique health goals.",
      icon: Heart,
      color: "#FF7F50",
      details: [
        "Custom health recommendations",
        "Progress tracking",
        "Expert guidance"
      ]
    }
  ];

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.3, 1, 1, 0.3]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#37AFE1]/10">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-44">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-6 py-2 bg-[#37AFE1]/10 rounded-full mb-6">
            <span className="text-[#37AFE1] font-semibold">Treatos Features</span>
          </div>
          <h1 className="text-5xl font-bold text-[#37AFE1] mb-6">
            Transforming Healthcare Through Innovation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover a comprehensive suite of features designed to provide 
            seamless, personalized, and intelligent healthcare solutions.
          </p>
        </motion.div>

        {/* Features Grid */}
        <section ref={ref} className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                style={{ opacity }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="mb-6 flex justify-center">
                  <div 
                    className="p-4 rounded-full transition-all group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}10` }}
                  >
                    <feature.icon size={40} color={feature.color} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#37AFE1] mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2 text-gray-500 mb-6">
                  {feature.details.map(detail => (
                    <li key={detail} className="flex items-center">
                      <span className="mr-2 text-[#37AFE1]">▪</span>
                      {detail}
                    </li>
                  ))}
                </ul>
                
              </motion.div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#37AFE1] to-cyan-500 text-white p-12 rounded-xl"
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience Next-Gen Healthcare?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Explore how Treato's innovative features can transform your 
              healthcare experience and empower your wellness journey.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-[#37AFE1] hover:bg-gray-100"
            >
            <Link href="/pricing">
              Get Started
            </Link>
            </Button>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default FeaturesPage;