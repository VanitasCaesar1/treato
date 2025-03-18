"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { PlusCircle, Menu, Book, DollarSign } from "lucide-react";
import CreateAppointment from "./CreateAppointment";

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
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
      icon: PlusCircle,
      onClick: () => setIsAppointmentOpen(true),
    },
    {
      type: "dropdown",
      title: "Diagnosis",
      icon: Menu,
      items: [
        {
          title: "Templates",
          href: "/dashboard/templates",
          description:
            "Edit and create templates for faster diagnosis and treatment times",
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
      <nav className="relative">
        <div className="flex items-center gap-2">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.type === "link" ? (
                <Link
                  href={item.href}
                  className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-100 rounded-md transition-all duration-200 hover:text-[#FFB347] hover:bg-gray-800/60"
                >
                  <item.icon className="w-4 h-4 transition-colors duration-200 group-hover:text-[#FFB347]" />
                  {item.title}
                </Link>
              ) : item.type === "button" ? (
                <button
                  onClick={item.onClick}
                  className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-100 rounded-md transition-all duration-200 hover:text-[#FFB347] hover:bg-gray-800/60"
                >
                  <item.icon className="w-4 h-4 transition-colors duration-200 group-hover:text-[#FFB347]" />
                  {item.title}
                </button>
              ) : (
                <div
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="relative"
                >
                  <button
                    className={`group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                      ${isOpen ? "text-[#FFB347] bg-gray-800/60" : "text-gray-100 hover:text-[#FFB347] hover:bg-gray-800/60"}`}
                  >
                    <item.icon className="w-4 h-4 transition-colors duration-200 group-hover:text-[#FFB347]" />
                    {item.title}
                  </button>

                  <div
                    className={`absolute left-0 top-full mt-1 w-[600px] transition-all duration-200 ease-in-out origin-top-left
                      ${
                        isOpen
                          ? "opacity-100 translate-y-0 visible"
                          : "opacity-0 -translate-y-1 invisible pointer-events-none"
                      }`}
                  >
                    <div className="p-4 bg-gray-900 rounded-lg shadow-lg border border-gray-800">
                      <div className="grid gap-3">
                        {item.items.map((dropdownItem, index) => (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            className="block p-3 rounded-lg transition-all duration-200 hover:bg-gray-800/60"
                            style={{
                              transitionDelay: `${index * 50}ms`,
                            }}
                          >
                            <div className="text-sm font-medium text-gray-100">
                              {dropdownItem.title}
                            </div>
                            <p className="mt-1 text-sm text-gray-400">
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

      {/* Direct render of CreateAppointment without Dialog wrapper */}
      <CreateAppointment
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
      />
    </>
  );
};

export default NavMenu;
