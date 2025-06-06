// components/buttons/CreateHospitalButton.jsx
"use client";
import React from "react";
import Link from "next/link";

const CreateHospitalButton = () => {
  return (
    <Link
      href="/create-hospital"
      className="group flex flex-col items-center justify-center h-14 rounded-2xl bg-gradient-to-br from-[#37AFE1] to-[#2E9FD1] shadow-lg shadow-[#37AFE1]/20 hover:shadow-xl hover:shadow-[#37AFE1]/30 transition-all duration-300 hover:scale-105 active:scale-95"
    >
      {/* Plus Icon */}
      <div className="w-6 h-6 mb-1 text-white transition-transform duration-300 group-hover:rotate-90">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-full h-full"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      
      {/* Label */}
      <span className="text-xs font-semibold text-white leading-none text-center">
        Create
      </span>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Link>
  );
};

export default CreateHospitalButton;