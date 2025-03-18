// components/layout/Sidebar.jsx (Server Component)
import React from "react";
import NavigationLink from "@/components/NavigationLink";
import LogoutButton from "@/components/buttons/LogoutButton";

const Sidebar = ({ navigation }) => {
  return (
    <aside className="w-20 md:w-22 hidden md:flex flex-col fixed inset-y-0 bg-[#37AFE1] z-40 shadow-lg">
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
  );
};

export default Sidebar;
