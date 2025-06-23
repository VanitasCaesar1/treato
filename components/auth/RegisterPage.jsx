"use client"
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, Check, X, Upload } from "lucide-react";

const RegistrationComponent = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Updated to 5 steps

  const [formData, setFormData] = useState({
    // Basic user fields
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
    
    // Doctor-specific fields
    imrNumber: "",
    specialization: "",
    qualification: "",
    slotDuration: "30",
    profilePic: "",
    yearsOfExperience: "",
    consultationFee: "",
    medicalLicenseNumber: "",
    hospitalAffiliation: "",
    bio: "",
    languagesSpoken: [],
    availableDays: [],
    consultationType: "both"
  });

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
    profilePic: "",
    yearsOfExperience: "",
    consultationFee: "",
    general: ""
  });

  // Available options
  const specializations = [
    "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", "Hematology",
    "Neurology", "Oncology", "Orthopedics", "Pediatrics", "Psychiatry", "Radiology",
    "Surgery", "Urology", "Gynecology", "Ophthalmology", "ENT", "General Medicine"
  ];

  const languages = [
    "English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Bengali", 
    "Marathi", "Gujarati", "Punjabi", "Urdu", "Assamese", "Odia"
  ];

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

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

  const validateIMRNumber = (imrNumber) => {
    if (!imrNumber) return "IMR number is required";
    if (imrNumber.length < 3) return "IMR number must be at least 3 characters";
    return "";
  };

  const validateSlotDuration = (duration) => {
    if (!duration) return "Slot duration is required";
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum < 15 || durationNum > 120) return "Slot duration must be between 15 and 120 minutes";
    return "";
  };

  const validateYearsOfExperience = (years) => {
    if (years === "") return ""; // Optional field
    const yearsNum = parseInt(years);
    if (isNaN(yearsNum) || yearsNum < 0) return "Years of experience cannot be negative";
    return "";
  };

  const validateConsultationFee = (fee) => {
    if (fee === "") return ""; // Optional field
    const feeNum = parseFloat(fee);
    if (isNaN(feeNum) || feeNum < 0) return "Consultation fee cannot be negative";
    return "";
  };

  const validateProfilePic = (url) => {
    if (!url) return ""; // Optional field
    try {
      new URL(url);
      return "";
    } catch {
      return "Invalid profile picture URL";
    }
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
      case "firstName": return value ? "" : "First name is required";
      case "lastName": return value ? "" : "Last name is required";
      case "location": return value ? "" : "Location is required";
      case "bloodGroup": return value ? "" : "Blood group is required";
      case "address": return value ? "" : "Address is required";
      case "imrNumber": return validateIMRNumber(value);
      case "specialization": return value ? "" : "Specialization is required";
      case "qualification": return value ? "" : "Qualification is required";
      case "slotDuration": return validateSlotDuration(value);
      case "profilePic": return validateProfilePic(value);
      case "yearsOfExperience": return validateYearsOfExperience(value);
      case "consultationFee": return validateConsultationFee(value);
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
      
      const errorMessage = validateField(name, digitsOnly);
      setErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const errorMessage = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const handleCheckboxChange = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));
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
      3: ["location", "address", "aadhaarId"],
      4: ["imrNumber", "specialization", "qualification", "slotDuration"],
      5: [] // Optional fields step
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

    // Validate required fields
    const requiredFields = [
      "firstName", "lastName", "age", "bloodGroup", "mobileNo", "email", 
      "password", "confirmPassword", "username", "location", "address", 
      "aadhaarId", "imrNumber", "specialization", "qualification", "slotDuration"
    ];

    const newErrors = {};
    requiredFields.forEach(field => {
      const errorMessage = validateField(field, formData[field]);
      if (errorMessage) {
        newErrors[field] = errorMessage;
      }
    });

    // Validate optional fields that have values
    ["yearsOfExperience", "consultationFee", "profilePic"].forEach(field => {
      if (formData[field]) {
        const errorMessage = validateField(field, formData[field]);
        if (errorMessage) {
          newErrors[field] = errorMessage;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
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
          imr_number: formData.imrNumber,
          specialization: formData.specialization,
          qualification: formData.qualification,
          slot_duration: parseInt(formData.slotDuration),
          profile_pic: formData.profilePic || "",
          years_of_experience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
          consultation_fee: formData.consultationFee ? parseFloat(formData.consultationFee) : undefined,
          medical_license_number: formData.medicalLicenseNumber || "",
          hospital_affiliation: formData.hospitalAffiliation || "",
          bio: formData.bio || "",
          languages_spoken: formData.languagesSpoken,
          available_days: formData.availableDays,
          consultation_type: formData.consultationType
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
        } else if (errorMessage.includes("IMR")) {
          setErrors(prev => ({ ...prev, imrNumber: errorMessage }));
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
    const stepNames = ["Personal", "Account", "Location", "Medical", "Optional"];
    
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
              <span className="text-xs mt-1">{stepNames[step - 1]}</span>
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
          <h1 className="text-3xl font-bold text-center">Create Your Doctor Account</h1>
          
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
                        errors.firstName ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
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
                        errors.lastName ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
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
                        errors.age ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group*</Label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.bloodGroup ? "border-red-500 bg-red-50" : "border-black"
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
                    {errors.bloodGroup && <p className="text-red-500 text-sm">{errors.bloodGroup}</p>}
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
                        errors.mobileNo ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.mobileNo && <p className="text-red-500 text-sm">{errors.mobileNo}</p>}
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
                      errors.email ? "border-red-500 bg-red-50" : "border-black"
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
                          errors.password ? "border-red-500 bg-red-50" : "border-black"
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
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
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
                          errors.confirmPassword ? "border-red-500 bg-red-50" : "border-black"
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
                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
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
                      errors.username ? "border-red-500 bg-red-50" : "border-black"
                    }`}
                  />
                  {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Location & ID Information */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-semibold">Location & ID Information</h2>
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
                        errors.location ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address*</Label>
                    <input
                      type="text"
                      id="address"
                      maxLength={128}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.address ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaarId">Aadhaar ID*</Label>
                  <input
                    type="number"
                    id="aadhaarId"
                    name="aadhaarId"
                    value={formData.aadhaarId}
                    onChange={handleChange}
                    placeholder="12-digit Aadhaar number (digits only)"
                    maxLength={12}
                    className={`w-full p-2 border-2 rounded-2xl ${
                      errors.aadhaarId ? "border-red-500 bg-red-50" : "border-black"
                    }`}
                  />
                  {errors.aadhaarId && <p className="text-red-500 text-sm">{errors.aadhaarId}</p>}
                </div>
              </div>
            )}

            {/* Step 4: Medical Information */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-semibold">Medical Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imrNumber">IMR Number*</Label>
                    <input
                      type="text"
                      id="imrNumber"
                      name="imrNumber"
                      value={formData.imrNumber}
                      onChange={handleChange}
                      placeholder="Indian Medical Register Number"
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.imrNumber ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.imrNumber && <p className="text-red-500 text-sm">{errors.imrNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization*</Label>
                    <select
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.specialization ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    {errors.specialization && <p className="text-red-500 text-sm">{errors.specialization}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification*</Label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="e.g., MBBS, MD, MS"
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.qualification ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.qualification && <p className="text-red-500 text-sm">{errors.qualification}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slotDuration">Slot Duration (minutes)*</Label>
                    <select
                      id="slotDuration"
                      name="slotDuration"
                      value={formData.slotDuration}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.slotDuration ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                    {errors.slotDuration && <p className="text-red-500 text-sm">{errors.slotDuration}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Optional Information */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-semibold">Optional Information</h2>
                <p className="text-gray-600 text-sm">These fields are optional but help patients find and connect with you better.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      min="0"
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.yearsOfExperience ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.yearsOfExperience && <p className="text-red-500 text-sm">{errors.yearsOfExperience}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                    <input
                      type="number"
                      id="consultationFee"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full p-2 border-2 rounded-2xl ${
                        errors.consultationFee ? "border-red-500 bg-red-50" : "border-black"
                      }`}
                    />
                    {errors.consultationFee && <p className="text-red-500 text-sm">{errors.consultationFee}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePic">Profile Picture URL</Label>
                  <input
                    type="url"
                    id="profilePic"
                    name="profilePic"
                    value={formData.profilePic}
                    onChange={handleChange}
                    placeholder="https://example.com/profile-picture.jpg"
                    className={`w-full p-2 border-2 rounded-2xl ${
                      errors.profilePic ? "border-red-500 bg-red-50" : "border-black"
                    }`}
                  />
                  {errors.profilePic && <p className="text-red-500 text-sm">{errors.profilePic}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalLicenseNumber">Medical License Number</Label>
                    <input
                      type="text"
                      id="medicalLicenseNumber"
                      name="medicalLicenseNumber"
                      value={formData.medicalLicenseNumber}
                      onChange={handleChange}
                      className="w-full p-2 border-2 rounded-2xl border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalAffiliation">Hospital Affiliation</Label>
                    <input
                      type="text"
                      id="hospitalAffiliation"
                      name="hospitalAffiliation"
                      value={formData.hospitalAffiliation}
                      onChange={handleChange}
                      className="w-full p-2 border-2 rounded-2xl border-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio/About</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tell patients about yourself, your approach to healthcare, etc."
                    className="w-full p-2 border-2 rounded-2xl border-black resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {languages.map(language => (
                      <label key={language} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.languagesSpoken.includes(language)}
                          onChange={(e) => handleCheckboxChange('languagesSpoken', language, e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Days</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.availableDays.includes(day)}
                          onChange={(e) => handleCheckboxChange('availableDays', day, e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationType">Consultation Type</Label>
                  <select
                    id="consultationType"
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleChange}
                    className="w-full p-2 border-2 rounded-2xl border-black"
                  >
                    <option value="online">Online Only</option>
                    <option value="offline">In-Person Only</option>
                    <option value="both">Both Online & In-Person</option>
                  </select>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-6 py-2 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Previous</span>
                </button>
              )}
              
              <div className="flex-1" />
              
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
                  className="flex items-center space-x-2 px-8 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Complete Registration</span>
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