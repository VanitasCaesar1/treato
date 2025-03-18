// components/layout/MobileSidebar.jsx (Client Component)
"use client";

import React, { useState } from "react";
import NavigationLink from "@/components/NavigationLink";
import LogoutButton from "@/components/buttons/LogoutButton";

const MobileSidebar = ({ navigation }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="fixed top-3 left-3 p-2 rounded-md text-white md:hidden z-50"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`w-20 md:w-22 flex md:hidden flex-col fixed inset-y-0 bg-[#37AFE1] z-40 shadow-lg transition-all duration-300 ease-in-out transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-center border-b border-[#FFB347]/10">
          <svg
            className="w-8 h-8 text-[#FFB347] transition-transform hover:scale-110 duration-200"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M351.9 256L460 193.6l-48-83.2l-108 62.4V48h-96v124.8l-108-62.4l-48 83.2L160.1 256L52 318.4l48 83.2l108-62.4V464h96V339.2l108 62.4l48-83.2z"
            />
          </svg>
        </div>
        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 py-4 overflow-y-auto">
          {navigation.map((item) => (
            <NavigationLink key={item.name} item={item} />
          ))}
        </nav>
        {/* Static Logout Button */}
        <div className="p-2 border-t border-[#82ea5b]/10">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
