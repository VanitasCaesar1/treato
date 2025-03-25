"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Stethoscope, 
  Heart, 
  Watch, 
  Smartphone, 
  CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "./Navbar";

const ProductsPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(0);

  const products = [
    {
      name: "Treato Care App",
      icon: Smartphone,
      tagline: "Healthcare at Your Fingertips",
      description: "A comprehensive mobile application that puts your health management directly in your hands.",
      features: [
        "Virtual consultations",
        "Health record tracking",
        "Medication reminders",
        "Secure health profiles"
      ],
      color: "#37AFE1"
    },
    {
      name: "Treato Wellness Tracker (Coming Soon)",
      icon: Watch,
      tagline: "Your Personal Health Companion",
      description: "An advanced wearable device that monitors your vital signs and provides real-time health insights.",
      features: [
        "Continuous heart rate monitoring",
        "Sleep tracking",
        "Activity analysis",
        "Emergency alerts"
      ],
      color: "#4ECDC4"
    },
    {
      name: "Treato EHR System",
      icon: Stethoscope,
      tagline: "Easy and Intuitive Apps Healthcare Professionals",
      description: "A robust telehealth solution enabling seamless remote medical consultations and care.",
      features: [
        "Treatment Templates",
        "Specialist referrals",
        "Prescription management",
        "Medical record integration",
        "Secure health profiles"
      ],
      color: "#FF6B6B"
    }
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#37AFE1]/10">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-32">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-6 py-2 bg-[#37AFE1]/10 rounded-full mb-6">
            <span className="text-[#37AFE1] font-semibold">Treato Products</span>
          </div>
          <h1 className="text-5xl font-bold text-[#37AFE1] mb-6">
            Innovative Healthcare Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our range of cutting-edge products designed to revolutionize 
            your healthcare experience and empower proactive wellness.
          </p>
        </motion.div>

        {/* Product Selection */}
        <section className="py-16">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {products.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                onClick={() => setSelectedProduct(index)}
                className={`
                  cursor-pointer p-6 rounded-xl transition-all 
                  ${selectedProduct === index 
                    ? 'bg-white shadow-xl border-2 border-[#37AFE1]/20' 
                    : 'bg-[#37AFE1]/5 hover:bg-[#37AFE1]/10'}
                `}
              >
                <div className="flex items-center mb-4">
                  <div 
                    className="p-3 rounded-full mr-4"
                    style={{ 
                      backgroundColor: `${product.color}10`,
                      color: product.color
                    }}
                  >
                    <product.icon size={30} />
                  </div>
                  <h3 className={`
                    text-2xl font-bold 
                    ${selectedProduct === index ? 'text-[#37AFE1]' : 'text-gray-800'}
                  `}>
                    {product.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">{product.tagline}</p>
              </motion.div>
            ))}
          </div>

          {/* Detailed Product View */}
          <motion.div
            key={selectedProduct}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-12 rounded-xl shadow-lg"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-4xl font-bold text-[#37AFE1] mb-6">
                  {products[selectedProduct].name}
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  {products[selectedProduct].description}
                </p>
                <div className="space-y-4 mb-8">
                  {products[selectedProduct].features.map(feature => (
                    <div key={feature} className="flex items-center">
                      <CheckCircle 
                        className="mr-3 text-[#37AFE1]" 
                        size={24} 
                      />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-4">
                  <Button 
                    size="lg" 
                    className="bg-[#37AFE1] hover:bg-[#2490C4] text-white"
                  >
                    Learn More
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-[#37AFE1] text-[#37AFE1] hover:bg-[#37AFE1]/10"
                  >
                    Book Demo
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div 
                  className="w-80 h-80 rounded-xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: `${products[selectedProduct].color}10` 
                  }}
                >
                  {React.createElement(products[selectedProduct].icon, {
                    size: 200,
                    color: products[selectedProduct].color
                  })}
                </div>
              </div>
            </div>
          </motion.div>
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
              Transform Your Healthcare Experience
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Explore our innovative solutions and take the first step towards 
              a more connected, proactive health journey.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-[#37AFE1] hover:bg-gray-100"
            >
              Get Started
            </Button>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default ProductsPage;