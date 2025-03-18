"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Camera,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Heart,
  Home,
  Save,
  Bell,
  Shield,
  Lock,
  AtSign,
  ArrowRight,
  X,
} from "lucide-react";

// Constants and interfaces
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /\S+@\S+\.\S+/;
const MOBILE_REGEX = /^\d{10}$/;

interface Profile {
  user_id: string;
  username: string | null;
  profile_pic: string | null;
  name: string;
  mobile: string;
  email: string;
  blood_group: string | null;
  location: string | null;
  address: string | null;
  aadhaar_id: string | null;
}

interface FormErrors {
  [key: string]: string;
}

// Improved debounce utility function with proper typing
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}

// Memoized helper components to prevent unnecessary re-renders
const InfoCard = React.memo(({ icon, label, value, className = "" }) => (
  <div
    className={`rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition ${className}`}
  >
    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
      {icon}
      {label}
    </div>
    <p className="font-medium">{value}</p>
  </div>
));
InfoCard.displayName = "InfoCard";

const SettingsCard = React.memo(({ icon, title, description, onClick }) => (
  <div
    className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 flex gap-4 cursor-pointer hover:bg-gray-50/90 transition shadow-sm hover:shadow-md"
    onClick={onClick}
  >
    <div className="mt-1">{icon}</div>
    <div className="flex-1">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <ArrowRight className="self-center w-4 h-4 text-gray-400" />
  </div>
));
SettingsCard.displayName = "SettingsCard";

// Loading skeleton component
const ProfileSkeleton = () => (
  <div className="container mx-auto p-6 max-w-3xl">
    <Card className="rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-1/3 mb-2 rounded-full" />
        <Skeleton className="h-4 w-1/4 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Helper function to get initials safely
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  return name.trim().substring(0, 2).toUpperCase();
};

// Main profile component
const ProfilePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [profile, setProfile] = useState<Profile>({
    user_id: "",
    username: null,
    profile_pic: null,
    aadhaar_id: null,
    name: "",
    mobile: "",
    email: "",
    blood_group: null,
    location: null,
    address: null,
  });
  const [formData, setFormData] = useState<Profile>({ ...profile });
  const [lastUpdated, setLastUpdated] = useState("");

  const obfuscateAadhaarId = (aadhaarId: string | null): string => {
    if (!aadhaarId || aadhaarId.trim() === "") return "Not provided";
    // Show only last 4 digits, replace first 8 with X
    return "XXXX-XXXX-" + aadhaarId.slice(-4);
  };

  // Refs to handle component lifecycle
  const isMounted = useRef(false);
  const isFetching = useRef(false);

  // Define form update callback with useCallback to prevent re-creation
  const updateFormData = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    setFormErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Create debounced handlers with proper dependencies
  const debouncedUpdateFormData = useDebounce(updateFormData, 300);

  // Stable input change handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      debouncedUpdateFormData(name, value);
    },
    [debouncedUpdateFormData],
  );

  // Stable select change handler
  const handleSelectChange = useCallback(
    (name: string, value: string) => {
      debouncedUpdateFormData(name, value);
    },
    [debouncedUpdateFormData],
  );

  // Fetch profile data only once on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (isFetching.current) return;
      isFetching.current = true;

      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          credentials: "include",
        });

        if (!isMounted.current) return;

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Please login to continue");
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        
        // Ensure all required fields exist
        const safeData = {
          ...profile, // Default values
          ...data,    // Server data
          // Ensure these fields exist and have valid default values
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
        };
        
        setProfile(safeData);
        setFormData(safeData);

        // Set the last updated timestamp from server or use current date
        const formattedDate = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        setLastUpdated(formattedDate);
      } catch (error) {
        if (isMounted.current) {
          console.error("Profile fetch error:", error);
          toast.error("Failed to load profile data");
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          isFetching.current = false;
        }
      }
    };

    isMounted.current = true;
    fetchProfileData();

    return () => {
      isMounted.current = false;
    };
  }, [router]); // Added router to dependencies

  // Form validation with stable reference
  const validateForm = useCallback(() => {
    const errors: FormErrors = {};

    if (!formData.name?.trim()) errors.name = "Name is required";

    if (!formData.username?.trim()) {
      errors.username = "Username is required";
    } else if (!USERNAME_REGEX.test(formData.username)) {
      errors.username =
        "Username must be 3-20 characters (letters, numbers, underscore)";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.mobile?.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!MOBILE_REGEX.test(formData.mobile.replace(/[^0-9]/g, ""))) {
      errors.mobile = "Mobile number must have 10 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Form submission - only update profile state on success
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!isMounted.current) return;

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please login to continue");
          router.push("/login");
          return;
        }
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();
      // Only update the profile state on successful API response
      setProfile(updatedData);

      // Update last updated timestamp
      const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      setLastUpdated(formattedDate);

      setIsEditOpen(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      if (isMounted.current) {
        console.error("Profile update error:", error);
        toast.error("Failed to update profile");
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  };

  // Profile picture upload with stable reference
  const handlePictureUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
  
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Please upload a JPEG or PNG image");
        return;
      }
  
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
  
      const formData = new FormData();
      formData.append("profilePic", file);
  
      const toastId = toast.loading("Uploading image...");
      try {
        const response = await fetch("/api/user/profile/picture", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
  
        if (!isMounted.current) return;
  
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed");
  
        // Update the profile state even if no URL is returned
        // The server might be storing the image with the user ID rather than returning a URL
        setProfile((prev) => ({ 
          ...prev, 
          profile_pic: data.url || `${prev.user_id}_profile_pic` // Use a fallback if no URL
        }));
        
        toast.success("Profile picture updated", { id: toastId });
      } catch (error) {
        if (isMounted.current) {
          toast.error("Failed to upload profile picture", { id: toastId });
          console.error("Upload error:", error);
        }
      }
    },
    [],
  );

  // UI helpers with stable references
  const openEditMode = useCallback(() => {
    // Set form data from current profile state to ensure correct initial values
    setFormData(JSON.parse(JSON.stringify(profile)));
    setFormErrors({});
    setIsEditOpen(true);
  }, [profile]);

  const handleTabChange = useCallback(
    (tab: string) => {
      if (activeTab !== tab) setActiveTab(tab);
    },
    [activeTab],
  );

  // Memoize the Sheet element to prevent re-renders
  const editSheet = React.useMemo(
    () => (
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent
          side="bottom"
          className="h-[90vh] rounded-t-3xl p-0 max-w-full overflow-hidden"
        >
          {/* Sheet Header */}
          <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-2 border-b">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center">
              <SheetTitle className="text-lg text-blue-600 font-medium">
                Edit Profile
              </SheetTitle>
              <Button
                variant="ghost"
                className="w-8 h-8 p-0 rounded-full"
                onClick={() => setIsEditOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sheet content */}
          <div className="p-6 overflow-y-auto h-[calc(90vh-130px)]">
            <form
              id="profile-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={formData.name || ""}
                  onChange={handleChange}
                  className={`rounded-xl ${formErrors.name ? "border-red-400" : ""}`}
                />
                {formErrors.name && (
                  <span className="text-red-500 text-xs">
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={formData.username || ""}
                  onChange={handleChange}
                  className={`rounded-xl ${formErrors.username ? "border-red-400" : ""}`}
                />
                {formErrors.username && (
                  <span className="text-red-500 text-xs">
                    {formErrors.username}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={formData.email || ""}
                    onChange={handleChange}
                    className={`rounded-xl ${formErrors.email ? "border-red-400" : ""}`}
                  />
                  {formErrors.email && (
                    <span className="text-red-500 text-xs">
                      {formErrors.email}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mobile" className="text-sm font-medium">
                    Mobile <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    defaultValue={formData.mobile || ""}
                    onChange={handleChange}
                    className={`rounded-xl ${formErrors.mobile ? "border-red-400" : ""}`}
                  />
                  {formErrors.mobile && (
                    <span className="text-red-500 text-xs">
                      {formErrors.mobile}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="blood_group" className="text-sm font-medium">
                    Blood Group
                  </Label>
                  <Select
                    defaultValue={formData.blood_group || undefined}
                    onValueChange={(value) =>
                      handleSelectChange("blood_group", value)
                    }
                  >
                    <SelectTrigger id="blood_group" className="rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {BLOOD_GROUPS.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={formData.location || ""}
                    onChange={handleChange}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="aadhaar_id" className="text-sm font-medium">
                  Aadhaar ID
                </Label>
                <Input
                  id="aadhaar_id"
                  name="aadhaar_id"
                  defaultValue={formData.aadhaar_id || ""}
                  onChange={handleChange}
                  className="rounded-xl"
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                />
                <p className="text-xs text-gray-500">
                  Only you and authorized personnel can view your full Aadhaar
                  ID
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  defaultValue={formData.address || ""}
                  onChange={handleChange}
                  className="min-h-24 rounded-xl"
                />
              </div>
            </form>
          </div>

          {/* Sheet footer */}
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="profile-form"
              disabled={isSaving}
              className="rounded-full bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    ),
    [
      isEditOpen,
      setIsEditOpen,
      formData,
      formErrors,
      handleChange,
      handleSelectChange,
      handleSubmit,
      isSaving,
    ],
  );

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl min-h-screen py-6">
      <div className="container mx-auto  px-4 max-w-7xl">
        <Card className="shadow-md rounded-2xl overflow-hidden border-none bg-white/90 backdrop-blur-sm">
          {/* Header with gradient background */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
            <div className="absolute -bottom-12 left-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  {profile.profile_pic ? (
                   <AvatarImage
                      src={`/api/user/profile/picture/${profile.user_id}`}
                      alt={profile.name || "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-blue-50 transition-colors">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={handlePictureUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Profile info */}
          <CardContent className="pt-14 px-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-xl font-semibold">{profile.name || "User"}</h1>
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
                onClick={openEditMode}
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                type="button"
                size="sm"
              >
                Edit
              </Button>
            </div>

            {/* Tabs */}
            <div className="mt-6">
              <div className="flex space-x-1 mb-1 border-b">
                {["profile", "settings", "security"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    type="button"
                    className={`relative px-4 py-2 text-sm font-medium capitalize transition-all ${
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
                <div className="pt-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoCard
                      icon={<Mail className="h-4 w-4 text-blue-500" />}
                      label="Email"
                      value={profile.email || "Not set"}
                    />
                    <InfoCard
                      icon={<Phone className="h-4 w-4 text-blue-500" />}
                      label="Mobile"
                      value={profile.mobile || "Not set"}
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
                    <InfoCard
                      icon={<Shield className="h-4 w-4 text-blue-500" />}
                      label="Aadhaar ID"
                      value={obfuscateAadhaarId(profile.aadhaar_id)}
                    />
                  </div>
                  {profile.address && (
                    <InfoCard
                      icon={<Home className="h-4 w-4 text-blue-500" />}
                      label="Address"
                      value={profile.address}
                      className="mt-3"
                    />
                  )}
                </div>
              )}

              {/* Settings Tab Content */}
              {activeTab === "settings" && (
                <div className="pt-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <SettingsCard
                      icon={<Bell className="h-5 w-5 text-blue-500" />}
                      title="Notifications"
                      description="Manage notifications"
                      onClick={() =>
                        toast.success("Coming soon: Notification settings")
                      }
                    />
                    <SettingsCard
                      icon={<User className="h-5 w-5 text-blue-500" />}
                      title="Account"
                      description="Update account details"
                      onClick={openEditMode}
                    />
                    <SettingsCard
                      icon={<Shield className="h-5 w-5 text-blue-500" />}
                      title="Privacy"
                      description="Control data sharing"
                      onClick={() =>
                        toast.success("Coming soon: Privacy settings")
                      }
                    />
                    <SettingsCard
                      icon={<Lock className="h-5 w-5 text-blue-500" />}
                      title="Security"
                      description="Manage authentication"
                      onClick={() => handleTabChange("security")}
                    />
                  </div>
                </div>
              )}

              {/* Security Tab Content */}
              {activeTab === "security" && (
                <div className="pt-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                    <Lock className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                    <h3 className="text-base font-medium mb-2">
                      Account Security
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">
                      Security settings including password management and
                      two-factor authentication will be available soon.
                    </p>
                    <Button
                      className="rounded-full border-blue-500 bg-transparent text-blue-500 hover:bg-blue-50"
                      onClick={() =>
                        toast.success("Security features coming soon")
                      }
                      type="button"
                      size="sm"
                    >
                      Coming Soon
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t py-2 text-center text-gray-500 text-xs">
            Profile last updated: {lastUpdated}
          </CardFooter>
        </Card>

        {/* Edit Profile Sheet */}
        {editSheet}
      </div>
    </div>
  );
};

export default ProfilePage;