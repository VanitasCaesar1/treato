// components/InfoCard.tsx
import React from "react";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  label,
  value,
  className,
}) => (
  <div
    className={`rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${className || ""}`}
  >
    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
      {icon}
      {label}
    </div>
    <p className="font-medium">{value}</p>
  </div>
);

export default InfoCard;
