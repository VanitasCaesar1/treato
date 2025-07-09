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
import dynamic from 'next/dynamic';

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

// PDF styles
const pdfStyles = {
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    color: '#2563eb', // blue-600
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe', // blue-100
    borderBottomStyle: 'solid',
    backgroundColor: '#eff6ff', // blue-50
  },
  tableHeader: {
    fontWeight: 'bold',
    color: '#1d4ed8', // blue-700
    backgroundColor: '#dbeafe', // blue-100
    padding: 6,
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  tableCell: {
    padding: 6,
    flex: 1,
    textAlign: 'center',
    color: '#1e293b',
    fontSize: 11,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    textAlign: 'right',
    fontSize: 10,
    color: '#64748b',
  },
};

// PDF Document component
const AppointmentsPDF = ({ data }) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Appointments Report</Text>
          <Text style={pdfStyles.date}>Generated: {formattedDate}</Text>
        </View>
        <View style={pdfStyles.table}>
          {/* Table Header */}
          <View style={pdfStyles.tableRow}>
            {['#', 'Patient Name', 'Doctor Name', 'Date', 'Time', 'Status', 'Fee', 'Fee Type', 'Valid'].map((header, idx) => (
              <Text key={idx} style={pdfStyles.tableHeader}>{header}</Text>
            ))}
          </View>
          {/* Table Rows */}
          {data.length === 0 ? (
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, { flex: 9, color: '#64748b', textAlign: 'center' }]}>No appointments found for this report.</Text>
            </View>
          ) : data.map((app, idx) => (
            <View style={[pdfStyles.tableRow, { backgroundColor: idx % 2 === 0 ? '#f1f5f9' : '#eff6ff' }]} key={app.appointment_id || idx}>
              <Text style={pdfStyles.tableCell}>{idx + 1}</Text>
              <Text style={pdfStyles.tableCell}>{app.patient_name || ''}</Text>
              <Text style={pdfStyles.tableCell}>{app.doctor_name || ''}</Text>
              <Text style={pdfStyles.tableCell}>{app.appointment_date}</Text>
              <Text style={pdfStyles.tableCell}>{`${app.slot_start_time || ''} - ${app.slot_end_time || ''}`}</Text>
              <Text style={pdfStyles.tableCell}>{app.appointment_status}</Text>
              <Text style={pdfStyles.tableCell}>{app.appointment_fee}</Text>
              <Text style={pdfStyles.tableCell}>{app.fee_type}</Text>
              <Text style={pdfStyles.tableCell}>{app.is_valid ? 'VALID' : 'INVALID'}</Text>
            </View>
          ))}
        </View>
        <Text style={pdfStyles.footer}>Report generated by Treato | {formattedDate}</Text>
      </Page>
    </Document>
  );
};

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // Store all appointments for client-side filtering
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

  // Client-side search function for patient and doctor names
  const performClientSideSearch = useCallback((appointmentsList, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return appointmentsList;
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    return appointmentsList.filter(appointment => {
      // Search in patient name
      const patientName = (appointment.patient_name || '').toLowerCase();
      const patientId = (appointment.patient_id || '').toLowerCase();
      
      // Search in doctor name (both from appointment data and from doctors list)
      const doctorName = (appointment.doctor_name || '').toLowerCase();
      const doctorFromList = doctors.find(d => d.id === appointment.doctor_id);
      const doctorListName = doctorFromList ? doctorFromList.name.toLowerCase() : '';
      const doctorId = (appointment.doctor_id || '').toLowerCase();
      
      // Check if search term matches any of these fields
      return (
        patientName.includes(lowerSearchTerm) ||
        patientId.includes(lowerSearchTerm) ||
        doctorName.includes(lowerSearchTerm) ||
        doctorListName.includes(lowerSearchTerm) ||
        doctorId.includes(lowerSearchTerm)
      );
    });
  }, [doctors]);

  // Apply all filters (both server-side and client-side)
  const applyFilters = useCallback((appointmentsList) => {
    let filteredAppointments = [...appointmentsList];
    
    // Apply client-side search first
    if (filters.search && filters.search.trim()) {
      filteredAppointments = performClientSideSearch(filteredAppointments, filters.search);
    }
    
    // Apply other filters
    if (filters.appointment_status !== "all") {
      filteredAppointments = filteredAppointments.filter(app => 
        app.appointment_status === filters.appointment_status
      );
    }
    
    if (filters.doctor_id !== "all") {
      filteredAppointments = filteredAppointments.filter(app => 
        app.doctor_id === filters.doctor_id
      );
    }
    
    if (filters.fee_type !== "all") {
      filteredAppointments = filteredAppointments.filter(app => 
        app.fee_type === filters.fee_type
      );
    }
    
    if (filters.is_valid !== "all") {
      const expectedValidState = filters.is_valid === "true";
      filteredAppointments = filteredAppointments.filter(app => {
        const appValidState = app.is_valid === true || app.is_valid === "true";
        return appValidState === expectedValidState;
      });
    }
    
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
    
    return filteredAppointments;
  }, [filters, performClientSideSearch]);

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

  // IMPROVED: Fetch appointments from API with search handled client-side
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      // Build query parameters - EXCLUDE search from server request for now
      const queryParams = new URLSearchParams();
      
      // Add filters only if they have meaningful values (excluding search)
      if (filters.appointment_status && filters.appointment_status !== "all") {
        queryParams.append("appointment_status", filters.appointment_status);
      }
      
      if (filters.doctor_id && filters.doctor_id !== "all") {
        queryParams.append("doctor_id", filters.doctor_id);
      }
      
      if (filters.fee_type && filters.fee_type !== "all") {
        queryParams.append("fee_type", filters.fee_type);
      }
      
      // Handle boolean parameter correctly
      if (filters.is_valid && filters.is_valid !== "all") {
        const booleanValue = filters.is_valid === "true";
        queryParams.append("is_valid", booleanValue.toString());
      }
      
      // Handle date parameter with proper formatting
      if (filters.start_date) {
        const dateValue = new Date(filters.start_date);
        if (!isNaN(dateValue.getTime())) {
          const formattedDate = dateValue.toISOString().split('T')[0];
          queryParams.append("start_date", formattedDate);
          queryParams.append("end_date", formattedDate);
        }
      }

      // For search functionality, we'll get more data and filter client-side
      // Increase limit when there's a search to get more data for filtering
      const effectiveLimit = filters.search && filters.search.trim() ? 100 : pagination.limit;
      queryParams.append("limit", effectiveLimit.toString());
      
      // Only use offset if there's no search (pagination doesn't work well with client-side search)
      if (!filters.search || !filters.search.trim()) {
        queryParams.append("offset", pagination.offset.toString());
      } else {
        queryParams.append("offset", "0");
      }
      
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
      
      // Store all appointments for client-side filtering
      setAllAppointments(processedAppointments);
      
      // Apply client-side filters
      const filteredAppointments = applyFilters(processedAppointments);
      
      // Handle pagination for filtered results
      let paginatedAppointments = filteredAppointments;
      let totalCount = filteredAppointments.length;
      
      // If we're doing client-side search, handle pagination client-side too
      if (filters.search && filters.search.trim()) {
        const startIndex = pagination.offset;
        const endIndex = startIndex + pagination.limit;
        paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);
        totalCount = filteredAppointments.length;
      } else {
        // For server-side filtering, use server pagination info
        totalCount = data.pagination?.total || data.total || processedAppointments.length;
      }
      
      setAppointments(paginatedAppointments);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: totalCount,
      }));
      
      // Update stats based on filtered results
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
      setAllAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset, processAppointments, applyFilters]);

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

  // IMPROVED: Handle search form submission with better validation
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

  // Real-time search functionality
  const handleRealTimeSearch = useCallback((searchValue) => {
    // Update form state immediately
    setFormState(prev => ({ ...prev, search: searchValue }));
    
    // Apply real-time filtering if we have data
    if (allAppointments.length > 0) {
      const tempFilters = { ...filters, search: searchValue };
      
      // Create a temporary filtered list
      let filteredAppointments = [...allAppointments];
      
      // Apply search
      if (searchValue && searchValue.trim()) {
        filteredAppointments = performClientSideSearch(filteredAppointments, searchValue);
      }
      
      // Apply other filters
      if (tempFilters.appointment_status !== "all") {
        filteredAppointments = filteredAppointments.filter(app => 
          app.appointment_status === tempFilters.appointment_status
        );
      }
      
      if (tempFilters.doctor_id !== "all") {
        filteredAppointments = filteredAppointments.filter(app => 
          app.doctor_id === tempFilters.doctor_id
        );
      }
      
      if (tempFilters.fee_type !== "all") {
        filteredAppointments = filteredAppointments.filter(app => 
          app.fee_type === tempFilters.fee_type
        );
      }
      
      if (tempFilters.is_valid !== "all") {
        const expectedValidState = tempFilters.is_valid === "true";
        filteredAppointments = filteredAppointments.filter(app => {
          const appValidState = app.is_valid === true || app.is_valid === "true";
          return appValidState === expectedValidState;
        });
      }
      
      if (tempFilters.start_date) {
        const filterDate = new Date(tempFilters.start_date);
        if (!isNaN(filterDate.getTime())) {
          filteredAppointments = filteredAppointments.filter(app => {
            if (!app.appointment_date) return false;
            
            const appDate = new Date(app.appointment_date);
            if (isNaN(appDate.getTime())) return false;
            
            const filterDateString = filterDate.toISOString().split('T')[0];
            const appDateString = appDate.toISOString().split('T')[0];
            
            return filterDateString === appDateString;
          });
        }
      }
      
      // Apply pagination
      const startIndex = 0; // Reset to first page for search
      const endIndex = startIndex + pagination.limit;
      const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);
      
      setAppointments(paginatedAppointments);
      setPagination(prev => ({
        ...prev,
        total: filteredAppointments.length,
        offset: 0
      }));
      
      updateStats(filteredAppointments);
    }
  }, [allAppointments, filters, pagination.limit, performClientSideSearch, updateStats]);

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
  useEffect(() => {
    if (initialLoadRef.current && !prevFiltersRef.current) {
      console.log("Initial load, fetching appointments");
      fetchAppointments();
    }
  }, [fetchAppointments]);

  // Remove PDFDownloadLink and use a client-only PDF download button
  function downloadAppointmentsPDF(data) {
    import('@react-pdf/renderer').then(({ pdf, Document, Page, View, Text, StyleSheet }) => {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
      const styles = pdfStyles;
      const AppointmentsPDF = (
        <Document>
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>Appointments Report</Text>
              <Text style={styles.date}>Generated: {formattedDate}</Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                {["#", "Patient Name", "Doctor Name", "Date", "Time", "Status", "Fee", "Fee Type", "Valid"].map((header, idx) => (
                  <Text key={idx} style={styles.tableHeader}>{header}</Text>
                ))}
              </View>
              {data.length === 0 ? (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 9, color: '#64748b', textAlign: 'center' }]}>No appointments found for this report.</Text>
                </View>
              ) : data.map((app, idx) => (
                <View style={[styles.tableRow, { backgroundColor: idx % 2 === 0 ? '#f1f5f9' : '#eff6ff' }]} key={app.appointment_id || idx}>
                  <Text style={styles.tableCell}>{idx + 1}</Text>
                  <Text style={styles.tableCell}>{app.patient_name || ''}</Text>
                  <Text style={styles.tableCell}>{app.doctor_name || ''}</Text>
                  <Text style={styles.tableCell}>{app.appointment_date}</Text>
                  <Text style={styles.tableCell}>{`${app.slot_start_time || ''} - ${app.slot_end_time || ''}`}</Text>
                  <Text style={styles.tableCell}>{app.appointment_status}</Text>
                  <Text style={styles.tableCell}>{app.appointment_fee}</Text>
                  <Text style={styles.tableCell}>{app.fee_type}</Text>
                  <Text style={styles.tableCell}>{app.is_valid ? 'VALID' : 'INVALID'}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.footer}>Report generated by Treato | {formattedDate}</Text>
          </Page>
        </Document>
      );
      pdf(AppointmentsPDF).toBlob().then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'appointments_report.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-medium text-gray-900 mb-4 sm:mb-0">Appointments</h1>
          
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {error}
              {errorDetails && (
                <div className="mt-2">
                  <strong>{errorDetails.title}:</strong> {errorDetails.description}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
              {/* Search Input */}
              <div className="xl:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Patient/Doctor
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by patient or doctor name..."
                    value={formState.search}
                    onChange={(e) => handleRealTimeSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={formState.appointment_status}
                  onValueChange={(value) => handleInputChange('appointment_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="not_completed">Not Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Filter */}
              <div>
                <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <Select
                  value={formState.doctor_id}
                  onValueChange={(value) => handleInputChange('doctor_id', value)}
                  disabled={doctorsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={doctorsLoading ? "Loading..." : "All Doctors"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} {doctor.speciality && `(${doctor.speciality})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fee Type Filter */}
              <div>
                <label htmlFor="feeType" className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Type
                </label>
                <Select
                  value={formState.fee_type}
                  onValueChange={(value) => handleInputChange('fee_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Fee Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fee Types</SelectItem>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Validity Filter */}
              <div>
                <label htmlFor="validity" className="block text-sm font-medium text-gray-700 mb-1">
                  Validity
                </label>
                <Select
                  value={formState.is_valid}
                  onValueChange={(value) => handleInputChange('is_valid', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Valid</SelectItem>
                    <SelectItem value="false">Invalid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={formState.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={handleSearch} className="bg-blue-600 text-white hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Appointments Table */}
        <Card>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading appointments...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500">
                  {Object.values(filters).some(val => val && val !== 'all') 
                    ? "Try adjusting your filters or search terms."
                    : "No appointments have been created yet."}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
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
                      Valid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient_name || 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {appointment.patient_id || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.doctor_name || getDoctorName(appointment.doctor_id)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {appointment.doctor_id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {formatDate(appointment.appointment_date)}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatSlotTimeRange(appointment.slot_start_time, appointment.slot_end_time)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={`${STATUS_STYLES[appointment.appointment_status] || STATUS_STYLES.pending} border-0`}
                        >
                          {appointment.appointment_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{appointment.appointment_fee || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.fee_type || 'default'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={`${VALIDITY_STYLES[appointment.is_valid?.toString()] || VALIDITY_STYLES.false} border-0`}
                        >
                          {appointment.is_valid ? 'VALID' : 'INVALID'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex flex-col gap-1 items-end">
                          <Link 
                            href={{
                              pathname: "/dashboard/rx-pad",
                              query: {
                                appointment_id: appointment.appointment_id || appointment.id,
                                patient_id: appointment.patient_id,
                                doctor_id: appointment.doctor_id
                              }
                            }}
                            legacyBehavior
                          >
                            <Button variant="outline" size="sm" className="text-purple-700 border-purple-300 hover:bg-purple-50 mb-1">
                              Rx Pad
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAppointmentClick(appointment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {appointment.has_diagnosis ? 'View Details' : 'Create Diagnosis'}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && appointments.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={pagination.offset === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{pagination.offset + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.offset + pagination.limit, pagination.total)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                        disabled={pagination.offset === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </Button>
                      
                      {paginationInfo.pageNumbers.map((pageNum, index) => (
                        <React.Fragment key={index}>
                          {pageNum === "..." ? (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          ) : (
                            <Button
                              variant={paginationInfo.currentPage === pageNum ? "default" : "outline"}
                              onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                            >
                              {pageNum}
                            </Button>
                          )}
                        </React.Fragment>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                        disabled={pagination.offset + pagination.limit >= pagination.total}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          <Button variant="outline" className="flex items-center" onClick={() => downloadAppointmentsPDF(appointments)}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Button variant="outline" className="flex items-center" onClick={() => {
            // Export appointments as CSV
            const csvRows = [];
            // Header
            csvRows.push([
              'Appointment ID', 'Patient Name', 'Patient ID', 'Doctor Name', 'Doctor ID',
              'Date', 'Time', 'Status', 'Fee', 'Fee Type', 'Valid'
            ].join(','));
            // Data
            appointments.forEach(app => {
              csvRows.push([
                app.appointment_id,
                `"${app.patient_name || ''}"`,
                app.patient_id,
                `"${app.doctor_name || ''}"`,
                app.doctor_id,
                app.appointment_date,
                `${app.slot_start_time || ''} - ${app.slot_end_time || ''}`,
                app.appointment_status,
                app.appointment_fee,
                app.fee_type,
                app.is_valid ? 'VALID' : 'INVALID'
              ].map(val => (val !== undefined ? val : '')).join(','));
            });
            const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'appointments_export.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
}