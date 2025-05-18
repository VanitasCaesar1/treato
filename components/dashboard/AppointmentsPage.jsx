"use client"
// dashboard/op
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

  // Create refs at the top level of component
  const prevFiltersRef = useRef(null);
  const prevPaginationRef = useRef(null);

  // Filters state
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "all",
    doctor: "all",
    feeType: "all",
    validity: "all",
    date: "",
  });

  // Form state for filter inputs
  const [formState, setFormState] = useState({
    searchTerm: "",
    status: "all",
    doctor: "all",
    feeType: "all",
    validity: "all",
    date: "",
  });

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
      // Add proper support for slot times
      slot_start_time: app.slot_start_time || app.slotStartTime || '',
      slot_end_time: app.slot_end_time || app.slotEndTime || '',
      // Track if there's an existing diagnosis
      diagnosis_id: app.diagnosis_id || app.diagnosisId || '',
      has_diagnosis: !!app.diagnosis_id || !!app.diagnosisId || !!app.has_diagnosis,
    }));
  }, []);

  // Calculate pagination information
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
    
    const pageNumbers = [];
    // Calculate which page numbers to show
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Show ellipsis or pages near current
      if (currentPage > 3) {
        pageNumbers.push("...");
      }
      
      // Pages around current
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        pageNumbers.push("...");
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }

    return { totalPages, currentPage, pageNumbers };
  }, [pagination]);

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add filters only if they have meaningful values
      if (filters.status && filters.status !== "all") 
        queryParams.append("appointment_status", filters.status);
      
      if (filters.doctor && filters.doctor !== "all") 
        queryParams.append("doctor_id", filters.doctor);
      
      if (filters.feeType && filters.feeType !== "all") 
        queryParams.append("fee_type", filters.feeType);
      
      if (filters.validity && filters.validity !== "all") 
        queryParams.append("is_valid", filters.validity);
      
      if (filters.date) 
        queryParams.append("start_date", filters.date);

      // Add search term if available
      if (filters.searchTerm) 
        queryParams.append("search", filters.searchTerm);

      // Pagination parameters
      queryParams.append("limit", pagination.limit.toString());
      queryParams.append("offset", pagination.offset.toString());
      queryParams.append("sort_by", "appointment_date");
      queryParams.append("sort_order", "desc");
      
      console.log("Fetching appointments with params:", queryParams.toString());
      
      // Make API call
      const response = await fetch(`/api/appointments/org?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process appointments data
      const processedAppointments = processAppointments(data);
      setAppointments(processedAppointments);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || data.total || 0,
      }));
      
      // Update stats
      updateStats(processedAppointments, data.stats);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message || 'Failed to fetch appointments');
      
      // Handle specific errors
      if (error.message.includes("Invalid doctor ID format")) {
        setErrorDetails({
          title: "Doctor ID Format Error",
          description: "The API is expecting doctor IDs in UUID format. Please verify your doctor ID selection."
        });
      } else if (error.message.includes("Invalid appointment") || error.message.includes("ID format")) {
        setErrorDetails({
          title: "ID Format Error",
          description: "There's an issue with the ID format in your request. Please verify the IDs match the required format."
        });
      } else if (error.message.includes("Authentication required") || error.message.includes("Unauthorized")) {
        setErrorDetails({
          title: "Authentication Error",
          description: "You need to be logged in to access this data. Please refresh the page or log in again."
        });
      } else if (error.message.includes("Service unavailable")) {  
        setErrorDetails({
          title: "Service Unavailable",
          description: "The appointments service is currently unavailable. Please try again later."
        });
      }
      
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset, processAppointments]);

  // Calculate statistics
  const updateStats = useCallback((appointmentsData, backendStats = null) => {
    // If backend provides stats, use them
    if (backendStats) {
      setStats(DEFAULT_STATS.map((stat, index) => ({
        ...stat,
        value: backendStats[Object.keys(backendStats)[index]]?.toString() || "0"
      })));
      return;
    }
    
    // Client-side stats calculation
    const total = appointmentsData.length;
    const completed = appointmentsData.filter(app => app.appointment_status === "completed").length;
    const notCompleted = appointmentsData.filter(app => app.appointment_status === "not_completed").length;
    const uniqueDoctors = new Set(appointmentsData.map(app => app.doctor_id)).size;
    
    setStats([
      { label: "Total Appointments", value: total.toString(), icon: <Package className="h-4 w-4" /> },
      { label: "Waiting", value: notCompleted.toString(), icon: <TimerIcon className="h-4 w-4" /> },
      { label: "In Progress", value: "0", icon: <Clock className="h-4 w-4" /> },
      { label: "Completed", value: completed.toString(), icon: <LogOut className="h-4 w-4" /> },
      { label: "Active Doctors", value: uniqueDoctors.toString(), icon: <User className="h-4 w-4" /> },
      { label: "Pending Bills", value: "0", icon: <DollarSign className="h-4 w-4" /> },
    ]);
  }, []);

  // Format time utility function
  const formatTime = useCallback((timeString) => {
    if (!timeString) return "";
    
    // Check if it's already in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // Handle if timeString is a full date string
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
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
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

  // Handle search form submission
  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();

    // Update filters state with form values
    setFilters({...formState});

    // Reset pagination when filters change
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
    
    // Update URL query params for better shareability
    const newParams = new URLSearchParams();
    
    if (formState.searchTerm) newParams.set('search', formState.searchTerm);
    if (formState.status !== 'all') newParams.set('status', formState.status);
    if (formState.doctor !== 'all') newParams.set('doctorId', formState.doctor);
    if (formState.feeType !== 'all') newParams.set('feeType', formState.feeType);
    if (formState.validity !== 'all') newParams.set('validity', formState.validity);
    if (formState.date) newParams.set('startDate', formState.date);
    
    // Use Next.js router to update the URL without refreshing the page
    const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
    router.push(newUrl, { scroll: false });
    
  }, [formState, router]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      searchTerm: "",
      status: "all",
      doctor: "all",
      feeType: "all",
      validity: "all",
      date: "",
    };
    
    // Reset form state
    setFormState(defaultFilters);
    
    // Reset actual filters
    setFilters(defaultFilters);
    
    // Reset pagination
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
    
    // Clear URL parameters
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  // Handle adding a new appointment
  const handleNewAppointment = useCallback(() => {
    router.push('/appointments/new');
  }, [router]);
  
  const handleAppointmentClick = useCallback((appointment) => {
    // If there's an existing diagnosis, go to the diagnosis page
    if (appointment.diagnosis_id) {
      router.push(`/dashboard/op/${appointment.diagnosis_id}`);
    } else {
      // Otherwise, go to create a new diagnosis for this appointment
      router.push(`/dashboard/diagnosis/new?appointmentId=${appointment.appointment_id}`);
    }
  }, [router]);

  // Load initial URL parameters if any
  useEffect(() => {
    const status = searchParams.get('status') || 'all';
    const doctor = searchParams.get('doctorId') || 'all';
    const feeType = searchParams.get('feeType') || 'all';
    const validity = searchParams.get('validity') || 'all';
    const date = searchParams.get('startDate') || '';
    const search = searchParams.get('search') || '';
    
    if (status !== 'all' || doctor !== 'all' || feeType !== 'all' || validity !== 'all' || date || search) {
      const initialFilters = {
        searchTerm: search,
        status,
        doctor,
        feeType,
        validity,
        date,
      };
      
      setFormState(initialFilters);
      setFilters(initialFilters);
    }
  }, [searchParams]);

  // This effect will trigger whenever filters or pagination changes
  useEffect(() => {
    // Create a reference to the current filters and pagination
    const currentFilters = JSON.stringify(filters);
    const currentPagination = JSON.stringify({
      limit: pagination.limit,
      offset: pagination.offset
    });
    
    // Only fetch if filters or pagination actually changed
    if (prevFiltersRef.current !== currentFilters || prevPaginationRef.current !== currentPagination) {
      // Update our refs with the current values
      prevFiltersRef.current = currentFilters;
      prevPaginationRef.current = currentPagination;
      
      // Fetch appointments
      fetchAppointments();
    }
  }, [filters, pagination.limit, pagination.offset, fetchAppointments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">Appointments</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            
          </div>
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
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients or doctors..."
                  className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500"
                  value={formState.searchTerm}
                  onChange={(e) => handleInputChange('searchTerm', e.target.value)}
                />
              </div>
              
              <Select
                value={formState.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className="w-full md:w-[140px] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not_completed">Not Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={formState.doctor}
                onValueChange={(value) => handleInputChange('doctor', value)}
              >
                <SelectTrigger className="w-full md:w-[140px] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="550e8400-e29b-41d4-a716-446655440000">Dr. Brandon McIntyre</SelectItem>
                  <SelectItem value="550e8400-e29b-41d4-a716-446655440001">Dr. Sarah Johnson</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={formState.feeType}
                onValueChange={(value) => handleInputChange('feeType', value)}
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
                value={formState.validity}
                onValueChange={(value) => handleInputChange('validity', value)}
              >
                <SelectTrigger className="w-full md:w-[140px] bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Validity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Valid</SelectItem>
                  <SelectItem value="false">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative flex items-center w-full md:w-auto">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 w-full md:w-[180px]"
                  value={formState.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <Button 
                  type="submit" 
                  className="bg-blue-600 text-white hover:bg-blue-700 flex-1 md:flex-none"
                >
                  Search
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetFilters}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 md:flex-none"
                >
                  Reset
                </Button>
              </div>
            </form>
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

          {/* Filter summary */}
          {(filters.status !== 'all' || 
            filters.doctor !== 'all' || 
            filters.feeType !== 'all' || 
            filters.validity !== 'all' || 
            filters.date || 
            filters.searchTerm) && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
              <div className="text-sm text-blue-600">
                <span className="font-medium">Filters applied:</span>{' '}
                {filters.searchTerm && <span className="mr-2">Search: "{filters.searchTerm}"</span>}
                {filters.status !== 'all' && <span className="mr-2">Status: {filters.status}</span>}
                {filters.doctor !== 'all' && (
                  <span className="mr-2">Doctor: {
                    filters.doctor === '550e8400-e29b-41d4-a716-446655440000' 
                      ? 'Dr. Brandon McIntyre' 
                      : filters.doctor === '550e8400-e29b-41d4-a716-446655440001'
                        ? 'Dr. Sarah Johnson'
                        : filters.doctor
                  }</span>
                )}
                {filters.feeType !== 'all' && <span className="mr-2">Fee Type: {filters.feeType}</span>}
                {filters.validity !== 'all' && <span className="mr-2">Validity: {filters.validity === 'true' ? 'Valid' : 'Expired'}</span>}
                {filters.date && <span>Date: {filters.date}</span>}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-blue-600 hover:bg-blue-100"
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Table header with slot time range */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 hidden md:grid" 
            style={{ gridTemplateColumns: "1.4fr 1.8fr 1.8fr 1fr 1fr 0.8fr 0.8fr 100px" }}>
            <div className="text-xs font-medium text-gray-500">Appointment Time</div>
            <div className="text-xs font-medium text-gray-500">Patient</div>
            <div className="text-xs font-medium text-gray-500">Doctor</div>
            <div className="text-xs font-medium text-gray-500">Fee</div>
            <div className="text-xs font-medium text-gray-500">Date</div>
            <div className="text-xs font-medium text-gray-500">Status</div>
            <div className="text-xs font-medium text-gray-500">Validity</div>
            <div className="text-xs font-medium text-gray-500 text-right">Actions</div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : appointments.length > 0 ? (
            <div>
              {/* Appointment rows with slot time range */}
              {appointments.map((appointment, index) => (
                <div
                key={appointment.appointment_id || index}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div className="px-6 py-4 grid gap-4 md:gap-0 md:grid-cols-[1.4fr_1.8fr_1.8fr_1fr_1fr_0.8fr_0.8fr_100px] items-center cursor-pointer">
                  {/* Time slot with clock icon */}
                  <div className="flex items-center">
                  <div className="rounded-full p-2 bg-blue-50 mr-3">
                      <AlarmClock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">
                        {formatSlotTimeRange(appointment.slot_start_time, appointment.slot_end_time) || "Any time"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {appointment.next_visit_date ? `Next: ${formatDate(appointment.next_visit_date)}` : "No follow-up"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Patient info */}
                  <div>
                    <div className="font-medium text-gray-800">{appointment.patient_name || "Unknown Patient"}</div>
                    <div className="text-xs text-gray-500">ID: {appointment.patient_id || "N/A"}</div>
                  </div>
                  
                  {/* Doctor info */}
                  <div>
                    <div className="font-medium text-gray-800">{appointment.doctor_name || "Unassigned"}</div>
                    <div className="text-xs text-gray-500">
                      {appointment.fee_type === "emergency" ? "Emergency Consultation" : "Regular Consultation"}
                    </div>
                  </div>
                  
                  {/* Fee info */}
                  <div>
                    <div className="font-medium text-gray-800">
                      ${typeof appointment.appointment_fee === 'number' ? appointment.appointment_fee.toFixed(2) : appointment.appointment_fee || "0.00"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.payment_method || "Not paid"}
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div>
                    <div className="text-sm text-gray-700">{formatDate(appointment.appointment_date)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(appointment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div>
                    <Badge 
                      className={STATUS_STYLES[appointment.appointment_status] || "bg-gray-50 text-gray-600"}
                    >
                      {appointment.appointment_status === "completed" ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                  
                  {/* Validity badge */}
                  <div>
                    <Badge 
                      className={VALIDITY_STYLES[String(appointment.is_valid)] || "bg-gray-50 text-gray-600"}
                    >
                      {appointment.is_valid ? "Valid" : "Expired"}
                    </Badge>
                  </div>
                  
                  {/* Actions */}
                  <div className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppointmentClick(appointment);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex justify-center">
                <TimerIcon className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
              <div className="mt-6">
                <Button 
                  onClick={resetFilters}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {appointments.length > 0 && pagination.total > pagination.limit && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.offset === 0}
                  onClick={() => handlePageChange(0)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  First
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.offset === 0}
                  onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Previous
                </Button>
                
                {paginationInfo.pageNumbers.map((pageNum, index) => (
                  pageNum === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2">...</span>
                  ) : (
                    <Button
                      key={pageNum}
                      variant={paginationInfo.currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                      className={
                        paginationInfo.currentPage === pageNum
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Next
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  onClick={() => handlePageChange(Math.floor(pagination.total / pagination.limit) * pagination.limit)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons at bottom */}
        <div className="mt-6 flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print List
          </Button>
          
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>
    </div>
  );
}