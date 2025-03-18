"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavigationLink = ({ item }) => {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href === "/" && pathname === "") ||
    (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={`group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ease-in-out relative
            ${isActive ? "bg-white/10 shadow-sm" : "hover:bg-[#4CC9FE]"}`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FFB347] rounded-r-full shadow-[0_0_8px_rgba(130,234,91,0.5)]" />
      )}
      <svg
        className={`w-5 h-5 mb-1.5 transition-colors duration-200 ${
          isActive ? "text-[#FFB347]" : "text-white/90 group-hover:text-white"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={item.icon}
        />
      </svg>
      <span
        className={`text-sm font-semibold transition-colors duration-200 ${
          isActive ? "text-[#FFB347]" : "text-white/90 group-hover:text-white"
        }`}
      >
        {item.name}
      </span>
    </Link>
  );
};

export default NavigationLink;
