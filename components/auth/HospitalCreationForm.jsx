"use client"
import React, { useState, useRef } from 'react';
import { toast, Toaster } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, Upload, Trash2, AlertCircle } from "lucide-react";
import { Progress } from '@/components/ui/progress';
import { clientApi } from '@/lib/client-api';

const CreateHospitalForm = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    address: '',
    licenseNumber: '',
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    speciality: ''
  });

  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        setError('Only JPG and PNG files are allowed');
      } else if (!isValidSize) {
        setError('File size exceeds maximum limit of 10MB');
      } else {
        return true;
      }
      return false;
    });
    
    // Add preview URLs for the files
    const newFiles = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setError('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(file => file.id !== id);
      // Revoke the URL to avoid memory leaks
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  // Format time to HH:MM:SS format expected by the backend time type
  const formatTimeForBackend = (timeString) => {
    // If the time is already in HH:MM format, add :00 for seconds
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return `${timeString}:00`;
    }
    return timeString;
  };

  // Add validation function for the time fields
  const validateTimeFields = () => {
    if (!formData.startTime || !formData.endTime) {
      setError('Start time and end time are required');
      return false;
    }
    
    // Parse the times to compare them
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    // Compare times
    if (endHours < startHours || (endHours === startHours && endMinutes <= startMinutes)) {
      setError('End time must be after start time');
      return false;
    }
    
    return true;
  };

  // Enhanced validation for hospital name - key fix for WorkOS validation
  const validateHospitalName = () => {
    if (!formData.name) {
      setError('Hospital name is required');
      return false;
    }
    
    // WorkOS has restrictions on organization names
    // Adding validation to prevent common issues
    if (formData.name.length < 2) {
      setError('Hospital name must be at least 2 characters');
      return false;
    }
    
    if (formData.name.length > 64) {
      setError('Hospital name cannot exceed 64 characters');
      return false;
    }
    
    // Check for special characters that might cause issues
    const specialCharsRegex = /[<>{}\\^~[\]`]/;
    if (specialCharsRegex.test(formData.name)) {
      setError('Hospital name contains invalid special characters');
      return false;
    }
    
    return true;
  };

  // Validate current step fields
  const validateStepFields = (currentStep) => {
    let isValid = true;
    setError('');
    
    if (currentStep === 1) {
      // Validate basic info fields
      if (!formData.name || !formData.email || !formData.number || !formData.licenseNumber) {
        setError('Please fill in all required fields');
        isValid = false;
      } else if (!validateHospitalName()) {
        isValid = false;
      } else if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        isValid = false;
      }
    } else if (currentStep === 2) {
      // Validate address and hours
      if (!formData.address || !formData.location || !formData.startTime || !formData.endTime) {
        setError('Please fill in all required fields');
        isValid = false;
      } else if (!validateTimeFields()) {
        isValid = false;
      }
    }
    
    return isValid;
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate all required fields
    if (!validateStepFields(2)) {
      setIsLoading(false);
      return;
    }
    
    // Validate that at least one image is selected
    if (selectedFiles.length === 0) {
      setError('Please select at least one hospital image');
      setIsLoading(false);
      return;
    }
    
    try {
      // Create a FormData object for the entire submission
      const formDataToSubmit = new FormData();
      
      // Add all hospital details
      formDataToSubmit.append('name', formData.name.trim());
      formDataToSubmit.append('email', formData.email.trim());
      
      // Parse number properly
      const parsedNumber = formData.number.replace(/\D/g, '');
      formDataToSubmit.append('number', parsedNumber ? parseInt(parsedNumber, 10) : formData.number);
      
      formDataToSubmit.append('address', formData.address.trim());
      formDataToSubmit.append('licenseNumber', formData.licenseNumber.trim());
      formDataToSubmit.append('startTime', formatTimeForBackend(formData.startTime));
      formDataToSubmit.append('endTime', formatTimeForBackend(formData.endTime));
      formDataToSubmit.append('location', formData.location.trim());
      
      if (formData.speciality) {
        formDataToSubmit.append('speciality', formData.speciality.trim());
      }
      
      // Add all selected images
      selectedFiles.forEach(({ file }) => {
        formDataToSubmit.append('hospitalPics', file);
      });
      
      // Use clientApi instead of makeApiRequest
      const response = await clientApi.upload('/hospital/create', formDataToSubmit, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(percentCompleted);
      });
      
      // Handle successful submission
      toast.success("Hospital registration successful!");
      setSuccess(true);
      setStep(3); // Move to success step
    } catch (err) {
      console.error('Failed to create hospital:', err);
      let errorMessage = 'Failed to create hospital. Please try again.';
      
      // Extract the error message from the response if available
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        
        // Special handling for WorkOS organization validation errors
        if (errorMessage.includes('Validation failed') && errorMessage.includes('422')) {
          errorMessage = 'Hospital name validation failed. Please check for special characters or length issues.';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      number: '',
      address: '',
      licenseNumber: '',
      startTime: '09:00',
      endTime: '17:00',
      location: '',
      speciality: ''
    });
    
    // Clean up any object URLs to prevent memory leaks
    selectedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    setSelectedFiles([]);
    setUploadProgress(0);
    setSuccess(false);
    setError('');
    setStep(1);
  };

  const nextStep = () => {
    if (validateStepFields(step)) {
      setStep(step + 1);
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Progress bar
  const StepProgress = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 
                ${step >= stepNum 
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 text-gray-500"}`}
              >
                {step > stepNum ? <CheckCircle size={16} /> : stepNum}
              </div>
              <span className="text-xs mt-1">
                {stepNum === 1 ? "Basic Info" : 
                 stepNum === 2 ? "Address & Hours" : 
                 "Images"}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(step/totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderBasicInfoForm = () => (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-semibold">Hospital Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Hospital Name*</Label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter hospital name (2-64 characters)"
            className={`w-full p-2 border-2 rounded-2xl ${
              !formData.name ? "border-red-500 bg-red-50" : "border-black"
            }`}
          />
          <p className="text-xs text-gray-500">
            Use only letters, numbers and standard punctuation. 
            Avoid special characters like &lt; &gt; { } \ ^ ~ [ ] `
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address*</Label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="hospital@example.com"
            className={`w-full p-2 border-2 rounded-2xl ${
              !formData.email || !validateEmail(formData.email) ? "border-red-500 bg-red-50" : "border-black"
            }`}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="number">Phone Number*</Label>
          <input
            type="tel"
            id="number"
            name="number"
            value={formData.number}
            onChange={handleInputChange}
            required
            placeholder="Enter phone number"
            className={`w-full p-2 border-2 rounded-2xl ${
              !formData.number ? "border-red-500 bg-red-50" : "border-black"
            }`}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number*</Label>
          <input
            type="text"
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            required
            placeholder="Enter license number"
            className={`w-full p-2 border-2 rounded-2xl ${
              !formData.licenseNumber ? "border-red-500 bg-red-50" : "border-black"
            }`}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="speciality">Speciality</Label>
          <input
            type="text"
            id="speciality"
            name="speciality"
            value={formData.speciality}
            onChange={handleInputChange}
            placeholder="e.g., Cardiology, General"
            className="w-full p-2 border-2 rounded-2xl border-black"
          />
        </div>
      </div>
    </div>
  );

  const renderAddressForm = () => (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-semibold">Address & Hours</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">City/Town*</Label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            placeholder="City, State"
            className={`w-full p-2 border-2 rounded-2xl ${
              !formData.location ? "border-red-500 bg-red-50" : "border-black"
            }`}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Full Address*</Label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            placeholder="Enter full address"
            className={`w-full p-2 border-2 rounded-2xl ${
              !formData.address ? "border-red-500 bg-red-50" : "border-black"
            }`}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time*</Label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border-2 rounded-2xl ${
              !formData.startTime ? "border-red-500 bg-red-50" : "border-black"
            }`}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time*</Label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border-2 rounded-2xl ${
              !formData.endTime ? "border-red-500 bg-red-50" : "border-black"
            }`}
          />
        </div>
      </div>
    </div>
  );

  const renderImageUploadForm = () => (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-semibold">Hospital Images</h2>
      <p className="text-gray-600">Upload images of your hospital (JPG or PNG format, max 10MB each)</p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          multiple
          className="hidden"
          id="file-upload"
        />
        <label 
          htmlFor="file-upload" 
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <Upload size={40} className="text-gray-400 mb-2" />
          <span className="font-medium">Click to upload or drag and drop</span>
          <span className="text-sm text-gray-500">JPEG or PNG (Max 10MB per file)</span>
        </label>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Selected Images ({selectedFiles.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {selectedFiles.map((file) => (
              <div key={file.id} className="relative border rounded-lg overflow-hidden">
                <img 
                  src={file.preview} 
                  alt={file.name} 
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="bg-red-500 text-white p-2 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-2 bg-white text-xs truncate">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-4">
          <p className="text-sm mb-1">Uploading... {uploadProgress}%</p>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8 animate-fadeIn">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <CheckCircle className="text-green-500" size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
      <p className="text-gray-600 mb-6">
        Your hospital has been successfully registered. Our team will review your submission shortly.
      </p>
      <button
        onClick={resetForm}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Register Another Hospital
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="p-9">
        <CardContent className="p-3">
          <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {!success && <StepProgress />}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {step === 1 && renderBasicInfoForm()}
            {step === 2 && renderAddressForm()}
            {step === 3 && !success && renderImageUploadForm()}
            {success && renderSuccessStep()}
            
            {!success && (
              <div className="flex justify-between mt-6">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeft size={16} className="mr-1" /> Back
                  </button>
                ) : (
                  <div></div> // Empty div to maintain flex spacing
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Next <ArrowRight size={16} className="ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex items-center px-6 py-2 bg-green-500 text-white rounded-lg ${
                      isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-600"
                    }`}
                  >
                    {isLoading ? "Submitting..." : "Submit Registration"}
                  </button>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      <Toaster position="top-center" />
    </div>
  );
};

export default CreateHospitalForm;