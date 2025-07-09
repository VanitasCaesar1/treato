"use client"
import React, { useState } from 'react';
import { User, Phone, Mail, Calendar, MapPin, CreditCard, Heart, AlertCircle, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreatePatientForm = ({ onPatientCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: '',
    age: '',
    blood_group: '',
    address: '',
    aadhaar_id: '',
    medical_history: [],
    allergies: [],
    emergency_contact: {
      name: '',
      relationship: '',
      phone: ''
    },
    insurance: {
      provider: '',
      policy_number: '',
      expiry_date: '',
      coverage_details: ''
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [submitting, setSubmitting] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedicalHistory, setNewMedicalHistory] = useState({
    condition: '',
    diagnosed_date: '',
    notes: ''
  });
  const [formError, setFormError] = useState("");

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  // Blood group options
  const bloodGroupOptions = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  // Relationship options
  const relationshipOptions = [
    'Spouse', 'Parent', 'Child', 'Sibling', 'Guardian', 'Friend', 'Other'
  ];

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Add allergy
  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  // Remove allergy
  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  // Add medical history
  const addMedicalHistory = () => {
    if (newMedicalHistory.condition.trim()) {
      setFormData(prev => ({
        ...prev,
        medical_history: [...prev.medical_history, { ...newMedicalHistory }]
      }));
      setNewMedicalHistory({
        condition: '',
        diagnosed_date: '',
        notes: ''
      });
    }
  };

  // Remove medical history
  const removeMedicalHistory = (index) => {
    setFormData(prev => ({
      ...prev,
      medical_history: prev.medical_history.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = [];
    // Clean mobile number: remove spaces, dashes, country code
    let mobile = formData.mobile.trim().replace(/[-\s]/g, '');
    if (mobile.startsWith('+91')) mobile = mobile.slice(3);
    if (mobile.startsWith('91') && mobile.length > 10) mobile = mobile.slice(2);
    // Debug log
    console.log('Validating mobile number:', mobile);
    if (!formData.name.trim()) errors.push('Name is required');
    if (!mobile) errors.push('Mobile number is required');
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      errors.push(`Please enter a valid 10-digit mobile number. Value: ${mobile}`);
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    if (formData.age && (isNaN(formData.age) || parseInt(formData.age) < 0 || parseInt(formData.age) > 150)) {
      errors.push('Please enter a valid age');
    }
    if (formData.aadhaar_id && !/^\d{12}$/.test(formData.aadhaar_id)) {
      errors.push('Aadhaar ID must be 12 digits');
    }
    if (errors.length > 0) {
      setFormError(errors[0]);
      return false;
    }
    setFormError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validateForm()) return;
    setSubmitting(true);
    const loadingToast = toast.loading("Creating patient...");

    try {
      // Clean up the data before sending
      const cleanedData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        medical_history: formData.medical_history.filter(item => item.condition.trim()),
        allergies: formData.allergies.filter(allergy => allergy.trim()),
        emergency_contact: (formData.emergency_contact.name || formData.emergency_contact.phone) 
          ? formData.emergency_contact 
          : undefined,
        insurance: formData.insurance.provider 
          ? formData.insurance 
          : undefined
      };

      const response = await fetch('/api/patients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || 'Failed to create patient');
        throw new Error(data.error || 'Failed to create patient');
      }

      toast.success('Patient created successfully!', { id: loadingToast });
      
      // Call the callback with the created patient data
      if (onPatientCreated) {
        onPatientCreated(data.patient || data);
      }
      
    } catch (error) {
      setFormError(error.message || 'Failed to create patient');
      console.error('Error creating patient:', error);
      toast.error(error.message || 'Failed to create patient', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  // Tab content
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'medical', label: 'Medical', icon: Heart },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'insurance', label: 'Insurance', icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Create New Patient</h3>
        <p className="text-sm text-gray-600 mt-1">Fill in the patient information below</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-2 text-sm">
            <AlertCircle className="inline w-4 h-4 mr-2 align-text-bottom" />
            {formError}
          </div>
        )}

        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10-digit mobile number"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="patient@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter age"
                  min="0"
                  max="150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  value={formData.blood_group}
                  onChange={(e) => handleInputChange('blood_group', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select blood group</option>
                  {bloodGroupOptions.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter complete address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar ID
              </label>
              <input
                type="text"
                value={formData.aadhaar_id}
                onChange={(e) => handleInputChange('aadhaar_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12-digit Aadhaar number"
                maxLength="12"
              />
            </div>
          </div>
        )}

        {/* Medical Information Tab */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add allergy (e.g., Penicillin, Peanuts)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Medical History */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical History
              </label>
              <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newMedicalHistory.condition}
                    onChange={(e) => setNewMedicalHistory(prev => ({ ...prev, condition: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Condition/Disease"
                  />
                  <input
                    type="date"
                    value={newMedicalHistory.diagnosed_date}
                    onChange={(e) => setNewMedicalHistory(prev => ({ ...prev, diagnosed_date: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={newMedicalHistory.notes}
                    onChange={(e) => setNewMedicalHistory(prev => ({ ...prev, notes: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Notes (optional)"
                  />
                </div>
                <button
                  type="button"
                  onClick={addMedicalHistory}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add Medical History
                </button>
              </div>
              
              {formData.medical_history.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.medical_history.map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{history.condition}</div>
                        <div className="text-sm text-gray-600">
                          {history.diagnosed_date && `Diagnosed: ${history.diagnosed_date}`}
                          {history.notes && ` • ${history.notes}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedicalHistory(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact.name}
                  onChange={(e) => handleInputChange('emergency_contact.name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <select
                  value={formData.emergency_contact.relationship}
                  onChange={(e) => handleInputChange('emergency_contact.relationship', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select relationship</option>
                  {relationshipOptions.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact.phone}
                  onChange={(e) => handleInputChange('emergency_contact.phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency contact phone"
                  maxLength={10}

                />
              </div>
            </div>
          </div>
        )}

        {/* Insurance Information Tab */}
        {activeTab === 'insurance' && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Insurance Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={formData.insurance.provider}
                  onChange={(e) => handleInputChange('insurance.provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Insurance company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Number
                </label>
                <input
                  type="text"
                  value={formData.insurance.policy_number}
                  onChange={(e) => handleInputChange('insurance.policy_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Policy number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.insurance.expiry_date}
                  onChange={(e) => handleInputChange('insurance.expiry_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coverage Details
                </label>
                <textarea
                  value={formData.insurance.coverage_details}
                  onChange={(e) => handleInputChange('insurance.coverage_details', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Coverage details and limits"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Patient
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePatientForm;