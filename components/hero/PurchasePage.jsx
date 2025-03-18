"use client";
import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Shield,
  Clock,
  CreditCard,
  Calendar,
  Users,
  Heart,
  Activity,
  Plus,
  ArrowRight,
  Phone,
  CheckCircle,
  XCircle,
} from "lucide-react";
import axios from "axios";

// Simple animation components without framer-motion
const SpinningPlus = () => (
  <div className="animate-spin">
    <Plus size={20} className="text-red-500" />
  </div>
);

const FeatureItem = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 hover:translate-x-1 transition-transform">
    <Icon className="w-5 h-5 text-red-500 flex-shrink-0" />
    <span className="text-[#FFF5CD]">{title}</span>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-6 py-4 text-base font-medium border-b-2 transition-colors duration-200 ${
      active
        ? "border-red-500 text-[#FFF5CD]"
        : "border-transparent text-[#FFF5CD]/70 hover:text-[#FFF5CD]"
    }`}
  >
    {children}
  </button>
);

// Payment result modal
const PaymentResultModal = ({ isOpen, status, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center">
          {status === "success" ? (
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
          )}
          <h2 className="text-2xl font-bold mb-2">
            {status === "success" ? "Payment Successful" : "Payment Failed"}
          </h2>
          <p className="text-gray-600 text-center mb-6">{message}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
          >
            {status === "success" ? "Continue" : "Try Again"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Signup form component
const SignupForm = ({ onComplete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>
      
      {/* Progress steps */}
      <div className="flex justify-between mb-8">
        {[
          { num: 1, text: "Personal", active: true },
          { num: 2, text: "Account", active: false },
          { num: 3, text: "Location", active: false },
          { num: 4, text: "ID", active: false },
        ].map((step) => (
          <div key={step.num} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mb-2 ${
                step.active ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              {step.num}
            </div>
            <span className="text-sm">{step.text}</span>
          </div>
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-8 relative">
        <div className="h-full bg-blue-500 rounded-full w-1/4"></div>
      </div>
      
      {/* Form section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2">First Name*</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block mb-2">Last Name*</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg" 
              placeholder="Enter last name"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2">Age*</label>
            <input 
              type="number" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Enter age"
            />
          </div>
          <div>
            <label className="block mb-2">Blood Group*</label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg">
              <option>Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Mobile Number*</label>
            <input 
              type="tel" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="10-digit number"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          Already have an account? <a href="#" className="text-blue-500">Login</a>
        </div>
        <button 
          onClick={onComplete}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2"
        >
          Next <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

const PurchasePage = ({ selectedTier = "basic" }) => {
  const [activeSection, setActiveSection] = useState("details");
  const [selectedDuration, setSelectedDuration] = useState("yearly");
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [paymentResult, setPaymentResult] = useState({
    isOpen: false,
    status: "",
    message: ""
  });

  const tiers = {
    basic: {
      name: "Basic Care",
      monthly: 999,
      yearly: 9990,
      details: [
        "Regular health check-ups",
        "Basic emergency support",
        "Community forum access",
        "Digital health records",
        "Email support",
        "Basic health analytics",
        "Medication reminders",
        "Limited specialist consultations",
      ],
      terms: [
        "Annual/Monthly billing options",
        "14-day money-back guarantee",
        "Basic support response within 24 hours",
        "Data privacy protection",
        "HIPAA compliance",
        "Limited to 2 family members",
        "Basic health report exports",
        "Standard prescription services",
      ],
    },
    pro: {
      name: "Pro Care",
      monthly: 2499,
      yearly: 24990,
      details: [
        "Priority health services",
        "24/7 emergency support",
        "Premium community access",
        "Advanced health tracking",
        "Priority video consultations",
        "Unlimited specialist access",
        "Advanced health analytics",
        "Family health management",
      ],
      terms: [
        "Annual/Monthly billing options",
        "30-day money-back guarantee",
        "Priority support response within 4 hours",
        "Enhanced data protection",
        "HIPAA compliance",
        "Up to 5 family members",
        "Advanced health report exports",
        "Premium prescription services",
      ],
    },
  };

  const tier = tiers[selectedTier];
  const price = selectedDuration === "yearly" ? tier.yearly : tier.monthly;
  const monthlyEquivalent =
    selectedDuration === "yearly" ? Math.round(tier.yearly / 12) : tier.monthly;

  // Handle test payment submission
  const handlePaymentTest = async (status) => {
    try {
      // Simulate API call to backend
      const endpoint = `/api/purchase/hospital/${status}`;
      
      // In a real implementation, you'd use axios like this:
      // const response = await axios.post(endpoint, {
      //   plan: selectedTier,
      //   duration: selectedDuration,
      //   amount: price
      // });
      
      // For demo purposes, we'll simulate the response
      const simulatedResponse = { 
        data: {
          success: status === 'success',
          message: status === 'success' 
            ? "Your payment was processed successfully. Welcome to our healthcare plan!" 
            : "Your payment could not be processed. Please check your payment details and try again."
        }
      };
      
      // Show result modal
      setPaymentResult({
        isOpen: true,
        status: status,
        message: simulatedResponse.data.message
      });
      
    } catch (error) {
      console.error("Payment test error:", error);
      setPaymentResult({
        isOpen: true,
        status: 'failure',
        message: "An unexpected error occurred. Please try again later."
      });
    }
  };

  const closeModal = () => {
    setPaymentResult({...paymentResult, isOpen: false});
  };

  const FLOATING_ICONS = [
    { Icon: Heart, className: "left-[15%] top-[20%]" },
    { Icon: Activity, className: "right-[15%] top-[30%]" },
    { Icon: Shield, className: "left-[25%] bottom-[20%]" },
  ];

  if (showSignupForm) {
    return <SignupForm onComplete={() => setShowSignupForm(false)} />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#37AFE1]">
      {/* Background Icons */}
      {FLOATING_ICONS.map(({ Icon, className }, index) => (
        <div
          key={index}
          className={`absolute ${className} text-[#FFF5CD] opacity-20`}
        >
          <Icon size={32} />
        </div>
      ))}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
        {/* Promotion Banner */}
        <div className="flex justify-center mb-12">
          <div className="px-8 py-3 rounded-full border border-[#FFB347] bg-white/10 backdrop-blur-sm">
            <span className="text-[#FFF5CD] text-lg font-medium flex items-center gap-2">
              <SpinningPlus />
              Special Launch Offer - Save 20% Today!
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#FFB347] overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-[#FFB347]">
            <h1 className="text-3xl font-bold text-[#FFF5CD] mb-2">
              {tier.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl font-bold text-[#FFF5CD]">
                ₹{price}
              </span>
              <span className="text-[#FFF5CD]/70">
                {selectedDuration === "yearly" ? "/year" : "/month"}
              </span>
            </div>
            {selectedDuration === "yearly" && (
              <div className="text-[#FFF5CD]/90">
                ₹{monthlyEquivalent}/month when billed annually (Save 20%)
              </div>
            )}
          </div>

          {/* Duration Toggle */}
          <div className="px-8 py-4 border-b border-[#FFB347] bg-white/5">
            <div className="flex gap-4 items-center justify-center">
              <button
                onClick={() => setSelectedDuration("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedDuration === "monthly"
                    ? "bg-red-500 text-white"
                    : "text-[#FFF5CD] hover:bg-white/10"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedDuration("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedDuration === "yearly"
                    ? "bg-red-500 text-white"
                    : "text-[#FFF5CD] hover:bg-white/10"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex border-b border-[#FFB347]">
            <TabButton
              active={activeSection === "details"}
              onClick={() => setActiveSection("details")}
            >
              Package Details
            </TabButton>
            <TabButton
              active={activeSection === "terms"}
              onClick={() => setActiveSection("terms")}
            >
              Terms & Conditions
            </TabButton>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeSection === "details" ? (
              <div className="space-y-8">
                <div className="grid gap-4">
                  {tier.details.map((detail, index) => (
                    <FeatureItem
                      key={index}
                      icon={CheckCircle2}
                      title={detail}
                    />
                  ))}
                </div>

                <div className="bg-white/10 p-6 rounded-xl border border-[#FFB347]">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <h3 className="font-medium text-[#FFF5CD]">
                      Important Information
                    </h3>
                  </div>
                  <ul className="text-[#FFF5CD]/90 space-y-2 text-[16px] font-medium">
                    <li>• Service availability may vary by region</li>
                    <li>• Emergency response times are approximate</li>
                    <li>• Additional fees may apply for specialty services</li>
                    <li>• Prescriptions subject to doctor's approval</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Users,
                      title: "Family Coverage",
                      desc: `Up to ${selectedTier === "pro" ? "5" : "2"} members`,
                    },
                    {
                      icon: Calendar,
                      title: "Consultation Limit",
                      desc: `${selectedTier === "pro" ? "Unlimited" : "4"}/month`,
                    },
                    {
                      icon: Phone,
                      title: "Support Priority",
                      desc:
                        selectedTier === "pro" ? "24/7 Priority" : "Standard",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/10 p-4 rounded-xl border border-[#FFB347] hover:scale-105 transition-transform"
                    >
                      <item.icon className="w-6 h-6 text-red-500 mb-2" />
                      <h4 className="font-medium text-[#FFF5CD]">
                        {item.title}
                      </h4>
                      <p className="text-sm text-[#FFF5CD]/70">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-4">
                  {tier.terms.map((term, index) => (
                    <FeatureItem key={index} icon={FileText} title={term} />
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div
                    className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-[#FFB347] hover:scale-105 transition-transform"
                  >
                    <Shield className="w-6 h-6 text-red-500" />
                    <div>
                      <h4 className="font-medium text-[#FFF5CD]">
                        Data Protection
                      </h4>
                      <p className="text-sm text-[#FFF5CD]/70">
                        HIPAA Compliant Security
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-[#FFB347] hover:scale-105 transition-transform"
                  >
                    <Clock className="w-6 h-6 text-red-500" />
                    <div>
                      <h4 className="font-medium text-[#FFF5CD]">
                        Money-back Guarantee
                      </h4>
                      <p className="text-sm text-[#FFF5CD]/70">
                        {selectedTier === "pro" ? "30-day" : "14-day"} Risk Free
                        Trial
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Test Buttons */}
          <div className="p-6 border-t border-[#FFB347] bg-white/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-[#FFF5CD]/70">
                Questions? Our support team is here to help 24/7
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowSignupForm(true)}
                  className="flex items-center gap-2 px-8 py-3 bg-red-500 text-[#FFF5CD] rounded-xl
                  border border-[#FFB347] font-medium hover:scale-105 transition-transform"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Sign Up
                  <ArrowRight className="w-5 h-5" />
                </button>
                {/* Test buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePaymentTest('success')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm"
                  >
                    Test Success
                  </button>
                  <button
                    onClick={() => handlePaymentTest('failure')}
                    className="px-4 py-2 bg-red-400 text-white rounded-lg font-medium text-sm"
                  >
                    Test Failure
                  </button>
                </div>
              </div>
            </div>
          </div>
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

      {/* Payment Result Modal */}
      <PaymentResultModal
        isOpen={paymentResult.isOpen}
        status={paymentResult.status}
        message={paymentResult.message}
        onClose={closeModal}
      />
    </div>
  );
};

export default PurchasePage;