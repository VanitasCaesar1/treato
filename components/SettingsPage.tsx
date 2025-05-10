"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';

// Types
interface Doctor {
  doctor_id?: string;
  DoctorID?: string;
  name?: string;
  Name?: string;
  profile_picture_url?: string;
  specialization?: {
    primary: string;
    secondary?: string;
  };
  Speciality?: string;
}

interface Schedule {
  doctorID: string;
  hospitalID: string;
  weekday: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  id?: string;
}

interface Fees {
  doctorID: string;
  hospitalID: string;
  doctorName?: string;
  recurringFees: number;
  defaultFees: number;
  emergencyFees: number;
  createdAt: string;
  id?: string;
}

const DoctorSettings: React.FC = () => {
  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [fees, setFees] = useState<Fees[]>([]);
  const [activeTab, setActiveTab] = useState<'schedules' | 'fees'>('schedules');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('name');
  const [specialityFilter, setSpecialityFilter] = useState<string>('');
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingFeesId, setEditingFeesId] = useState<string | null>(null);
  
  // Form states
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
    weekday: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true
  });
  
  const [newFees, setNewFees] = useState<Partial<Fees>>({
    recurringFees: 0,
    defaultFees: 0,
    emergencyFees: 0
  });

  const [updatingSchedule, setUpdatingSchedule] = useState<Partial<Schedule>>({
    weekday: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true
  });

  const [updatingFees, setUpdatingFees] = useState<Partial<Fees>>({
    recurringFees: 0,
    defaultFees: 0,
    emergencyFees: 0
  });

  const hospitalID = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hospitalID') || '';
    }
    return '';
  }, []);

  // Fetch all doctors using the search API
  const fetchDoctors = async (query = '', by = 'name', speciality = '') => {
    try {
      setSearchLoading(true);
      
      // Build query string
      let url = '/api/doctors/search?';
      if (query) url += `q=${encodeURIComponent(query)}&`;
      if (by) url += `by=${encodeURIComponent(by)}&`;
      if (speciality) url += `speciality=${encodeURIComponent(speciality)}&`;
      url += 'limit=50';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Normalize doctor data from search API
      const doctorsArray = data.doctors?.map((doc: any) => ({
        doctor_id: doc.DoctorID || doc.doctor_id,
        name: doc.Name || doc.name,
        specialization: typeof doc.Speciality === 'string' 
          ? { primary: doc.Speciality } 
          : doc.specialization || { primary: doc.Speciality || 'General' },
        profile_picture_url: doc.profile_picture_url
      })) || [];
      
      setDoctors(doctorsArray);
      
      // Extract unique specialities for filter dropdown
      const allSpecialities = doctorsArray.map((doc: Doctor) => {
        if (typeof doc.specialization === 'object' && doc.specialization?.primary) {
          return doc.specialization.primary;
        }
        return doc.Speciality || '';
      }).filter((spec): spec is string => typeof spec === 'string' && spec !== '');
      
      setSpecialities([...new Set<string>(allSpecialities)]);
      
      // Select first doctor if no doctor is selected
      if (doctorsArray.length > 0 && !selectedDoctor) {
        setSelectedDoctor(doctorsArray[0]);
      }
      
    } catch (err: any) {
      setError('Failed to fetch doctors: ' + (err.message || 'Unknown error'));
      setDoctors([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch selected doctor's schedules and fees
  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorData();
    }
  }, [selectedDoctor]);

  const fetchDoctorData = async () => {
    if (!selectedDoctor) return;
    
    setLoading(true);
    try {
      const doctorId = selectedDoctor.doctor_id || selectedDoctor.DoctorID;
      
      if (!doctorId) {
        throw new Error('Invalid doctor ID');
      }
      
      // Fetch schedules
      const schedulesResponse = await fetch(`/api/doctors/${doctorId}/schedules`);
      
      if (!schedulesResponse.ok) {
        throw new Error(`HTTP error when fetching schedules! Status: ${schedulesResponse.status}`);
      }
      
      const schedulesData = await schedulesResponse.json();
      
      // Ensure the response is an array
      const schedulesArray = Array.isArray(schedulesData) ? schedulesData : 
                            (schedulesData && schedulesData.data && Array.isArray(schedulesData.data)) ? 
                            schedulesData.data : [];
      setSchedules(schedulesArray);
      
      // Fetch fees
      const feesResponse = await fetch(`/api/doctors/${doctorId}/fees`);
      
      if (!feesResponse.ok) {
        throw new Error(`HTTP error when fetching fees! Status: ${feesResponse.status}`);
      }
      
      const feesData = await feesResponse.json();
      
      // Ensure the response is an array
      const feesArray = Array.isArray(feesData) ? feesData : 
                       (feesData && feesData.data && Array.isArray(feesData.data)) ? 
                       feesData.data : [];
      setFees(feesArray);
      
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch doctor data: ' + (err.message || 'Unknown error'));
      setSchedules([]);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setError(null);
  };

  // Handle search
  const handleSearch = () => {
    fetchDoctors(searchQuery, searchFilter, specialityFilter);
  };
  
  // Handle schedule creation
  const handleAddSchedule = async () => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      const scheduleData = {
        ...newSchedule,
        doctorID: selectedDoctor.doctor_id || selectedDoctor.DoctorID,
        hospitalID
      };
      
      const response = await fetch('/api/doctors/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh schedules
      await fetchDoctorData();
      
      // Reset form
      setNewSchedule({
        weekday: 'Monday',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true
      });
      
    } catch (err: any) {
      setError('Failed to add schedule: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle schedule update
  const handleUpdateSchedule = async (scheduleId: string) => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      const scheduleData = {
        ...updatingSchedule,
        scheduleID: scheduleId,
        doctorID: selectedDoctor.doctor_id || selectedDoctor.DoctorID,
        hospitalID
      };
      
      const response = await fetch(`/api/doctors/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh schedules
      await fetchDoctorData();
      setEditingScheduleId(null);
      
    } catch (err: any) {
      setError('Failed to update schedule: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle schedule deletion
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/doctors/schedules/${scheduleId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh schedules
      await fetchDoctorData();
      
    } catch (err: any) {
      setError('Failed to delete schedule: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle fees creation
  const handleAddFees = async () => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      const feesData = {
        ...newFees,
        doctorID: selectedDoctor.doctor_id || selectedDoctor.DoctorID,
        doctorName: selectedDoctor.name || selectedDoctor.Name,
        hospitalID
      };
      
      const response = await fetch('/api/doctors/fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feesData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh fees
      await fetchDoctorData();
      
      // Reset form
      setNewFees({
        recurringFees: 0,
        defaultFees: 0,
        emergencyFees: 0
      });
      
    } catch (err: any) {
      setError('Failed to add fees: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle fees update
  const handleUpdateFees = async (feesId?: string) => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      // If we have fees already, update them; otherwise create new ones
      if (feesId) {
        const feesData = {
          ...updatingFees,
          feesID: feesId,
          doctorID: selectedDoctor.doctor_id || selectedDoctor.DoctorID,
          doctorName: selectedDoctor.name || selectedDoctor.Name,
          hospitalID
        };
        
        const response = await fetch(`/api/doctors/fees/${feesId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(feesData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } else {
        // No existing fees, create new ones
        await handleAddFees();
        return;
      }
      
      // Refresh fees
      await fetchDoctorData();
      setEditingFeesId(null);
      
    } catch (err: any) {
      setError('Failed to update fees: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle fees deletion
  const handleDeleteFees = async (feesId: string) => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/doctors/fees/${feesId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh fees
      await fetchDoctorData();
      
    } catch (err: any) {
      setError('Failed to delete fees: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Helper to format times
  const formatTime = (timeString: string) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) {
      return timeString;
    }
  };

  // Get doctor's specialization display
  const getDoctorSpecialization = (doctor: Doctor): string => {
    if (doctor.specialization?.primary) {
      return doctor.specialization.secondary 
        ? `${doctor.specialization.primary}, ${doctor.specialization.secondary}`
        : doctor.specialization.primary;
    }
    return doctor.Speciality || '';
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
  );


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Settings</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <span className="font-medium mr-2">Error:</span> {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-auto text-red-700 hover:text-red-900"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Doctor Search & List Sidebar */}
        <div className="md:col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Doctors</h2>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="flex mb-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full border border-gray-300 rounded-l px-3 py-2 pr-10"
                />
                <button 
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Search size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <select
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="name">By Name</option>
                  <option value="speciality">By Speciality</option>
                </select>
              </div>
              
              <div>
                <select
                  value={specialityFilter}
                  onChange={(e) => setSpecialityFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">All Specialities</option>
                  {specialities.map((spec, index) => (
                    <option key={index} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Doctors List */}
          {searchLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            </div>
          ) : loading && doctors.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No doctors found.</p>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <ul className="space-y-2">
                {doctors.map((doctor) => (
                  <li 
                    key={doctor.doctor_id || doctor.DoctorID}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedDoctor?.doctor_id === doctor.doctor_id || 
                      selectedDoctor?.DoctorID === doctor.DoctorID 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div className="flex items-center">
                      {doctor.profile_picture_url ? (
                        <img 
                          src={doctor.profile_picture_url} 
                          alt={doctor.name || doctor.Name || ''} 
                          className="w-10 h-10 rounded-full mr-3 object-cover" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 mr-3 flex items-center justify-center text-lg font-medium">
                          {(doctor.name?.[0] || doctor.Name?.[0] || '?').toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name || doctor.Name}</p>
                        <p className="text-xs text-gray-500">{getDoctorSpecialization(doctor)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Main Content Area */}
        <div className="md:col-span-3 bg-white p-6 rounded shadow">
          {selectedDoctor ? (
            <>
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                {selectedDoctor.profile_picture_url ? (
                  <img 
                    src={selectedDoctor.profile_picture_url} 
                    alt={selectedDoctor.name || selectedDoctor.Name || ''} 
                    className="w-16 h-16 rounded-full mr-4 object-cover" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 mr-4 flex items-center justify-center text-2xl font-medium">
                    {(selectedDoctor.name?.[0] || selectedDoctor.Name?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedDoctor.name || selectedDoctor.Name}</h2>
                  <p className="text-gray-600">{getDoctorSpecialization(selectedDoctor)}</p>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('schedules')}
                    className={`py-3 px-1 ${
                      activeTab === 'schedules' 
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                        : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                    } transition-colors`}
                  >
                    Schedules
                  </button>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className={`py-3 px-1 ${
                      activeTab === 'fees' 
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                        : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                    } transition-colors`}
                  >
                    Fees
                  </button>
                </nav>
              </div>
              
              {/* Schedules Tab */}
              {activeTab === 'schedules' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Working Hours</h3>
                  
                  {/* Add Schedule Form */}
                  <div className="bg-gray-50 p-5 rounded-lg mb-6 shadow-sm">
                    <h4 className="font-medium mb-3 text-gray-700">Add New Schedule</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weekday</label>
                        <select
                          value={newSchedule.weekday}
                          onChange={(e) => setNewSchedule({...newSchedule, weekday: e.target.value})}
                          className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        >
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={newSchedule.startTime}
                          onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                          className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={newSchedule.endTime}
                          onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                          className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={newSchedule.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setNewSchedule({...newSchedule, isActive: e.target.value === 'active'})}
                          className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleAddSchedule}
                      disabled={loading}
                      className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : 'Add Schedule'}
                    </button>
                  </div>
                  
                  {/* Schedules List */}
                  {loading && schedules.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No schedules found for this doctor.</p>
                      <p className="text-sm text-gray-400 mt-1">Add a schedule using the form above.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weekday</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {schedules.map((schedule, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schedule.weekday}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(`2000-01-01T${schedule.startTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(`2000-01-01T${schedule.endTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {schedule.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleDeleteSchedule(schedule.id || '')}
                                  className="text-red-600 hover:text-red-900 transition-colors focus:outline-none"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                  )}
                </div>
              )}
              
              {/* Fees Tab */}
              {activeTab === 'fees' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Consultation Fees</h3>
                  
                  {/* Add/Update Fees Form */}
                  <div className="bg-gray-50 p-5 rounded-lg mb-6 shadow-sm">
                    <h4 className="font-medium mb-3 text-gray-700">Set Consultation Fees</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Fees</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                          <input
                            type="number"
                            min="0"
                            value={newFees.defaultFees}
                            onChange={(e) => setNewFees({...newFees, defaultFees: Number(e.target.value)})}
                            className="w-full border border-gray-300 rounded p-2 pl-8 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recurring Fees</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                          <input
                            type="number"
                            min="0"
                            value={newFees.recurringFees}
                            onChange={(e) => setNewFees({...newFees, recurringFees: Number(e.target.value)})}
                            className="w-full border border-gray-300 rounded p-2 pl-8 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Fees</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                          <input
                            type="number"
                            min="0"
                            value={newFees.emergencyFees}
                            onChange={(e) => setNewFees({...newFees, emergencyFees: Number(e.target.value)})}
                            className="w-full border border-gray-300 rounded p-2 pl-8 focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateFees()}
                      disabled={loading}
                      className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                      ) : 'Update Fees'}
                    </button>
                  </div>
                  
                  {/* Fees List */}
                  {loading && fees.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : fees.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No fees configured for this doctor.</p>
                      <p className="text-sm text-gray-400 mt-1">Set fees using the form above.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Fees</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring Fees</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emergency Fees</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {fees.map((fee, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {fee.hospitalID}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${fee.defaultFees}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${fee.recurringFees}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${fee.emergencyFees}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(fee.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleDeleteFees(fee.id || '')}
                                  className="text-red-600 hover:text-red-900 transition-colors focus:outline-none"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-500">No Doctor Selected</h3>
              <p className="text-gray-400 mt-1">Please select a doctor from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;

