"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Trash, User, Clock, DollarSign, Save, X, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

// iOS-style Components
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-50">{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`px-6 py-6 ${className}`}>{children}</div>
);

const Input = ({ className = "", ...props }: any) => (
  <input 
    className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${className}`}
    {...props}
  />
);

const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <label className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>{children}</label>
);

const Button = ({ children, variant = "default", size = "md", className = "", disabled = false, ...props }: any) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    default: "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500",
    outline: "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 focus:ring-gray-500",
    destructive: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    icon: "p-2"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: string }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Custom iOS-style Select Component
const Select = ({ value, onValueChange, children, placeholder, disabled = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  useEffect(() => {
    const findLabel = (items: any) => {
      for (const child of React.Children.toArray(items)) {
        if (React.isValidElement(child) && (child as React.ReactElement<any>).props.value === value) {
          return (child as React.ReactElement<any>).props.children;
        }
      }
      return placeholder || 'Select...';
    };
    setSelectedLabel(findLabel(children));
  }, [value, children, placeholder]);

  return (
    <div className="relative">
      <button
        type="button"
        className={`w-full px-4 py-3 bg-gray-50 rounded-xl text-left text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              const element = child as React.ReactElement<any>;
              return (
                <button
                  key={element.props.value}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-900 border-b border-gray-50 last:border-b-0"
                  onClick={() => {
                    onValueChange(element.props.value);
                    setIsOpen(false);
                  }}
                >
                  {element.props.children}
                </button>
              );
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

const SelectItem = ({ value, children }: { value: string, children: React.ReactNode }) => (
  <div data-value={value}>{children}</div>
);

// Fixed Combobox for custom entries
const ComboBox = ({ value, onValueChange, options, placeholder, disabled = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(String(value || ''));
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    setInputValue(String(value || ''));
  }, [value]);

  useEffect(() => {
    const searchValue = String(inputValue || '').toLowerCase();
    const filtered = options.filter((option: string) => 
      String(option || '').toLowerCase().includes(searchValue)
    );
    setFilteredOptions(filtered);
  }, [inputValue, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onValueChange(newValue);
    setIsOpen(true);
  };

  const handleSelect = (option: string) => {
    const optionStr = String(option);
    setInputValue(optionStr);
    onValueChange(optionStr);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-auto">
          {filteredOptions.map((option: string, index: number) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-900 border-b border-gray-50 last:border-b-0"
              onMouseDown={() => handleSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Data arrays
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SLOT_DURATIONS = [15, 20, 30, 45, 60];

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Medicine',
  'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology',
  'Surgery', 'Urology', 'Gynecology', 'Ophthalmology', 'ENT', 'Anesthesiology'
];

const QUALIFICATIONS = [
  'MBBS', 'MD', 'MS', 'DNB', 'FRCS', 'MRCP', 'DM', 'MCh', 'FACS', 'FCPS',
  'Diploma', 'Fellowship', 'PhD', 'DSc'
];

// Types
interface Doctor {
  doctor_id?: string;
  DoctorID?: string;
  name?: string;
  Name?: string;
  profile_picture_url?: string;
  specialization?: { primary: string; secondary?: string };
  Speciality?: string;
}

interface Schedule {
  id?: string;
  doctorID: string;
  hospitalID: string;
  weekday: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Fees {
  id?: string;
  doctorID: string;
  hospitalID: string;
  organizationID?: string;
  recurringFees: number;
  defaultFees: number;
  emergencyFees: number;
  createdAt: string;
}

interface DoctorProfile {
  username: string;
  name: string;
  mobile: string;
  blood_group: string;
  location: string;
  address: string;
  imrNumber: string;
  age: number;
  specialization: { primary: string; secondary?: string };
  isActive: boolean;
  qualification: string;
  slot_duration: number;
}

// Custom hooks
const useLocalStorage = (key: string, defaultValue: string = '') => {
  return useMemo(() => {
    if (typeof window === 'undefined') return defaultValue;
    return localStorage.getItem(key) || defaultValue;
  }, [key, defaultValue]);
};

const useApiCall = (organizationId = '') => {
  const [loading, setLoading] = useState(false);
  
  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    try {
      // Merge headers to include organization ID
      const headers = {
        'Content-Type': 'application/json',
        ...(organizationId && { 'X-Organization-ID': organizationId }),
      };

      const response = await fetch(url, {
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  return { apiCall, loading };
};

// Utility Components
const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return <div className={`animate-spin ${sizeMap[size]} border-2 border-blue-500 border-t-transparent rounded-full`} />;
};

const DoctorAvatar = ({ doctor, size = 'md' }: { doctor: Doctor, size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = { sm: 'w-10 h-10 text-sm', md: 'w-12 h-12', lg: 'w-16 h-16 text-xl' };
  const name = doctor.name || doctor.Name || '';
  
  return doctor.profile_picture_url ? (
    <img 
      src={doctor.profile_picture_url} 
      alt={name} 
      className={`${sizeMap[size]} rounded-full object-cover`}
    />
  ) : (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-medium`}>
      {name[0]?.toUpperCase() || '?'}
    </div>
  );
};

const EmptyState = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

// iOS-style Tabs
const Tabs = ({ defaultValue, children }: { defaultValue: string, children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, setActiveTab }: any) => (
  <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement<any>(child, { activeTab, setActiveTab });
      }
      return child;
    })}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab }: any) => (
  <button
    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
      activeTab === value 
        ? 'bg-white text-blue-600 shadow-sm' 
        : 'text-gray-600 hover:text-gray-900'
    }`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, activeTab }: any) => (
  activeTab === value ? <div>{children}</div> : null
);

// Profile Tab Component
const DoctorProfileTab = ({ doctorId, doctorName, organizationId }: { 
  doctorId: string, 
  doctorName: string,
  organizationId: string 
}) => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { apiCall, loading } = useApiCall(organizationId); // Use organizationId here

  const fetchProfile = useCallback(async () => {
    if (!doctorId) return;
    try {
      const data = await apiCall(`/api/doctors/${doctorId}/profile`);
      setProfile(data);
    } catch (err) {
      toast.error('Failed to load profile: ' + (err as Error).message);
    }
  }, [doctorId, apiCall]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      await apiCall(`/api/doctors/${doctorId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update profile: ' + (err as Error).message);
    }
  };

  if (loading && !profile) return <div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>;
  if (!profile) return <EmptyState title="No Profile Found" description="Create a profile for this doctor" icon={User} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Doctor Profile</h3>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={loading} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  value={profile.username}
                  onChange={(e) => setProfile({...profile, username: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mobile</Label>
                <Input
                  value={profile.mobile}
                  onChange={(e) => setProfile({...profile, mobile: e.target.value})}
                  disabled={!isEditing}
                  maxLength={10}
                />
              </div>
              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: Number(e.target.value)})}
                  disabled={!isEditing}
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label>Blood Group</Label>
              <Select
                value={profile.blood_group}
                onValueChange={(value) => setProfile({...profile, blood_group: value})}
                disabled={!isEditing}
                placeholder="Select blood group"
              >
                {BLOOD_GROUPS.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>IMR Number</Label>
              <Input
                value={profile.imrNumber}
                onChange={(e) => setProfile({...profile, imrNumber: e.target.value})}
                disabled={!isEditing}
                maxLength={16}

              />
            </div>

            <div>
              <Label>Primary Specialization</Label>
              <ComboBox
                value={profile.specialization.primary}
                onValueChange={(value) => setProfile({
                  ...profile, 
                  specialization: {...profile.specialization, primary: value}
                })}
                options={SPECIALIZATIONS}
                placeholder="Select or type specialization"
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Secondary Specialization (Optional)</Label>
              <ComboBox
                value={profile.specialization.secondary || ''}
                onValueChange={(value) => setProfile({
                  ...profile, 
                  specialization: {...profile.specialization, secondary: value}
                })}
                options={SPECIALIZATIONS}
                placeholder="Select or type secondary specialization"
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Qualification</Label>
              <ComboBox
                value={profile.qualification}
                onValueChange={(value) => setProfile({...profile, qualification: value})}
                options={QUALIFICATIONS}
                placeholder="Select or type qualification"
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Slot Duration (minutes)</Label>
              <Select
                value={profile.slot_duration?.toString() || '30'}
                onValueChange={(value) => setProfile({...profile, slot_duration: Number(value)})}
                disabled={!isEditing}
                placeholder="Select slot duration"
              >
                {SLOT_DURATIONS.map(duration => (
                  <SelectItem key={duration} value={duration.toString()}>{duration} minutes</SelectItem>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Location</Label>
              <Input
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Full Address</Label>
              <Input
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Component - FIXED to get organizationId from API
const DoctorSettings: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [fees, setFees] = useState<Fees[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');
  const [specialityFilter, setSpecialityFilter] = useState('all');
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    weekday: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true
  });
  
  const [newFees, setNewFees] = useState({
    recurringFees: 0,
    defaultFees: 0,
    emergencyFees: 0
  });

  const hospitalID = useLocalStorage('hospitalID');
    const { apiCall, loading } = useApiCall(organizationId);

// Fixed fetchOrganizationId function for your React component
const fetchOrganizationId = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // Direct fetch call since we're calling a Next.js API route, not your backend
    const response = await fetch('/api/check-organization', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data); // Debug log
    
    if (!data.organizationId) {
      console.warn('No organization ID in response:', data);
      throw new Error('No organization ID found');
    }
    
    setOrganizationId(data.organizationId);
    console.log('Organization ID successfully set:', data.organizationId);
    
    // Store in sessionStorage for persistence within session
    sessionStorage.setItem('organizationId', data.organizationId);
    
  } catch (err) {
    console.error('Failed to fetch organization ID:', err);
    setError(err.message);
    
    // Different toast messages based on error type
    if (err.message.includes('401') || err.message.includes('Unauthorized')) {
      toast.error('Please log in to continue');
    } else {
      toast.error('Failed to load organization data: ' + err.message);
    }
  } finally {
    setIsLoading(false);
  }
}, []); // Remove apiCall dependency since we're using direct fetch

// Also update your useEffect to not depend on fetchOrganizationId changing
useEffect(() => {
  // Check sessionStorage first for better UX
  const cachedOrgId = sessionStorage.getItem('organizationId');
  if (cachedOrgId) {
    setOrganizationId(cachedOrgId);
    console.log('Using cached organization ID:', cachedOrgId);
  }
  
  // Always fetch fresh data
  fetchOrganizationId();
}, []); // Empty dependency array since fetchOrganizationId is stable now
  const fetchDoctors = useCallback(async (query = '', by = 'name', speciality = '') => {
  // Make sure organizationId is available before making calls
  if (!organizationId) {
    console.log('Organization ID not available yet, skipping doctor fetch');
    return;
  }
  
  try {
    const params = new URLSearchParams({
      limit: '50',
      ...(query && { q: query }),
      ...(by && { by }),
      ...(speciality && speciality !== 'all' && { speciality })
    });
    
    const data = await apiCall(`/api/doctors/search?${params}`);
    
    const doctorsArray = data.doctors?.map((doc: any) => ({
      doctor_id: doc.DoctorID || doc.doctor_id,
      name: doc.Name || doc.name,
      specialization: typeof doc.Speciality === 'string' 
        ? { primary: doc.Speciality } 
        : doc.specialization || { primary: doc.Speciality || 'General' },
      profile_picture_url: doc.profile_picture_url
    })) || [];
    
    setDoctors(doctorsArray);
    
    const allSpecialities = [...new Set(
      doctorsArray
        .map((doc: Doctor) => doc.specialization?.primary || doc.Speciality)
        .filter(Boolean)
    )];
    setSpecialities(allSpecialities as string[]);
    
    if (doctorsArray.length > 0 && !selectedDoctor) {
      setSelectedDoctor(doctorsArray[0]);
    }
  } catch (err) {
    toast.error('Failed to fetch doctors: ' + (err as Error).message);
    setDoctors([]);
  }
}, [apiCall, selectedDoctor, organizationId]); // Add organizationId to dependencies


  const fetchDoctorData = useCallback(async () => {
  if (!selectedDoctor || !organizationId) {
    console.log('Selected doctor or organization ID not available');
    return;
  }
  
  const doctorId = selectedDoctor.doctor_id || selectedDoctor.DoctorID;
  if (!doctorId) return;

  try {
    const [schedulesData, feesData] = await Promise.all([
      apiCall(`/api/doctors/${doctorId}/schedules`).catch(() => []),
      apiCall(`/api/doctors/${doctorId}/fees`).catch(() => [])
    ]);
      const normalizedSchedules = (Array.isArray(schedulesData) ? schedulesData : schedulesData?.data || [])
        .map((s: any) => ({
          id: s.id || s.ID || s._id || '',
          doctorID: s.doctorID || s.doctor_id || s.DoctorID || '',
          hospitalID: s.hospitalID || s.hospital_id || s.HospitalID || '',
          weekday: s.weekday || s.Weekday || '',
          startTime: s.startTime || s.start_time || '',
          endTime: s.endTime || s.end_time || '',
          isActive: s.isActive ?? s.is_active ?? true
        }));

      const normalizedFees = (Array.isArray(feesData) ? feesData : feesData?.data ? [feesData.data] : [feesData])
        .filter(Boolean)
        .map((f: any) => ({
          id: f.id || f._id || '',
          doctorID: f.doctorID || f.doctor_id || '',
          hospitalID: f.hospitalID || f.hospital_id || '',
          organizationID: f.organizationID || f.organization_id || '',
          recurringFees: Number(f.recurringFees || f.recurring_fees || 0),
          defaultFees: Number(f.defaultFees || f.default_fees || 0),
          emergencyFees: Number(f.emergencyFees || f.emergency_fees || 0),
          createdAt: f.createdAt || f.created_at || new Date().toISOString()
        }));

      setSchedules(normalizedSchedules);
      setFees(normalizedFees);
      
      if (normalizedFees.length > 0) {
        setNewFees({
          recurringFees: normalizedFees[0].recurringFees,
          defaultFees: normalizedFees[0].defaultFees,
          emergencyFees: normalizedFees[0].emergencyFees
        });
      } else {
        setNewFees({ recurringFees: 0, defaultFees: 0, emergencyFees: 0 });
      }
    } catch (err) {
    toast.error('Failed to load doctor data: ' + (err as Error).message);
    setSchedules([]);
    setFees([]);
  }
}, [selectedDoctor, apiCall, organizationId]); // Add organizationId to dependencies

  // CRUD Operations
  const handleAddSchedule = async () => {
    if (!selectedDoctor) return;
    
    try {
      const scheduleData = {
        ...newSchedule,
        doctorID: selectedDoctor.doctor_id || selectedDoctor.DoctorID
      };
      
      await apiCall('/api/doctors/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      
      toast.success('Schedule added successfully');
      setNewSchedule({ weekday: 'Monday', startTime: '09:00', endTime: '17:00', isActive: true });
      fetchDoctorData();
    } catch (err) {
      toast.error('Failed to add schedule: ' + (err as Error).message);
    }
  };
  
// Updated handleDeleteSchedule function for your React component
const handleDeleteSchedule = async (schedule) => {
  if (!confirm('Delete this schedule?')) return;
  
  try {
    const doctorId = selectedDoctor?.doctor_id || selectedDoctor?.DoctorID;
    
    // Ensure organizationId is available
    if (!organizationId) {
      throw new Error('Organization ID not available');
    }
    
    // Create composite ID in the format expected by backend: doctor_id_weekday_org_organizationId
    // Note: The backend expects "org_" prefix before the organization ID
    const compositeId = `${doctorId}_${schedule.weekday}_${organizationId}`;
    
    console.log('Deleting schedule with composite ID:', compositeId);
    console.log('Organization ID being sent:', organizationId);
    console.log('Doctor ID:', doctorId);
    console.log('Weekday:', schedule.weekday);
    
    const response = await apiCall(`/api/doctors/schedules/${compositeId}`, {
      method: 'DELETE'
    });
    
    if (response.message || response.success !== false) {
      toast.success('Schedule deleted successfully');
      fetchDoctorData();
    } else {
      throw new Error(response.error || 'Failed to delete schedule');
    }
  } catch (err) {
    console.error('Delete schedule error:', err);
    toast.error('Failed to delete schedule: ' + (err as Error).message);
  }
};

  const handleUpdateFees = async () => {
    if (!selectedDoctor) return;
    
    try {
      const feesData = {
        ...newFees,
        doctorID: selectedDoctor.doctor_id || selectedDoctor.DoctorID,
        hospitalID,
        organizationId
      };
      
      const method = fees.length > 0 ? 'PUT' : 'POST';
      const url = fees.length > 0 ? `/api/doctors/${selectedDoctor.doctor_id || selectedDoctor.DoctorID}/fees` : '/api/doctors/fees';
      
      await apiCall(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feesData)
      });
      
      toast.success('Fees updated successfully');
      fetchDoctorData();
    } catch (err) {
      toast.error('Failed to update fees: ' + (err as Error).message);
    }
  };

  // Updated handleDeleteFees function for your React component
const handleDeleteFees = async (fee) => {
  if (!confirm('Delete this fee structure?')) return;
  
  try {
    const doctorId = selectedDoctor?.doctor_id || selectedDoctor?.DoctorID;
    
    // Ensure organizationId is available
    if (!organizationId) {
      throw new Error('Organization ID not available');
    }
    
    // Create composite ID in the format: doctor_id_organizationId
    // The API route will add the "org_" prefix if needed
    const compositeId = `${doctorId}_${organizationId}`;
    
    console.log('Deleting fees with composite ID:', compositeId);
    console.log('Organization ID being sent:', organizationId);
    console.log('Doctor ID:', doctorId);
    
    const response = await apiCall(`/api/doctors/fees/${compositeId}`, { 
      method: 'DELETE' 
    });
    
    if (response.message || response.success !== false) {
      toast.success('Fees deleted successfully');
      setNewFees({ recurringFees: 0, defaultFees: 0, emergencyFees: 0 });
      fetchDoctorData();
    } else {
      throw new Error(response.error || 'Failed to delete fees');
    } 
  } catch (err) {
    console.error('Delete fees error:', err);
    toast.error('Failed to delete fees: ' + (err as Error).message);
  }
};

  // Effects
 useEffect(() => {
  if (organizationId) {
    fetchDoctors();
  }
}, [fetchDoctors, organizationId]); // Add organizationId dependency

// 5. Update fetchDoctorData effect similarly
useEffect(() => {
  if (organizationId) {
    fetchDoctorData();
  }
}, [fetchDoctorData, organizationId]); // Add organizationId dependency

  // Search and filter logic
  const handleSearch = useCallback(() => {
    fetchDoctors(searchQuery, searchFilter, specialityFilter);
  }, [searchQuery, searchFilter, specialityFilter, fetchDoctors]);

  useEffect(() => {
    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  const filteredSchedules = schedules.filter(s => s.isActive);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Settings</h1>
          <p className="text-gray-600">Manage doctor profiles, schedules, and fees</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={searchFilter} onValueChange={setSearchFilter}>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="id">Doctor ID</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </Select>
              
              <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                <SelectItem value="all">All Specialities</SelectItem>
                {specialities.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Doctor List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Doctors ({doctors.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto h-[500px]">
                  {loading && doctors.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : doctors.length === 0 ? (
                    <EmptyState 
                      title="No Doctors Found" 
                      description="Try adjusting your search criteria" 
                      icon={User} 
                    />
                  ) : (
                    <div className="space-y-1 p-4">
                      {doctors.map((doctor) => (
                        <button
                          key={doctor.doctor_id || doctor.DoctorID}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                            selectedDoctor?.doctor_id === doctor.doctor_id || selectedDoctor?.DoctorID === doctor.DoctorID
                              ? 'bg-blue-50 border-2 border-blue-200'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                          onClick={() => setSelectedDoctor(doctor)}
                        >
                          <div className="flex items-center gap-3">
                            <DoctorAvatar doctor={doctor} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {doctor.name || doctor.Name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {doctor.specialization?.primary || doctor.Speciality || 'General'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedDoctor ? (
              <Tabs defaultValue="profile">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="fees">Fees</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
  <DoctorProfileTab 
    doctorId={selectedDoctor.doctor_id || selectedDoctor.DoctorID || ''} 
    doctorName={selectedDoctor.name || selectedDoctor.Name || ''} 
    organizationId={organizationId} // Pass organizationId
  />
</TabsContent>

                <TabsContent value="schedule">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Schedule Management</h3>
                    </div>

                    {/* Add Schedule Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Add New Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Day</Label>
                            <Select 
                              value={newSchedule.weekday} 
                              onValueChange={(value) => setNewSchedule({...newSchedule, weekday: value})}
                            >
                              {WEEKDAYS.map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                              ))}
                            </Select>
                          </div>
                          <div>
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={newSchedule.startTime}
                              onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={newSchedule.endTime}
                              onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button onClick={handleAddSchedule} disabled={loading} className="w-full">
                              {loading ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4 mr-2" />}
                              Add Schedule
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Existing Schedules */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Current Schedules
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {filteredSchedules.length === 0 ? (
                          <EmptyState 
                            title="No Schedules" 
                            description="Add a schedule to get started" 
                            icon={Clock} 
                          />
                        ) : (
                          <div className="space-y-3">
                            {filteredSchedules.map((schedule, index) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-4">
                                  <Badge>{schedule.weekday}</Badge>
                                  <span className="font-medium">
                                    {schedule.startTime} - {schedule.endTime}
                                  </span>
                                </div>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteSchedule(schedule)}
                                  disabled={loading}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="fees">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Fee Management</h3>
                    </div>

                    {/* Fee Form */}
                    <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <DollarSign className="h-5 w-5" />
      {fees.length > 0 ? 'Update' : 'Set'} Fee Structure
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <Label>Recurring Fees (₹)</Label>
        <Input
          type="text"
          value={newFees.recurringFees === 0 ? '' : newFees.recurringFees}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
              setNewFees({...newFees, recurringFees: value === '' ? 0 : parseInt(value)});
            }
          }}
          placeholder="0"
        />
      </div>
      <div>
        <Label>Default Fees (₹)</Label>
        <Input
          type="text"
          value={newFees.defaultFees === 0 ? '' : newFees.defaultFees}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
              setNewFees({...newFees, defaultFees: value === '' ? 0 : parseInt(value)});
            }
          }}
          placeholder="0"
        />
      </div>
      <div>
        <Label>Emergency Fees (₹)</Label>
        <Input
          type="text"
          value={newFees.emergencyFees === 0 ? '' : newFees.emergencyFees}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
              setNewFees({...newFees, emergencyFees: value === '' ? 0 : parseInt(value)});
            }
          }}
          placeholder="0"
        />
      </div>
    </div>
    <div className="flex gap-3">
      <Button onClick={handleUpdateFees} disabled={loading}>
        {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
        {fees.length > 0 ? 'Update' : 'Save'} Fees
      </Button>
      {fees.length > 0 && (
        <Button
          variant="destructive"
          onClick={() => handleDeleteFees(fees[0])}
          disabled={loading}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete Fees
        </Button>
      )}
    </div>
  </CardContent>
</Card>
                    {/* Current Fees Display */}
                    {fees.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Current Fee Structure</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-xl">
                              <p className="text-sm text-gray-600">Recurring</p>
                              <p className="text-2xl font-bold text-blue-600">₹{fees[0].recurringFees}</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                              <p className="text-sm text-gray-600">Default</p>
                              <p className="text-2xl font-bold text-green-600">₹{fees[0].defaultFees}</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-xl">
                              <p className="text-sm text-gray-600">Emergency</p>
                              <p className="text-2xl font-bold text-red-600">₹{fees[0].emergencyFees}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <EmptyState 
                  title="Select a Doctor" 
                  description="Choose a doctor from the list to manage their settings" 
                  icon={User} 
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;

