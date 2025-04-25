// components/CreatePatient.jsx
import React, { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const CreatePatient = ({ isOpen, onClose }) => {
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
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    
    // If form was already submitted once or field was touched, validate on change
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
  
  const handleHospitalVisitChange = (field, value) => {
    setHospitalVisit(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const addMedicalCondition = () => {
    if (!medicalCondition.condition || !medicalCondition.diagnosed_date) {
      toast.error("Please provide both condition and diagnosis date");
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
      toast.error("Please enter an allergy");
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
  
  const addHospitalVisit = () => {
    if (!hospitalVisit.hospital_name || !hospitalVisit.visit_date) {
      toast.error("Please provide both hospital name and visit date");
      return;
    }
    
    // Generate a UUID for hospital_id if not provided
    const visit = {
      ...hospitalVisit,
      hospital_id: hospitalVisit.hospital_id || crypto.randomUUID()
    };
    
    setFormData(prev => ({
      ...prev,
      hospital_visits: [...prev.hospital_visits, visit]
    }));
    
    setHospitalVisit({
      hospital_id: "",
      hospital_name: "",
      visit_date: "",
      reason: ""
    });
  };
  
  const removeHospitalVisit = (index) => {
    setFormData(prev => ({
      ...prev,
      hospital_visits: prev.hospital_visits.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validate all fields
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      // Show error toast
      toast.error("Please fix the errors before submitting");
      return;
    }
    
    setSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Creating patient record...");
    
    try {
      const response = await fetch("/api/patients/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle API validation errors if they exist
        if (data.errors && typeof data.errors === 'object') {
          setErrors(prev => ({ ...prev, ...data.errors }));
          throw new Error("Please fix the highlighted errors");
        } else {
          throw new Error(data.error || "Failed to create patient");
        }
      }
      
      // Success toast
      toast.success("Patient created successfully", {
        id: loadingToast,
      });
      
      console.log("Patient created:", data);
      onClose();
    } catch (error) {
      console.error("Error creating patient:", error);
      
      // Error toast
      toast.error(error.message || "Failed to create patient", {
        id: loadingToast,
      });
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
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Helper to render form fields with consistent error handling
  const renderField = ({ name, label, type = "text", placeholder, required = false, options, maxLength, fullWidth = false }) => {
    const hasError = touched[name] && errors[name];
    
    return (
      <div className={fullWidth ? "sm:col-span-2" : ""}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {type === "select" ? (
          <select
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              hasError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
            }`}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={maxLength}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              hasError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
            }`}
            placeholder={placeholder}
            rows="3"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={maxLength}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              hasError ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
            }`}
            placeholder={placeholder}
          />
        )}
        
        {hasError && (
          <p className="mt-1 text-sm text-red-500 flex items-start">
            <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <span>{errors[name]}</span>
          </p>
        )}
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Create Patient</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Form */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form-level errors summary */}
            {formSubmitted && Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>
                          {message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Basic Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderField({
                  name: "name",
                  label: "Full Name",
                  placeholder: "Enter full name",
                  required: true
                })}
                
                {renderField({
                  name: "gender",
                  label: "Gender",
                  type: "select",
                  required: true,
                  options: [
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" }
                  ]
                })}
                
                {renderField({
                  name: "age",
                  label: "Age",
                  type: "number",
                  placeholder: "Enter age in years",
                  required: true,
                  maxLength: 3
                })}
                
                {renderField({
                  name: "blood_group",
                  label: "Blood Group",
                  type: "select",
                  options: [
                    { value: "A+", label: "A+" },
                    { value: "A-", label: "A-" },
                    { value: "B+", label: "B+" },
                    { value: "B-", label: "B-" },
                    { value: "AB+", label: "AB+" },
                    { value: "AB-", label: "AB-" },
                    { value: "O+", label: "O+" },
                    { value: "O-", label: "O-" }
                  ]
                })}
                
                {renderField({
                  name: "aadhaar_id",
                  label: "Aadhaar ID",
                  placeholder: "Enter 12-digit Aadhaar ID",
                  required: true,
                  maxLength: 12
                })}
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderField({
                  name: "mobile",
                  label: "Mobile Number",
                  type: "number",
                  placeholder: "Enter mobile number",
                  required: true,
                  maxLength: 10
                })}
                
                {renderField({
                  name: "email",
                  label: "Email",
                  type: "email",
                  placeholder: "Enter email address",
                  required: true
                })}
                
                {renderField({
                  name: "address",
                  label: "Address",
                  type: "textarea",
                  placeholder: "Enter physical address",
                  maxLength: 128,
                  fullWidth: true
                })}
              </div>
            </div>
            
            {/* Emergency Contact */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact.name}
                    onChange={(e) => handleNestedChange("emergency_contact", "name", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter emergency contact name"
                    maxLength={32}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact.relationship}
                    onChange={(e) => handleNestedChange("emergency_contact", "relationship", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="E.g., Spouse, Parent, Child"
                    maxLength={32}
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="number"
                    maxLength={10}
                    value={formData.emergency_contact.phone}
                    onChange={(e) => handleNestedChange("emergency_contact", "phone", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>
            </div>
            
            {/* Medical History */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Medical History</h3>
              
              {/* Display added medical conditions */}
              {formData.medical_history.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Conditions:</h4>
                  <div className="space-y-2">
                    {formData.medical_history.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                        <div>
                          <span className="font-medium">{condition.condition}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}
                          </span>
                          {condition.notes && <p className="text-sm text-gray-600 mt-1">{condition.notes}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedicalCondition(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add new medical condition */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Medical Condition</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={medicalCondition.condition}
                      onChange={(e) => handleMedicalConditionChange("condition", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Condition name"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="date"
                      value={medicalCondition.diagnosed_date}
                      onChange={(e) => handleMedicalConditionChange("diagnosed_date", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <textarea
                      value={medicalCondition.notes}
                      onChange={(e) => handleMedicalConditionChange("notes", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes (optional)"
                      maxLength={128}
                      rows="2"
                    />
                  </div>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={addMedicalCondition}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center text-sm"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Condition
                  </button>
                </div>
              </div>
            </div>
            
            {/* Allergies */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Allergies</h3>
              
              {/* Display added allergies */}
              {formData.allergies.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {formData.allergies.map((item, index) => (
                    <div key={index} className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add new allergy */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={allergy}
                  onChange={(e) => setAllergy(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter allergy"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </button>
              </div>
            </div>
            
            {/* Insurance Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Insurance Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={formData.insurance.provider}
                    onChange={(e) => handleNestedChange("insurance", "provider", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter insurance provider"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={formData.insurance.policy_number}
                    onChange={(e) => handleNestedChange("insurance", "policy_number", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter policy number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.insurance.expiry_date}
                    onChange={(e) => handleNestedChange("insurance", "expiry_date", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coverage Details
                  </label>
                  <textarea
                    value={formData.insurance.coverage_details}
                    onChange={(e) => handleNestedChange("insurance", "coverage_details", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter coverage details"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="p-4 sm:p-6 border-t sticky bottom-0 bg-gray-50">
          <div className="flex justify-end items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Create Patient"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePatient;