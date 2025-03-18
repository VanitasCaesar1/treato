// components/layout/MobileSearchButton.jsx (Client Component)
"use client";

import React, { useState } from "react";

const MobileSearchButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <button
      className="p-2 rounded-md text-white sm:hidden"
      onClick={() => setIsExpanded(!isExpanded)}
      aria-label="Search"
    >
      <svg
        className="h-6 w-6"
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
    </button>
  );
};

export default MobileSearchButton;
