"use client"
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Trash, User, Clock, DollarSign, Save, X, ChevronDown } from 'lucide-react';

// iOS-style Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="px-6 py-4 border-b border-gray-50">{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`px-6 py-6 ${className}`}>{children}</div>;

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${className}`}
    {...props}
    value={props.value ?? ""}
  />
);

const Label = ({ children, className = "" }) => <label className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>{children}</label>;

const Button = ({ children, variant = "default", size = "md", className = "", disabled = false, ...props }) => {
  const variants = {
    default: "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500",
    outline: "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 focus:ring-gray-500",
    destructive: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700"
  };
  const sizes = { sm: "px-3 py-2 text-sm", md: "px-4 py-3 text-sm", icon: "p-2" };
  
  return (
    <button className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const variants = { default: "bg-blue-100 text-blue-800", secondary: "bg-gray-100 text-gray-800" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
};

// Custom Select Component
const Select = ({ value, onValueChange, children, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  useEffect(() => {
    const findLabel = (items) => {
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
              const el = child as React.ReactElement<any>;
              return (
                <button
                  key={el.props.value}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-900 border-b border-gray-50 last:border-b-0"
                  onClick={() => {
                    onValueChange(el.props.value);
                    setIsOpen(false);
                  }}
                >
                  {el.props.children}
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

const SelectItem = ({ value, children }) => <div data-value={value}>{children}</div>;

// Constants
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Utility functions
const useLocalStorage = (key, defaultValue = '') => {
  return useMemo(() => {
    if (typeof window === 'undefined') return defaultValue;
    return localStorage.getItem(key) || defaultValue;
  }, [key, defaultValue]);
};

const useApiCall = (organizationId = '') => {
  const [loading, setLoading] = useState(false);
  
  const apiCall = useCallback(async (url, options = {}) => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(organizationId && { 'X-Organization-ID': organizationId }),
        ...((options && (options as any).headers) || {})
      };
      const response = await fetch(url, {
        ...options,
        headers
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
const LoadingSpinner = ({ size = 'md' }) => {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return <div className={`animate-spin ${sizeMap[size]} border-2 border-blue-500 border-t-transparent rounded-full`} />;
};

const DoctorAvatar = ({ doctor, size = 'md' }) => {
  const sizeMap = { sm: 'w-10 h-10 text-sm', md: 'w-12 h-12', lg: 'w-16 h-16 text-xl' };
  const name = doctor.name || doctor.Name || '';
  
  return doctor.profile_picture_url ? (
    <img src={doctor.profile_picture_url} alt={name} className={`${sizeMap[size]} rounded-full object-cover`} />
  ) : (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-medium`}>
      {name[0]?.toUpperCase() || '?'}
    </div>
  );
};

const EmptyState = ({ title, description, icon: Icon }) => (
  <div className="text-center py-12">
    <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500">{description}</p>
  </div>
);

// Tabs
interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}
const Tabs = ({ defaultValue, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
}
const TabsList = ({ children }: TabsListProps) => {
  return (
    <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}
const TabsTrigger = ({ value, children }: TabsTriggerProps) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  return (
    <button
      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        activeTab === value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
      onClick={() => setActiveTab(value)}
      type="button"
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
}
const TabsContent = ({ value, children, activeTab }: TabsContentProps) => {
  const context = React.useContext(TabsContext);
  const tab = activeTab ?? context.activeTab;
  return tab === value ? <div>{children}</div> : null;
};

// Tabs context
const TabsContext = React.createContext({ activeTab: '', setActiveTab: (tab: string) => {} });

// Main Component
const DoctorSettings = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [fees, setFees] = useState([]);
  const [organizationId, setOrganizationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSchedule, setNewSchedule] = useState({ weekday: 'Monday', startTime: '09:00', endTime: '17:00', isActive: true });
  const [newFees, setNewFees] = useState({ recurringFees: 0, defaultFees: 0, emergencyFees: 0 });

  const hospitalID = useLocalStorage('hospitalID');
  const { apiCall, loading } = useApiCall(organizationId);

  const fetchOrganizationId = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/check-organization', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      if (!data.organizationId) throw new Error('No organization ID found');
      
      setOrganizationId(data.organizationId);
      sessionStorage.setItem('organizationId', data.organizationId);
    } catch (err) {
      console.error('Failed to fetch organization ID:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      const params = new URLSearchParams({ limit: '50' });
      const data = await apiCall(`/api/doctors/search?${params}`);
      
      const doctorsArray = data.doctors?.map(doc => ({
        doctor_id: doc.DoctorID || doc.doctor_id,
        name: doc.Name || doc.name,
        specialization: typeof doc.Speciality === 'string' ? { primary: doc.Speciality } : doc.specialization || { primary: doc.Speciality || 'General' },
        profile_picture_url: doc.profile_picture_url
      })) || [];
      
      setDoctors(doctorsArray);
      if (doctorsArray.length > 0 && !selectedDoctor) {
        setSelectedDoctor(doctorsArray[0]);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err.message);
      setDoctors([]);
    }
  }, [apiCall, selectedDoctor, organizationId]);

  const fetchDoctorData = useCallback(async () => {
    if (!selectedDoctor || !organizationId) return;
    
    const doctorId = selectedDoctor.doctor_id || selectedDoctor.DoctorID;
    if (!doctorId) return;

    try {
      const [schedulesData, feesData] = await Promise.all([
        apiCall(`/api/doctors/${doctorId}/schedules`).catch(() => []),
        apiCall(`/api/doctors/${doctorId}/fees`).catch(() => [])
      ]);

      const normalizedSchedules = (Array.isArray(schedulesData) ? schedulesData : schedulesData?.data || [])
        .map(s => ({
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
        .map(f => ({
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
      console.error('Failed to load doctor data:', err.message);
      setSchedules([]);
      setFees([]);
    }
  }, [selectedDoctor, apiCall, organizationId]);

  // CRUD Operations
  const handleAddSchedule = async () => {
    if (!selectedDoctor) return;
    
    try {
      const scheduleData = { ...newSchedule, doctorID: selectedDoctor.doctor_id || selectedDoctor.DoctorID };
      await apiCall('/api/doctors/schedules', { method: 'POST', body: JSON.stringify(scheduleData) });
      setNewSchedule({ weekday: 'Monday', startTime: '09:00', endTime: '17:00', isActive: true });
      fetchDoctorData();
    } catch (err) {
      console.error('Failed to add schedule:', err.message);
    }
  };

  const handleDeleteSchedule = async (schedule) => {
    if (!confirm('Delete this schedule?')) return;
    
    try {
      const doctorId = selectedDoctor?.doctor_id || selectedDoctor?.DoctorID;
      if (!organizationId) throw new Error('Organization ID not available');
      
      const compositeId = `${doctorId}_${schedule.weekday}_${organizationId}`;
      const response = await apiCall(`/api/doctors/schedules/${compositeId}`, { method: 'DELETE' });
      
      if (response.message || response.success !== false) {
        fetchDoctorData();
      } else {
        throw new Error(response.error || 'Failed to delete schedule');
      }
    } catch (err) {
      console.error('Delete schedule error:', err);
    }
  };

  const handleUpdateFees = async () => {
    if (!selectedDoctor) return;
    
    try {
      const feesData = { ...newFees, doctorID: selectedDoctor.doctor_id || selectedDoctor.DoctorID, hospitalID, organizationId };
      const method = fees.length > 0 ? 'PUT' : 'POST';
      const url = fees.length > 0 ? `/api/doctors/${selectedDoctor.doctor_id || selectedDoctor.DoctorID}/fees` : '/api/doctors/fees';
      
      await apiCall(url, { method, body: JSON.stringify(feesData) });
      fetchDoctorData();
    } catch (err) {
      console.error('Failed to update fees:', err.message);
    }
  };

  const handleDeleteFees = async (fee) => {
    if (!confirm('Delete this fee structure?')) return;
    
    try {
      const doctorId = selectedDoctor?.doctor_id || selectedDoctor?.DoctorID;
      if (!organizationId) throw new Error('Organization ID not available');
      
      const compositeId = `${doctorId}_${organizationId}`;
      const response = await apiCall(`/api/doctors/fees/${compositeId}`, { method: 'DELETE' });
      
      if (response.message || response.success !== false) {
        setNewFees({ recurringFees: 0, defaultFees: 0, emergencyFees: 0 });
        fetchDoctorData();
      } else {
        throw new Error(response.error || 'Failed to delete fees');
      }
    } catch (err) {
      console.error('Delete fees error:', err);
    }
  };

  // Effects
  useEffect(() => {
    const cachedOrgId = sessionStorage.getItem('organizationId');
    if (cachedOrgId) {
      setOrganizationId(cachedOrgId);
    }
    fetchOrganizationId();
  }, []);

  useEffect(() => {
    if (organizationId) {
      fetchDoctors();
    }
  }, [fetchDoctors, organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchDoctorData();
    }
  }, [fetchDoctorData, organizationId]);

  const filteredSchedules = schedules.filter(s => s.isActive);

  // Fee input local states
  const [defaultFeesInput, setDefaultFeesInput] = useState(newFees.defaultFees === 0 ? "" : String(newFees.defaultFees));
  const [recurringFeesInput, setRecurringFeesInput] = useState(newFees.recurringFees === 0 ? "" : String(newFees.recurringFees));
  const [emergencyFeesInput, setEmergencyFeesInput] = useState(newFees.emergencyFees === 0 ? "" : String(newFees.emergencyFees));

  useEffect(() => {
    setDefaultFeesInput(newFees.defaultFees === 0 ? "" : String(newFees.defaultFees));
  }, [newFees.defaultFees]);
  useEffect(() => {
    setRecurringFeesInput(newFees.recurringFees === 0 ? "" : String(newFees.recurringFees));
  }, [newFees.recurringFees]);
  useEffect(() => {
    setEmergencyFeesInput(newFees.emergencyFees === 0 ? "" : String(newFees.emergencyFees));
  }, [newFees.emergencyFees]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Settings</h1>
          <p className="text-gray-600">Manage doctor schedules and fees</p>
        </div>

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
                    <div className="flex justify-center py-8"><LoadingSpinner /></div>
                  ) : doctors.length === 0 ? (
                    <EmptyState title="No Doctors Found" description="Try adjusting your search criteria" icon={User} />
                  ) : (
                    <div className="space-y-2 p-4">
                      {doctors.map((doctor) => {
                        const doctorId = doctor.doctor_id || doctor.DoctorID;
                        const selectedId = selectedDoctor?.doctor_id || selectedDoctor?.DoctorID;
                        const isSelected = doctorId === selectedId;
                        
                        return (
                          <button
                            key={doctorId}
                            className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-2 ${
                              isSelected
                                ? 'bg-blue-500 border-blue-500 text-white shadow-lg transform scale-[1.02]'
                                : 'bg-white border-gray-100 text-gray-900 hover:bg-gray-50 hover:border-gray-200 shadow-sm'
                            }`}
                            onClick={() => setSelectedDoctor(doctor)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`relative ${isSelected ? 'ring-2 ring-white ring-opacity-50 rounded-full' : ''}`}>
                                <DoctorAvatar doctor={doctor} size="sm" />
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                  {doctor.name || doctor.Name}
                                </h4>
                                <p className={`text-sm truncate ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {typeof doctor.specialization === 'string' 
                                    ? doctor.specialization 
                                    : doctor.specialization?.primary || doctor.Speciality || 'General'}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <Button onClick={fetchOrganizationId}>Try Again</Button>
                </CardContent>
              </Card>
            ) : !selectedDoctor ? (
              <Card>
                <CardContent>
                  <EmptyState 
                    title="Select a Doctor" 
                    description="Choose a doctor from the list to manage their settings" 
                    icon={User} 
                  />
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="schedule">
                <TabsList>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="fees">Fees</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Schedule Management</h3>
                      <Badge variant="secondary">
                        {filteredSchedules.length} Active Schedule{filteredSchedules.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {/* Add New Schedule */}
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
                              placeholder="Select day"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredSchedules.length === 0 ? (
                        <div className="md:col-span-2 xl:col-span-3">
                          <EmptyState 
                            title="No Schedules Found" 
                            description="Add a schedule to get started" 
                            icon={Clock} 
                          />
                        </div>
                      ) : (
                        filteredSchedules.map((schedule) => (
                          <Card key={schedule.id || `${schedule.weekday}-${schedule.startTime}`}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{schedule.weekday}</h4>
                                  <p className="text-sm text-gray-500">
                                    {schedule.startTime} - {schedule.endTime}
                                  </p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteSchedule(schedule)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {(() => {
                                    const start = new Date(`1970-01-01T${schedule.startTime}`);
                                    const end = new Date(`1970-01-01T${schedule.endTime}`);
                                    const duration = (!isNaN(start.getTime()) && !isNaN(end.getTime())) ? (end.getTime() - start.getTime()) / (1000 * 60 * 60) : 0;
                                    return `${duration} hours`;
                                  })()}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fees">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">Fee Structure</h3>
                      <Badge variant="secondary">
                        {fees.length > 0 ? 'Configured' : 'Not Set'}
                      </Badge>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Consultation Fees
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <Label>Default Consultation (₹)</Label>
                            <Input 
                              type="number" 
                              value={defaultFeesInput}
                              onChange={e => setDefaultFeesInput(e.target.value)}
                              onFocus={e => { if (defaultFeesInput === "0") setDefaultFeesInput(""); }}
                              onBlur={e => {
                                const val = e.target.value;
                                setNewFees(fees => ({ ...fees, defaultFees: val === "" ? 0 : Number(val) }));
                                setDefaultFeesInput(val === "" ? "" : String(Number(val)));
                              }}
                              placeholder="Enter default fee"
                            />
                          </div>
                          <div>
                            <Label>Recurring Consultation (₹)</Label>
                            <Input 
                              type="number" 
                              value={recurringFeesInput}
                              onChange={e => setRecurringFeesInput(e.target.value)}
                              onFocus={e => { if (recurringFeesInput === "0") setRecurringFeesInput(""); }}
                              onBlur={e => {
                                const val = e.target.value;
                                setNewFees(fees => ({ ...fees, recurringFees: val === "" ? 0 : Number(val) }));
                                setRecurringFeesInput(val === "" ? "" : String(Number(val)));
                              }}
                              placeholder="Enter recurring fee"
                            />
                          </div>
                          <div>
                            <Label>Emergency Consultation (₹)</Label>
                            <Input 
                              type="number" 
                              value={emergencyFeesInput}
                              onChange={e => setEmergencyFeesInput(e.target.value)}
                              onFocus={e => { if (emergencyFeesInput === "0") setEmergencyFeesInput(""); }}
                              onBlur={e => {
                                const val = e.target.value;
                                setNewFees(fees => ({ ...fees, emergencyFees: val === "" ? 0 : Number(val) }));
                                setEmergencyFeesInput(val === "" ? "" : String(Number(val)));
                              }}
                              placeholder="Enter emergency fee"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <Button onClick={handleUpdateFees} disabled={loading} className="flex-1">
                            {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
                            {fees.length > 0 ? 'Update Fees' : 'Save Fees'}
                          </Button>
                          {fees.length > 0 && (
                            <Button 
                              variant="destructive" 
                              onClick={() => handleDeleteFees(fees[0])}
                              disabled={loading}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Current Fee Structure Display */}
                    {fees.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Current Fee Structure</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">Default</span>
                              </div>
                              <p className="text-2xl font-bold text-blue-900">₹{fees[0]?.defaultFees || 0}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-900">Recurring</span>
                              </div>
                              <p className="text-2xl font-bold text-green-900">₹{fees[0]?.recurringFees || 0}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-900">Emergency</span>
                              </div>
                              <p className="text-2xl font-bold text-red-900">₹{fees[0]?.emergencyFees || 0}</p>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-600">
                              Last updated: {new Date(fees[0]?.createdAt || new Date()).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;