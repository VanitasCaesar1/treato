"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  X, 
  ArrowRight, 
  Users, 
  Shield, 
  Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "./Navbar";

const PlansAndPricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Basic Care",
      description: "Essential healthcare monitoring systems for hospitals",
      monthlyPrice: "₹900",
      yearlyPrice: "₹9,000",
      savings: "₹2,160",
      features: [
        "Basic Health Monitoring",
        "Emergency Support",
        "Community Access",
        "Standard Response Time",
        "Basic Health Records"
      ],
      bestFor: "Individuals doctors and clinics",
      icon: Users,
      color: "#4ECDC4"
    },
    {
      name: "Pro Care",
      description: "Advanced Systems for Medium-sized Hospitals",
      monthlyPrice: "₹2,900",
      yearlyPrice: "₹29,000",
      savings: "₹5,800",
      features: [
        "Advanced Health Analytics",
        "Priority Care Access",
        "24/7 Doctor Chat",
        "Personalized Care Plans",
        "Family Health Tracking"
      ],
      bestFor: "Medium-sized hospitals and clinics",
      icon: Shield,
      color: "#FF6B6B"
    },
    {
      name: "Enterprise",
      description: "Custom solution for organizations",
      monthlyPrice: "Contact Us",
      yearlyPrice: "Contact Us",
      features: [
        "Custom Healthcare Solutions",
        "Dedicated Care Team",
        "Advanced Analytics Dashboard",
        "Multi-location Support",
        "White-label Options",
        "Basic Health Monitoring",
        "Emergency Support",
        "24/7 Doctor Chat",
        "Personalized Care Plans",
        "Family Health Tracking",
        "Advanced Analytics",
        "Priority Support"
      ],
      bestFor: "Large organizations and healthcare networks",
      icon: Zap,
      color: "#37AFE1"
    }
  ];

  const compareFeatures = [
    "Basic Health Monitoring",
    "Emergency Support",
    "24/7 Doctor Chat",
    "Personalized Care Plans",
    "Family Health Tracking",
    "Advanced Analytics",
    "Priority Support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#37AFE1]/10">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-8 sm:pt-16 md:pt-24">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-[#37AFE1]/10 rounded-full mb-4 sm:mb-6">
            <span className="text-[#37AFE1] font-semibold text-xs sm:text-base">Treato Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#37AFE1] mb-4 sm:mb-6">
            Flexible Plans for Every Need
          </h1>
          <p className="text-sm sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
            Choose a plan that fits your healthcare requirements. 
            All plans come with a 30-day free trial and no hidden costs.
          </p>
        </motion.div>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-10 sm:mb-16">
          <div className="bg-[#37AFE1]/5 p-1 rounded-full inline-flex">
            <button
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all ${
                !isYearly 
                  ? "bg-white shadow text-[#37AFE1]" 
                  : "text-gray-600 hover:bg-[#37AFE1]/5"
              }`}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </button>
            <button
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all ${
                isYearly 
                  ? "bg-white shadow text-[#37AFE1]" 
                  : "text-gray-600 hover:bg-[#37AFE1]/5"
              }`}
              onClick={() => setIsYearly(true)}
            >
              Yearly{" "}
              <span className="text-[0.6rem] sm:text-xs bg-red-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full ml-1 sm:ml-2">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              <div 
                className="p-4 sm:p-6 border-b"
                style={{ backgroundColor: `${plan.color}10` }}
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div 
                    className="p-2 sm:p-3 rounded-full mr-3 sm:mr-4"
                    style={{ 
                      backgroundColor: `${plan.color}20`,
                      color: plan.color 
                    }}
                  >
                    <plan.icon size={24} sm:size={30} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold" style={{ color: plan.color }}>
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">{plan.description}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2" style={{ color: plan.color }}>
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    <span className="text-base sm:text-lg text-gray-500 ml-1 sm:ml-2">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                  {isYearly && plan.savings && (
                    <div className="text-red-500 text-xs sm:text-sm font-medium">
                      Save {plan.savings} yearly
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-base">
                  <span className="font-semibold">Best for:</span> {plan.bestFor}
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center text-xs sm:text-base">
                      <Check 
                        className="mr-2 text-[#37AFE1]" 
                        size={16} sm:size={20} 
                      />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full text-xs sm:text-base"
                  style={{ 
                    backgroundColor: plan.color, 
                    '&:hover': { backgroundColor: `${plan.color}D0` } 
                  }}
                >
                  Choose {plan.name}
                  <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Feature Comparison */}
        <section className="bg-white rounded-xl shadow-lg p-6 sm:p-12 mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#37AFE1] text-center mb-8 sm:mb-12">
            Comprehensive Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#37AFE1]/5">
                  <th className="p-2 sm:p-4 text-left text-xs sm:text-base">Features</th>
                  {plans.map(plan => (
                    <th 
                      key={plan.name} 
                      className="p-2 sm:p-4 text-center text-xs sm:text-base"
                      style={{ color: plan.color }}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareFeatures.map(feature => (
                  <tr key={feature} className="border-b">
                    <td className="p-2 sm:p-4 text-gray-700 text-xs sm:text-base">{feature}</td>
                    {plans.map(plan => (
                      <td 
                        key={`${plan.name}-${feature}`} 
                        className="p-2 sm:p-4 text-center"
                      >
                        {plan.features.includes(feature) ? (
                          <Check 
                            className="mx-auto text-[#37AFE1]" 
                            size={16} sm:size={20} 
                          />
                        ) : (
                          <X 
                            className="mx-auto text-gray-300" 
                            size={16} sm:size={20} 
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-10 sm:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#37AFE1] to-cyan-500 text-white p-6 sm:p-12 rounded-xl"
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">
              Still Unsure? We're Here to Help
            </h2>
            <p className="text-sm sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto px-4 sm:px-0">
              Our team is ready to guide you in selecting the perfect plan 
              that meets your unique healthcare needs.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-[#37AFE1] hover:bg-gray-100 text-xs sm:text-base"
            >
              Contact Sales
            </Button>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default PlansAndPricingPage;