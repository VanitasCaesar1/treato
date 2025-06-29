"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Camera, Loader2, MapPin, Phone, Mail, Heart, 
  Stethoscope, GraduationCap, Clock, Languages, FileText, 
  Shield, Edit, Check, X, ChevronRight, UserCircle, Plus
} from "lucide-react";

// Constants
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const INDIAN_LANGUAGES = [
  "Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati",
  "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Maithili", "Sanskrit",
  "Nepali", "Konkani", "Manipuri", "Sindhi", "Dogri", "Kashmiri", "Santhali",
  "Bodo", "Mizo", "Khasi", "Garo", "Tripuri", "Bhojpuri", "Magahi", "Rajasthani",
  "Haryanvi", "Chhattisgarhi", "Awadhi", "Bundeli", "Bagheli", "Bhili", "Gondi",
  "Khandeshi", "Tulu", "Kodava", "Beary", "Konkani", "Other"
];

const QUALIFICATIONS = [
  "MBBS", "BDS", "BAMS", "BHMS", "BUMS", "B.VSc", "BNYS",
  "MD", "MS", "MDS", "DNB", "DM", "MCh", "FCPS", "FRCS", "MRCP",
  "MD (Ayurveda)", "MS (Ayurveda)", "MD (Homeopathy)", "MS (Homeopathy)",
  "MD (Unani)", "MS (Unani)", "Bachelor of Physiotherapy", "Master of Physiotherapy",
  "B.Sc Nursing", "M.Sc Nursing", "GNM", "ANM",
  "Diploma in Medical Laboratory Technology", "B.Sc MLT", "M.Sc MLT",
  "BPT", "MPT", "BPharm", "MPharm", "PharmD", "BSc", "MSc", "PhD",
  "MBChB", "MB BCh", "MB BChir", "MBBS (UK)", "MD (USA)", "DO (USA)",
  "MRCS", "MRCOG", "FRCOG", "FRCP", "FRCA", "FRCR", "FRCPCH", "FRCPsych",
  "Diplomate of National Board (DNB)", "Diploma in Child Health (DCH)",
  "Diploma in Obstetrics & Gynaecology (DGO)", "Diploma in Orthopaedics (D.Ortho)",
  "Diploma in Anaesthesia (DA)", "Diploma in Medical Radiology (DMRD)",
  "Diploma in Clinical Pathology (DCP)", "Diploma in Ophthalmology (DO)",
  "Diploma in Laryngology & Otology (DLO)", "Diploma in Public Health (DPH)",
  "Diploma in Industrial Health (DIH)", "Diploma in Tuberculosis & Chest Diseases (DTCD)",
  "Diploma in Dermatology, Venereology & Leprosy (DDVL)", "Diploma in Psychiatry (DPM)",
  "Diploma in Paediatrics (DCH)", "Diploma in Geriatric Medicine (DGM)",
  "Diploma in Sports Medicine (DSM)", "Diploma in Family Medicine (DFM)",
  "Other"
];

const SPECIALIZATIONS = [
  "General Medicine", "General Surgery", "Pediatrics", "Obstetrics & Gynecology",
  "Orthopedics", "Ophthalmology", "ENT (Otorhinolaryngology)", "Dermatology",
  "Psychiatry", "Cardiology", "Neurology", "Gastroenterology", "Pulmonology",
  "Nephrology", "Endocrinology", "Rheumatology", "Oncology", "Hematology",
  "Infectious Diseases", "Emergency Medicine", "Anesthesiology", "Radiology",
  "Pathology", "Microbiology", "Biochemistry", "Pharmacology", "Physiology",
  "Anatomy", "Forensic Medicine", "Community Medicine", "Dental Surgery",
  "Oral & Maxillofacial Surgery", "Orthodontics", "Periodontics", "Prosthodontics",
  "Pedodontics", "Oral Medicine", "Ayurveda", "Homeopathy", "Unani",
  "Physiotherapy", "Nursing", "Medical Laboratory Technology", "Sports Medicine",
  "Geriatrics", "Family Medicine", "Critical Care Medicine", "Pain Medicine",
  "Plastic Surgery", "Vascular Surgery", "Neurosurgery", "Urology", "Neonatology",
  "Pediatric Surgery", "Thoracic Surgery", "Transfusion Medicine", "Nuclear Medicine",
  "Genetics", "Immunology", "Sleep Medicine", "Reproductive Medicine",
  "Allergy & Immunology", "Clinical Pharmacology", "Occupational Medicine",
  "Public Health", "Epidemiology", "Tropical Medicine", "Palliative Medicine",
  "Rehabilitation Medicine", "Sexual Medicine", "Travel Medicine", "Aerospace Medicine",
  "Other"
];

// Utility functions
const parseSpecialization = (spec) => {
  if (!spec || typeof spec === 'string') return spec || "";
  if (typeof spec === 'object') return spec.primary || Object.keys(spec).find(key => spec[key]) || "";
  return "";
};

const parseLanguages = (languages) => {
  if (!languages) return [];
  if (Array.isArray(languages)) return languages;
  if (typeof languages === 'string') {
    return languages.split(',').map(lang => lang.trim()).filter(Boolean);
  }
  return [];
};

const isPractitioner = (role, profile) => {
  // Check role first
  if (["practitioner", "doctor", "admin"].includes(role?.toLowerCase())) return true;
  
  // Check if user has a corresponding doctor record
  if (profile && profile.doctor_profile) return true;
  
  return false;
};

const getInitials = (name) => name?.trim().substring(0, 2).toUpperCase() || "U";

// Multi-select Language Component
const LanguageSelector = ({ selectedLanguages, onChange, isEditing, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLanguageToggle = (language) => {
    const current = selectedLanguages || [];
    const updated = current.includes(language)
      ? current.filter(lang => lang !== language)
      : [...current, language];
    onChange(name, updated);
  };

  const displayText = selectedLanguages?.length > 0 
    ? selectedLanguages.join(', ') 
    : "Not set";

  if (!isEditing) {
    return (
      <div className="text-sm text-gray-600">
        {displayText}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border rounded-xl bg-gray-50 p-3 min-h-[44px] flex flex-wrap gap-1">
        {selectedLanguages?.map(lang => (
          <Badge 
            key={lang} 
            variant="secondary" 
            className="bg-blue-100 text-blue-700 text-xs"
          >
            {lang}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => handleLanguageToggle(lang)}
            />
          </Badge>
        ))}
        {(!selectedLanguages || selectedLanguages.length === 0) && (
          <span className="text-gray-400 text-sm">Select languages...</span>
        )}
      </div>
      
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between rounded-xl"
        >
          Add Languages
          <Plus className="h-4 w-4" />
        </Button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {INDIAN_LANGUAGES.map(language => (
              <div
                key={language}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                  selectedLanguages?.includes(language) ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => handleLanguageToggle(language)}
              >
                <span className="text-sm">{language}</span>
                {selectedLanguages?.includes(language) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Field Component
const Field = ({ 
  icon, 
  label, 
  value, 
  isEditing, 
  name, 
  type = "text", 
  options, 
  onChange, 
  error, 
  required, 
  placeholder, 
  isLast,
  isLanguageField = false 
}) => {
  const displayValue = value || <span className="text-gray-400 text-sm">{placeholder || "Not set"}</span>;
  const optionLabel = options?.find(opt => opt === value) || value;

  if (!isEditing) {
    return (
      <div className={`bg-white ${!isLast ? 'border-b border-gray-100' : ''} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-blue-500 flex-shrink-0">{icon}</div>
          <div className="flex-1">
            <Label className="text-sm font-medium text-gray-900">{label}</Label>
            <div className="text-sm mt-0.5 text-gray-600">
              {isLanguageField ? (
                <LanguageSelector 
                  selectedLanguages={value} 
                  onChange={onChange} 
                  isEditing={false} 
                  name={name} 
                />
              ) : (
                options ? optionLabel : displayValue
              )}
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`bg-white ${!isLast ? 'border-b border-gray-100' : ''} px-4 py-3 space-y-2`}>
      <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-blue-500">{icon}</span>
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </Label>
      {isLanguageField ? (
        <LanguageSelector 
          selectedLanguages={value} 
          onChange={onChange} 
          isEditing={true} 
          name={name} 
        />
      ) : options ? (
        <Select value={value || ""} onValueChange={(val) => onChange(name, val)}>
          <SelectTrigger className="border-0 bg-gray-50 rounded-xl h-11 min-w-[220px] max-w-full text-base focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} className="truncate" />
          </SelectTrigger>
          <SelectContent className="max-h-60 min-w-[220px] w-auto rounded-xl shadow-lg text-base">
            {options.map(opt => (
              <SelectItem key={opt} value={opt} className="text-base px-4 py-2 truncate hover:bg-blue-50">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "textarea" ? (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="border-0 bg-gray-50 rounded-xl resize-none text-base"
        />
      ) : (
        <Input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="border-0 bg-gray-50 rounded-xl h-11 text-base"
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
};

const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [userFormData, setUserFormData] = useState({});
  const [doctorFormData, setDoctorFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingDoctor, setIsEditingDoctor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const showPractitionerFields = isPractitioner(userRole, profile);
  const displayRole = userRole === "admin" ? "Administrator" : 
                     ["practitioner", "doctor"].includes(userRole?.toLowerCase()) ? "Doctor" : "User";

  console.log('Current state:', {
    userRole,
    showPractitionerFields,
    profileFields: profile ? Object.keys(profile) : 'no profile',
    hasDoctorProfile: !!profile?.doctor_profile,
    userId: profile?.user_id,
    doctorFormData
  });

  // Field configurations
  const userFields = [
    { icon: <User className="h-4 w-4" />, label: "Full Name", name: "name", required: true },
    { icon: <Mail className="h-4 w-4" />, label: "Email", name: "email", type: "email", required: true },
    { icon: <Phone className="h-4 w-4" />, label: "Mobile", name: "mobile", type: "tel", required: true },
    { icon: <Heart className="h-4 w-4" />, label: "Blood Group", name: "bloodGroup", options: BLOOD_GROUPS },
    { icon: <MapPin className="h-4 w-4" />, label: "Location", name: "location", placeholder: "City, State" },
    { icon: <MapPin className="h-4 w-4" />, label: "Address", name: "address", type: "textarea", placeholder: "Full address" }
  ];

  const doctorFields = [
    { icon: <User className="h-4 w-4" />, label: "Age", name: "age", type: "number", required: true },
    { icon: <GraduationCap className="h-4 w-4" />, label: "Qualification", name: "qualification", options: QUALIFICATIONS, required: true },
    { icon: <Stethoscope className="h-4 w-4" />, label: "Specialization", name: "specialization", options: SPECIALIZATIONS },
    { icon: <Clock className="h-4 w-4" />, label: "Experience (Years)", name: "yearsOfExperience", type: "number" },
    { icon: <Clock className="h-4 w-4" />, label: "Slot Duration (minutes)", name: "slotDuration", type: "number" },
    { icon: <FileText className="h-4 w-4" />, label: "IMR Number", name: "imrNumber", placeholder: "Medical registration number" },
    { icon: <Languages className="h-4 w-4" />, label: "Languages", name: "languagesSpoken", isLanguageField: true },
    { icon: <FileText className="h-4 w-4" />, label: "Bio", name: "bio", type: "textarea", placeholder: "Brief description" }
  ];

  const initializeFormData = useCallback((profileData) => {
    if (!profileData) return { user: {}, doctor: {} };

    const user = {
      name: profileData.name || '',
      email: profileData.email || '',
      mobile: profileData.mobile?.toString() || '',
      bloodGroup: profileData.blood_group || '',
      location: profileData.location || '',
      address: profileData.address || '',
    };

    // Get doctor data from doctor_profile if it exists
    const doctorProfile = profileData.doctor_profile || {};
    const doctor = {
      age: doctorProfile.age?.toString() || profileData.age?.toString() || '',
      qualification: doctorProfile.qualification || '',
      yearsOfExperience: doctorProfile.years_of_experience?.toString() || '0',
      slotDuration: doctorProfile.slot_duration?.toString() || '30',
      specialization: parseSpecialization(doctorProfile.specialization),
      bio: doctorProfile.bio || '',
      languagesSpoken: parseLanguages(doctorProfile.languages_spoken),
      imrNumber: doctorProfile.imr_number || '',
    };

    console.log('Initialized doctor form data:', doctor);
    return { user, doctor };
  }, []);

  const fetchData = useCallback(async (url, options = {}) => {
    try {
      console.log(`Making ${options.method || 'GET'} request to:`, url);
      
      const response = await fetch(url, { 
        credentials: 'include', 
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      });
      
      console.log(`Response status for ${url}:`, response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          router.push("/login");
          return null;
        }
        const errorText = await response.text();
        console.error(`HTTP ${response.status} for ${url}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Success response for ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`Fetch error for ${url}:`, error);
      throw error;
    }
  }, [router]);

  const fetchProfilePicture = useCallback(async () => {
    try {
      setProfilePicLoading(true);
      const response = await fetch('/api/user/profile/picture/current', { credentials: 'include' });
      
      if (response.ok) {
        const blob = await response.blob();
        setProfilePicUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    } finally {
      setProfilePicLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // First fetch session to get role and auth_id
        console.log('Fetching session data...');
        const sessionResponse = await fetchData('/api/auth/session');
        
        if (!sessionResponse) {
          console.log('No session data, redirecting to login');
          router.push('/login');
          return;
        }
        
        console.log('Session data received:', sessionResponse);
        setSessionData(sessionResponse);
        setUserRole(sessionResponse.role);
        
        // Then fetch user profile using auth_id from session
        console.log('Fetching user profile...');
        const userProfileResponse = await fetchData('/api/user/profile');
        
        if (!userProfileResponse) {
          console.log('No user profile data');
          return;
        }
        
        console.log('User profile received:', userProfileResponse);
        
        // Check if this is a practitioner and fetch doctor profile if needed
        const roleIsPractitioner = isPractitioner(sessionResponse.role, userProfileResponse);
        console.log('Is practitioner?', roleIsPractitioner);
        
        let mergedProfile = { ...userProfileResponse };
        
        if (roleIsPractitioner) {
          console.log('Fetching doctor profile for user_id:', userProfileResponse.user_id);
          try {
            // Use the user_id as doctor_id since they're the same in your schema
            const doctorProfileResponse = await fetchData(`/api/doctors/${userProfileResponse.user_id}/profile`);
            if (doctorProfileResponse) {
              console.log('Doctor profile received:', doctorProfileResponse);
              // Store doctor profile as nested object
              mergedProfile.doctor_profile = doctorProfileResponse;
            }
          } catch (doctorError) {
            console.error('Error fetching doctor profile:', doctorError);
            // Don't fail completely if doctor profile fetch fails
          }
        }

        setProfile(mergedProfile);
        
        // Initialize form data with merged profile
        const { user, doctor } = initializeFormData(mergedProfile);
        setUserFormData(user);
        setDoctorFormData(doctor);

        // Fetch profile picture
        await fetchProfilePicture();
        
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error(`Failed to load profile: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [fetchData, initializeFormData, fetchProfilePicture, router]);

  const handleChange = useCallback((name, value, isDoctor = false) => {
    console.log(`Updating ${isDoctor ? 'doctor' : 'user'} field ${name}:`, value);
    
    if (isDoctor) {
      setDoctorFormData(prev => {
        const updated = { ...prev, [name]: value };
        console.log('Updated doctor form data:', updated);
        return updated;
      });
    } else {
      setUserFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const validateForm = (data, isDoctor = false) => {
    const newErrors = {};
    
    if (!isDoctor) {
      if (!data.name?.trim()) newErrors.name = "Name is required";
      if (!data.email?.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = "Invalid email format";
      if (!data.mobile?.trim()) newErrors.mobile = "Mobile is required";
    } else {
      const age = Number(data.age);
      if (!age || age < 1 || age > 120) newErrors.age = "Valid age is required";
      if (!data.qualification?.trim()) newErrors.qualification = "Qualification is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (isDoctor = false) => {
    const data = isDoctor ? doctorFormData : userFormData;
    
    if (!validateForm(data, isDoctor)) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    
    try {
      let endpoint = '/api/user/profile';
      let saveData = data;

      if (isDoctor) {
        // Use user_id as doctor_id since they're the same
        const doctorId = profile.user_id;
        if (!doctorId) {
          throw new Error('User ID not found');
        }
        
        endpoint = `/api/doctors/${doctorId}/profile`;
        saveData = {
          age: parseInt(data.age) || null,
          qualification: data.qualification?.trim() || null,
          years_of_experience: parseInt(data.yearsOfExperience) || 0,
          slot_duration: parseInt(data.slotDuration) || 30,
          specialization: data.specialization ? { primary: data.specialization } : {},
          bio: data.bio?.trim() || null,
          languages_spoken: Array.isArray(data.languagesSpoken) ? data.languagesSpoken : [],
          imr_number: data.imrNumber?.trim() || null,
        };
      } else {
        saveData = {
          name: data.name?.trim() || '',
          email: data.email?.trim() || '',
          mobile: data.mobile?.trim() || '',
          blood_group: data.bloodGroup || null,
          location: data.location?.trim() || null,
          address: data.address?.trim() || null,
        };
      }

      console.log(`Saving ${isDoctor ? 'doctor' : 'user'} data to ${endpoint}:`, saveData);

      await fetchData(endpoint, {
        method: 'PUT',
        body: JSON.stringify(saveData)
      });

      // Refresh profile data
      const updatedProfile = await fetchData('/api/user/profile');
      if (updatedProfile) {
        let mergedProfile = { ...updatedProfile };
        
        // Re-fetch doctor profile if needed
        if (showPractitionerFields) {
          try {
            const doctorProfileResponse = await fetchData(`/api/doctors/${updatedProfile.user_id}/profile`);
            if (doctorProfileResponse) {
              mergedProfile.doctor_profile = doctorProfileResponse;
            }
          } catch (doctorError) {
            console.error('Error re-fetching doctor profile:', doctorError);
          }
        }
        
        setProfile(mergedProfile);
        const { user, doctor } = initializeFormData(mergedProfile);
        setUserFormData(user);
        setDoctorFormData(doctor);
      }

      if (isDoctor) {
        setIsEditingDoctor(false);
      } else {
        setIsEditingUser(false);
      }
      
      toast.success(`${isDoctor ? 'Professional' : 'Personal'} information updated successfully`);
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Failed to save ${isDoctor ? 'professional' : 'personal'} information: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (isDoctor = false) => {
    if (isDoctor) {
      setIsEditingDoctor(false);
      const { doctor } = initializeFormData(profile);
      setDoctorFormData(doctor);
    } else {
      setIsEditingUser(false);
      const { user } = initializeFormData(profile);
      setUserFormData(user);
    }
    setErrors({});
  };

  const handleEdit = (isDoctor = false) => {
    if (isDoctor) {
      setIsEditingDoctor(true);
      // Re-initialize form data to ensure it's fresh
      const { doctor } = initializeFormData(profile);
      setDoctorFormData(doctor);
      console.log('Starting doctor edit with data:', doctor);
    } else {
      setIsEditingUser(true);
      const { user } = initializeFormData(profile);
      setUserFormData(user);
    }
  };

  const handlePictureUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  console.log('File selected:', file.name, file.size, file.type);

  // Validation
  if (file.size > 5 * 1024 * 1024) {
    toast.error("File too large (max 5MB)");
    return;
  }

  if (!file.type.startsWith('image/')) {
    toast.error("Please select a valid image file");
    return;
  }

  const uploadFormData = new FormData();
  uploadFormData.append("profilePic", file);

  const toastId = toast.loading("Uploading picture...");
  
  try {
    console.log('Starting upload...');
    
    const response = await fetch('/api/user/profile/picture', {
      method: "POST",
      body: uploadFormData,
      credentials: 'include'
    });

    console.log('Upload response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('Upload error:', errorData);
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('Upload successful:', result);

    // Refresh profile picture with a small delay to ensure it's saved
    setTimeout(async () => {
      await fetchProfilePicture();
    }, 500);
    
    toast.success("Picture updated successfully", { id: toastId });
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(`Upload failed: ${error.message}`, { id: toastId });
  }

  // Clear the input so the same file can be selected again if needed
  e.target.value = '';
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Failed to load profile</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 text-white rounded-full px-6 py-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const FieldSection = ({ title, fields, isEditing, formData, onChange, onSave, onCancel, onEdit, isDoctor = false }) => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Button
          onClick={() => isEditing ? onSave() : onEdit()}
          disabled={isSaving}
          size="sm"
          className={`rounded-full px-4 py-1 font-semibold ${
            isEditing 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isSaving ? (
            <><Loader2 className="h-3 w-3 animate-spin mr-1" />Saving...</>
          ) : isEditing ? (
            <><Check className="h-3 w-3 mr-1" />Save</>
          ) : (
            <><Edit className="h-3 w-3 mr-1" />Edit</>
          )}
        </Button>
      </div>
      <div>
        {fields.map((field, index) => {
          let value = formData[field.name];
          // Always use string for number fields and bio to avoid input blur issues
          if ((field.name === 'age' || field.name === 'imrNumber' || field.name === 'bio') && (value === undefined || value === null)) {
            value = '';
          } else if ((field.name === 'age' || field.name === 'imrNumber' || field.name === 'bio') && typeof value !== 'string') {
            value = String(value);
          }
          return (
            <Field
              key={field.name}
              {...field}
              value={value}
              isEditing={isEditing}
              onChange={(name, val) => onChange(name, val, isDoctor)}
              error={errors[field.name]}
              isLast={index === fields.length - 1}
            />
          );
        })}
      </div>
      {isEditing && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl"
          >
            <X className="h-3 w-3 mr-1" />Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            size="sm"
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 rounded-xl"
          >
            {isSaving ? (
              <><Loader2 className="h-3 w-3 animate-spin mr-1" />Saving...</>
            ) : (
              <><Check className="h-3 w-3 mr-1" />Save</>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24 mx-auto">
              {profilePicLoading ? (
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : profilePicUrl ? (
                <AvatarImage src={profilePicUrl} alt="Profile" className="object-cover" />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                  {getInitials(profile.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureUpload}
                className="hidden"
              />
            </label>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.name || "User"}</h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>{displayRole}</span>
            </div>
            {profile.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white rounded-xl p-1 shadow-sm">
            <TabsTrigger 
              value="personal" 
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Personal Info
            </TabsTrigger>
            {showPractitionerFields && (
              <TabsTrigger 
                value="professional" 
                className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Professional Info
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <FieldSection
              title="Personal Information"
              fields={userFields}
              isEditing={isEditingUser}
              formData={userFormData}
              onChange={handleChange}
              onSave={() => handleSave(false)}
              onCancel={() => handleCancel(false)}
              onEdit={() => handleEdit(false)}
              isDoctor={false}
            />
          </TabsContent>

          {showPractitionerFields && (
            <TabsContent value="professional" className="space-y-6">
              <FieldSection
                title="Professional Information"
                fields={doctorFields}
                isEditing={isEditingDoctor}
                formData={doctorFormData}
                onChange={handleChange}
                onSave={() => handleSave(true)}
                onCancel={() => handleCancel(true)}
                onEdit={() => handleEdit(true)}
                isDoctor={true}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;