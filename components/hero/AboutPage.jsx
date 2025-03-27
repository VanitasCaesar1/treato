"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, HeartPulse, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "./Navbar";
import Link from "next/link";
const AboutPage = () => {
  const teamMembers = [
    {
      name: "A. Srinu",
      role: "Medical and Health Marketing Officer",
      bio: "Been in healthcare buisness with more than 15 years of experience.",
      image: "/api/placeholder/400/400"
    },
    {
      name: "C. Chakravarthi",
      role: "Developer",
      bio: "Tech visionary specializing in healthcare AI and secure platform development.",
      image: "/api/placeholder/400/400"
    },
  ];

  const values = [
    {
      title: "Patient-First Care",
      description: "We prioritize patient needs and experience above all else.",
      icon: HeartPulse
    },
    {
      title: "Data Privacy",
      description: "Robust security measures to protect your most sensitive information.",
      icon: Shield
    },
    {
      title: "EMR, EHM Accessibility",
      description: "Breaking down barriers to quality healthcare Nationwide.",
      icon: Globe
    }
  ];

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
            <span className="text-[#37AFE1] font-semibold">About Treato</span>
          </div>
          <h1 className="text-5xl font-bold text-[#37AFE1] mb-6">
            Reimagining Healthcare Through Technology
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mt-4 mx-auto">
            Treato is a revolutionary healthcare platform that combines cutting-edge technology 
            with compassionate care delivery. Our mission is to make quality healthcare accessible, 
            affordable, and convenient for everyone. Led by Alaveli Srinu a seasoned professional 
            in healthcare industry with more than 15 years of experience. 
          </p>
        </motion.div>

        {/* Company Values */}
        <section className="py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-full bg-[#37AFE1]/10">
                    <value.icon size={40} className="text-[#37AFE1]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#37AFE1] mb-4 text-center">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team Section 
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#37AFE1] mb-4">
              Meet Our Leadership
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our team combines medical expertise, technological innovation, 
              and a passion for improving healthcare accessibility.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all"
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-40 h-40 mx-auto rounded-full mb-6 object-cover"
                />
                <h3 className="text-2xl font-bold text-[#37AFE1]">
                  {member.name}
                </h3>
                <p className="text-gray-600 mb-4">{member.role}</p>
                <p className="text-gray-500">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>
*/}
        {/* Call to Action */}
        <section className="py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#37AFE1] to-cyan-500 text-white p-12 rounded-xl"
          >
            <h2 className="text-4xl font-bold mb-6">
              Join the Treato Healthcare Revolution
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Experience personalized, technology-driven healthcare that puts 
              you at the center of your wellness journey.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg" 
                className="bg-white text-[#37AFE1] hover:bg-gray-100"
              >
                <Link href="/pricing">
                See Plans
                </Link>
                <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white bg-transparent hover:bg-white/10"
              >
                <Link href="/contact">
                Contact Us
                </Link>
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;