"use client"
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, Check, X, Plus, Minus, ChevronDown } from "lucide-react";

const RegistrationComponent = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Updated to 5 steps

  // Language suggestions and dropdown data
  const languageSuggestions = [
    "English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", "Urdu", 
    "Kannada", "Odia", "Punjabi", "Malayalam", "Assamese", "Maithili", "Sanskrit",
    "French", "German", "Spanish", "Arabic", "Chinese", "Japanese", "Korean"
  ];

  const specializationOptions = [
    "Anesthesiology", "Cardiology", "Cardiovascular Surgery", "Dermatology", 
    "Emergency Medicine", "Endocrinology", "Family Medicine", "Gastroenterology",
    "General Surgery", "Geriatrics", "Gynecology", "Hematology", "Infectious Disease",
    "Internal Medicine", "Nephrology", "Neurology", "Neurosurgery", "Obstetrics",
    "Oncology", "Ophthalmology", "Orthopedics", "Otolaryngology (ENT)", "Pathology",
    "Pediatrics", "Plastic Surgery", "Psychiatry", "Pulmonology", "Radiology",
    "Rheumatology", "Urology", "Other"
  ];

const qualificationOptions = [
  // Medical - Core Specialties
  "MBBS, MD (General Medicine)",
  "MBBS, MS (General Surgery)",
  "MBBS, DNB (General Medicine)",
  "MBBS, DNB (General Surgery)",

  // Medical - Super Specialties
  "MBBS, MD (General Medicine), DM (Cardiology)",
  "MBBS, MD (General Medicine), DM (Neurology)",
  "MBBS, MD (General Medicine), DM (Gastroenterology)",
  "MBBS, MD (Pediatrics), DM (Neonatology)",
  "MBBS, MS (General Surgery), MCh (Urology)",
  "MBBS, MS (General Surgery), MCh (Cardiothoracic & Vascular Surgery)",
  "MBBS, MS (General Surgery), MCh (Neuro Surgery)",
  "MBBS, MD (Radiodiagnosis), DM (Interventional Radiology)",
  "MBBS, MD (Dermatology, Venereology & Leprosy), DM (Clinical Immunology)", // Example for a less common path

  // Medical - Diplomas & Fellowships (common add-ons)
  "MBBS, DCH (Pediatrics)",
  "MBBS, DA (Anesthesia)",
  "MBBS, DGO (Obstetrics & Gynaecology)",
  "MBBS, DDVL (Dermatology, Venereology & Leprosy)",
  "MBBS, FCPS (Medicine)",
  "MBBS, FRCS (General Surgery)", // Or specific branches like FRCS (Ortho)
  "MBBS, MRCP (UK)", // Or specific branches like MRCPCH

  // Dental
  "BDS, MDS (Orthodontics)",
  "BDS, MDS (Prosthodontics)",
  "BDS, MDS (Oral & Maxillofacial Surgery)",

  // Alternative Medicine
  "BAMS, MD (Ayurveda)",
  "BHMS, MD (Homoeopathy)",
  "BUMS, MD (Unani)",
  "BNYS, MD (Naturopathy)",

  // Allied Health
  "BPT, MPT (Orthopedics)",
  "B.Sc Nursing, M.Sc Nursing (Community Health)",
  "Pharm.D, MSc (Clinical Pharmacy)", // Pharm.D is a professional doctorate

  // Research/Academic Paths
  "MBBS, MD (Pharmacology), PhD",
  "MBBS, MPH (Public Health)",

  // Less Common but Possible Niche Combinations
  "MBBS, MD (Psychiatry), PhD (Neuroscience)",
  "MBBS, MD (Pathology), DNB (Forensic Medicine)", // Example of dual board certification/diploma

  "Other - Specify" // For unique or not-yet-listed combinations
];

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    mobileNo: "",
    location: "",
    aadhaarId: "",
    age: "",
    bloodGroup: "",
    address: "",
    // New doctor-specific fields
    imrNumber: "",
    specialization: "",
    qualification: "",
    slotDuration: "30",
    yearsOfExperience: "",
    bio: "",
    languagesSpoken: ["English"] // Default with English
  });

  // Move languageInputs state after formData to avoid reference error
  const [languageInputs, setLanguageInputs] = useState(
    [{ showSuggestions: false, filteredSuggestions: [] }]
  );

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    mobileNo: "",
    location: "",
    aadhaarId: "",
    age: "",
    bloodGroup: "",
    address: "",
    imrNumber: "",
    specialization: "",
    qualification: "",
    slotDuration: "",
    yearsOfExperience: "",
    bio: "",
    languagesSpoken: "",
    general: ""
  });

  // Password validation functions
  const getPasswordValidation = (password) => {
    const validations = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const isValid = Object.values(validations).every(Boolean);
    
    return {
      isValid,
      validations,
      message: isValid ? "" : "Password must meet all requirements"
    };
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    
    const validation = getPasswordValidation(password);
    return validation.message;
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const validateUsername = (username) => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters long";
    return "";
  };

  const validateMobileNo = (mobileNo) => {
    const mobileRegex = /^\d{10}$/;
    if (!mobileNo) return "Mobile number is required";
    if (!mobileRegex.test(mobileNo)) return "Mobile number must be exactly 10 digits";
    return "";
  };

  const validateAadhaarId = (aadhaarId) => {
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarId) return "Aadhaar ID is required";
    if (!aadhaarRegex.test(aadhaarId)) return "Aadhaar ID must be exactly 12 digits (no spaces or hyphens)";
    return "";
  };

  const validateAge = (age) => {
    if (!age) return "Age is required";
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) return "Age must be between 18 and 120";
    return "";
  };

  const validateYearsOfExperience = (years) => {
    if (!years) return "Years of experience is required";
    const yearsNum = parseInt(years);
    if (isNaN(yearsNum) || yearsNum < 0 || yearsNum > 50) return "Years of experience must be between 0 and 50";
    return "";
  };

  const validateSlotDuration = (duration) => {
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum < 15 || durationNum > 120) return "Slot duration must be between 15 and 120 minutes";
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "email": return validateEmail(value);
      case "password": return validatePassword(value);
      case "confirmPassword": return validateConfirmPassword(formData.password, value);
      case "username": return validateUsername(value);
      case "mobileNo": return validateMobileNo(value);
      case "aadhaarId": return validateAadhaarId(value);
      case "age": return validateAge(value);
      case "yearsOfExperience": return validateYearsOfExperience(value);
      case "slotDuration": return validateSlotDuration(value);
      case "firstName": return value ? "" : "First name is required";
      case "lastName": return value ? "" : "Last name is required";
      case "location": return value ? "" : "Location is required";
      case "bloodGroup": return value ? "" : "Blood group is required";
      case "address": return value ? "" : "Address is required";
      case "specialization": return value ? "" : "Specialization is required";
      case "qualification": return value ? "" : "Qualification is required";
      case "bio": return value.length > 500 ? "Bio must be less than 500 characters" : "";
      default: return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for Aadhaar ID - strip out any non-digit characters
    if (name === "aadhaarId") {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
      
      // Validate with cleaned input
      const errorMessage = validateField(name, digitsOnly);
      setErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
      return;
    }
    
    // Normal handling for other fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate the field
    const errorMessage = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  // Handle languages spoken with smart suggestions
  const addLanguage = () => {
    if (formData.languagesSpoken.length < 10) {
      setFormData(prev => ({
        ...prev,
        languagesSpoken: [...prev.languagesSpoken, ""]
      }));
      setLanguageInputs(prev => [
        ...prev,
        { showSuggestions: false, filteredSuggestions: [] }
      ]);
    }
  };

  const removeLanguage = (index) => {
    if (formData.languagesSpoken.length > 1) {
      setFormData(prev => ({
        ...prev,
        languagesSpoken: prev.languagesSpoken.filter((_, i) => i !== index)
      }));
      setLanguageInputs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateLanguage = (index, value) => {
    setFormData(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.map((lang, i) => i === index ? value : lang)
    }));

    // Filter suggestions based on input
    const filtered = languageSuggestions.filter(lang => 
      lang.toLowerCase().includes(value.toLowerCase()) && 
      !formData.languagesSpoken.includes(lang)
    );

    setLanguageInputs(prev => prev.map((input, i) => 
      i === index ? { 
        ...input, 
        filteredSuggestions: filtered,
        showSuggestions: value.length > 0 && filtered.length > 0
      } : input
    ));
  };

  const selectLanguageSuggestion = (index, suggestion) => {
    setFormData(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.map((lang, i) => i === index ? suggestion : lang)
    }));
    
    setLanguageInputs(prev => prev.map((input, i) => 
      i === index ? { ...input, showSuggestions: false, filteredSuggestions: [] } : input
    ));
  };

  const hideLanguageSuggestions = (index) => {
    setTimeout(() => {
      setLanguageInputs(prev => prev.map((input, i) => 
        i === index ? { ...input, showSuggestions: false } : input
      ));
    }, 200);
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = ({ password }) => {
    const validation = getPasswordValidation(password);
    
    if (!password) return null;

    const requirements = [
      { key: 'length', label: 'At least 12 characters', met: validation.validations.length },
      { key: 'uppercase', label: 'At least 1 uppercase letter (A-Z)', met: validation.validations.uppercase },
      { key: 'lowercase', label: 'At least 1 lowercase letter (a-z)', met: validation.validations.lowercase },
      { key: 'special', label: 'At least 1 special character (!@#$%^&*)', met: validation.validations.special }
    ];

    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-medium mb-2">Password Requirements:</h4>
        <div className="space-y-1">
          {requirements.map((req) => (
            <div key={req.key} className="flex items-center space-x-2">
              {req.met ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <X size={14} className="text-red-500" />
              )}
              <span className={`text-xs ${req.met ? 'text-green-600' : 'text-red-500'}`}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
        {validation.isValid && (
          <div className="mt-2 flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-green-600 font-medium">Password meets all requirements!</span>
          </div>
        )}
      </div>
    );
  };

  // Validate current step fields
  const validateStepFields = (step) => {
    const fieldsToValidate = {
      1: ["firstName", "lastName", "age", "bloodGroup", "mobileNo"],
      2: ["email", "password", "confirmPassword", "username"],
      3: ["location", "address"],
      4: ["aadhaarId"],
      5: ["specialization", "qualification", "yearsOfExperience", "slotDuration"]
    };

    const stepErrors = {};
    let isValid = true;

    fieldsToValidate[step].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        stepErrors[field] = error;
        isValid = false;
      }
    });

    // Special validation for languages in step 5
    if (step === 5) {
      const nonEmptyLanguages = formData.languagesSpoken.filter(lang => lang.trim() !== "");
      if (nonEmptyLanguages.length === 0) {
        stepErrors.languagesSpoken = "At least one language is required";
        isValid = false;
      }
    }

    setErrors(prev => ({ ...prev, ...stepErrors }));
    return isValid;
  };

  const handleNext = () => {
    if (validateStepFields(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, general: "" }));

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key === "general" || key === "confirmPassword" || key === "languagesSpoken") return;
      
      const errorMessage = validateField(key, formData[key]);
      if (errorMessage) {
        newErrors[key] = errorMessage;
      }
    });

    // Validate languages
    const nonEmptyLanguages = formData.languagesSpoken.filter(lang => lang.trim() !== "");
    if (nonEmptyLanguages.length === 0) {
      newErrors.languagesSpoken = "At least one language is required";
    }

    // If there are any errors, update state and prevent submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the API route
      const response = await fetch("/api/auth/doctor/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          mobile_no: formData.mobileNo,
          location: formData.location,
          aadhaar_id: formData.aadhaarId,
          age: parseInt(formData.age),
          blood_group: formData.bloodGroup,
          address: formData.address,
          // New doctor-specific fields
          imr_number: formData.imrNumber,
          specialization: formData.specialization,
          qualification: formData.qualification,
          slot_duration: parseInt(formData.slotDuration),
          years_of_experience: parseInt(formData.yearsOfExperience),
          bio: formData.bio,
          languages_spoken: formData.languagesSpoken.filter(lang => lang.trim() !== "")
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errorMessage = data.error || "Registration failed";
        toast.error(errorMessage);
        
        if (errorMessage.includes("email")) {
          setErrors(prev => ({ ...prev, email: errorMessage }));
        } else if (errorMessage.includes("username")) {
          setErrors(prev => ({ ...prev, username: errorMessage }));
        } else if (errorMessage.includes("Aadhaar")) {
          setErrors(prev => ({ ...prev, aadhaarId: errorMessage }));
        } else if (errorMessage.includes("password")) {
          setErrors(prev => ({ ...prev, password: errorMessage }));
        } else {
          setErrors(prev => ({ ...prev, general: errorMessage }));
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please try again.");
      setErrors(prev => ({ 
        ...prev, 
        general: "Network error. Please try again." 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress bar
  const StepProgress = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 
                ${currentStep >= step 
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 text-gray-500"}`}
              >
                {currentStep > step ? <CheckCircle size={16} /> : step}
              </div>
              <span className="text-xs mt-1">
                {step === 1 ? "Personal" : 
                 step === 2 ? "Account" : 
                 step === 3 ? "Location" : 
                 step === 4 ? "ID" : "Professional"}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep/totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#4CC9FE] p-4">
      <Card className="w-full max-w-4xl border-2 border-black rounded-3xl p-4">
        <CardContent className="flex flex-col gap-4 p-6">
          <h1 className="text-3xl font-bold text-center">Create Your Doctors Account</h1>
          
          <StepProgress />
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name*</Label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.firstName 
                          ? "border-red-500 bg-red-50" 
                          : "border-black"
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name*</Label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.lastName 
                          ? "border-red-500 bg-red-50" 
                          : "border-black"
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age*</Label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      maxLength={3}
                      value={formData.age}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.age 
                          ? "border-red-500 bg-red-50" 
                          : "border-black"
                      }`}
                    />
                    {errors.age && (
                      <p className="text-red-500 text-sm">{errors.age}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group*</Label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.bloodGroup 
                          ? "border-red-500 bg-red-50" 
                          : "border-black"
                      }`}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                    {errors.bloodGroup && (
                      <p className="text-red-500 text-sm">{errors.bloodGroup}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobileNo">Mobile Number*</Label>
                    <input
                      type="tel"
                      id="mobileNo"
                      name="mobileNo"
                      value={formData.mobileNo}
                      maxLength={10}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.mobileNo 
                          ? "border-red-500 bg-red-50" 
                          : "border-black"
                      }`}
                    />
                    {errors.mobileNo && (
                      <p className="text-red-500 text-sm">{errors.mobileNo}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Account Information */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-semibold">Account Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-2 border-2 rounded-2xl ${
                      errors.email 
                        ? "border-red-500 bg-red-50" 
                        : "border-black"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 relative">
                    <Label htmlFor="password">Password*</Label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full p-2 border-2 rounded-2xl ${
                          errors.password 
                            ? "border-red-500 bg-red-50" 
                            : "border-black"
                        }`}
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                    <PasswordStrengthIndicator password={formData.password} />
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="confirmPassword">Confirm Password*</Label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full p-2 border-2 rounded-2xl ${
                          errors.confirmPassword 
                            ? "border-red-500 bg-red-50" 
                            : "border-black"
                        }`}
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username*</Label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full p-2 border-2 rounded-2xl ${
                      errors.username 
                        ? "border-red-500 bg-red-50" 
                        : "border-black"
                    }`}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm">{errors.username}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Location Information */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-semibold">Location Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">City/Town*</Label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      maxLength={32}
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.location 
                          ? "border-red-500 bg-red-50" 
                          : "border-black"
                      }`}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm">{errors.location}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address*</Label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full p-2 border-2 rounded-2xl resize-none ${
                        errors.address 
                          ? "border-red-500 bg-red-50" 
                          : "border-black"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm">{errors.address}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Identity Verification */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-semibold">Identity Verification</h2>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarId">Aadhaar ID*</Label>
                  <input
                    type="text"
                    id="aadhaarId"
                    name="aadhaarId"
                    value={formData.aadhaarId}
                    onChange={handleChange}
                    maxLength={12}
                    placeholder="12-digit Aadhaar number"
                    className={`w-full p-2 border-2 rounded-2xl ${
                      errors.aadhaarId 
                        ? "border-red-500 bg-red-50" 
                        : "border-black"
                    }`}
                  />
                  {errors.aadhaarId && (
                    <p className="text-red-500 text-sm">{errors.aadhaarId}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Enter your 12-digit Aadhaar number without spaces or hyphens
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Professional Information */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-semibold">Professional Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imrNumber">IMR Number (Optional)</Label>
                    <input
                      type="text"
                      id="imrNumber"
                      name="imrNumber"
                      value={formData.imrNumber}
                      onChange={handleChange}
                      className="w-full p-2 border-2 rounded-2xl border-black"
                      placeholder="Indian Medical Register Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience*</Label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      min="0"
                      max="50"
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.yearsOfExperience 
                          ? "border-red-500 bg-red-50" 
                          : "border-black"
                      }`}
                    />
                    {errors.yearsOfExperience && (
                      <p className="text-red-500 text-sm">{errors.yearsOfExperience}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization*</Label>
                    <div className="relative">
                      <select
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className={`w-full p-2 border-2 rounded-2xl appearance-none ${
                          errors.specialization 
                            ? "border-red-500 bg-red-50" 
                            : "border-black"
                        }`}
                      >
                        <option value="">Select Specialization</option>
                        {specializationOptions.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" size={18} />
                    </div>
                    {errors.specialization && (
                      <p className="text-red-500 text-sm">{errors.specialization}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification*</Label>
                    <div className="relative">
                      <select
                        id="qualification"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className={`w-full p-2 border-2 rounded-2xl appearance-none ${
                          errors.qualification 
                            ? "border-red-500 bg-red-50" 
                            : "border-black"
                        }`}
                      >
                        <option value="">Select Qualification</option>
                        {qualificationOptions.map((qual) => (
                          <option key={qual} value={qual}>{qual}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" size={18} />
                    </div>
                    {errors.qualification && (
                      <p className="text-red-500 text-sm">{errors.qualification}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slotDuration">Appointment Slot Duration (minutes)*</Label>
                  <select
                    id="slotDuration"
                    name="slotDuration"
                    value={formData.slotDuration}
                    onChange={handleChange}
                    className={`w-full p-2 border-2 rounded-2xl ${
                      errors.slotDuration 
                        ? "border-red-500 bg-red-50" 
                        : "border-black"
                    }`}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                  {errors.slotDuration && (
                    <p className="text-red-500 text-sm">{errors.slotDuration}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languagesSpoken">Languages Spoken*</Label>
                  {formData.languagesSpoken.map((language, index) => (
                    <div key={index} className="flex items-center space-x-2 relative">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={language}
                          onChange={(e) => updateLanguage(index, e.target.value)}
                          onFocus={() => updateLanguage(index, language)}
                          onBlur={() => hideLanguageSuggestions(index)}
                          className="w-full p-2 border-2 rounded-2xl border-black"
                          placeholder="Enter language"
                        />
                        {languageInputs[index]?.showSuggestions && (
                          <div className="absolute z-10 w-full bg-white border-2 border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto">
                            {languageInputs[index].filteredSuggestions.map((suggestion) => (
                              <div
                                key={suggestion}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onMouseDown={() => selectLanguageSuggestion(index, suggestion)}
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {formData.languagesSpoken.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                      {index === formData.languagesSpoken.length - 1 && formData.languagesSpoken.length < 10 && (
                        <button
                          type="button"
                          onClick={addLanguage}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {errors.languagesSpoken && (
                    <p className="text-red-500 text-sm">{errors.languagesSpoken}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    maxLength={500}
                    placeholder="Tell patients about yourself, your experience, and approach to healthcare..."
                    className={`w-full p-2 border-2 rounded-2xl resize-none ${
                      errors.bio 
                        ? "border-red-500 bg-red-50" 
                        : "border-black"
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {formData.bio.length}/500 characters
                    </span>
                    {errors.bio && (
                      <p className="text-red-500 text-sm">{errors.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* General error message */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-6 py-2 rounded-2xl transition-all ${
                  currentStep === 1 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                <ArrowLeft size={18} />
                <span>Previous</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-2xl transition-all ${
                    isSubmitting 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <CheckCircle size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationComponent;