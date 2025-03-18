"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageCircle, Phone, Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const supportCategories = [
    {
      title: "Booking & Appointments",
      icon: <MessageCircle className="w-6 h-6" />,
      faqs: [
        {
          question: "How do I schedule an appointment?",
          answer:
            'You can schedule an appointment through our platform by clicking the "Get Started Free" button and following the booking process. Select your preferred healthcare provider, date, and time.',
        },
        {
          question: "Can I reschedule or cancel my appointment?",
          answer:
            "Yes, you can manage your appointments through your account dashboard. Please note that cancellations should be made at least 24 hours in advance.",
        },
      ],
    },
    {
      title: "Technical Support",
      icon: <Phone className="w-6 h-6" />,
      faqs: [
        {
          question: "I'm having trouble logging in",
          answer:
            "If you're experiencing login issues, try resetting your password. If the problem persists, contact our technical support team.",
        },
        {
          question: "How do I update my profile information?",
          answer:
            "Navigate to your account settings to update your personal information, medical history, and insurance details.",
        },
      ],
    },
    {
      title: "Billing & Insurance",
      icon: <Mail className="w-6 h-6" />,
      faqs: [
        {
          question: "How does billing work?",
          answer:
            "We process payments securely through our platform. You'll receive an itemized bill after each appointment, and we accept most major insurance providers.",
        },
        {
          question: "Is my insurance accepted?",
          answer:
            "We work with a wide range of insurance providers. You can verify your coverage by entering your insurance information in your profile.",
        },
      ],
    },
  ];

  const filteredCategories = supportCategories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.faqs.some(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="min-h-screen w-full bg-[#4CC9FE] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[#FFF5CD] mb-4">
            How Can We Help You?
          </h2>
          <p className="text-[#FFF5CD]/90 text-lg">
            Find answers to common questions or reach out to our support team
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#37AFE1]" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-12 py-4 rounded-xl bg-[#FFF5CD] text-[#37AFE1] placeholder-[#37AFE1]/60 focus:outline-none focus:ring-2 focus:ring-[#FFB347]"
            />
          </div>
        </motion.div>

        {/* FAQ Categories with shadcn Accordion */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ y: 0.2, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[#FFF5CD] rounded-xl border border-[#FFB347] overflow-hidden"
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={category.title} className="border-b-0">
                  <AccordionTrigger className="px-6 py-4 text-[#37AFE1] hover:no-underline">
                    <div className="flex items-center gap-4">
                      {category.icon}
                      <span className="font-semibold">{category.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-0 text-[#37AFE1]/80">
                    {category.faqs.map((faq, faqIndex) => (
                      <div key={faqIndex} className="mb-4 last:mb-0">
                        <h3 className="text-[#37AFE1] text-[14px] font-medium mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-[#37AFE1]/80 text-md">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-[#FFF5CD]/90 mb-4">
            Can't find what you're looking for?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-[#FFF5CD] text-[#37AFE1] rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-[#FFB347]"
          >
            Contact Support Team
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpSupport;
