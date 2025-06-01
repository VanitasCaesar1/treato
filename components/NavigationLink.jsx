
// NavigationLink.jsx - Compact version
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavigationLink = ({ item }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={`
        relative group flex flex-col items-center justify-center h-11 rounded-lg transition-all duration-200 ease-out overflow-hidden
        ${
          isActive
            ? "bg-white/15 shadow-lg shadow-white/10 border border-white/20"
            : "hover:bg-white/8 hover:scale-105 active:scale-95"
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-[#FFB347] to-[#ff9f1a] rounded-full shadow-sm" />
      )}
      
      {/* Icon */}
      <div className={`
        w-4 h-4 mb-0.5 transition-all duration-200
        ${isActive
          ? "text-[#FFB347] drop-shadow-sm scale-110"
          : "text-white/75 group-hover:text-white group-hover:scale-110"
        }
      `}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-full h-full"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
        </svg>
      </div>
      
      {/* Label */}
      <span className={`
        text-xs font-medium leading-none text-center transition-all duration-200
        ${isActive
          ? "text-[#FFB347] font-semibold drop-shadow-sm"
          : "text-white/75 group-hover:text-white"
        }
      `}>
        {item.name}
      </span>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </Link>
  );
};

export default NavigationLink;