import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PricingCard = ({ plan, isSelected, onClick }) => {
  const { name, description, monthlyPrice, yearlyPrice } = plan;

  return (
    <motion.div
      className={`w-full rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
        isSelected
          ? "bg-white shadow-lg border-2 border-[#37AFE1]/20"
          : "bg-[#37AFE1]/5 hover:bg-[#37AFE1]/10"
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="flex items-start justify-between">
        <div>
          <h3
            className={`text-lg sm:text-xl font-semibold mb-2 ${
              isSelected ? "text-[#37AFE1]" : "text-gray-800"
            }`}
          >
            {name}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">{description}</p>
        </div>
        <ChevronRight
          className={`mt-1 w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
            isSelected ? "text-[#37AFE1] translate-x-1" : "text-gray-400"
          }`}
        />
      </div>
    </motion.div>
  );
};

const PricingDetails = ({ selectedPlan }) => {
  const [isYearly, setIsYearly] = useState(false);

  // Only show toggle for non-Enterprise plans
  const showToggle = selectedPlan.name !== "Enterprise";

  return (
    <motion.div
      className="bg-white rounded-xl p-4 sm:p-8 shadow-lg border-2 border-[#37AFE1]/20"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {showToggle && (
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-[#37AFE1]/5 p-1 rounded-full inline-flex">
            <button
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                !isYearly ? "bg-white shadow text-[#37AFE1]" : "text-gray-600"
              }`}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </button>
            <button
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                isYearly ? "bg-white shadow text-[#37AFE1]" : "text-gray-600"
              }`}
              onClick={() => setIsYearly(true)}
            >
              Yearly{" "}
              <span className="text-[0.5rem] sm:text-xs bg-red-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full ml-1">
                -20%
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="text-center mb-6 sm:mb-8">
        {selectedPlan.name === "Enterprise" ? (
          <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            Contact Us
          </div>
        ) : (
          <>
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              {isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}
              <span className="text-sm sm:text-lg text-gray-500 ml-1 sm:ml-2">
                /{isYearly ? "year" : "month"}
              </span>
            </div>
            {isYearly && (
              <div className="text-red-500 text-xs sm:text-sm font-medium">
                Save {selectedPlan.savings} yearly
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {selectedPlan.features.map((feature, index) => (
          <motion.div
            key={feature}
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#37AFE1]/10 flex items-center justify-center mr-2 sm:mr-3">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#37AFE1]" />
            </div>
            <span className="text-xs sm:text-base text-gray-700">{feature}</span>
          </motion.div>
        ))}
      </div>

      <Button className="w-full mt-6 sm:mt-8 bg-[#37AFE1] hover:bg-[#2490C4] text-white transition-colors text-sm sm:text-base">
        Get Started
        <ArrowRight className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </motion.div>
  );
};

const AnimatedPricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(0);

  const plans = [
    {
      name: "Basic Care",
      description: "Essential healthcare monitoring",
      monthlyPrice: "₹999",
      yearlyPrice: "₹9,999",
      savings: "₹2,000",
      features: [
        "Basic Health Monitoring",
        "Emergency Support",
        "Community Access",
        "Standard Response Time",
        "Basic Health Records",
      ],
    },
    {
      name: "Pro Care",
      description: "Advanced care for health-conscious",
      monthlyPrice: "₹2,999",
      yearlyPrice: "₹29,999",
      savings: "₹6,000",
      features: [
        "Advanced Health Analytics",
        "Priority Care Access",
        "24/7 Doctor Chat",
        "Personalized Care Plans",
        "Family Health Tracking",
      ],
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
      ],
    },
  ];

  return (
    <section className="py-16 sm:py-32 bg-gradient-to-b from-[#37AFE1]/10 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-[#37AFE1]/10 rounded-full mb-4 sm:mb-6"
          >
            <span className="text-[#37AFE1] font-semibold text-xs sm:text-base">
              Pricing Plans
            </span>
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#37AFE1] mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Pricing for every need
          </motion.h2>
          <motion.p
            className="text-sm sm:text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Choose a plan that works best for you. All plans include a 30-day
            free trial.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-1 space-y-4">
            {plans.map((plan, index) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                isSelected={selectedPlan === index}
                onClick={() => setSelectedPlan(index)}
              />
            ))}
          </div>
          <div className="lg:col-span-2 mt-4 sm:mt-0">
            <PricingDetails selectedPlan={plans[selectedPlan]} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedPricing;