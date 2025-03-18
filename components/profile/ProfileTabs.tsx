// components/ProfileTabs.tsx
import React from "react";
import { toast } from "react-hot-toast";
import {
  Bell,
  User,
  Shield,
  Lock,
  Mail,
  Phone,
  Heart,
  MapPin,
  Home,
} from "lucide-react";
import { Profile } from "../../types/profileTypes";
import InfoCard from "./InfoCard";
import SettingsCard from "@/components/profile/SettingsCard";

interface ProfileTabsProps {
  profile: Profile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEditClick: () => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onEditClick,
}) => {
  return (
    <div className="mt-8 px-6 pb-6">
      <div className="flex space-x-1 mb-1 border-b">
        {["profile", "settings", "security"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-6 py-3 text-sm font-medium capitalize transition-all duration-200 ${
              activeTab === tab
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Profile Tab Content */}
      {activeTab === "profile" && (
        <div className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              icon={<Mail className="h-4 w-4 text-blue-500" />}
              label="Email"
              value={profile.email}
            />
            <InfoCard
              icon={<Phone className="h-4 w-4 text-blue-500" />}
              label="Mobile"
              value={profile.mobile}
            />
            <InfoCard
              icon={<Heart className="h-4 w-4 text-blue-500" />}
              label="Blood Group"
              value={profile.blood_group || "Not set"}
            />
            <InfoCard
              icon={<MapPin className="h-4 w-4 text-blue-500" />}
              label="Location"
              value={profile.location || "Not set"}
            />
          </div>
          {profile.address && (
            <InfoCard
              icon={<Home className="h-4 w-4 text-blue-500" />}
              label="Address"
              value={profile.address}
              className="mt-4"
            />
          )}
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === "settings" && (
        <div className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <SettingsCard
              icon={<Bell className="h-5 w-5 text-blue-500" />}
              title="Notifications"
              description="Manage how you receive notifications"
              onClick={() =>
                toast.success("Coming soon: Notification settings")
              }
            />
            <SettingsCard
              icon={<User className="h-5 w-5 text-blue-500" />}
              title="Account"
              description="Update your account details and preferences"
              onClick={onEditClick}
            />
            <SettingsCard
              icon={<Shield className="h-5 w-5 text-orange-500" />}
              title="Privacy"
              description="Control your data sharing preferences"
              onClick={() => toast.success("Coming soon: Privacy settings")}
            />
            <SettingsCard
              icon={<Lock className="h-5 w-5 text-orange-500" />}
              title="Security"
              description="Manage passwords and authentication methods"
              onClick={() => setActiveTab("security")}
            />
          </div>
        </div>
      )}

      {/* Security Tab Content */}
      {activeTab === "security" && (
        <div className="pt-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
            <Lock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Account Security</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Security settings including password management and two-factor
              authentication will be available soon.
            </p>
            <button
              className="rounded-full border border-blue-500 bg-transparent text-blue-500 hover:bg-blue-50 transition-all duration-300 px-4 py-2"
              onClick={() => toast.success("Security features coming soon")}
            >
              Coming Soon
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTabs;
