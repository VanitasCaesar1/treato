// NavMenu.jsx - Compact version
"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from 'react-dom';
import Link from "next/link";
import { PlusCircle, Menu, Book, DollarSign, UserPlus } from "lucide-react";
import CreateAppointment from "./CreateAppointment";
import CreatePatient from './CreatePatient';

// Portal Modal Component with iOS translucent effect
const PortalModal = ({ children, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-[999999] backdrop-blur-xl bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-white shadow-2xl border border-gray-300 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const menuItems = [
    {
      type: "button",
      title: "Create Appointment",
      shortTitle: "Appointment",
      icon: PlusCircle,
      onClick: () => setIsAppointmentOpen(true),
    },
    {
      type: "button",
      title: "Create Patient",
      shortTitle: "Patient",
      icon: UserPlus,
      onClick: () => setIsPatientModalOpen(true),
    },
    {
      type: "dropdown",
      title: "Diagnosis",
      icon: Menu,
      items: [
        {
          title: "Templates",
          href: "/dashboard/templates",
          description: "Edit and create templates for faster diagnosis",
        },
        {
          title: "Lab Records & Vitals",
          href: "/dashboard/labs",
          description: "Record patient vitals and manage lab records",
        },
        {
          title: "Follow-up Visit",
          href: "/dashboard/followup",
          description: "Schedule and manage patient follow-up appointments",
        },
      ],
    },
    {
      type: "link",
      title: "Medical Records (EMR)",
      shortTitle: "Records",
      href: "/dashboard/records",
      icon: Book,
    },
    {
      type: "link",
      title: "Billing",
      href: "/dashboard/billing",
      icon: DollarSign,
    },
  ];

  return (
    <>
      {/* iOS-style backdrop overlay for dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <nav className="relative z-50">
        <div className="flex items-center gap-1.5">
          {menuItems.map((item) => (
            <div key={item.title} className="relative">
              {item.type === "link" ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white/80 backdrop-blur-xl rounded-lg border border-white/50 hover:bg-white/90 hover:text-blue-600 transition-all duration-200 shadow-sm whitespace-nowrap"
                >
                  <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.shortTitle || item.title}</span>
                  <span className="lg:hidden">{item.icon === DollarSign ? '$' : item.shortTitle || item.title}</span>
                </Link>
              ) : item.type === "button" ? (
                <button
                  onClick={item.onClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white/80 backdrop-blur-xl rounded-lg border border-white/50 hover:bg-white/90 hover:text-blue-600 transition-all duration-200 shadow-sm whitespace-nowrap"
                >
                  <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden lg:inline">{item.shortTitle || item.title}</span>
                  <span className="lg:hidden">{item.shortTitle || item.title}</span>
                </button>
              ) : (
                <div
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="relative"
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 shadow-sm whitespace-nowrap ${
                      isOpen 
                        ? "text-blue-600 bg-white/90 border-white/60 backdrop-blur-xl" 
                        : "text-gray-700 bg-white/80 backdrop-blur-xl border-white/50 hover:bg-white/90 hover:text-blue-600"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {item.title}
                  </button>

                  <div
                    className={`absolute left-0 top-full mt-2 w-[420px] z-[9999] transition-all duration-200 ${
                      isOpen
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 -translate-y-1 invisible"
                    }`}
                  >
                    <div className="p-3 bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-gray-200/50">
                      <div className="space-y-1">
                        {item.items.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            className="block p-2.5 rounded-lg hover:bg-white/60 transition-colors duration-150"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="text-xs font-medium text-gray-900">
                              {dropdownItem.title}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {dropdownItem.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <PortalModal 
        isOpen={isAppointmentOpen} 
        onClose={() => setIsAppointmentOpen(false)}
      >
        <CreateAppointment
          isOpen={isAppointmentOpen}
          onClose={() => setIsAppointmentOpen(false)}
        />
      </PortalModal>

      <PortalModal 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)}
      >
        <CreatePatient
          isOpen={isPatientModalOpen}
          onClose={() => setIsPatientModalOpen(false)}
        />
      </PortalModal>
    </>
  );
};

export default NavMenu;
