"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const ProfileSection = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const fetchProfilePicture = useCallback(async () => {
    try {
      setProfilePicLoading(true);
      const response = await fetch(`/api/user/profile/picture/current`, {
        credentials: 'include'
      });
      if (response.ok) {
        const blob = await response.blob();
        setProfilePicUrl(URL.createObjectURL(blob));
      } else {
        setProfilePicUrl(null);
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      setProfilePicUrl(null);
    } finally {
      setProfilePicLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      try {
        setLoading(true);
        // Get userId from session
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok || !sessionData.user?.id) throw new Error('No user session');
        setUserId(sessionData.user.id);
        // Fetch profile data
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch profile data");
        const data = await response.json();
        setProfileData(data);
        // Fetch profile picture for current user
        fetchProfilePicture();
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionAndProfile();
    // eslint-disable-next-line
  }, [fetchProfilePicture]);

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (profilePicUrl) {
        URL.revokeObjectURL(profilePicUrl);
      }
    };
  }, [profilePicUrl]);

  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-3">
        <div className="h-9 w-32 bg-white/30 rounded-xl"></div>
        <div className="h-9 w-9 bg-white/30 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-xs text-white bg-red-500/20 px-3 py-1 rounded-lg">
          Error loading profile
        </div>
        <Link href="/profile">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/dashboard/profile" className="group">
        <div className="flex flex-col items-end bg-white/20 hover:bg-white/30 px-4 py-1 rounded-xl transition-all duration-200">
          <p className="text-md font-medium text-white group-hover:text-white/90">
            Dr. {profileData?.name || "Doctor"}
          </p>
          <p className="text-xs text-white/80 group-hover:text-white/70">
            {profileData?.doctorId || profileData?.employeeId || `ID: ${profileData?.id?.slice(-8)}` || "ID: N/A"}
          </p>
        </div>
      </Link>

      <Link
        href="/dashboard/profile"
        className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-white/20 hover:ring-[#FFB347] transition-all duration-200 flex-shrink-0 bg-white/10"
      >
        {profilePicLoading ? (
          <div className="w-full h-full flex items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : profilePicUrl ? (
          <Image
            src={profilePicUrl}
            alt="Profile"
            width={36}
            height={36}
            className="w-full h-full object-cover"
            priority
            onError={() => {
              setProfilePicUrl(null);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        {profileData?.status && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </Link>
    </div>
  );
};

export default ProfileSection;