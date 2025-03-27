"use client";
import React, { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const SpinningPlus = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  >
    <Plus size={20} className="text-red-500" />
  </motion.div>
);

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

const ContactPage = () => {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if all fields are filled
    const allFieldsFilled = Object.values(formData).every(field => field.trim() !== "");

    if (allFieldsFilled) {
      setTimeout(() => {
        setStatus("success");
        setIsSubmitting(false);
        toast.success("Our customer support representative will reach out to you swiftly!", {
          duration: 4000,
          position: "top-right",
          style: {
            background: "#FFF5CD",
            color: "#2D8CB3",
            border: "1px solid #FFB347"
          }
        });
        // Reset form after successful submission
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      }, 1000);
    } else {
      toast.error("Please fill out all fields", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#FF6B6B",
          color: "white"
        }
      });
      setIsSubmitting(false);
    }
  };

  const handleLiveChatStart = () => {
    toast.error("Error contacting server", {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#FF6B6B",
        color: "white"
      }
    });
  };

  const FLOATING_ICONS = [
    { Icon: Mail, className: "left-[15%] top-[20%]", delay: 0 },
    { Icon: Phone, className: "right-[15%] top-[30%]", delay: 0.5 },
    { Icon: MessageCircle, className: "left-[25%] bottom-[20%]", delay: 1 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#37AFE1]">
      {/* Existing component code */}
      <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
        {/* Previous content remains the same */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            className="bg-white/5 backdrop-blur-md rounded-2xl border border-[#FFB347] p-8"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-[#FFF5CD] mb-8">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#FFF5CD] font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-[#FFB347]
                    focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none
                    text-white placeholder-white/70"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-[#FFF5CD] font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-[#FFB347]
                    focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none
                    text-white placeholder-white/70"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#FFF5CD] font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-[#FFB347]
                  focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none
                  text-white placeholder-white/70"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-[#FFF5CD] font-medium mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-[#FFB347]
                  focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none
                  text-white placeholder-white/70"
                  placeholder="Your message..."
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-500 text-white rounded-xl py-4 font-semibold
                border border-[#FFB347] disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>
            </form>
          </motion.div>

          {/* Right Column - Live Chat Section */}
          <div className="space-y-8">
             {/* Quick Contact */}
             <motion.div
              className="bg-white/5 backdrop-blur-md rounded-2xl border border-[#FFB347] p-8"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-[#FFF5CD] mb-8">
                Quick Contact
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: "Email Us",
                    content: "support@treatoapp.com",
                    href: "mailto:support@treatoapp.com",
                  },
                  {
                    icon: Phone,
                    title: "Call Us",
                    content: "+91 9063679809",
                    href: "tel:+91 9063679809",
                  },
                  {
                    icon: MapPin,
                    title: "Visit Us",
                    content: "Kakinada",
                  },
                ].map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    className="flex items-center gap-4 p-4 rounded-xl
                    hover:bg-white/10 transition-colors duration-200 group cursor-pointer"
                    whileHover={{ x: 10 }}
                  >
                    <div
                      className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center
                      group-hover:bg-red-500 transition-colors duration-200"
                    >
                      <item.icon className="w-6 h-6 text-[#FFF5CD]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#FFF5CD]">
                        {item.title}
                      </div>
                      <div className="text-[#FFF5CD]/90">{item.content}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            
            {/* Live Chat */}
            <motion.div
              className="bg-red-500 rounded-2xl border border-[#FFB347] p-8"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <MessageCircle className="w-8 h-8 text-[#FFF5CD]" />
                <h2 className="text-2xl font-bold text-[#FFF5CD]">
                  Live Chat Support
                </h2>
              </div>
              <p className="mb-6 text-[#FFF5CD]/90">
                Need immediate assistance? Our support team is available 24/7.
              </p>
              <motion.button
                onClick={handleLiveChatStart}
                className="w-full bg-[#FFF5CD] text-red-500 rounded-xl py-4 font-semibold
                hover:bg-white transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Chat
              </motion.button>
            </motion.div>
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
    </div>
  );
};

export default ContactPage;
