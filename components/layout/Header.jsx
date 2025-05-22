"use client";

import React, { useState, useEffect } from "react";
import NavMenu from "../NavMenu";
import ProfileSection from "../dashboard/ProfileSection";
import SearchBar from "./Searchbar";
import MobileSearchButton from "./MobileSearchButton";
import { Bell, Settings, Calendar, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-gradient-to-r from-[#37AFE1] via-[#37AFE1] to-[#2E9BC7] sticky top-0 z-30 shadow-lg backdrop-blur-sm border-b border-white/10">
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8">
        {/* Mobile menu spacing */}
        <div className="w-10 md:hidden"></div>
        
        {/* Logo and Brand - Hidden on mobile, shown on larger screens */}
        <div className="hidden lg:flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FFB347] to-[#FF9F1C] rounded-lg flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
          
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <SearchBar />
        </div>

        {/* Mobile search button */}
        <div className="sm:hidden">
          <MobileSearchButton />
        </div>


        {/* Navigation Menu */}
        <div className="flex-shrink-0">
          <NavMenu />
        </div>

        {/* Enhanced Actions Section */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-transparent hover:border-white/20 backdrop-blur-sm">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-transparent hover:border-white/20 backdrop-blur-sm">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Section */}
          <div className="flex-shrink-0">
            <ProfileSection />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;