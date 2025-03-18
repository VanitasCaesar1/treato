// components/SettingsCard.tsx
import React from "react";
import { ArrowRight } from "lucide-react";

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  title,
  description,
  onClick,
}) => (
  <div
    className="border rounded-2xl p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
    onClick={onClick}
  >
    <div className="mt-1">{icon}</div>
    <div className="flex-1">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div className="self-center bg-gray-100 rounded-full p-2 group-hover:bg-blue-50 transition-colors">
      <ArrowRight className="w-4 h-4 text-gray-400" />
    </div>
  </div>
);

export default SettingsCard;
