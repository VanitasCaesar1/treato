// components/layout/SearchBar.jsx (Server Component)
import React from "react";

const SearchBar = () => {
  return (
    <div className="flex-1 max-w-xl hidden sm:block">
      <div className="relative">
        <input
          type="search"
          placeholder="Search for Patients or Doctors..."
          className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-4 text-[15px] text-white placeholder-white/60 focus:outline-none focus:border-[#FFB347] focus:ring-1 focus:ring-[#FFB347] transition-all duration-200"
        />
        <svg
          className="absolute right-3 top-2.5 h-5 w-5 text-white/60"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;
