// components/layout/Header.jsx (Server Component)
import React from "react";
import NavMenu from "../NavMenu";
import ProfileSection from "../dashboard/ProfileSection";
import SearchBar from "./Searchbar";
import MobileSearchButton from "./MobileSearchButton";

const Header = () => {
  return (
    <header className="h-14 bg-[#37AFE1] sticky top-0 z-20 shadow-md">
      <div className="h-full px-3 md:px-6 flex items-center justify-between gap-2 md:gap-8">
        {/* This space is for the mobile menu button, which is now in MobileSidebar */}
        <div className="w-10 md:hidden"></div>

        {/* Search Bar - Desktop */}
        <SearchBar />

        {/* Mobile search icon */}
        <MobileSearchButton />

        <NavMenu />

        {/* Using the ProfileSection component */}
        <ProfileSection />
      </div>
    </header>
  );
};

export default Header;
