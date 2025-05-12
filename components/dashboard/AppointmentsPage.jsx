"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Printer, Download, Search, Clock, Package, User, 
  TimerIcon, LogOut, DollarSign, ChevronRight, Calendar, 
  Plus, Loader2, AlertCircle, RefreshCw 
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
  limit: 20,
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
  
  // State management with improved hooks and memoization
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [feeTypeFilter, setFeeTypeFilter] = useState("all");
  const [validityFilter, setValidityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Filter states with sensible defaults
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "all",
    doctor: "all",
    feeType: "all",
    validity: "all",
    date: "",
  });

  
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // Memoized and optimized data processing
  const processAppointments = useCallback((data) => {
    if (!data.appointments || !Array.isArray(data.appointments)) return [];

    return data.appointments.map(app => ({
      id: app.id || app.appointment_id || '',
      appointment_id: app.appointment_id || '',
      patient_id: app.patientID || app.patientId || app.patient_id || '',
      doctor_id: app.doctorID || app.doctorId || app.doctor_id || '',
      patient_name: app.patientName || app.patient_name || '',
      doctor_name: app.doctorName || app.doctor_name || '',
      appointment_status: app.appointmentStatus || app.appointment_status || '',
      payment_method: app.paymentMethod || app.payment_method || '',
      fee_type: app.feeType || app.fee_type || '',
      appointment_fee: app.appointmentFee || app.appointment_fee || 0,
      appointment_date: app.appointmentDate || app.appointment_date || '',
      next_visit_date: app.nextVisitDate || app.next_visit_date || '',
      is_valid: app.isValid !== undefined ? app.isValid : (app.is_valid !== undefined ? app.is_valid : true),
      created_at: app.createdAt || app.created_at || '',
      updated_at: app.updatedAt || app.updated_at || ''
    }));
  }, []);

  // Memoized pagination calculation
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
    
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pageNumbers.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pageNumbers.push("...");
      }
    }

    return { totalPages, currentPage, pageNumbers };
  }, [pagination]);

  // Fetch appointments with improved error handling and filtering
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      // Build query parameters with robust filtering
      const queryParams = new URLSearchParams();
      
      // Add filters only if they have meaningful values
      if (filters.status && filters.status !== "all") 
        queryParams.append("status", filters.status);
      
      if (filters.doctor && filters.doctor !== "all") 
        queryParams.append("doctorId", filters.doctor);
      
      if (filters.feeType && filters.feeType !== "all") 
        queryParams.append("feeType", filters.feeType);
      
      if (filters.validity && filters.validity !== "all") 
        queryParams.append("isValid", filters.validity);
      
      if (filters.date) 
        queryParams.append("startDate", filters.date);

      // Always add pagination parameters
      queryParams.append("limit", pagination.limit.toString());
      queryParams.append("offset", pagination.offset.toString());
      
      // Make API call
      const response = await fetch(`/api/appointments/org?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process and set appointments
      const processedAppointments = processAppointments(data);
      setAppointments(processedAppointments);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: data.total || data.pagination?.total || 0,
      }));
      
      // Update stats (keeping previous logic)
      updateStats(processedAppointments, data.stats);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message || 'Failed to fetch appointments');
      
      // Detailed error handling
      if (error.message.includes("Invalid appointment ID format")) {
        setErrorDetails({
          title: "ID Format Error",
          description: "The API is expecting appointment IDs in UUID format. Please verify your appointment IDs match the required format."
        });
      }
      
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset, processAppointments]);

  // Stats calculation with fallback
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

  // Utility functions 
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Error";
    }
  }, []);

  // Event handlers
  const handlePageChange = useCallback((newOffset) => {
    setPagination(prev => ({
      ...prev,
      offset: newOffset
    }));
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault(); // Prevent default form submission

    // Sanitize and trim search term
    const sanitizedSearchTerm = searchTerm.trim();

    // Validate and prepare filters
    const newFilters = {
      searchTerm: sanitizedSearchTerm,
      status: statusFilter || "all",
      doctor: doctorFilter || "all",
      feeType: feeTypeFilter || "all",
      validity: validityFilter || "all",
      date: dateFilter || "",
    };

    // Update filters state
    setFilters(newFilters);

    // Reset pagination to first page when performing a new search
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));

    // Trigger fetchAppointments with new filters
    fetchAppointments();
  }, [
    searchTerm, 
    statusFilter, 
    doctorFilter, 
    feeTypeFilter, 
    validityFilter, 
    dateFilter, 
    fetchAppointments
  ]);

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: "",
      status: "all",
      doctor: "all",
      feeType: "all",
      validity: "all",
      date: "",
    });
    
    // Reset pagination
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
  }, []);

  // Primary effect for fetching appointments
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Create an array of page numbers for pagination
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const pageNumbers = [];
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pageNumbers.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pageNumbers.push("...");
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Appointments</h1>
          <div className="flex space-x-4">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
            <Button className="bg-[#FFB347] text-black hover:bg-amber-500 rounded-lg px-4">
              More Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400">{stat.icon}</div>
                <span className="text-2xl font-medium text-gray-900">
                  {stat.value}
                </span>
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

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

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* Search and filters section */}
          <div className="p-6 border-b border-gray-100">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients or doctors..."
                  className="pl-10 h-10 bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-[140px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not_completed">Not Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={doctorFilter}
                onValueChange={(value) => setDoctorFilter(value)}
              >
                <SelectTrigger className="w-[140px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="550e8400-e29b-41d4-a716-446655440000">Dr. Brandon McIntyre</SelectItem>
                  <SelectItem value="550e8400-e29b-41d4-a716-446655440001">Dr. Sarah Johnson</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={feeTypeFilter}
                onValueChange={(value) => setFeeTypeFilter(value)}
              >
                <SelectTrigger className="w-[140px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
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
                value={validityFilter}
                onValueChange={(value) => setValidityFilter(value)}
              >
                <SelectTrigger className="w-[140px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
                  <SelectValue placeholder="Validity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Valid</SelectItem>
                  <SelectItem value="false">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative flex items-center">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  className="pl-10 h-10 bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900 w-[180px]"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetFilters}
                className="whitespace-nowrap"
              >
                Reset Filters
              </Button>
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

          <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
            <div className="grid-cols-[0.8fr_2fr_1.2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 hidden md:grid">
              <div className="text-xs font-medium text-gray-500">Time</div>
              <div className="text-xs font-medium text-gray-500">Patient</div>
              <div className="text-xs font-medium text-gray-500">ID</div>
              <div className="text-xs font-medium text-gray-500">Doctor</div>
              <div className="text-xs font-medium text-gray-500">Fee</div>
              <div className="text-xs font-medium text-gray-500">Status</div>
              <div className="text-xs font-medium text-gray-500">Validity</div>
              <div className="text-xs font-medium text-gray-500 text-right">
                Actions
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : appointments.length > 0 ? (
            <div>
              {appointments.map((appointment, index) => (
                <div
                  key={index}
                  className="px-6 py-4 grid grid-cols-1 md:grid-cols-[0.8fr_2fr_1.2fr_1.5fr_1fr_1fr_1fr_100px] gap-4 items-center border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <div className="text-sm text-gray-900">
                    {formatDate(appointment.appointment_date)}
                    <div className="text-xs text-gray-500 mt-0.5">
                      {appointment.appointment_date && new Date(appointment.appointment_date).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                    </div>
                  </div>
                  <div>
                    <Link
                      href={`/patients/${appointment.patient_id}`}
                      className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center gap-1 group"
                    >
                      {appointment.patient_name}
                      <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {appointment.next_visit_date && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          Next visit: {new Date(appointment.next_visit_date).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 truncate" title={appointment.appointment_id || appointment.id}>
                    {appointment.appointment_id || appointment.id}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {appointment.doctor_name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    ${appointment.appointment_fee}
                    <div className="text-xs text-gray-400">{appointment.fee_type}</div>
                  </div>
                  <div>
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[appointment.appointment_status]}`}
                    >
                      {appointment.appointment_status === "completed" ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                  <div>
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${validityStyles[appointment.is_valid ? "true" : "false"]}`}
                    >
                      {appointment.is_valid ? "Valid" : "Expired"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                      title="Print appointment details"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                      title="Download appointment details"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-12 text-gray-500">
              No appointments found. Try adjusting your filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {appointments.length > 0 && (
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{pagination.offset + 1}</span> to <span className="font-medium">{Math.min(pagination.offset + appointments.length, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> appointments
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={pagination.offset === 0}
                onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                className={pagination.offset === 0 ? "text-gray-400" : ""}
              >
                Previous
              </Button>
              
              {pageNumbers.map((page, index) => (
                typeof page === "number" ? (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm"
                    className={page === currentPage ? "bg-gray-100" : ""}
                    onClick={() => handlePageChange((page - 1) * pagination.limit)}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={index} className="px-2 flex items-center">...</span>
                )
              ))}
              
              <Button 
                variant="outline" 
                size="sm"
                disabled={pagination.offset + pagination.limit >= pagination.total}
                onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                className={pagination.offset + pagination.limit >= pagination.total ? "text-gray-400" : ""}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}