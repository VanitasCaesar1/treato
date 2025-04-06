import React, { useState } from "react";
import { X, Loader2, Plus, Trash } from "lucide-react";
import toast from "react-hot-toast";

const CreatePatient = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  
  const validateForm = () => {
    // Validate required fields
    const requiredFields = ["name", "email", "mobile"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please provide ${field.replace("_", " ")}`);
        return false;
      }
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please provide a valid email address");
      return false;
    }
    
    // Validate mobile
    if (formData.mobile.length < 10) {
      toast.error("Please provide a valid mobile number");
      return false;
    }
    
    // Validate Aadhaar if provided
    if (formData.aadhaar_id && !/^\d{12}$/.test(formData.aadhaar_id)) {
      toast.error("Aadhaar ID must be 12 digits");
      return false;
    }
    
    // Validate blood group if provided
    if (formData.blood_group && !/^(A|B|AB|O)[+-]$/.test(formData.blood_group)) {
      toast.error("Please select a valid blood group");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
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
        throw new Error(data.error || "Failed to create patient");
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
  
  if (!isOpen) return null;
  
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
            {/* Basic Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter age in years"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar ID
                  </label>
                  <input
                    type="text"
                    name="aadhaar_id"
                    value={formData.aadhaar_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 12-digit Aadhaar ID"
                    maxLength={12}
                  />
                </div>
                
                
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter mobile number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter physical address"
                    rows="3"
                  />
                </div>
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
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
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
            
            {/* Hospital Visits */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Hospital Visits</h3>
              
              {/* Display added hospital visits */}
              {formData.hospital_visits.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Visits:</h4>
                  <div className="space-y-2">
                    {formData.hospital_visits.map((visit, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                        <div>
                          <span className="font-medium">{visit.hospital_name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            Date: {new Date(visit.visit_date).toLocaleDateString()}
                          </span>
                          {visit.reason && <p className="text-sm text-gray-600 mt-1">{visit.reason}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeHospitalVisit(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add new hospital visit */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Hospital Visit</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={hospitalVisit.hospital_name}
                      onChange={(e) => handleHospitalVisitChange("hospital_name", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Hospital name"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="date"
                      value={hospitalVisit.visit_date}
                      onChange={(e) => handleHospitalVisitChange("visit_date", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <textarea
                      value={hospitalVisit.reason}
                      onChange={(e) => handleHospitalVisitChange("reason", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Reason for visit (optional)"
                      rows="2"
                    />
                  </div>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={addHospitalVisit}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center text-sm"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Visit
                  </button>
                </div>
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