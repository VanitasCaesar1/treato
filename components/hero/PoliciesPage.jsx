"use client";

import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "@/components/hero/Footer";
import { 
  ScrollText, 
  ShieldCheck, 
  RefreshCw 
} from "lucide-react";

const PoliciesPage = () => {
  const [activeSection, setActiveSection] = useState("terms");

  const sections = [
    {
      id: "terms",
      title: "Terms and Conditions",
      icon: ScrollText,
      content: [
        {
          heading: "1. Acceptance of Terms",
          text: "By accessing and using Treato's services, you agree to these Terms and Conditions. Please read them carefully."
        },
        {
          heading: "2. Service Description",
          text: "Treato provides digital healthcare monitoring and support services through various subscription plans."
        },
        {
          heading: "3. User Obligations",
          text: "Users must provide accurate information, maintain account confidentiality, and use services ethically."
        },
        {
          heading: "4. Intellectual Property",
          text: "All content, logos, and software are the exclusive property of Treato and protected by intellectual property laws."
        },
        {
          heading: "5. Limitation of Liability",
          text: "Treato is not liable for indirect, incidental, or consequential damages arising from service use."
        }
      ]
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: ShieldCheck,
      content: [
        {
          heading: "1. Information Collection",
          text: "We collect personal and health-related information necessary for providing our services."
        },
        {
          heading: "2. Data Usage",
          text: "User data is used to provide personalized healthcare monitoring, improve services, and communicate important updates."
        },
        {
          heading: "3. Data Protection",
          text: "We implement industry-standard security measures to protect user data from unauthorized access."
        },
        {
          heading: "4. Data Sharing",
          text: "We do not sell personal data. Information may be shared with healthcare providers with explicit user consent."
        },
        {
          heading: "5. User Rights",
          text: "Users can request data access, correction, and deletion at any time through our support channels."
        }
      ]
    },
    {
      id: "refund",
      title: "Refund Policy",
      icon: RefreshCw,
      content: [
        {
          heading: "1. Eligibility",
          text: "Refund eligibility varies by plan: Basic Care (7 days), Pro Care (14 days), Enterprise (custom terms)."
        },
        {
          heading: "2. Refund Process",
          text: "Refunds are credited within 5-7 business days after approval. Original payment method will be credited."
        },
        {
          heading: "3. Non-Refundable Circumstances",
          text: "Partial months, add-on services, and enterprise custom solutions are typically non-refundable."
        },
        {
          heading: "4. Prorated Refunds",
          text: "For annual plans, we offer prorated refunds minus a small administrative fee."
        },
        {
          heading: "5. Cancellation",
          text: "Users can cancel subscriptions at any time, with refund subject to the policy of their specific plan."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#37AFE1]/10 flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-44 flex-grow h-screen">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-[#37AFE1] mb-6">Our Policies</h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center ${
                    activeSection === section.id
                      ? "bg-[#37AFE1] text-white"
                      : "hover:bg-[#37AFE1]/10 text-gray-700"
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <section.icon className="mr-3" size={20} />
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 bg-white rounded-xl shadow-lg p-8">
            {sections.map((section) => (
              <div 
                key={section.id}
                className={activeSection === section.id ? "block" : "hidden"}
              >
                <div className="flex items-center mb-8">
                  <section.icon className="mr-4 text-[#37AFE1]" size={40} />
                  <h1 className="text-4xl font-bold text-[#37AFE1]">
                    {section.title}
                  </h1>
                </div>
                
                {section.content.map((item, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-xl font-semibold text-[#37AFE1] mb-2">
                      {item.heading}
                    </h3>
                    <p className="text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;