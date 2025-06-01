// components/layout/Sidebar.jsx (Server Component)
import React from "react";
import Link from "next/link";
import NavigationLink from "@/components/NavigationLink";
import LogoutButton from "@/components/buttons/LogoutButton";

const Sidebar = ({ navigation }) => {
  return (
    <aside className="w-20 hidden sm:flex flex-col fixed inset-y-0 bg-[#37AFE1]/90 backdrop-blur-2xl z-40 border-r border-white/10">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-br from-[#FFB347] to-[#ff9f1a] rounded-lg flex items-center justify-center shadow-lg shadow-[#FFB347]/25 hover:shadow-xl hover:shadow-[#FFB347]/35 transition-all duration-200 hover:scale-105 active:scale-95">
          <svg
            className="w-4 h-4 text-white drop-shadow-sm"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M351.9 256L460 193.6l-48-83.2l-108 62.4V48h-96v124.8l-108-62.4l-48 83.2L160.1 256L52 318.4l48 83.2l108-62.4V464h96V339.2l108 62.4l48-83.2z"
            />
          </svg>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 py-3 px-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavigationLink key={item.name} item={item} />
        ))}
      </nav>
      
      {/* Create Hospital Button */}
      <div className="px-2 pb-3">
        <Link
          href="/create-hospital"
          className="group relative flex flex-col items-center justify-center h-12 rounded-lg bg-gradient-to-br from-[#FFB347] to-[#ff9f1a] shadow-lg shadow-[#FFB347]/25 hover:shadow-xl hover:shadow-[#FFB347]/35 transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden"
        >
          {/* Plus Icon */}
          <div className="w-4 h-4 mb-0.5 text-white transition-transform duration-200 group-hover:rotate-90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-full h-full drop-shadow-sm"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          {/* Label */}
          <span className="text-xs font-medium text-white leading-none text-center drop-shadow-sm">
            Create
          </span>
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>
      </div>
      
      {/* Logout Button */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3">
        <LogoutButton />
      </div>
    </aside>
  );
};

export default Sidebar;