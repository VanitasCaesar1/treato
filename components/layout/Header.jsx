"use client";
import React, { useState, useEffect } from "react";
import NavMenu from "../NavMenu";
import ProfileSection from "../dashboard/ProfileSection";
import SearchBar from "./Searchbar";
import MobileSearchButton from "./MobileSearchButton";
import { Bell, Settings } from "lucide-react";
import Link from "next/link";

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
    <header className="h-14 bg-gradient-to-r from-[#37AFE1] via-[#37AFE1] to-[#2E9BC7] sticky top-0 z-30 shadow-lg backdrop-blur-sm border-b border-white/10">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Mobile menu spacing */}
        <div className="w-8 md:hidden"></div>
        
        {/* Enhanced Search Bar */}
        <div className="flex-1 max-w-xl hidden sm:block">
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
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-transparent hover:border-white/20 backdrop-blur-sm">
              <Bell className="w-4 h-4" />
            </button>
            <Link href='/dashboard/settings'>
              <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-transparent hover:border-white/20 backdrop-blur-sm">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
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
