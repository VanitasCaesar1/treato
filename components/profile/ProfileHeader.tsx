// components/ProfileHeader.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, AtSign, MapPin } from "lucide-react";
import { Profile } from "@/types/profileTypes";

interface ProfileHeaderProps {
  profile: Profile;
  onEditClick: () => void;
  onPictureUpload: (file: File) => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onEditClick,
  onPictureUpload,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPictureUpload(file);
    }
  };

  return (
    <>
      {/* Header with gradient background */}
      <div className="h-36 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
        <div className="absolute -bottom-14 left-6">
          <div className="relative">
            <Avatar className="h-28 w-28 border-4 border-white shadow-md">
              {profile.profile_pic ? (
                <AvatarImage
                  src={`/api/profile/picture/${profile.profile_pic.split("/").pop()}`}
                  alt={profile.name}
                  loading="lazy"
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {profile.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-blue-50 transition-colors">
              <Camera className="h-4 w-4 text-blue-600" />
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-16 px-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <div className="flex items-center text-gray-500 mt-1">
              <AtSign className="w-3 h-3 mr-1 text-blue-500" />
              <span>{profile.username || "username"}</span>
            </div>
            {profile.location && (
              <div className="flex items-center text-gray-600 text-sm mt-2">
                <MapPin className="w-4 h-4 mr-1 text-blue-500/70" />
                {profile.location}
              </div>
            )}
          </div>
          <Button
            onClick={onEditClick}
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-all duration-300 hover:shadow-lg"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
