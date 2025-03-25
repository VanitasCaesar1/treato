"use client"
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { toast, Toaster } from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const RegistrationComponent = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
    address: ""
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
    general: ""
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    // Add more password strength requirements if needed
    return "";
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
    const mobileRegex = /^\+?[0-9]{10}$/;
    if (!mobileNo) return "Mobile number is required";
    if (!mobileRegex.test(mobileNo)) return "Invalid mobile number format";
    return "";
  };

  const validateAadhaarId = (aadhaarId) => {
    const aadhaarRegex = /^[0-9]{12}$/;
    if (!aadhaarId) return "Aadhaar ID is required";
    if (!aadhaarRegex.test(aadhaarId)) return "Aadhaar ID must be 12 digits";
    return "";
  };

  const validateAge = (age) => {
    if (!age) return "Age is required";
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) return "Age must be between 18 and 120";
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
      case "firstName": return value ? "" : "First name is required";
      case "lastName": return value ? "" : "Last name is required";
      case "location": return value ? "" : "Location is required";
      case "bloodGroup": return value ? "" : "Blood group is required";
      case "address": return value ? "" : "Address is required";
      default: return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  // Validate current step fields
  const validateStepFields = (step) => {
    const fieldsToValidate = {
      1: ["firstName", "lastName", "age", "bloodGroup", "mobileNo"],
      2: ["email", "password", "confirmPassword", "username"],
      3: ["location", "address"],
      4: ["aadhaarId"]
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

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key === "general") return; // Skip general error field
      
      const errorMessage = validateField(key, formData[key]);
      if (errorMessage) {
        newErrors[key] = errorMessage;
      }
    });

    // If there are any errors, update state and prevent submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          mobile_no: formData.mobileNo,
          location: formData.location,
          aadhaar_id: formData.aadhaarId,
          age: parseInt(formData.age),
          blood_group: formData.bloodGroup,
          address: formData.address
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Redirecting to login...");
        // Give the toast time to be seen before redirecting
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Handle specific API error messages
        const errorMessage = data.error || "Registration failed";
        toast.error(errorMessage);
        
        // Map API errors to form fields when possible
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
          {[1, 2, 3, 4].map((step) => (
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
                 step === 3 ? "Location" : "ID"}
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
      <Toaster position="top-center" />
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
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full p-2 border-2 rounded-2xl ${
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

            {/* Step 4: Government ID */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-semibold">Government ID</h2>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarId">Aadhaar ID*</Label>
                  <input
                    type="text"
                    id="aadhaarId"
                    name="aadhaarId"
                    value={formData.aadhaarId}
                    onChange={handleChange}
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
                </div>

                {errors.general && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p className="text-sm">{errors.general}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2 mt-4">
                  <input type="checkbox" id="terms" name="terms" className="rounded border-black" required />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center bg-white text-black px-6 py-2 rounded-full
                  border-2 border-black transition-all duration-300
                  hover:-translate-y-1 hover:shadow-[2px_5px_0_0_#000]
                  active:translate-y-0.5 active:shadow-none"
                >
                  <ArrowLeft size={16} className="mr-2" /> Previous
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center ml-auto bg-white text-black px-6 py-2 rounded-full
                  border-2 border-black transition-all duration-300
                  hover:-translate-y-1 hover:shadow-[2px_5px_0_0_#000]
                  active:translate-y-0.5 active:shadow-none hover:bg-blue-100"
                >
                  Next <ArrowRight size={16} className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center ml-auto bg-white text-black px-8 py-3 rounded-full
                  border-2 border-black transition-all duration-300
                  hover:-translate-y-1 hover:shadow-[2px_5px_0_0_#000]
                  active:translate-y-0.5 active:shadow-none hover:bg-yellow-200
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              )}
            </div>

            <div className="text-center mt-4">
              <p>Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationComponent;