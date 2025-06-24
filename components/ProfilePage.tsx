"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import {
  User, Camera, Loader2, MapPin, Phone, Mail, Heart, 
  Stethoscope, GraduationCap, Clock, Languages, FileText, 
  Shield, AtSign, Edit3, Check, X, ChevronRight
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
  role?: string;
}

interface PractitionerProfile extends BaseProfile {
  age: number;
  specialization: Record<string, boolean> | string;
  qualification: string;
  years_of_experience: number;
  slot_duration: number;
  bio?: string;
  languages_spoken: string[] | string;
  imr_number?: string;
  is_active: boolean;
}

type ProfileFormData = Partial<PractitionerProfile> & Partial<BaseProfile>;
type ProfileErrors = Partial<Record<keyof ProfileFormData, string>>;

// iOS-style Section Component
const Section = ({ title, children, className = "" }) => (
  <div className={`mb-8 ${className}`}>
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-4">
      {title}
    </h2>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {children}
    </div>
  </div>
);

// iOS-style Field Component
const Field = ({ 
  icon, 
  label, 
  value, 
  isEditing, 
  name, 
  type = "text", 
  options = undefined, 
  onChange, 
  error, 
  required = false,
  placeholder,
  isLast = false 
}) => (
  <div className={`${!isLast ? 'border-b border-gray-100' : ''}`}>
    <div className="flex items-center px-4 py-3">
      <div className="flex items-center min-w-0 flex-1">
        <div className="text-gray-400 mr-3 flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-900 mb-1 block">
              {label}
              {required && !value && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {!isEditing && !options && (
              <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 ml-2" />
            )}
          </div>
          
          {isEditing ? (
            <div className="mt-1">
              {options ? (
                <Select value={value || ""} onValueChange={(val) => onChange(name, val)}>
                  <SelectTrigger className="border-gray-200 rounded-lg h-10">
                    <SelectValue placeholder={placeholder || "Select..."} />
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
                  className="border-gray-200 rounded-lg resize-none"
                  placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
                  rows={3}
                />
              ) : (
                <Input
                  name={name}
                  type={type}
                  value={value || ""}
                  onChange={(e) => onChange(name, e.target.value)}
                  className="border-gray-200 rounded-lg h-10"
                  placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
                />
              )}
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">
              {value || (
                <span className="text-gray-400">
                  {placeholder || "Not set"}
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ isActive, isEditing, onChange }) => (
  <div className="flex items-center px-4 py-3">
    <div className="flex items-center min-w-0 flex-1">
      <div className="text-gray-400 mr-3 flex-shrink-0">
        <Shield className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <Label className="text-sm font-medium text-gray-900 mb-1 block">
          Status
        </Label>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange('is_active', !isActive)}
              className="ml-2"
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Main Component
const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [userRole, setUserRole] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setSessionData(data);
          setUserRole(data.role || null);
        } else if (res.status === 401) {
          router.push("/login");
          return;
        }
      } catch (e) {
        console.error("Error fetching session:", e);
      }
    };
    fetchSession();
  }, [router]);

  // Determine if user is practitioner
  const isPractitioner = useMemo(() => {
    const roleBasedCheck = (
      userRole === "practitioner" || 
      userRole === "doctor" || 
      userRole === "admin" || 
      profile?.role === "practitioner" ||
      profile?.role === "doctor" ||
      profile?.role === "admin"
    );
    const fieldBasedCheck = !!(profile?.age || profile?.specialization || profile?.qualification);
    return roleBasedCheck || fieldBasedCheck;
  }, [userRole, profile]);

  // Get display role
  const getDisplayRole = () => {
    const currentRole = userRole || profile?.role;
    if (currentRole === "admin") return "Administrator";
    if (currentRole === "practitioner" || currentRole === "doctor") return "Doctor";
    return "User";
  };

  // Helper function to parse specialization
  const parseSpecialization = (spec) => {
    if (!spec) return {};
    if (typeof spec === 'object') return spec;
    if (typeof spec === 'string') {
      try {
        return JSON.parse(spec);
      } catch {
        // If it's just a string, convert to object format
        return { [spec]: true };
      }
    }
    return {};
  };

  // Helper function to get specialization display value
  const getSpecializationDisplay = (spec) => {
    const parsed = parseSpecialization(spec);
    const keys = Object.keys(parsed);
    if (keys.length === 0) return '';
    return SPECIALIZATIONS[keys[0]] || keys[0];
  };

  // Fetch profile data
  useEffect(() => {
    if (!userRole && !sessionData) return;

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
        
        // Initialize form data properly
        const initialFormData = {
          username: data.username || '',
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile?.toString() || '',
          blood_group: data.blood_group || '',
          location: data.location || '',
          address: data.address || '',
          aadhaar_id: data.aadhaar_id || '',
        };

        // Add practitioner fields if applicable
        if (isPractitioner || data.age || data.specialization || data.qualification) {
          Object.assign(initialFormData, {
            age: data.age || '',
            qualification: data.qualification || '',
            years_of_experience: data.years_of_experience || 0,
            slot_duration: data.slot_duration || 30,
            specialization: parseSpecialization(data.specialization),
            bio: data.bio || '',
            languages_spoken: Array.isArray(data.languages_spoken) 
              ? data.languages_spoken.join(', ')
              : data.languages_spoken || '',
            imr_number: data.imr_number || '',
            is_active: data.is_active !== undefined ? data.is_active : true
          });
        }
        
        setFormData(initialFormData);
        
        if (!userRole && data.role) {
          setUserRole(data.role);
        }
      } catch (error) {
        toast.error("Failed to load profile");
        console.error("Profile fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router, userRole, sessionData, isPractitioner]);

  // Handle form changes
  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Validate form
  const validateForm = () => {
    const newErrors: ProfileErrors = {};
    const data = formData as ProfileFormData;

    if (!data.name?.toString().trim()) newErrors.name = "Name is required";
    if (!data.email?.toString().trim()) newErrors.email = "Email is required";
    if (!data.mobile?.toString().trim()) newErrors.mobile = "Mobile is required";

    if (isPractitioner) {
      if (!data.age || Number(data.age) < 1) newErrors.age = "Valid age is required";
      if (!data.qualification?.toString().trim()) newErrors.qualification = "Qualification is required";
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
      const saveData = {
        username: formData.username || profile?.username,
        name: formData.name?.trim(),
        email: formData.email?.trim(),
        mobile: formData.mobile?.trim(),
        blood_group: formData.blood_group || null,
        location: formData.location?.trim() || null,
        address: formData.address?.trim() || null,
        aadhaar_id: formData.aadhaar_id?.trim() || null,
      };

      // Add practitioner fields if applicable
      if (isPractitioner) {
        Object.assign(saveData, {
          age: formData.age ? parseInt(String(formData.age)) : null,
          qualification: formData.qualification?.trim() || null,
          years_of_experience: formData.years_of_experience ? parseInt(String(formData.years_of_experience)) : 0,
          slot_duration: formData.slot_duration ? parseInt(String(formData.slot_duration)) : 30,
          specialization: formData.specialization || {},
          bio: formData.bio?.trim() || null,
          languages_spoken: typeof formData.languages_spoken === 'string'
            ? formData.languages_spoken.split(',').map(lang => lang.trim()).filter(Boolean)
            : Array.isArray(formData.languages_spoken) 
              ? formData.languages_spoken.filter(lang => lang?.trim())
              : [],
          imr_number: formData.imr_number?.trim() || null,
          is_active: formData.is_active !== undefined ? formData.is_active : true
        });
      }

      // Remove undefined values
      Object.keys(saveData).forEach(key => {
        if (saveData[key] === undefined) {
          delete saveData[key];
        }
      });
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save");
      }

      const updated = await response.json();
      setProfile(updated);
      
      // Update form data with saved values
      const updatedFormData = {
        ...formData,
        ...updated,
        mobile: updated.mobile?.toString() || '',
        languages_spoken: Array.isArray(updated.languages_spoken) 
          ? updated.languages_spoken.join(', ')
          : updated.languages_spoken || '',
        specialization: parseSpecialization(updated.specialization)
      };
      setFormData(updatedFormData);
      
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to save profile");
      console.error("Save error:", error);
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-3 ring-white shadow-lg">
                    {profile?.profile_pic ? (
                      <AvatarImage src={`/api/user/profile/picture/${profile.user_id}`} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg">
                        {getInitials(profile?.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors">
                    <Camera className="h-3 w-3" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePictureUpload}
                    />
                  </label>
                </div>
                
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {profile?.name || "User"}
                  </h1>
                  <div className="flex items-center text-gray-500 text-sm">
                    <AtSign className="h-3 w-3 mr-1" />
                    <span>{profile?.username || "username"}</span>
                  </div>
                  <div className="flex items-center text-blue-600 text-sm mt-1">
                    {(userRole === "admin" || profile?.role === "admin") ? (
                      <Shield className="h-3 w-3 mr-1" />
                    ) : (
                      <Stethoscope className="h-3 w-3 mr-1" />
                    )}
                    <span className="font-medium">{getDisplayRole()}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm rounded-lg px-6"
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
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              {/* Personal Information */}
              <Section title="Personal Information">
                <Field
                  icon={<User className="h-5 w-5" />}
                  label="Full Name"
                  value={formData.name || ''}
                  name="name"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  placeholder="Enter full name"
                />
                <Field
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={formData.email || ''}
                  name="email"
                  type="email"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="Enter email"
                />
                <Field
                  icon={<Phone className="h-5 w-5" />}
                  label="Mobile"
                  value={formData.mobile || ''}
                  name="mobile"
                  type="tel"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.mobile}
                  required
                  placeholder="Enter mobile number"
                />
                <Field
                  icon={<Heart className="h-5 w-5" />}
                  label="Blood Group"
                  value={formData.blood_group || ''}
                  name="blood_group"
                  isEditing={isEditing}
                  onChange={handleChange}
                  options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
                  error={errors.blood_group}
                  placeholder="Select blood group"
                  isLast
                />
              </Section>

              {/* Location Information */}
              <Section title="Location">
                <Field
                  icon={<MapPin className="h-5 w-5" />}
                  label="Location"
                  value={formData.location || ''}
                  name="location"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.location}
                  placeholder="City, State"
                />
                <Field
                  icon={<MapPin className="h-5 w-5" />}
                  label="Address"
                  value={formData.address || ''}
                  name="address"
                  type="textarea"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="Full address"
                  isLast
                />
              </Section>

              {/* Security */}
              <Section title="Security">
                <Field
                  icon={<Shield className="h-5 w-5" />}
                  label="Aadhaar ID"
                  value={formData.aadhaar_id || ''}
                  name="aadhaar_id"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.aadhaar_id}
                  placeholder="12-digit Aadhaar number"
                  isLast
                />
              </Section>
            </div>

            {/* Right Column - Practitioner Info */}
            {isPractitioner && (
              <div>
                <Section title="Medical Practice">
                  <Field
                    icon={<User className="h-5 w-5" />}
                    label="Age"
                    value={formData.age ?? ''}
                    name="age"
                    type="number"
                    isEditing={isEditing}
                    onChange={handleChange}
                    error={errors.age}
                    required
                    placeholder="Enter age"
                  />
                  <Field
                    icon={<GraduationCap className="h-5 w-5" />}
                    label="Qualification"
                    value={formData.qualification || ''}
                    name="qualification"
                    isEditing={isEditing}
                    onChange={handleChange}
                    error={errors.qualification}
                    required
                    placeholder="MBBS, MD, etc."
                  />
                  <Field
                    icon={<Stethoscope className="h-5 w-5" />}
                    label="Specialization"
                    value={getSpecializationDisplay(formData.specialization)}
                    name="specialization"
                    isEditing={isEditing}
                    onChange={(name, value) => handleChange(name, { [value]: true })}
                    options={Object.entries(SPECIALIZATIONS).map(([key, label]) => ({ value: key, label }))}
                    error={errors.specialization}
                    placeholder="Select specialization"
                  />
                  <Field
                    icon={<Clock className="h-5 w-5" />}
                    label="Experience (Years)"
                    value={formData.years_of_experience ?? ''}
                    name="years_of_experience"
                    type="number"
                    isEditing={isEditing}
                    onChange={handleChange}
                    error={errors.years_of_experience}
                    placeholder="0"
                  />
                  <Field
                    icon={<Clock className="h-5 w-5" />}
                    label="Slot Duration (minutes)"
                    value={formData.slot_duration ?? ''}
                    name="slot_duration"
                    type="number"
                    isEditing={isEditing}
                    onChange={handleChange}
                    error={errors.slot_duration}
                    placeholder="30"
                  />
                  <Field
                    icon={<FileText className="h-5 w-5" />}
                    label="IMR Number"
                    value={formData.imr_number || ''}
                    name="imr_number"
                    isEditing={isEditing}
                    onChange={handleChange}
                    error={errors.imr_number}
                    placeholder="Medical registration number"
                  />
                  <Field
                    icon={<Languages className="h-5 w-5" />}
                    label="Languages"
                    value={formData.languages_spoken || ''}
                    name="languages_spoken"
                    isEditing={isEditing}
                    onChange={handleChange}
                    error={errors.languages_spoken}
                    placeholder="English, Hindi, etc. (comma separated)"
                  />
                  <Field
                    icon={<FileText className="h-5 w-5" />}
                    label="Bio"
                    value={formData.bio || ''}
                    name="bio"
                    type="textarea"
                    isEditing={isEditing}
                    onChange={handleChange}
                    error={errors.bio}
                    placeholder="Brief description about yourself"
                  />
                  <StatusBadge 
                    isActive={formData.is_active}
                    isEditing={isEditing}
                    onChange={handleChange}
                  />
                </Section>
              </div>
            )}
          </div>

          {/* Cancel button when editing */}
          {isEditing && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to profile data
                  const resetData = {
                    username: profile?.username || '',
                    name: profile?.name || '',
                    email: profile?.email || '',
                    mobile: profile?.mobile?.toString() || '',
                    blood_group: profile?.blood_group || '',
                    location: profile?.location || '',
                    address: profile?.address || '',
                    aadhaar_id: profile?.aadhaar_id || '',
                  };

                  if (isPractitioner || profile?.age || profile?.specialization || profile?.qualification) {
                    Object.assign(resetData, {
                      age: profile?.age || '',
                      qualification: profile?.qualification || '',
                      years_of_experience: profile?.years_of_experience || 0,
                      slot_duration: profile?.slot_duration || 30,
                      specialization: parseSpecialization(profile?.specialization),
                      bio: profile?.bio || '',
                      languages_spoken: Array.isArray(profile?.languages_spoken) 
                        ? profile.languages_spoken.join(', ')
                        : profile?.languages_spoken || '',
                      imr_number: profile?.imr_number || '',
                      is_active: profile?.is_active !== undefined ? profile.is_active : true
                    });
                  }

                  setFormData(resetData);
                  setErrors({});
                }}
                className="rounded-lg px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;