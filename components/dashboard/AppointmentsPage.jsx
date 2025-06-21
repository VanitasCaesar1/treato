'use client'
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Printer, Download, Search, Clock, Package, User, 
  TimerIcon, LogOut, DollarSign, ChevronRight, Calendar, 
  Plus, Loader2, AlertCircle, RefreshCw, AlarmClock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Constants for styling and configuration
const STATUS_STYLES = {
  completed: "bg-green-50 text-green-600 hover:bg-green-100",
  not_completed: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  cancelled: "bg-red-50 text-red-600 hover:bg-red-100",
  declined: "bg-gray-50 text-gray-600 hover:bg-gray-100",
  scheduled: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  pending: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100",
};

const VALIDITY_STYLES = {
  true: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  false: "bg-red-50 text-red-600 hover:bg-red-100",
};

const DEFAULT_PAGINATION = {
  total: 0,
  limit: 10,
  offset: 0,
};

const DEFAULT_STATS = [
  { label: "Total Appointments", value: "0", icon: <Package className="h-4 w-4" /> },
  { label: "Waiting", value: "0", icon: <TimerIcon className="h-4 w-4" /> },
  { label: "In Progress", value: "0", icon: <Clock className="h-4 w-4" /> },
  { label: "Completed", value: "0", icon: <LogOut className="h-4 w-4" /> },
  { label: "Active Doctors", value: "0", icon: <User className="h-4 w-4" /> },
  { label: "Pending Bills", value: "0", icon: <DollarSign className="h-4 w-4" /> },
];

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  // Create refs at the top level of component
  const prevFiltersRef = useRef(null);
  const prevPaginationRef = useRef(null);
  const initialLoadRef = useRef(false);

  // Filters state - using backend parameter names
  const [filters, setFilters] = useState({
    search: "",
    appointment_status: "all",
    doctor_id: "all",
    fee_type: "all",
    is_valid: "all",
    start_date: "",
  });

  // Form state for filter inputs (separate from actual filters to allow for form validation)
  const [formState, setFormState] = useState({
    search: "",
    appointment_status: "all",
    doctor_id: "all",
    fee_type: "all",
    is_valid: "all",
    start_date: "",
  });

  // Fetch doctors for the dropdown
  const fetchDoctors = useCallback(async () => {
    try {
      setDoctorsLoading(true);
      const response = await fetch('/api/doctors/search?limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Doctors API Response:", data);
      
      // Handle the response format from your API
      const doctorsList = data.doctors || [];
      
      // Map the doctors to a consistent format
      const formattedDoctors = doctorsList.map(doctor => ({
        id: doctor.DoctorID || doctor.doctor_id || doctor.id,
        name: doctor.Name || doctor.name || `Doctor ${doctor.DoctorID || doctor.doctor_id}`,
        speciality: doctor.Speciality || doctor.speciality || doctor.specialization,
      }));
      
      console.log("Formatted doctors:", formattedDoctors);
      setDoctors(formattedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Set empty array instead of throwing to prevent component crash
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  // Process appointments data to ensure consistent format
  const processAppointments = useCallback((data) => {
    if (!data.appointments || !Array.isArray(data.appointments)) return [];

    return data.appointments.map(app => ({
      id: app.id || app.appointment_id || '',
      appointment_id: app.appointment_id || app.appointmentId || app.id || '',
      patient_id: app.patient_id || app.patientId || app.patientID || '',
      doctor_id: app.doctor_id || app.doctorId || app.doctorID || '',
      patient_name: app.patient_name || app.patientName || '',
      doctor_name: app.doctor_name || app.doctorName || '',
      appointment_status: app.appointment_status || app.appointmentStatus || 'not_completed',
      payment_method: app.payment_method || app.paymentMethod || '',
      fee_type: app.fee_type || app.feeType || 'default',
      appointment_fee: app.appointment_fee || app.appointmentFee || 0,
      appointment_date: app.appointment_date || app.appointmentDate || '',
      next_visit_date: app.next_visit_date || app.nextVisitDate || '',
      is_valid: app.is_valid !== undefined ? app.is_valid : (app.isValid !== undefined ? app.isValid : true),
      created_at: app.created_at || app.createdAt || '',
      updated_at: app.updated_at || app.updatedAt || '',
      slot_start_time: app.slot_start_time || app.slotStartTime || '',
      slot_end_time: app.slot_end_time || app.slotEndTime || '',
      diagnosis_id: app.diagnosis_id || app.diagnosisId || '',
      has_diagnosis: !!app.diagnosis_id || !!app.diagnosisId || !!app.has_diagnosis,
    }));
  }, []);

  // Calculate pagination information
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
    
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage > 3) {
        pageNumbers.push("...");
      }
      
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push("...");
      }
      
      pageNumbers.push(totalPages);
    }

    return { totalPages, currentPage, pageNumbers };
  }, [pagination]);

  // FIXED: Fetch appointments from API with proper parameter handling
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      // Build query parameters using correct backend parameter names
      const queryParams = new URLSearchParams();
      
      // Add filters only if they have meaningful values
      if (filters.appointment_status && filters.appointment_status !== "all") {
        queryParams.append("appointment_status", filters.appointment_status);
      }
      
      if (filters.doctor_id && filters.doctor_id !== "all") {
        queryParams.append("doctor_id", filters.doctor_id);
      }
      
      if (filters.fee_type && filters.fee_type !== "all") {
        queryParams.append("fee_type", filters.fee_type);
      }
      
      // FIXED: Handle boolean parameter correctly
      if (filters.is_valid && filters.is_valid !== "all") {
        // Convert string to actual boolean for API
        const booleanValue = filters.is_valid === "true";
        queryParams.append("is_valid", booleanValue.toString());
      }
      
      // FIXED: Handle date parameter with proper formatting
      if (filters.start_date) {
        // Ensure the date is in YYYY-MM-DD format
        const dateValue = new Date(filters.start_date);
        if (!isNaN(dateValue.getTime())) {
          // Format as ISO date string (YYYY-MM-DD)
          const formattedDate = dateValue.toISOString().split('T')[0];
          queryParams.append("start_date", formattedDate);
          
          // Also add end_date for same day filtering (optional - depends on your API)
          // This ensures we get appointments for the entire selected day
          queryParams.append("end_date", formattedDate);
        }
      }

      if (filters.search && filters.search.trim()) {
        queryParams.append("search", filters.search.trim());
      }

      // Pagination parameters
      queryParams.append("limit", pagination.limit.toString());
      queryParams.append("offset", pagination.offset.toString());
      
      console.log("Fetching appointments with params:", queryParams.toString());
      
      // Make API call
      const response = await fetch(`/api/appointments/org?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      
      // Process appointments data
      const processedAppointments = processAppointments(data);
      
      // FIXED: Additional client-side filtering for edge cases
      let filteredAppointments = processedAppointments;
      
      // Client-side validation filter (backup in case backend doesn't handle it correctly)
      if (filters.is_valid !== "all") {
        const expectedValidState = filters.is_valid === "true";
        filteredAppointments = filteredAppointments.filter(app => {
          // Handle both boolean and string values
          const appValidState = app.is_valid === true || app.is_valid === "true";
          return appValidState === expectedValidState;
        });
      }
      
      // Client-side date filter (backup in case backend doesn't handle it correctly)
      if (filters.start_date) {
        const filterDate = new Date(filters.start_date);
        if (!isNaN(filterDate.getTime())) {
          filteredAppointments = filteredAppointments.filter(app => {
            if (!app.appointment_date) return false;
            
            const appDate = new Date(app.appointment_date);
            if (isNaN(appDate.getTime())) return false;
            
            // Compare dates (ignore time)
            const filterDateString = filterDate.toISOString().split('T')[0];
            const appDateString = appDate.toISOString().split('T')[0];
            
            return filterDateString === appDateString;
          });
        }
      }
      
      setAppointments(filteredAppointments);
      
      // Update pagination (use original count for pagination, not filtered count)
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || data.total || processedAppointments.length,
      }));
      
      // Update stats
      updateStats(filteredAppointments, data.stats);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message || 'Failed to fetch appointments');
      
      // Handle specific errors
      if (error.message.includes("Invalid appointment ID format")) {
        setErrorDetails({
          title: "ID Format Error",
          description: "There's an issue with appointment ID validation. This may be a backend configuration issue."
        });
      } else if (error.message.includes("Invalid doctor ID format")) {
        setErrorDetails({
          title: "Doctor ID Format Error",
          description: "The API is expecting doctor IDs in UUID format. Please verify your doctor ID selection."
        });
      } else if (error.message.includes("Organization ID is required")) {
        setErrorDetails({
          title: "Organization ID Missing",
          description: "The X-Organization-ID header is required. Please ensure you're properly authenticated."
        });
      } else if (error.message.includes("Invalid organization ID format")) {
        setErrorDetails({
          title: "Organization ID Format Error",
          description: "The organization ID must be in ULID format with org_ prefix."
        });
      } else if (error.message.includes("Authentication required") || error.message.includes("Unauthorized")) {
        setErrorDetails({
          title: "Authentication Error",
          description: "You need to be logged in to access this data. Please refresh the page or log in again."
        });
      }
      
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset, processAppointments]);

  // Calculate statistics
  const updateStats = useCallback((appointmentsData, backendStats = null) => {
    if (backendStats) {
      setStats(DEFAULT_STATS.map((stat, index) => ({
        ...stat,
        value: backendStats[Object.keys(backendStats)[index]]?.toString() || "0"
      })));
      return;
    }
    
    const total = appointmentsData.length;
    const completed = appointmentsData.filter(app => app.appointment_status === "completed").length;
    const notCompleted = appointmentsData.filter(app => app.appointment_status === "not_completed").length;
    const scheduled = appointmentsData.filter(app => app.appointment_status === "scheduled").length;
    const uniqueDoctors = new Set(appointmentsData.map(app => app.doctor_id)).size;
    
    setStats([
      { label: "Total Appointments", value: total.toString(), icon: <Package className="h-4 w-4" /> },
      { label: "Waiting", value: notCompleted.toString(), icon: <TimerIcon className="h-4 w-4" /> },
      { label: "Scheduled", value: scheduled.toString(), icon: <Clock className="h-4 w-4" /> },
      { label: "Completed", value: completed.toString(), icon: <LogOut className="h-4 w-4" /> },
      { label: "Active Doctors", value: uniqueDoctors.toString(), icon: <User className="h-4 w-4" /> },
      { label: "Pending Bills", value: "0", icon: <DollarSign className="h-4 w-4" /> },
    ]);
  }, []);

  // Format time utility function
  const formatTime = useCallback((timeString) => {
    if (!timeString) return "";
    
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return "Invalid";
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Time formatting error:", e);
      return "Error";
    }
  }, []);

  // Format time range (slot start to slot end)
  const formatSlotTimeRange = useCallback((startTime, endTime) => {
    if (!startTime) return "";
    
    const formattedStart = formatTime(startTime);
    const formattedEnd = endTime ? formatTime(endTime) : "";
    
    if (formattedEnd) {
      return `${formattedStart} - ${formattedEnd}`;
    }
    
    return formattedStart;
  }, [formatTime]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'});
    } catch (e) {
      return "";
    }
  }, []);

  // Event handlers
  const handlePageChange = useCallback((newOffset) => {
    setPagination(prev => ({
      ...prev,
      offset: newOffset
    }));
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // FIXED: Handle search form submission with better validation
  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();

    console.log("Applying filters:", formState);

    // Validate date input
    if (formState.start_date) {
      const dateValue = new Date(formState.start_date);
      if (isNaN(dateValue.getTime())) {
        setError("Invalid date format. Please select a valid date.");
        return;
      }
    }

    // Update filters state with form values
    setFilters({...formState});

    // Reset pagination when filters change
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
    
    // Update URL query params for better shareability
    const newParams = new URLSearchParams();
    
    if (formState.search && formState.search.trim()) newParams.set('search', formState.search.trim());
    if (formState.appointment_status !== 'all') newParams.set('appointment_status', formState.appointment_status);
    if (formState.doctor_id !== 'all') newParams.set('doctor_id', formState.doctor_id);
    if (formState.fee_type !== 'all') newParams.set('fee_type', formState.fee_type);
    if (formState.is_valid !== 'all') newParams.set('is_valid', formState.is_valid);
    if (formState.start_date) newParams.set('start_date', formState.start_date);
    
    const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
    router.push(newUrl, { scroll: false });
    
  }, [formState, router]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      search: "",
      appointment_status: "all",
      doctor_id: "all",
      fee_type: "all",
      is_valid: "all",
      start_date: "",
    };
    
    console.log("Resetting filters to default");
    
    setFormState(defaultFilters);
    setFilters(defaultFilters);
    
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
    
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  // Handle adding a new appointment
  const handleNewAppointment = useCallback(() => {
    router.push('/appointments/new');
  }, [router]);
  
  const handleAppointmentClick = useCallback((appointment) => {
    if (appointment.diagnosis_id) {
      router.push(`/dashboard/op/${appointment.diagnosis_id}`);
    } else {
      router.push(`/dashboard/diagnosis/new?appointmentId=${appointment.appointment_id}`);
    }
  }, [router]);

  // Get doctor name by ID - Fixed to properly look up doctor names
  const getDoctorName = useCallback((doctorId) => {
    if (!doctorId) return "Unknown Doctor";
    
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      return doctor.name;
    }
    
    // Fallback: if doctor not found in list, return a formatted ID
    return `Doctor ${doctorId.substring(0, 8)}...`;
  }, [doctors]);

  // Load initial URL parameters if any
  useEffect(() => {
    if (!initialLoadRef.current) {
      const appointment_status = searchParams.get('appointment_status') || 'all';
      const doctor_id = searchParams.get('doctor_id') || 'all';
      const fee_type = searchParams.get('fee_type') || 'all';
      const is_valid = searchParams.get('is_valid') || 'all';
      const start_date = searchParams.get('start_date') || '';
      const search = searchParams.get('search') || '';
      
      if (appointment_status !== 'all' || doctor_id !== 'all' || fee_type !== 'all' || is_valid !== 'all' || start_date || search) {
        const initialFilters = {
          search,
          appointment_status,
          doctor_id,
          fee_type,
          is_valid,
          start_date,
        };
        
        console.log("Loading initial filters from URL:", initialFilters);
        setFormState(initialFilters);
        setFilters(initialFilters);
      }
      
      initialLoadRef.current = true;
    }
  }, [searchParams]);

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // This effect will trigger whenever filters or pagination changes
  useEffect(() => {
    const currentFilters = JSON.stringify(filters);
    const currentPagination = JSON.stringify({
      limit: pagination.limit,
      offset: pagination.offset
    });
    
    // Only fetch if filters or pagination actually changed, and after initial load
    if (initialLoadRef.current && 
        (prevFiltersRef.current !== currentFilters || prevPaginationRef.current !== currentPagination)) {
      
      console.log("Filters or pagination changed, fetching appointments");
      console.log("Current filters:", filters);
      console.log("Current pagination:", { limit: pagination.limit, offset: pagination.offset });
      
      prevFiltersRef.current = currentFilters;
      prevPaginationRef.current = currentPagination;
      
      fetchAppointments();
    }
  }, [filters, pagination.limit, pagination.offset, fetchAppointments]);

  // Initial load effect
// Initial load effect
  useEffect(() => {
    if (initialLoadRef.current && !prevFiltersRef.current) {
      console.log("Initial load, fetching appointments");
      fetchAppointments();
    }
  }, [fetchAppointments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">Appointments</h1>
          <Button 
            onClick={handleNewAppointment}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400">{stat.icon}</div>
                <span className="text-xl font-medium text-gray-900">
                  {stat.value}
                </span>
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Error displays */}
        {error && errorDetails && (
          <Alert className="mb-6 bg-red-50 border-red-100">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-600">{errorDetails.title}</AlertTitle>
            <AlertDescription className="text-red-600">
              {errorDetails.description}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white border-red-200 text-red-600 hover:bg-red-50"
                  onClick={fetchAppointments}
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Search and filters section */}
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients or doctors..."
                  className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                  value={formState.search}
                  onChange={(e) => handleInputChange('search', e.target.value)}
                />
              </div>
              
              <Select
                value={formState.appointment_status}
                onValueChange={(value) => handleInputChange('appointment_status', value)}
              >
                <SelectTrigger className="w-full md:w-[140px] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not_completed">Not Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={formState.doctor_id}
                onValueChange={(value) => handleInputChange('doctor_id', value)}
                disabled={doctorsLoading}
              >
                <SelectTrigger className="w-full md:w-[180px] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder={doctorsLoading ? "Loading..." : "Select Doctor"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={formState.fee_type}
                onValueChange={(value) => handleInputChange('fee_type', value)}
              >
                <SelectTrigger className="w-full md:w-[140px] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Fee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={formState.is_valid}
                onValueChange={(value) => handleInputChange('is_valid', value)}
              >
                <SelectTrigger className="w-full md:w-[140px] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Validity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="true">Valid Only</SelectItem>
                  <SelectItem value="false">Expired Only</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative flex items-center w-full md:w-auto">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 w-full md:w-[180px]"
                  value={formState.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  placeholder="Select date"
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <Button 
                  onClick={handleSearch}
                  className="bg-blue-600 text-white hover:bg-blue-700 flex-1 md:flex-none"
                >
                  Search
                </Button>
                <Button 
                  onClick={resetFilters}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 md:flex-none"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {error && !errorDetails && (
            <div className="bg-red-50 p-4 border-b border-red-100">
              <p className="text-red-600">Error: {error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 bg-white border-red-200 text-red-600 hover:bg-red-50"
                onClick={fetchAppointments}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Filter summary display */}
          {(filters.appointment_status !== 'all' || 
            filters.doctor_id !== 'all' || 
            filters.fee_type !== 'all' || 
            filters.is_valid !== 'all' || 
            filters.start_date || 
            filters.search) && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <div className="text-sm text-blue-600">
                <span className="font-medium">Active filters:</span>{' '}
                {filters.search && <span className="mr-2 bg-blue-100 px-2 py-1 rounded">Search: "{filters.search}"</span>}
                {filters.appointment_status !== 'all' && <span className="mr-2 bg-blue-100 px-2 py-1 rounded">Status: {filters.appointment_status.replace('_', ' ')}</span>}
                {filters.doctor_id !== 'all' && (
                  <span className="mr-2 bg-blue-100 px-2 py-1 rounded">Doctor: {getDoctorName(filters.doctor_id)}</span>
                )}
                {filters.fee_type !== 'all' && <span className="mr-2 bg-blue-100 px-2 py-1 rounded">Fee: {filters.fee_type}</span>}
                {filters.is_valid !== 'all' && <span className="mr-2 bg-blue-100 px-2 py-1 rounded">Validity: {filters.is_valid === 'true' ? 'Valid' : 'Expired'}</span>}
                {filters.start_date && <span className="mr-2 bg-blue-100 px-2 py-1 rounded">Date: {formatDate(filters.start_date)}</span>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading appointments...</span>
            </div>
          )}

          {/* Appointments table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No appointments found</p>
                        <p className="text-sm">Try adjusting your filters or create a new appointment</p>
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.patient_name || 'Unknown Patient'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {appointment.patient_id?.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.doctor_name || getDoctorName(appointment.doctor_id)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {appointment.doctor_id?.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.appointment_date)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <AlarmClock className="h-3 w-3 mr-1" />
                            {formatSlotTimeRange(appointment.slot_start_time, appointment.slot_end_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={`${STATUS_STYLES[appointment.appointment_status] || STATUS_STYLES.not_completed} capitalize`}
                          >
                            {appointment.appointment_status?.replace('_', ' ') || 'Not Completed'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${appointment.appointment_fee || 0}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {appointment.fee_type || 'default'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            className={`${VALIDITY_STYLES[appointment.is_valid?.toString()] || VALIDITY_STYLES.true}`}
                          >
                            {appointment.is_valid ? 'Valid' : 'Expired'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {appointment.has_diagnosis ? (
                              <Link
                                href={`/dashboard/op/${appointment.diagnosis_id}`}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            ) : (
                              <Link
                                href={`/dashboard/diagnosis/new?appointmentId=${appointment.appointment_id}`}
                                className="text-green-600 hover:text-green-900 flex items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Start
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && appointments.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={pagination.offset === 0}
                    className="border-gray-300"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {paginationInfo.pageNumbers.map((pageNum, index) => (
                      <React.Fragment key={index}>
                        {pageNum === "..." ? (
                          <span className="px-2 text-gray-500">...</span>
                        ) : (
                          <Button
                            variant={pageNum === paginationInfo.currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                            className={pageNum === paginationInfo.currentPage 
                              ? "bg-blue-600 text-white" 
                              : "border-gray-300"
                            }
                          >
                            {pageNum}
                          </Button>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className="border-gray-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}