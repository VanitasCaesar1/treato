"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter, 
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  organizationID?: string;
  doctorName?: string;
  recurringFees: number;
  defaultFees: number;
  emergencyFees: number;
  createdAt: string;
  id?: string;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorSettings: React.FC = () => {
  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [fees, setFees] = useState<Fees[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('name');
  const [specialityFilter, setSpecialityFilter] = useState<string>("all");
  const [specialities, setSpecialities] = useState<string[]>([]);
  
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
  
  // Focus states for fee inputs
  const [focusedFeeInput, setFocusedFeeInput] = useState<string | null>(null);

  const organizationID = useMemo(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('organizationID') || '' : '';
  }, []);

  const hospitalID = useMemo(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('hospitalID') || '' : '';
  }, []);

  // Fetch all doctors
  const fetchDoctors = async (query = '', by = 'name', speciality = '') => {
    try {
      setLoading(true);
      
      let url = '/api/doctors/search?';
      if (query) url += `q=${encodeURIComponent(query)}&`;
      if (by) url += `by=${encodeURIComponent(by)}&`;
      if (speciality && speciality !== "all") url += `speciality=${encodeURIComponent(speciality)}&`;
      url += 'limit=50';
      
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      
      // Normalize doctor data
      const doctorsArray = data.doctors?.map((doc: any) => ({
        doctor_id: doc.DoctorID || doc.doctor_id,
        name: doc.Name || doc.name,
        specialization: typeof doc.Speciality === 'string' 
          ? { primary: doc.Speciality } 
          : doc.specialization || { primary: doc.Speciality || 'General' },
        profile_picture_url: doc.profile_picture_url
      })) || [];
      
      setDoctors(doctorsArray);
      
      // Extract unique specialities
      const allSpecialities = doctorsArray
        .map((doc: Doctor) => 
          typeof doc.specialization === 'object' ? doc.specialization?.primary : doc.Speciality || ''
        )
        .filter((spec): spec is string => typeof spec === 'string' && spec !== '');
      
      setSpecialities([...new Set<string>(allSpecialities)]);
      
      // Select first doctor if no doctor is selected
      if (doctorsArray.length > 0 && !selectedDoctor) {
        setSelectedDoctor(doctorsArray[0]);
      }
      
    } catch (err: any) {
      toast.error('Failed to fetch doctors: ' + (err.message || 'Unknown error'));
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch selected doctor's data
  useEffect(() => {
    if (selectedDoctor) fetchDoctorData();
  }, [selectedDoctor]);

  const fetchDoctorData = async () => {
    if (!selectedDoctor) return;
    
    setLoading(true);
    try {
      const doctorId = selectedDoctor.doctor_id || selectedDoctor.DoctorID;
      
      if (!doctorId) throw new Error('Invalid doctor ID');
      
      // Fetch schedules
      const schedulesResponse = await fetch(`/api/doctors/${doctorId}/schedules`);
      if (!schedulesResponse.ok) {
        const errorData = await schedulesResponse.json();
        throw new Error(`Error fetching schedules: ${errorData.error || schedulesResponse.status}`);
      }
      
      const schedulesData = await schedulesResponse.json();
      console.log("Raw schedules data received:", schedulesData);
      
      // Process and normalize the schedules data
      let schedulesArray = [];
      
      if (Array.isArray(schedulesData)) {
        schedulesArray = schedulesData;
      } else if (schedulesData?.data && Array.isArray(schedulesData.data)) {
        schedulesArray = schedulesData.data;
      } else if (typeof schedulesData === 'object' && schedulesData !== null) {
        schedulesArray = [schedulesData];
      }
      
      // Ensure each schedule has properly formatted properties and IDs
      const normalizedSchedules = schedulesArray.map(schedule => ({
        id: schedule.id || schedule.ID || schedule._id || '',
        doctorID: schedule.doctorID || schedule.doctor_id || schedule.DoctorID || '',
        hospitalID: schedule.hospitalID || schedule.hospital_id || schedule.HospitalID || '',
        weekday: schedule.weekday || schedule.Weekday || '',
        startTime: schedule.startTime || schedule.start_time || '',
        endTime: schedule.endTime || schedule.end_time || '',
        isActive: typeof schedule.isActive === 'boolean' ? schedule.isActive : 
                  typeof schedule.is_active === 'boolean' ? schedule.is_active : true
      }));
      
      setSchedules(normalizedSchedules);
      
      // Fetch fees
      const feesResponse = await fetch(`/api/doctors/${doctorId}/fees`);
      if (!feesResponse.ok) {
        const errorData = await feesResponse.json();
        throw new Error(`Error fetching fees: ${errorData.error || feesResponse.status}`);
      }

      const feesData = await feesResponse.json();
      console.log("Raw fees data received:", feesData);
      
      // Process fees data - handle various response structures
      let feesArray = [];
      if (Array.isArray(feesData)) {
        feesArray = feesData;
      } else if (feesData?.data && Array.isArray(feesData.data)) {
        feesArray = feesData.data;
      } else if (typeof feesData === 'object' && feesData !== null) {
        // If it's a single object, wrap it in an array
        feesArray = [feesData];
      }
      
      // Normalize the fees data structure
      const normalizedFees = feesArray.map(fee => ({
        id: fee.id || fee._id || '',
        doctorID: fee.doctorID || fee.doctor_id || '',
        hospitalID: fee.hospitalID || fee.hospital_id || '',
        organizationID: fee.organizationID || fee.organization_id || '',
        recurringFees: Number(fee.recurringFees || fee.recurring_fees || 0),
        defaultFees: Number(fee.defaultFees || fee.default_fees || 0),
        emergencyFees: Number(fee.emergencyFees || fee.emergency_fees || 0),
        createdAt: fee.createdAt || fee.created_at || new Date().toISOString()
      }));
      
      console.log("Normalized fees:", normalizedFees);
      setFees(normalizedFees);
      
      // Update the fee form with existing values if available
      if (normalizedFees.length > 0) {
        setNewFees({
          recurringFees: normalizedFees[0].recurringFees,
          defaultFees: normalizedFees[0].defaultFees,
          emergencyFees: normalizedFees[0].emergencyFees
        });
      } else {
        // Reset to defaults if no fees found
        setNewFees({
          recurringFees: 0,
          defaultFees: 0,
          emergencyFees: 0
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Failed to load doctor data: ' + errorMessage);
      console.error('Error loading doctor data:', err);
      setSchedules([]);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleAddSchedule = async () => {
    if (!selectedDoctor) return;
    
    try {
      setLoading(true);
      
      // Ensure doctorID is correctly passed
      const scheduleData = {
        ...newSchedule,
        doctorID: selectedDoctor.doctor_id || selectedDoctor.DoctorID
      };
      
      const response = await fetch('/api/doctors/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      
      // Wait for the response and get the created schedule data
      const createdSchedule = await response.json();
      
      // Update the local state with the newly created schedule
      if (createdSchedule.id) {
        setSchedules(prevSchedules => [...prevSchedules, createdSchedule]);
        toast.success('Schedule added successfully');
        
        // Reset the form
        setNewSchedule({
          weekday: 'Monday',
          startTime: '09:00',
          endTime: '17:00',
          isActive: true
        });
      } else {
        // If no ID was returned, fetch all schedules again
        await fetchDoctorData();
        toast.success('Schedule added successfully');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Failed to add schedule: ' + errorMessage);
      console.error('Error adding schedule:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle schedule deletion
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/doctors/schedules/${scheduleId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      await fetchDoctorData();
      toast.success('Schedule deleted successfully');
      
    } catch (err: any) {
      toast.error('Failed to delete schedule: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateFees = async () => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor first');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get doctor ID
      const doctorId = selectedDoctor.doctor_id || selectedDoctor.DoctorID;
      
      if (!doctorId) {
        toast.error('Invalid doctor ID');
        return;
      }
      
      const existingFee = fees.length > 0 ? fees[0] : null;
      
      // Format fee values as numbers and include organizationID
      const feesData = {
        doctorID: doctorId,
        organizationID: organizationID, // This is critical - use the organizationID from localStorage
        recurringFees: Number(newFees.recurringFees) || 0,
        defaultFees: Number(newFees.defaultFees) || 0,
        emergencyFees: Number(newFees.emergencyFees) || 0,
      };
      
      console.log('Sending fees data:', feesData);
      
      let response;
      if (existingFee?.id) {
        // Update existing fees
        response = await fetch(`/api/doctors/fees/${existingFee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...feesData,
            feesID: existingFee.id 
          })
        });
      } else {
        // Create new fees
        response = await fetch('/api/doctors/fees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feesData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      await fetchDoctorData();
      toast.success(existingFee ? 'Fees updated successfully' : 'Fees created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Failed to update fees: ' + errorMessage);
      console.error('Error updating fees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle fees deletion - FIXED to use both doctor ID and organization ID
  const handleDeleteFees = async () => {
    if (!selectedDoctor) return;
    if (!confirm('Are you sure you want to delete these fees?')) return;
    
    try {
      setLoading(true);
      const doctorId = selectedDoctor.doctor_id || selectedDoctor.DoctorID;
      
      // Since our backend uses composite primary key (doctor_id, organization_id),
      // we need to make sure our API route handles this properly
      const response = await fetch(`/api/doctors/${doctorId}/fees`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      
      await fetchDoctorData();
      toast.success('Fees deleted successfully');
      
    } catch (err: any) {
      toast.error('Failed to delete fees: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Helper to format times
  const formatTime = (timeString: string) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
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

  // Doctor avatar component
  const DoctorAvatar = ({ doctor, size = 'md' }: { doctor: Doctor, size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-10 h-10 text-sm',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-xl'
    };
    
    return doctor.profile_picture_url ? (
      <img 
        src={doctor.profile_picture_url} 
        alt={doctor.name || doctor.Name || ''} 
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    ) : (
      <div className={`${sizeClasses[size]} rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium`}>
        {(doctor.name?.[0] || doctor.Name?.[0] || '?').toUpperCase()}
      </div>
    );
  };

  // Loading spinner
  const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    };
    
    return (
      <div className={`animate-spin ${sizeClasses[size]} border-2 border-gray-500 border-t-transparent rounded-full`} />
    );
  };
  
  // Helper function to handle fee input display based on focus
  const getDisplayValue = (field, value) => {
    if (value === null || value === undefined || value === 0) {
      return '';
    }
    return value;
  };

  return (
    <div className="container mx-auto p-4 mt-4">
      <h1 className="text-3xl font-bold mb-6">Doctor Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Doctor Search & List Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchDoctors(searchQuery, searchFilter, specialityFilter)}
                  className="pr-10"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => fetchDoctors(searchQuery, searchFilter, specialityFilter)}
                  disabled={loading}
                  className="absolute right-0 top-0 h-full"
                >
                  {loading ? <LoadingSpinner size="sm" /> : <Search size={18} />}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={searchFilter} onValueChange={setSearchFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">By Name</SelectItem>
                    <SelectItem value="speciality">By Speciality</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Speciality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialities</SelectItem>
                    {specialities.map((spec, index) => (
                      <SelectItem key={index} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Doctors List */}
            {loading && doctors.length === 0 ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No doctors found.</p>
            ) : (
              <div className="overflow-y-auto max-h-96 space-y-2">
                {doctors.map((doctor) => {
                  const isSelected = selectedDoctor?.doctor_id === doctor.doctor_id || 
                                     selectedDoctor?.DoctorID === doctor.DoctorID;
                  return (
                    <div 
                      key={doctor.doctor_id || doctor.DoctorID}
                      className={`p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
                        isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <div className="flex items-center">
                        <DoctorAvatar doctor={doctor} size="sm" />
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{doctor.name || doctor.Name}</p>
                          <p className="text-xs text-gray-500">{getDoctorSpecialization(doctor)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Main Content Area */}
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            {selectedDoctor ? (
              <>
                <div className="flex items-center mb-6">
                  <DoctorAvatar doctor={selectedDoctor} size="lg" />
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-800">{selectedDoctor.name || selectedDoctor.Name}</h2>
                    <p className="text-gray-600">{getDoctorSpecialization(selectedDoctor)}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Tabs defaultValue="schedules">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="schedules">Schedules</TabsTrigger>
                    <TabsTrigger value="fees">Fees</TabsTrigger>
                  </TabsList>
                  
                  {/* Schedules Tab */}
                  <TabsContent value="schedules" className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Working Hours</h3>
                    
                    {/* Add Schedule Form */}
                    <Card className="mb-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Add New Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Weekday</Label>
                            <Select 
                              value={newSchedule.weekday} 
                              onValueChange={(val) => setNewSchedule({...newSchedule, weekday: val})}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {WEEKDAYS.map(day => (
                                  <SelectItem key={day} value={day}>{day}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Start Time</Label>
                            <div className="mt-1">
                              <Input
                                type="time"
                                value={newSchedule.startTime}
                                onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                                className="time-input"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>End Time</Label>
                            <div className="mt-1">
                              <Input
                                type="time"
                                value={newSchedule.endTime}
                                onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                                className="time-input"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Status</Label>
                            <Select 
                              value={newSchedule.isActive ? 'active' : 'inactive'} 
                              onValueChange={(val) => setNewSchedule({...newSchedule, isActive: val === 'active'})}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={handleAddSchedule}
                          disabled={loading}
                          className="mt-2"
                        >
                          {loading ? (
                            <>
                              <LoadingSpinner size="sm" /><span className="ml-2">Adding...</span>
                            </>
                          ) : (
                            <>
                              <Plus size={16} className="mr-2" />
                              Add Schedule
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {/* Schedules List */}
                    {loading && schedules.length === 0 ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : schedules.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No schedules found for this doctor.</p>
                        <p className="text-sm text-gray-400 mt-1">Add a schedule using the form above.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Weekday</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedules.map((schedule, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{schedule.weekday}</TableCell>
                              <TableCell>{formatTime(schedule.startTime)}</TableCell>
                              <TableCell>{formatTime(schedule.endTime)}</TableCell>
                              <TableCell>
                                <Badge variant={schedule.isActive ? "secondary" : "destructive"}>
                                  {schedule.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSchedule(schedule.id || '')}
                                >
                                  <Trash size={16} className="text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                  
                  {/* Fees Tab */}
                  <TabsContent value="fees" className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Consultation Fees</h3>

                    {/* Add/Update Fees Form */}
                    <Card className="mb-6">
                      <CardHeader className="pb-2">
                      <CardTitle className="text-base">{fees.length > 0 ? 'Update Fees' : 'Add Fees'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Recurring Fees (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={getDisplayValue('recurringFees', newFees.recurringFees)}
                              onChange={(e) => setNewFees({...newFees, recurringFees: Number(e.target.value)})}
                              onFocus={() => setFocusedFeeInput('recurringFees')}
                              onBlur={() => setFocusedFeeInput(null)}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label>Default Fees (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={getDisplayValue('defaultFees', newFees.defaultFees)}
                              onChange={(e) => setNewFees({...newFees, defaultFees: Number(e.target.value)})}
                              onFocus={() => setFocusedFeeInput('defaultFees')}
                              onBlur={() => setFocusedFeeInput(null)}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label>Emergency Fees (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={getDisplayValue('emergencyFees', newFees.emergencyFees)}
                              onChange={(e) => setNewFees({...newFees, emergencyFees: Number(e.target.value)})}
                              onFocus={() => setFocusedFeeInput('emergencyFees')}
                              onBlur={() => setFocusedFeeInput(null)}
                              placeholder="0"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          onClick={handleUpdateFees}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <LoadingSpinner size="sm" /><span className="ml-2">Saving...</span>
                            </>
                          ) : (
                            <>
                              <Edit size={16} className="mr-2" />
                              {fees.length > 0 ? 'Update Fees' : 'Add Fees'}
                            </>
                          )}
                        </Button>
                        
                        {fees.length > 0 && (
                          <Button
                            variant="destructive"
                            onClick={handleDeleteFees}
                            disabled={loading}
                          >
                            <Trash size={16} className="mr-2" />
                            Delete Fees
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                    
                    {/* Fees Info */}
                    {loading && fees.length === 0 ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : fees.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No fees configured for this doctor.</p>
                        <p className="text-sm text-gray-400 mt-1">Add fees using the form above.</p>
                      </div>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Current Fees</CardTitle>
                          <CardDescription>Last updated: {new Date(fees[0].createdAt).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Fee Type</TableHead>
                                <TableHead>Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">Recurring Consultation</TableCell>
                                <TableCell>₹{fees[0].recurringFees}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Default Consultation</TableCell>
                                <TableCell>₹{fees[0].defaultFees}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Emergency Consultation</TableCell>
                                <TableCell>₹{fees[0].emergencyFees}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Select a doctor to view and manage their settings.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorSettings;