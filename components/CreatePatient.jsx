import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash, AlertCircle, ChevronRight, User, Phone, Heart, Shield, Calendar } from "lucide-react";

const CreatePatient = ({ isOpen = true, onClose = () => {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    age: "",
    blood_group: "",
    address: "",
    aadhaar_id: "",
    auth_id: "",
    medical_history: [],
    allergies: [],
    emergency_contact: {
      name: "",
      relationship: "",
      phone: ""
    },
    insurance: {
      provider: "",
      policy_number: "",
      expiry_date: "",
      coverage_details: ""
    },
    hospital_visits: []
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  
  const [medicalCondition, setMedicalCondition] = useState({
    condition: "",
    diagnosed_date: "",
    notes: ""
  });
  const [allergy, setAllergy] = useState("");
  const [hospitalVisit, setHospitalVisit] = useState({
    hospital_id: "",
    hospital_name: "",
    visit_date: "",
    reason: ""
  });
  
  // Validate a specific field
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return !value.trim() ? "Full name is required" : "";
      case "email":
        return !value.trim() ? "Email is required" : 
               !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) ?
               "Invalid email format" : "";
      case "mobile":
        return !value ? "Mobile number is required" : 
               value.toString().length < 10 ? "Mobile number must be at least 10 digits" : "";
      case "gender":
        return !value ? "Gender is required" : "";
      case "age":
        return !value ? "Age is required" : 
               isNaN(value) || parseInt(value) <= 0 ? "Age must be a positive number" : "";
      case "aadhaar_id":
        return !value ? "Aadhaar ID is required" : 
               !/^\d{12}$/.test(value) ? "Aadhaar ID must be 12 digits" : "";
      case "blood_group":
        return value && !/^(A|B|AB|O)[+-]$/.test(value) ? "Invalid blood group format" : "";
      default:
        return "";
    }
  };
  
  // Validate the entire form
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ["name", "email", "mobile", "gender", "age", "aadhaar_id"];
    
    // Validate all required fields
    for (const field of requiredFields) {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    }
    
    // Validate optional fields that have values
    if (formData.blood_group) {
      const error = validateField("blood_group", formData.blood_group);
      if (error) newErrors.blood_group = error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Only validate if form was already submitted or field was previously touched
    if (formSubmitted || touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };
  
  // Handle blur event for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched only on blur
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };
  
  const handleMedicalConditionChange = (field, value) => {
    setMedicalCondition(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const addMedicalCondition = () => {
    if (!medicalCondition.condition || !medicalCondition.diagnosed_date) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      medical_history: [...prev.medical_history, {...medicalCondition}]
    }));
    
    setMedicalCondition({
      condition: "",
      diagnosed_date: "",
      notes: ""
    });
  };
  
  const removeMedicalCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      medical_history: prev.medical_history.filter((_, i) => i !== index)
    }));
  };
  
  const addAllergy = () => {
    if (!allergy.trim()) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, allergy.trim()]
    }));
    
    setAllergy("");
  };
  
  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Mark all required fields as touched for validation display
    const requiredFields = ["name", "email", "mobile", "gender", "age", "aadhaar_id"];
    const touchedUpdate = {};
    requiredFields.forEach(field => {
      touchedUpdate[field] = true;
    });
    setTouched(prev => ({ ...prev, ...touchedUpdate }));
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Patient created:", formData);
      onClose();
    } catch (error) {
      console.error("Error creating patient:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Reset form and errors when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setTouched({});
      setFormSubmitted(false);
      setActiveSection("basic");
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // iOS-style form field component
  const IOSField = ({ 
    name, 
    label, 
    type = "text", 
    placeholder, 
    required = false, 
    options, 
    maxLength, 
    icon: Icon,
    multiline = false,
    rows = 3
  }) => {
    const hasError = touched[name] && errors[name];
    const hasValue = formData[name] && formData[name].toString().length > 0;
    
    return (
      <div className="relative">
        <div className={`
          bg-white rounded-xl border transition-all duration-200 ease-out
          ${hasError ? 'border-red-300 bg-red-50/30' : hasValue ? 'border-blue-200' : 'border-gray-200'}
          ${hasError ? 'shadow-sm' : 'hover:border-gray-300 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-100/50'}
        `}>
          <div className="flex items-center px-4 py-3">
            {Icon && (
              <div className={`
                mr-3 p-2 rounded-lg transition-colors duration-200
                ${hasError ? 'bg-red-100 text-red-600' : hasValue ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
              `}>
                <Icon className="h-4 w-4" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <label className={`
                block text-xs font-medium transition-colors duration-200 mb-1
                ${hasError ? 'text-red-600' : hasValue ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              
              {type === "select" ? (
                <select
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-transparent border-none outline-none text-gray-900 text-base placeholder-gray-400"
                >
                  <option value="">{placeholder || `Select ${label}`}</option>
                  {options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : multiline ? (
                <textarea
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={maxLength}
                  className="w-full bg-transparent border-none outline-none text-gray-900 text-base placeholder-gray-400 resize-none"
                  placeholder={placeholder}
                  rows={rows}
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={maxLength}
                  className="w-full bg-transparent border-none outline-none text-gray-900 text-base placeholder-gray-400"
                  placeholder={placeholder}
                />
              )}
            </div>
          </div>
        </div>
        
        {hasError && (
          <div className="mt-2 px-2 flex items-start animate-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-600 font-medium">{errors[name]}</span>
          </div>
        )}
      </div>
    );
  };

  // Section navigation
  const sections = [
    { id: "basic", label: "Basic Info", icon: User, complete: formData.name && formData.email && formData.mobile },
    { id: "contact", label: "Contact", icon: Phone, complete: formData.address },
    { id: "medical", label: "Medical", icon: Heart, complete: formData.medical_history.length > 0 },
    { id: "insurance", label: "Insurance", icon: Shield, complete: formData.insurance.provider }
  ];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] sm:rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 ease-out">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">New Patient</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fill in the patient details</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 active:scale-95"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex mt-4 space-x-1">
            {sections.map((section) => (
              <div key={section.id} className="flex-1">
                <div className={`
                  h-1 rounded-full transition-all duration-300
                  ${section.complete ? 'bg-green-400' : 
                    section.id === activeSection ? 'bg-blue-400' : 'bg-gray-200'}
                `} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form-level errors */}
            {formSubmitted && Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-in fade-in duration-300">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800 mb-1">
                      Please fix the following errors:
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field} className="flex items-center">
                          <div className="w-1 h-1 bg-red-400 rounded-full mr-2" />
                          {message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-xl mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>
              
              <IOSField
                name="name"
                label="Full Name"
                placeholder="Enter full name"
                required
                icon={User}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <IOSField
                  name="gender"
                  label="Gender"
                  type="select"
                  required
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" }
                  ]}
                />
                
                <IOSField
                  name="age"
                  label="Age"
                  type="number"
                  placeholder="Years"
                  required
                  maxLength={3}
                />
              </div>
              
              <IOSField
                name="blood_group"
                label="Blood Group"
                type="select"
                options={[
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" }
                ]}
                icon={Heart}
              />
              
              <IOSField
                name="aadhaar_id"
                label="Aadhaar ID"
                placeholder="12-digit Aadhaar number"
                required
                maxLength={12}
              />
            </div>
            
            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-xl mr-3">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              </div>
              
              <IOSField
                name="mobile"
                label="Mobile Number"
                type="tel"
                placeholder="Phone number"
                required
                maxLength={10}
                icon={Phone}
              />
              
              <IOSField
                name="email"
                label="Email Address"
                type="email"
                placeholder="email@example.com"
                required
              />
              
              <IOSField
                name="address"
                label="Address"
                placeholder="Enter physical address"
                maxLength={128}
                multiline
                rows={3}
              />
            </div>
            
            {/* Emergency Contact */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 rounded-xl mr-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.emergency_contact.name}
                    onChange={(e) => handleNestedChange("emergency_contact", "name", e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact person name"
                    maxLength={32}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergency_contact.relationship}
                      onChange={(e) => handleNestedChange("emergency_contact", "relationship", e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Spouse"
                      maxLength={32}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.emergency_contact.phone}
                      onChange={(e) => handleNestedChange("emergency_contact", "phone", e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Phone number"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Medical History */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-xl mr-3">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Medical History</h2>
              </div>
              
              {/* Added conditions */}
              {formData.medical_history.length > 0 && (
                <div className="space-y-3">
                  {formData.medical_history.map((condition, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-900">{condition.condition}</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}
                          </p>
                          {condition.notes && (
                            <p className="text-sm text-red-600 mt-2">{condition.notes}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedicalCondition(index)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200 active:scale-95"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add condition form */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                <h4 className="font-medium text-gray-900">Add Medical Condition</h4>
                
                <div>
                  <input
                    type="text"
                    value={medicalCondition.condition}
                    onChange={(e) => handleMedicalConditionChange("condition", e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Condition name"
                  />
                </div>
                
                <div>
                  <input
                    type="date"
                    value={medicalCondition.diagnosed_date}
                    onChange={(e) => handleMedicalConditionChange("diagnosed_date", e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <textarea
                    value={medicalCondition.notes}
                    onChange={(e) => handleMedicalConditionChange("notes", e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Additional notes (optional)"
                    maxLength={128}
                    rows="2"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={addMedicalCondition}
                  className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200 active:scale-[0.98] flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </button>
              </div>
            </div>
            
            {/* Allergies */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-100 rounded-xl mr-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Allergies</h2>
              </div>
              
              {/* Display allergies */}
              {formData.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.allergies.map((item, index) => (
                    <div key={index} className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full">
                      <span className="text-sm font-medium">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="ml-2 text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add allergy */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={allergy}
                  onChange={(e) => setAllergy(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter allergy"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Insurance */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-xl mr-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Insurance Information</h2>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                    <input
                      type="text"
                      value={formData.insurance.provider}
                      onChange={(e) => handleNestedChange("insurance", "provider", e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Insurance provider"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                      <input
                        type="text"
                        value={formData.insurance.policy_number}
                        onChange={(e) => handleNestedChange("insurance", "policy_number", e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Policy number"
                        maxLength={24}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="date"
                        value={formData.insurance.expiry_date}
                        onChange={(e) => handleNestedChange("insurance", "expiry_date", e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Details</label>
                    <textarea
                      value={formData.insurance.coverage_details}
                      onChange={(e) => handleNestedChange("insurance", "coverage_details", e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Coverage details"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/80 backdrop-blur-xl border-t border-gray-200 sticky bottom-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              All fields marked with * are required
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors duration-200 active:scale-95"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex items-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Creating Patient...
                  </>
                ) : (
                  "Create Patient"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePatient;