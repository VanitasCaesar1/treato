"use client"
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// Types
interface Doctor {
  doctor_id: string;
  auth_id: string;
  username: string;
  profile_picture_url: string;
  name: string;
  specialization: {
    primary: string;
    secondary?: string;
  };
  is_active: boolean;
}

interface Schedule {
  doctorID: string;
  hospitalID: string;
  weekday: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  id?: string; // Added ID for deletion
}

interface Fees {
  doctorID: string;
  hospitalID: string;
  doctorName: string;
  recurringFees: number;
  defaultFees: number;
  emergencyFees: number;
  createdAt: string;
  id?: string; // Added ID for deletion
}

const DoctorSettings: React.FC = () => {
  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [fees, setFees] = useState<Fees[]>([]);
  const [activeTab, setActiveTab] = useState<'schedules' | 'fees'>('schedules');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // New schedule form state
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
    weekday: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    isActive: true
  });
  
  // New fees form state
  const [newFees, setNewFees] = useState<Partial<Fees>>({
    recurringFees: 0,
    defaultFees: 0,
    emergencyFees: 0
  });

  // Fetch all doctors in the organization
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        // Use the new API route for fetching doctors in the organization
        const response = await fetch('/api/doctors/organization');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure the response is an array
        const doctorsArray = Array.isArray(data) ? data : 
          (data && data.data && Array.isArray(data.data)) ? data.data : [];
        
        setDoctors(doctorsArray);
        if (doctorsArray.length > 0) {
          setSelectedDoctor(doctorsArray[0]);
        }
      } catch (err: any) {
        setError('Failed to fetch doctors: ' + (err.message || 'Unknown error'));
        // Ensure doctors is an empty array on error
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);

  // Fetch selected doctor's schedules and fees
  useEffect(() => {
    if (selectedDoctor) {
      const fetchDoctorData = async () => {
        setLoading(true);
        try {
          // Use the new API routes for fetching schedules and fees
          const schedulesResponse = await fetch(`/api/doctors/${selectedDoctor.doctor_id}/schedules`);
          
          if (!schedulesResponse.ok) {
            throw new Error(`HTTP error when fetching schedules! Status: ${schedulesResponse.status}`);
          }
          
          const schedulesData = await schedulesResponse.json();
          
          // Ensure the response is an array
          const schedulesArray = Array.isArray(schedulesData) ? schedulesData : 
                                (schedulesData && schedulesData.data && Array.isArray(schedulesData.data)) ? 
                                schedulesData.data : [];
          setSchedules(schedulesArray);
          
          const feesResponse = await fetch(`/api/doctors/${selectedDoctor.doctor_id}/fees`);
          
          if (!feesResponse.ok) {
            throw new Error(`HTTP error when fetching fees! Status: ${feesResponse.status}`);
          }
          
          const feesData = await feesResponse.json();
          
          // Ensure the response is an array
          const feesArray = Array.isArray(feesData) ? feesData : 
                           (feesData && feesData.data && Array.isArray(feesData.data)) ? 
                           feesData.data : [];
          setFees(feesArray);
        } catch (err: any) {
          setError('Failed to fetch doctor data: ' + (err.message || 'Unknown error'));
          // Ensure schedules and fees are empty arrays on error
          setSchedules([]);
          setFees([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchDoctorData();
    }
  }, [selectedDoctor]);

  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setError(null);
  };

  // Handle schedule creation
  const handleAddSchedule = async () => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      const scheduleData = {
        ...newSchedule,
        doctorID: selectedDoctor.doctor_id,
        hospitalID: localStorage.getItem('hospitalID') || '' // Assuming hospital ID is stored in localStorage
      };
      
      // Use the new API route for creating schedules
      const response = await fetch('/api/doctors/schedules', {
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
      const updatedSchedulesResponse = await fetch(`/api/doctors/${selectedDoctor.doctor_id}/schedules`);
      
      if (!updatedSchedulesResponse.ok) {
        throw new Error(`HTTP error when refreshing schedules! Status: ${updatedSchedulesResponse.status}`);
      }
      
      const updatedSchedulesData = await updatedSchedulesResponse.json();
      
      // Ensure the response is an array
      const schedulesArray = Array.isArray(updatedSchedulesData) ? updatedSchedulesData : 
                            (updatedSchedulesData && updatedSchedulesData.data && Array.isArray(updatedSchedulesData.data)) ? 
                            updatedSchedulesData.data : [];
      setSchedules(schedulesArray);
      
      // Reset form
      setNewSchedule({
        weekday: 'Monday',
        startTime: '09:00',
        endTime: '17:00',
        isActive: true
      });
      
      setError(null);
    } catch (err: any) {
      setError('Failed to add schedule: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle schedule deletion
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      // Use the new API route for deleting schedules
      const response = await fetch(`/api/doctors/schedules/${scheduleId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh schedules
      const updatedSchedulesResponse = await fetch(`/api/doctors/${selectedDoctor.doctor_id}/schedules`);
      
      if (!updatedSchedulesResponse.ok) {
        throw new Error(`HTTP error when refreshing schedules! Status: ${updatedSchedulesResponse.status}`);
      }
      
      const updatedSchedulesData = await updatedSchedulesResponse.json();
      
      // Ensure the response is an array
      const schedulesArray = Array.isArray(updatedSchedulesData) ? updatedSchedulesData : 
                            (updatedSchedulesData && updatedSchedulesData.data && Array.isArray(updatedSchedulesData.data)) ? 
                            updatedSchedulesData.data : [];
      setSchedules(schedulesArray);
      
      setError(null);
    } catch (err: any) {
      setError('Failed to delete schedule: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle fees update
  const handleUpdateFees = async () => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      const feesData = {
        ...newFees,
        doctorID: selectedDoctor.doctor_id,
        doctorName: selectedDoctor.name,
        hospitalID: localStorage.getItem('hospitalID') || '' // Assuming hospital ID is stored in localStorage
      };
      
      // Use the new API route for updating fees
      const response = await fetch('/api/doctors/fees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feesData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh fees
      const updatedFeesResponse = await fetch(`/api/doctors/${selectedDoctor.doctor_id}/fees`);
      
      if (!updatedFeesResponse.ok) {
        throw new Error(`HTTP error when refreshing fees! Status: ${updatedFeesResponse.status}`);
      }
      
      const updatedFeesData = await updatedFeesResponse.json();
      
      // Ensure the response is an array
      const feesArray = Array.isArray(updatedFeesData) ? updatedFeesData : 
                        (updatedFeesData && updatedFeesData.data && Array.isArray(updatedFeesData.data)) ? 
                        updatedFeesData.data : [];
      setFees(feesArray);
      
      // Reset form
      setNewFees({
        recurringFees: 0,
        defaultFees: 0,
        emergencyFees: 0
      });
      
      setError(null);
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
      // Use the new API route for deleting fees
      const response = await fetch(`/api/doctors/fees/${feesId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh fees
      const updatedFeesResponse = await fetch(`/api/doctors/${selectedDoctor.doctor_id}/fees`);
      
      if (!updatedFeesResponse.ok) {
        throw new Error(`HTTP error when refreshing fees! Status: ${updatedFeesResponse.status}`);
      }
      
      const updatedFeesData = await updatedFeesResponse.json();
      
      // Ensure the response is an array
      const feesArray = Array.isArray(updatedFeesData) ? updatedFeesData : 
                        (updatedFeesData && updatedFeesData.data && Array.isArray(updatedFeesData.data)) ? 
                        updatedFeesData.data : [];
      setFees(feesArray);
      
      setError(null);
    } catch (err: any) {
      setError('Failed to delete fees: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Settings</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Doctor List Sidebar */}
        <div className="md:col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Doctors</h2>
          
          {loading && doctors.length === 0 ? (
            <p>Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p>No doctors found.</p>
          ) : (
            <ul className="space-y-2">
              {doctors.map((doctor) => (
                <li 
                  key={doctor.doctor_id}
                  className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedDoctor?.doctor_id === doctor.doctor_id ? 'bg-blue-100' : ''}`}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="flex items-center">
                    {doctor.profile_picture_url ? (
                      <img src={doctor.profile_picture_url} alt={doctor.name} className="w-8 h-8 rounded-full mr-2" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                        {doctor.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-gray-600">{doctor.specialization.primary}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
         {/* Main Content Area */}
         <div className="md:col-span-3 bg-white p-4 rounded shadow">
          {selectedDoctor ? (
            <>
              <div className="flex items-center mb-6">
                {selectedDoctor.profile_picture_url ? (
                  <img src={selectedDoctor.profile_picture_url} alt={selectedDoctor.name} className="w-16 h-16 rounded-full mr-4" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 mr-4 flex items-center justify-center text-2xl">
                    {selectedDoctor.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{selectedDoctor.name}</h2>
                  <p className="text-gray-600">{selectedDoctor.specialization.primary}</p>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('schedules')}
                    className={`py-2 px-1 ${activeTab === 'schedules' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Schedules
                  </button>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className={`py-2 px-1 ${activeTab === 'fees' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Fees
                  </button>
                </nav>
              </div>
              
              {/* Schedules Tab */}
              {activeTab === 'schedules' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Schedules</h3>
                  
                  {/* Add Schedule Form */}
                  <div className="bg-gray-50 p-4 rounded mb-6">
                    <h4 className="font-medium mb-2">Add New Schedule</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weekday</label>
                        <select
                          value={newSchedule.weekday}
                          onChange={(e) => setNewSchedule({...newSchedule, weekday: e.target.value})}
                          className="w-full border border-gray-300 rounded p-2"
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
                          className="w-full border border-gray-300 rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={newSchedule.endTime}
                          onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                          className="w-full border border-gray-300 rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={newSchedule.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setNewSchedule({...newSchedule, isActive: e.target.value === 'active'})}
                          className="w-full border border-gray-300 rounded p-2"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleAddSchedule}
                      disabled={loading}
                      className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                      {loading ? 'Adding...' : 'Add Schedule'}
                    </button>
                  </div>
                  
                  {/* Schedules List */}
                  {loading && schedules.length === 0 ? (
                    <p>Loading schedules...</p>
                  ) : schedules.length === 0 ? (
                    <p>No schedules found.</p>
                  ) : (
                    <div className="overflow-x-auto">
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
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">{schedule.weekday}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{schedule.startTime}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{schedule.endTime}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {schedule.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => handleDeleteSchedule(schedule.id || '')}
                                  className="text-red-600 hover:text-red-900"
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
                  <h3 className="text-xl font-semibold mb-4">Fees</h3>
                  
                  {/* Add/Update Fees Form */}
                  <div className="bg-gray-50 p-4 rounded mb-6">
                    <h4 className="font-medium mb-2">Update Fees</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Fees</label>
                        <input
                          type="number"
                          value={newFees.defaultFees}
                          onChange={(e) => setNewFees({...newFees, defaultFees: Number(e.target.value)})}
                          className="w-full border border-gray-300 rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recurring Fees</label>
                        <input
                          type="number"
                          value={newFees.recurringFees}
                          onChange={(e) => setNewFees({...newFees, recurringFees: Number(e.target.value)})}
                          className="w-full border border-gray-300 rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Fees</label>
                        <input
                          type="number"
                          value={newFees.emergencyFees}
                          onChange={(e) => setNewFees({...newFees, emergencyFees: Number(e.target.value)})}
                          className="w-full border border-gray-300 rounded p-2"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleUpdateFees}
                      disabled={loading}
                      className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                      {loading ? 'Updating...' : 'Update Fees'}
                    </button>
                  </div>
                  
                  {/* Fees List */}
                  {loading && fees.length === 0 ? (
                    <p>Loading fees...</p>
                  ) : fees.length === 0 ? (
                    <p>No fees found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Fees</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring Fees</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emergency Fees</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {fees.map((fee, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">{fee.hospitalID}</td>
                              <td className="px-6 py-4 whitespace-nowrap">${fee.defaultFees}</td>
                              <td className="px-6 py-4 whitespace-nowrap">${fee.recurringFees}</td>
                              <td className="px-6 py-4 whitespace-nowrap">${fee.emergencyFees}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{new Date(fee.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => handleDeleteFees(fee.id || '')}
                                  className="text-red-600 hover:text-red-900"
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
            <div className="text-center py-12">
              <p className="text-gray-500">Select a doctor to view and manage their schedules and fees.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;