"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  User, Camera, Loader2, MapPin, Phone, Mail, Heart, 
  Stethoscope, GraduationCap, Clock, Languages, FileText, 
  Shield, AtSign, Edit3, Check, X
} from "lucide-react";

// Constants
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const SPECIALIZATIONS = {
  "cardiology": "Cardiology",
  "dermatology": "Dermatology", 
  "neurology": "Neurology",
  "orthopedics": "Orthopedics",
  "pediatrics": "Pediatrics",
  "psychiatry": "Psychiatry"
};

// Types
interface BaseProfile {
  user_id: string;
  username: string;
  name: string;
  mobile: string;
  email: string;
  blood_group?: string;
  location?: string;
  address?: string;
  profile_pic?: string;
  aadhaar_id?: string;
}

interface DoctorProfile extends BaseProfile {
  age: number;
  specialization: object;
  qualification: string;
  years_of_experience: number;
  slot_duration: number;
  bio?: string;
  languages_spoken: string[];
  imr_number?: string;
  is_active: boolean;
}

// Apple-style Field Component
const Field = ({ icon, label, value, isEditing, name, type = "text", options, onChange, error, required = false }) => (
  <div className="group">
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 transition-all hover:border-gray-200 focus-within:border-blue-500 focus-within:shadow-sm">
      <div className="text-gray-400 transition-colors group-focus-within:text-blue-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</Label>
        {isEditing ? (
          options ? (
            <Select value={value || ""} onValueChange={(val) => onChange(name, val)}>
              <SelectTrigger className="border-none p-0 h-auto shadow-none focus:ring-0">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === "textarea" ? (
            <Textarea
              name={name}
              value={value || ""}
              onChange={(e) => onChange(name, e.target.value)}
              className="border-none p-0 shadow-none resize-none focus:ring-0 min-h-[60px]"
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          ) : (
            <Input
              name={name}
              type={type}
              value={value || ""}
              onChange={(e) => onChange(name, e.target.value)}
              className="border-none p-0 shadow-none focus:ring-0"
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          )
        ) : (
          <p className="text-gray-900 font-medium truncate">
            {value || "Not set"}
            {required && !value && <span className="text-red-500 ml-1">*</span>}
          </p>
        )}
      </div>
    </div>
    {error && <p className="text-red-500 text-xs mt-1 ml-4">{error}</p>}
  </div>
);

// Main Component
const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState<Partial<DoctorProfile & BaseProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [userRole, setUserRole] = useState(null);

  // Fetch user role from session
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role || null);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchRole();
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          credentials: "include"
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data);
        setFormData(data);
        // Do not set userRole here; rely on /api/auth/session only
      } catch (error) {
        toast.error("Failed to load profile");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Handle form changes
  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string | undefined } = {};
    const data = formData as Partial<DoctorProfile & BaseProfile>;
    if (!data.name?.trim()) newErrors.name = "Name is required";
    if (!data.email?.trim()) newErrors.email = "Email is required";
    if (!data.mobile?.trim()) newErrors.mobile = "Mobile is required";
    if (userRole === "doctor") {
      if (!data.age || data.age < 1) newErrors.age = "Valid age is required";
      if (!data.qualification?.trim()) newErrors.qualification = "Qualification is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    setIsSaving(true);
    try {
      const endpoint = userRole === "doctor" 
        ? `/api/doctors/${profile.user_id}/profile`
        : "/api/user/profile";
      
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to save");

      const updated = await response.json();
      setProfile(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to save profile");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle picture upload
  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

    const toastId = toast.loading("Uploading...");
    try {
      const response = await fetch("/api/user/profile/picture", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      setProfile(prev => ({ ...prev, profile_pic: data.url }));
      toast.success("Picture updated", { id: toastId });
    } catch (error) {
      toast.error("Upload failed", { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-500 mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => name?.trim().substring(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <Card className="mb-6 border-none shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                  {profile?.profile_pic ? (
                    <AvatarImage src={`/api/user/profile/picture/${profile.user_id}`} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg">
                      {getInitials(profile?.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <label className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePictureUpload}
                  />
                </label>
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {profile?.name || "User"}
                </h1>
                <div className="flex items-center text-gray-500 mt-1">
                  <AtSign className="h-4 w-4 mr-1" />
                  <span>{profile?.username || "username"}</span>
                </div>
                {userRole === "doctor" && (
                  <div className="flex items-center text-blue-600 mt-1">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Doctor</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-full px-6"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditing ? (
                  <><Check className="h-4 w-4 mr-2" />Save</>
                ) : (
                  <><Edit3 className="h-4 w-4 mr-2" />Edit</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid gap-4">
            <Field
              icon={<User className="h-5 w-5" />}
              label="Full Name"
              value={formData.name}
              name="name"
              isEditing={isEditing}
              onChange={handleChange}
              error={errors.name}
              required
              options={undefined}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value={formData.email}
                name="email"
                type="email"
                isEditing={isEditing}
                onChange={handleChange}
                error={errors.email}
                required
                options={undefined}
              />
              
              <Field
                icon={<Phone className="h-5 w-5" />}
                label="Mobile"
                value={formData.mobile}
                name="mobile"
                type="tel"
                isEditing={isEditing}
                onChange={handleChange}
                error={errors.mobile}
                required
                options={undefined}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                icon={<Heart className="h-5 w-5" />}
                label="Blood Group"
                value={formData.blood_group}
                name="blood_group"
                isEditing={isEditing}
                onChange={handleChange}
                options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
                error={undefined}
              />
              
              <Field
                icon={<MapPin className="h-5 w-5" />}
                label="Location"
                value={formData.location}
                name="location"
                isEditing={isEditing}
                onChange={handleChange}
                error={undefined}
                options={undefined}
              />
            </div>

            <Field
              icon={<Shield className="h-5 w-5" />}
              label="Aadhaar ID"
              value={formData.aadhaar_id}
              name="aadhaar_id"
              isEditing={isEditing}
              onChange={handleChange}
              error={undefined}
              options={undefined}
            />
          </div>

          {/* Doctor-specific fields */}
          {userRole === "doctor" && (
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-500" />
                Doctor Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  icon={<User className="h-5 w-5" />}
                  label="Age"
                  value={formData.age}
                  name="age"
                  type="number"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.age}
                  required
                  options={undefined}
                />
                
                <Field
                  icon={<GraduationCap className="h-5 w-5" />}
                  label="Qualification"
                  value={formData.qualification}
                  name="qualification"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.qualification}
                  required
                  options={undefined}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  icon={<Stethoscope className="h-5 w-5" />}
                  label="Specialization"
                  value={Object.keys(formData.specialization || {})[0]}
                  name="specialization"
                  isEditing={isEditing}
                  onChange={(name, value) => handleChange(name, { [value]: true })}
                  options={Object.entries(SPECIALIZATIONS).map(([key, label]) => ({ value: key, label }))}
                  error={undefined}
                />
                
                <Field
                  icon={<Clock className="h-5 w-5" />}
                  label="Years of Experience"
                  value={formData.years_of_experience}
                  name="years_of_experience"
                  type="number"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={undefined}
                  options={undefined}
                />
              </div>

              <Field
                icon={<FileText className="h-5 w-5" />}
                label="IMR Number"
                value={formData.imr_number}
                name="imr_number"
                isEditing={isEditing}
                onChange={handleChange}
                error={undefined}
                options={undefined}
              />

              <Field
                icon={<FileText className="h-5 w-5" />}
                label="Bio"
                value={formData.bio}
                name="bio"
                type="textarea"
                isEditing={isEditing}
                onChange={handleChange}
                error={undefined}
                options={undefined}
              />
            </div>
          )}

          <Field
            icon={<MapPin className="h-5 w-5" />}
            label="Address"
            value={formData.address}
            name="address"
            type="textarea"
            isEditing={isEditing}
            onChange={handleChange}
            error={undefined}
            options={undefined}
          />
        </div>

        {/* Cancel button when editing */}
        {isEditing && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFormData(profile);
                setErrors({});
              }}
              className="rounded-full px-6"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;