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
import { Textarea } from "./ui/textarea";
import {
  User, Camera, Loader2, MapPin, Phone, Mail, Heart, 
  Stethoscope, GraduationCap, Clock, Languages, FileText, 
  Shield, AtSign, Edit3, Check, X, ChevronRight
} from "lucide-react";

// Constants
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const QUALIFICATIONS = [
  { value: "MBBS", label: "MBBS - Bachelor of Medicine and Bachelor of Surgery" },
  { value: "MD", label: "MD - Doctor of Medicine" },
  { value: "MS", label: "MS - Master of Surgery" },
  { value: "DM", label: "DM - Doctorate of Medicine" },
  { value: "MCh", label: "MCh - Master of Chirurgiae" },
  { value: "DNB", label: "DNB - Diplomate of National Board" },
  { value: "BAMS", label: "BAMS - Bachelor of Ayurvedic Medicine and Surgery" },
  { value: "BHMS", label: "BHMS - Bachelor of Homoeopathic Medicine and Surgery" },
  { value: "BDS", label: "BDS - Bachelor of Dental Surgery" },
  { value: "MDS", label: "MDS - Master of Dental Surgery" },
  { value: "BUMS", label: "BUMS - Bachelor of Unani Medicine and Surgery" },
  { value: "BSMS", label: "BSMS - Bachelor of Siddha Medicine and Surgery" },
  { value: "BNYS", label: "BNYS - Bachelor of Naturopathy and Yogic Sciences" },
  { value: "BPT", label: "BPT - Bachelor of Physiotherapy" },
  { value: "MPT", label: "MPT - Master of Physiotherapy" },
  { value: "Other", label: "Other" }
];

const SPECIALIZATIONS = [
  { value: "general_medicine", label: "General Medicine" },
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "neurology", label: "Neurology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "gynecology", label: "Gynecology & Obstetrics" },
  { value: "ent", label: "ENT (Ear, Nose, Throat)" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "oncology", label: "Oncology" },
  { value: "urology", label: "Urology" },
  { value: "gastroenterology", label: "Gastroenterology" },
  { value: "pulmonology", label: "Pulmonology" },
  { value: "endocrinology", label: "Endocrinology" },
  { value: "nephrology", label: "Nephrology" },
  { value: "rheumatology", label: "Rheumatology" },
  { value: "anesthesiology", label: "Anesthesiology" },
  { value: "radiology", label: "Radiology" },
  { value: "pathology", label: "Pathology" },
  { value: "emergency_medicine", label: "Emergency Medicine" },
  { value: "family_medicine", label: "Family Medicine" },
  { value: "internal_medicine", label: "Internal Medicine" },
  { value: "surgery", label: "General Surgery" },
  { value: "plastic_surgery", label: "Plastic Surgery" },
  { value: "dental", label: "Dental" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "other", label: "Other" }
];

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
              {required && <span className="text-red-500 ml-1">*</span>}
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
              {value ? (
                options ? 
                  options.find(opt => opt.value === value)?.label || value
                  : value
              ) : (
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
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState(null);

  // Helper function to safely parse specialization
  const parseSpecialization = (spec) => {
    if (!spec) return "";
    if (typeof spec === 'string') {
      try {
        const parsed = JSON.parse(spec);
        if (typeof parsed === 'object' && parsed !== null) {
          // Get the first true key
          const trueKeys = Object.keys(parsed).filter(key => parsed[key]);
          return trueKeys.length > 0 ? trueKeys[0] : "";
        }
        return spec;
      } catch {
        return spec;
      }
    }
    if (typeof spec === 'object' && spec !== null) {
      const trueKeys = Object.keys(spec).filter(key => spec[key]);
      return trueKeys.length > 0 ? trueKeys[0] : "";
    }
    return "";
  };

  // Check if user is practitioner
  const isPractitioner = (profileData, role) => {
    return (
      role === "practitioner" || 
      role === "doctor" || 
      role === "admin" || 
      profileData?.role === "practitioner" ||
      profileData?.role === "doctor" ||
      profileData?.role === "admin" ||
      // Check if profile has practitioner-specific fields
      !!(profileData?.age || profileData?.specialization || profileData?.qualification)
    );
  };

  // Initialize form data from profile
  const initializeFormData = useCallback((profileData, role) => {
    if (!profileData) return {};

    const baseData = {
      username: profileData.username || '',
      name: profileData.name || '',
      email: profileData.email || '',
      mobile: profileData.mobile?.toString() || '',
      blood_group: profileData.blood_group || '',
      location: profileData.location || '',
      address: profileData.address || '',
      aadhaar_id: profileData.aadhaar_id || '',
    };

    // Add practitioner fields if applicable
    if (isPractitioner(profileData, role)) {
      const languagesSpoken = Array.isArray(profileData.languages_spoken) 
        ? profileData.languages_spoken.join(', ')
        : profileData.languages_spoken || '';

      Object.assign(baseData, {
        age: profileData.age || '',
        qualification: profileData.qualification || '',
        years_of_experience: profileData.years_of_experience || 0,
        slot_duration: profileData.slot_duration || 30,
        specialization: parseSpecialization(profileData.specialization),
        bio: profileData.bio || '',
        languages_spoken: languagesSpoken,
        imr_number: profileData.imr_number || '',
        is_active: profileData.is_active !== undefined ? profileData.is_active : true
      });
    }

    return baseData;
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // First get session info
        const sessionRes = await fetch('/api/auth/session', {
          credentials: 'include'
        });
        
        if (!sessionRes.ok) {
          if (sessionRes.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch session");
        }
        
        const sessionData = await sessionRes.json();
        const currentUserRole = sessionData.role || null;
        setUserRole(currentUserRole);
        
        // Then fetch profile
        const profileRes = await fetch("/api/user/profile", {
          credentials: "include"
        });
        
        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const profileData = await profileRes.json();
        setProfile(profileData);
        
        // Initialize form data immediately with both profile and role data
        const initialFormData = initializeFormData(profileData, currentUserRole);
        setFormData(initialFormData);
        
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router, initializeFormData]);

  // Reset form data when profile changes
  useEffect(() => {
    if (profile && userRole !== null && !isEditing) {
      const initialFormData = initializeFormData(profile, userRole);
      setFormData(initialFormData);
    }
  }, [profile, userRole, isEditing, initializeFormData]);

  // Get display role
  const getDisplayRole = () => {
    const currentRole = userRole || profile?.role;
    if (currentRole === "admin") return "Administrator";
    if (currentRole === "practitioner" || currentRole === "doctor") return "Doctor";
    return "User";
  };

  // Handle form field changes
  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.name?.toString().trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email?.toString().trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.mobile?.toString().trim()) {
      newErrors.mobile = "Mobile is required";
    }

    // Practitioner-specific validation
    if (isPractitioner(profile, userRole)) {
      if (!formData.age || Number(formData.age) < 1 || Number(formData.age) > 120) {
        newErrors.age = "Valid age is required (1-120)";
      }
      if (!formData.qualification?.toString().trim()) {
        newErrors.qualification = "Qualification is required";
      }
      if (formData.years_of_experience < 0) {
        newErrors.years_of_experience = "Experience cannot be negative";
      }
      if (formData.slot_duration < 15 || formData.slot_duration > 180) {
        newErrors.slot_duration = "Slot duration must be between 15-180 minutes";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile changes
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      // Prepare data for API
      const saveData = {
        username: formData.username,
        name: formData.name?.trim(),
        email: formData.email?.trim(),
        mobile: formData.mobile?.trim(),
        blood_group: formData.blood_group || null,
        location: formData.location?.trim() || null,
        address: formData.address?.trim() || null,
        aadhaar_id: formData.aadhaar_id?.trim() || null,
      };

      // Add practitioner fields if applicable
      if (isPractitioner(profile, userRole)) {
        // Handle languages - convert string back to array
        let languagesArray = [];
        if (formData.languages_spoken) {
          languagesArray = formData.languages_spoken
            .split(',')
            .map(lang => lang.trim())
            .filter(lang => lang.length > 0);
        }

        // Handle specialization - convert to object format expected by backend
        let specializationObj = {};
        if (formData.specialization) {
          specializationObj = { [formData.specialization]: true };
        }

        Object.assign(saveData, {
          age: parseInt(formData.age) || null,
          qualification: formData.qualification?.trim() || null,
          years_of_experience: parseInt(formData.years_of_experience) || 0,
          slot_duration: parseInt(formData.slot_duration) || 30,
          specialization: specializationObj,
          bio: formData.bio?.trim() || null,
          languages_spoken: languagesArray,
          imr_number: formData.imr_number?.trim() || null,
          is_active: formData.is_active !== undefined ? formData.is_active : true
        });
      }

      console.log("Saving profile data:", saveData);
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" 
        },
        credentials: "include",
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: "Failed to save profile" };
        }
        throw new Error(errorData.error || "Failed to save profile");
      }

      const result = await response.json();
      
      // Fetch updated profile to ensure we have the latest data
      const profileRes = await fetch("/api/user/profile", {
        credentials: "include"
      });
      
      if (profileRes.ok) {
        const updatedProfile = await profileRes.json();
        setProfile(updatedProfile);
      }
      
      setIsEditing(false);
      toast.success("Profile updated successfully");
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      const resetData = initializeFormData(profile, userRole);
      setFormData(resetData);
    }
    setErrors({});
  };

  // Handle profile picture upload
  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("profilePic", file);

    const toastId = toast.loading("Uploading picture...");
    try {
      const response = await fetch("/api/user/profile/picture", {
        method: "POST",
        body: uploadFormData,
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }
      
      const data = await response.json();
      setProfile(prev => ({ ...prev, profile_pic: data.url }));
      toast.success("Picture updated successfully", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed", { id: toastId });
    }
  };

  // Loading state
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

  // Error state
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Failed to load profile</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (name) => name?.trim().substring(0, 2).toUpperCase() || "U";
  const showPractitionerFields = isPractitioner(profile, userRole);

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
            {/* Left Column - Personal Information */}
            <div>
              <Section title="Personal Information">
                <Field
                  icon={<User className="h-5 w-5" />}
                  label="Full Name"
                  value={formData.name}
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
                  value={formData.email}
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
                  value={formData.mobile}
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
                  value={formData.blood_group}
                  name="blood_group"
                  isEditing={isEditing}
                  onChange={handleChange}
                  options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
                  error={errors.blood_group}
                  placeholder="Select blood group"
                  isLast
                />
              </Section>

              <Section title="Location">
                <Field
                  icon={<MapPin className="h-5 w-5" />}
                  label="Location"
                  value={formData.location}
                  name="location"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.location}
                  placeholder="City, State"
                />
                <Field
                  icon={<MapPin className="h-5 w-5" />}
                  label="Address"
                  value={formData.address}
                  name="address"
                  type="textarea"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.address}
                  placeholder="Full address"
                  isLast
                />
              </Section>

              <Section title="Security">
                <Field
                  icon={<Shield className="h-5 w-5" />}
                  label="Aadhaar ID"
                  value={formData.aadhaar_id}
                  name="aadhaar_id"
                  isEditing={isEditing}
                  onChange={handleChange}
                  error={errors.aadhaar_id}
                  placeholder="12-digit Aadhaar number"
                  isLast
                />
              </Section>
            </div>

            {/* Right Column - Practitioner Information */}
            {showPractitionerFields && (
              <div>
                <Section title="Medical Practice">
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
                    placeholder="Enter age"
                  />
                  <Field
                    icon={<GraduationCap className="h-5 w-5" />}
                    label="Qualification"
                    value={formData.qualification}
                    name="qualification"
                    isEditing={isEditing}
                    onChange={handleChange}
                    options={QUALIFICATIONS}
                    error={errors.qualification}
                    required
                    placeholder="Select qualification"
                  />
                  <Field
                    icon={<Stethoscope className="h-5 w-5" />}
                    label="Specialization"
                    value={formData.specialization}
                    name="specialization"
                    isEditing={isEditing}
                    onChange={handleChange}
                    options={SPECIALIZATIONS}
                    error={errors.specialization}
                    placeholder="Select specialization"
                  />
                  <Field
                    icon={<Clock className="h-5 w-5" />}
                    label="Experience (Years)"
                    value={formData.years_of_experience}
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
                    value={formData.slot_duration}
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
                    value={formData.imr_number}
                    name="imr_number"
                    isEditing={isEditing}
                    onChange={handleChange}
                    error={errors.imr_number}
                    placeholder="Medical registration number"
                    isLast
                  />
                </Section>

                <Section title="Additional Information">
                  <Field
                    icon={<Languages className="h-5 w-5" />}
                    label="Languages Spoken"
                    value={formData.languages_spoken}
                    name="languages_spoken"
                    isEditing={isEditing}
                    onChange={handleChange}
                    error={errors.languages_spoken}
                    placeholder="English, Hindi, etc. (comma separated)"
                  />
                  <Field
                    icon={<FileText className="h-5 w-5" />}
                    label="Bio"
                    value={formData.bio}
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

          {/* Action Buttons */}
          {isEditing && (
            <div className="mt-8 flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;