import React, { useState, useEffect } from 'react';
import { Edit, Save, X, User, Award, Clock, Activity, FileText, MapPin, Phone, Mail, Calendar, Star, Shield } from 'lucide-react';

// Types based on your API response
interface DoctorProfile {
  user_id: string;
  auth_id: string;
  username: string;
  profile_pic: string;
  name: string;
  mobile: string;
  email: string;
  blood_group: string;
  location: string;
  address: string;
  hospital_id: string;
  imr_number: string;
  age: number;
  specialization: {
    primary: string;
    secondary?: string[];
  };
  is_active: boolean;
  qualification: string;
  slot_duration: number;
}

interface DoctorProfileTabProps {
  doctorId?: string;
  doctorName?: string;
}

const DoctorProfileTab: React.FC<DoctorProfileTabProps> = ({ 
  doctorId: propDoctorId, 
  doctorName: propDoctorName 
}) => {
  // State
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<Partial<DoctorProfile>>({});
  const [doctorId, setDoctorId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [customSlotTime, setCustomSlotTime] = useState<string>('');
  const [showCustomSlot, setShowCustomSlot] = useState<boolean>(false);
  
  // Common specializations for dropdown
  const commonSpecializations = [
    'Cardiology', 'Dermatology', 'Emergency Medicine', 'Family Medicine',
    'General Surgery', 'Internal Medicine', 'Neurology', 'Obstetrics & Gynecology',
    'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology',
    'Anesthesiology', 'Pathology', 'Ophthalmology', 'ENT', 'Urology'
  ];

  // Common qualifications for dropdown
  const commonQualifications = [
    'MBBS',
    'MBBS, MD',
    'MBBS, MS',
    'MBBS, MD, DM',
    'MBBS, MS, MCh',
    'MBBS, MD (General Medicine)',
    'MBBS, MD (Pediatrics)',
    'MBBS, MD (Cardiology)',
    'MBBS, MD (Dermatology)',
    'MBBS, MD (Psychiatry)',
    'MBBS, MS (General Surgery)',
    'MBBS, MS (Orthopedics)',
    'MBBS, MS (ENT)',
    'MBBS, MS (Ophthalmology)',
    'MBBS, MD (Radiology)',
    'MBBS, MD (Anesthesiology)',
    'MBBS, MD (Pathology)',
    'MBBS, MD (Emergency Medicine)',
    'MBBS, MD, Fellowship',
    'MBBS, MS, Fellowship'
  ];

  // Slot duration options
  const slotDurationOptions = [
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 'custom', label: 'Custom' }
  ];

  // Get doctor ID and fetch profile
  useEffect(() => {
    initializeProfile();
  }, [propDoctorId]);

  const initializeProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Determine which doctor ID to use
      let targetDoctorId = '';
      
      if (propDoctorId) {
        targetDoctorId = propDoctorId;
      } else if (typeof window !== 'undefined') {
        const selectedDoctorId = localStorage.getItem('selectedDoctorId');
        const currentDoctorId = localStorage.getItem('currentDoctorId') || 
                               localStorage.getItem('userId') || 
                               localStorage.getItem('doctorId');
        
        targetDoctorId = selectedDoctorId || currentDoctorId || '';
      }
      
      if (!targetDoctorId) {
        throw new Error('No doctor ID available');
      }
      
      console.log('Using doctor ID:', targetDoctorId);
      setDoctorId(targetDoctorId);
      await fetchDoctorProfile(targetDoctorId);
      
    } catch (error) {
      console.error('Error initializing profile:', error);
      setError(error.message || 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorProfile = async (targetDoctorId: string) => {
    try {
      console.log('Fetching profile for doctor:', targetDoctorId);
      const response = await fetch(`/api/doctors/${targetDoctorId}/profile`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Doctor profile not found');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Access denied');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch profile: ${response.status}`);
      }
      
      const profileData = await response.json();
      console.log('Profile data received:', profileData);
      
      // Normalize the profile data to ensure consistent structure
      const normalizedProfile = {
        ...profileData,
        specialization: profileData.specialization || { primary: '', secondary: [] }
      };
      
      // Ensure secondary is always an array
      if (normalizedProfile.specialization.secondary && !Array.isArray(normalizedProfile.specialization.secondary)) {
        normalizedProfile.specialization.secondary = [normalizedProfile.specialization.secondary];
      } else if (!normalizedProfile.specialization.secondary) {
        normalizedProfile.specialization.secondary = [];
      }
      
      setProfile(normalizedProfile);
      
      // Initialize edit form with normalized data
      setEditForm(normalizedProfile);
      
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      throw error;
    }
  };

  const handleSlotDurationChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomSlot(true);
      setCustomSlotTime('');
    } else {
      setShowCustomSlot(false);
      setCustomSlotTime('');
      setEditForm({...editForm, slot_duration: parseInt(value)});
    }
  };

  const handleCustomSlotTimeChange = (value: string) => {
    setCustomSlotTime(value);
    const numValue = parseInt(value);
    if (numValue && numValue > 0 && numValue <= 60) {
      setEditForm({...editForm, slot_duration: numValue});
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !doctorId) return;
    
    try {
      setSaving(true);
      setError('');
      
      // Validate required fields
      if (!editForm.name?.trim()) {
        throw new Error('Name is required');
      }
      
      if (!editForm.username?.trim()) {
        throw new Error('Username is required');
      }
      
      if (!editForm.qualification?.trim()) {
        throw new Error('Qualification is required');
      }
      
      if (!editForm.age || editForm.age < 18 || editForm.age > 100) {
        throw new Error('Please enter a valid age between 18 and 100');
      }
      
      if (!editForm.specialization?.primary?.trim()) {
        throw new Error('Primary specialization is required');
      }

      if (!editForm.slot_duration || editForm.slot_duration < 5 || editForm.slot_duration > 60) {
        throw new Error('Please enter a valid slot duration between 5 and 60 minutes');
      }
      
      // Prepare the update data to match the Go backend structure
      const updateData = {
        username: editForm.username.trim(),
        name: editForm.name.trim(),
        mobile: editForm.mobile?.trim() || '',
        email: editForm.email?.trim() || '',
        blood_group: editForm.blood_group?.trim() || '',
        location: editForm.location?.trim() || '',
        address: editForm.address?.trim() || '',
        imr_number: editForm.imr_number?.trim() || '',
        age: editForm.age,
        specialization: {
          primary: editForm.specialization.primary.trim(),
          secondary: editForm.specialization.secondary && editForm.specialization.secondary.length > 0 
            ? editForm.specialization.secondary.filter(s => s && s.trim())
            : []
        },
        is_active: editForm.is_active ?? true,
        qualification: editForm.qualification.trim(),
        slot_duration: editForm.slot_duration
      };
      
      console.log('Updating profile for doctor:', doctorId, updateData);
      
      const response = await fetch(`/api/doctors/${doctorId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const result = await response.json();
      console.log('Update successful:', result);
      
      // Refresh the profile data after successful update
      await fetchDoctorProfile(doctorId);
      setEditing(false);
      setShowCustomSlot(false);
      
      // Show success message
      console.log('Profile updated successfully');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      ...profile,
      specialization: profile?.specialization || { primary: '', secondary: [] }
    });
    setEditing(false);
    setShowCustomSlot(false);
    setCustomSlotTime('');
    setError('');
  };

  const formatSpecialization = (specialization: any): string => {
    if (!specialization) return 'Not specified';
    
    if (typeof specialization === 'string') return specialization;
    
    if (specialization.primary) {
      const secondary = specialization.secondary;
      if (secondary && Array.isArray(secondary) && secondary.length > 0) {
        const validSecondary = secondary.filter(s => s && s.trim());
        return validSecondary.length > 0 
          ? `${specialization.primary}, ${validSecondary.join(', ')}`
          : specialization.primary;
      }
      return specialization.primary;
    }
    
    return 'Not specified';
  };

  const handleSecondarySpecializationChange = (value: string) => {
    const currentSecondary = editForm.specialization?.secondary || [];
    let newSecondary: string[];
    
    if (value === '') {
      newSecondary = [];
    } else if (currentSecondary.includes(value)) {
      // Remove if already exists
      newSecondary = currentSecondary.filter(s => s !== value);
    } else {
      // Add new specialization (limit to 3 for UI purposes)
      newSecondary = [...currentSecondary.slice(0, 2), value];
    }
    
    setEditForm({
      ...editForm,
      specialization: {
        ...editForm.specialization,
        primary: editForm.specialization?.primary || '',
        secondary: newSecondary
      }
    });
  };

  // Loading spinner component
  const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    };
    
    return (
      <div className={`animate-spin ${sizeClasses[size]} border-2 border-purple-300 border-t-purple-600 rounded-full`} />
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading doctor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error or no profile found
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Profile Not Available</h3>
            <p className="text-gray-600 mb-4">{error || 'Doctor profile not found.'}</p>
            <button
              onClick={initializeProfile}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <X size={16} className="text-red-500" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <Star size={12} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    {profile.name || 'Doctor Name'}
                  </h1>
                  <p className="text-gray-600 font-medium">{formatSpecialization(profile.specialization)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      profile.is_active 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {profile.is_active ? '● Active' : '● Inactive'}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                      {profile.age} years old
                    </span>
                  </div>
                </div>
              </div>
              {!editing ? (
                <button 
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium flex items-center gap-2 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-md disabled:opacity-50"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : <Save size={16} />}
                    Save
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-gray-600 transform hover:scale-105 transition-all duration-200 shadow-md"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name *</label>
                  {editing ? (
                    <input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Enter full name"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-gray-50 rounded-lg">{profile.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Username *</label>
                  {editing ? (
                    <input
                      value={editForm.username || ''}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Enter username"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-gray-50 rounded-lg">{profile.username || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Age *</label>
                  {editing ? (
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={editForm.age || ''}
                      onChange={(e) => setEditForm({...editForm, age: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Enter age"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-gray-50 rounded-lg">{profile.age} years</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">IMR Number</label>
                  {editing ? (
                    <input
                      value={editForm.imr_number || ''}
                      onChange={(e) => setEditForm({...editForm, imr_number: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Enter IMR number"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-gray-50 rounded-lg">{profile.imr_number || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Slot Duration *</label>
                  {editing ? (
                    <div className="space-y-2">
                      <select
                        value={showCustomSlot ? 'custom' : editForm.slot_duration?.toString() || '30'}
                        onChange={(e) => handleSlotDurationChange(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                      >
                        {slotDurationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {showCustomSlot && (
                        <input
                          type="number"
                          min="5"
                          max="60"
                          value={customSlotTime}
                          onChange={(e) => handleCustomSlotTimeChange(e.target.value)}
                          className="w-full px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="Enter custom time (5-60 minutes)"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-gray-50 rounded-lg">{profile.slot_duration || 30} minutes</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mobile</label>
                  {editing ? (
                    <input
                      value={editForm.mobile || ''}
                      onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Enter mobile number"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-gray-50 rounded-lg">{profile.mobile || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-gray-50 rounded-lg">{profile.email || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Blood Group</label>
                  {editing ? (
                    <select
                      value={editForm.blood_group || ''}
                      onChange={(e) => setEditForm({...editForm, blood_group: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
                    >
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-gray-50 rounded-lg">{profile.blood_group || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Specialization */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Specialization</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Primary Specialization *</label>
                  {editing ? (
                    <select
                      value={editForm.specialization?.primary || ''}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        specialization: {
                          ...editForm.specialization,
                          primary: e.target.value,
                          secondary: editForm.specialization?.secondary || []
                        }
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:bg-white transition-all duration-200 text-sm"
                    >
                      <option value="">Select primary specialization</option>
                      {commonSpecializations.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-purple-50 rounded-lg border border-purple-100">
                      {profile.specialization?.primary || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Secondary Specializations</label>
                  {editing ? (
                    <div className="space-y-2">
                      <select
                        value=""
                        onChange={(e) => handleSecondarySpecializationChange(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:bg-white transition-all duration-200 text-sm"
                      >
                        <option value="">Add secondary specialization</option>
                        {commonSpecializations.filter(spec => spec !== editForm.specialization?.primary).map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      {editForm.specialization?.secondary && editForm.specialization.secondary.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editForm.specialization.secondary.map((spec, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1 border border-purple-200">
                              {spec}
                              <button
                                onClick={() => handleSecondarySpecializationChange(spec)}
                                className="ml-1 text-purple-500 hover:text-purple-700"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.specialization?.secondary && profile.specialization.secondary.length > 0 ? (
                        profile.specialization.secondary.map((spec, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                            {spec}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-lg">No secondary specializations</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Professional Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Qualification *</label>
                  {editing ? (
                    <select
                      value={editForm.qualification || ''}
                      onChange={(e) => setEditForm({...editForm, qualification: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                    >
                      <option value="">Select qualification</option>
                      {commonQualifications.map((qual) => (
                        <option key={qual} value={qual}>{qual}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
                      {profile.qualification || 'Not specified'}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Hospital ID</label>
                  <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-gray-50 rounded-lg">
                    {profile.hospital_id || 'Not provided'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</label>
                  {editing ? (
                    <select
                      value={editForm.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setEditForm({...editForm, is_active: e.target.value === 'active'})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <p className={`text-sm font-medium px-3 py-2 rounded-lg ${
                      profile.is_active 
                        ? 'text-green-800 bg-green-50 border border-green-100' 
                        : 'text-red-800 bg-red-50 border border-red-100'
                    }`}>
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <MapPin size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Location Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</label>
                  {editing ? (
                    <input
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Enter location"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100">
                      {profile.location || 'Not provided'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Address</label>
                  {editing ? (
                    <textarea
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:bg-white transition-all duration-200 text-sm resize-none"
                      rows={3}
                      placeholder="Enter full address"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800 px-3 py-2 bg-orange-50 rounded-lg border border-orange-100 min-h-[80px]">
                      {profile.address || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Activity size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Quick Stats</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Slot Duration</span>
                  </div>
                  <span className="text-sm font-bold text-blue-700">{profile.slot_duration || 30} min</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">Status</span>
                  </div>
                  <span className={`text-sm font-bold ${profile.is_active ? 'text-green-700' : 'text-red-700'}`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3">
                    <Award size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Age</span>
                  </div>
                  <span className="text-sm font-bold text-purple-700">{profile.age} years</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <Phone size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Contact</h2>
              </div>
              
              <div className="space-y-4">
                {profile.mobile && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                    <Phone size={16} className="text-pink-600" />
                    <div>
                      <p className="text-xs font-semibold text-pink-800 uppercase tracking-wide">Mobile</p>
                      <p className="text-sm font-medium text-pink-700">{profile.mobile}</p>
                    </div>
                  </div>
                )}

                {profile.email && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                    <Mail size={16} className="text-indigo-600" />
                    <div>
                      <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">Email</p>
                      <p className="text-sm font-medium text-indigo-700">{profile.email}</p>
                    </div>
                  </div>
                )}

                {profile.blood_group && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
                    <Activity size={16} className="text-red-600" />
                    <div>
                      <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Blood Group</p>
                      <p className="text-sm font-medium text-red-700">{profile.blood_group}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">System Info</h2>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">User ID</p>
                  <p className="text-sm font-mono text-gray-800">{profile.user_id}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Auth ID</p>
                  <p className="text-sm font-mono text-gray-800">{profile.auth_id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileTab;