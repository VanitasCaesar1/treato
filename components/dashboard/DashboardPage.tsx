"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronRight, RefreshCw, Package, Clock, LogOut, User, DollarSign, TimerIcon, Plus } from "lucide-react";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter, useSearchParams } from "next/navigation";

// Type definitions
interface Appointment {
  id: string;
  appointment_id?: string;
  appointment_date?: string;
  appointment_time?: string;
  patient_name?: string;
  patientName?: string;
  patient_id?: string;
  patientId?: string;
  source?: string;
  fee_type?: "recurring" | "emergency" | "default";
  type?: "recurring" | "emergency" | "default";
  doctor_name?: string;
  doctorName?: string;
  doctor_id?: string;
  doctorId?: string;
  appointment_status?: "completed" | "pending" | "new" | "not_completed";
  status?: "completed" | "pending" | "new" | "not_completed";
  duration?: string;
  is_valid?: boolean;
  validity?: "valid" | "expired";
  valid_until?: string;
  validUntil?: string;
  time?: string;
  diagnosis_id?: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface ErrorDetails {
  title: string;
  description: string;
}

interface Stats {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const DEFAULT_STATS = [
  { label: "Total Appointments", value: "0", icon: <Package className="h-4 w-4" /> },
  { label: "Waiting", value: "0", icon: <TimerIcon className="h-4 w-4" /> },
  { label: "In Progress", value: "0", icon: <Clock className="h-4 w-4" /> },
  { label: "Completed", value: "0", icon: <LogOut className="h-4 w-4" /> },
  { label: "Active Doctors", value: "0", icon: <User className="h-4 w-4" /> },
  { label: "Pending Bills", value: "0", icon: <DollarSign className="h-4 w-4" /> },
];

const STATUS_STYLES = {
  completed: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  new: "bg-red-100 text-red-800 hover:bg-red-100",
  not_completed: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  followup: "bg-sky-100 text-sky-800 hover:bg-sky-100",
} as const;

const VALIDITY_STYLES = {
  valid: "bg-emerald-100 text-emerald-800",
  expired: "bg-red-100 text-red-800",
} as const;

// Chart Data
const STATS_DATA = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 2000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
];

const PIE_COLORS = ["#36b37e", "#ffab00", "#ff5630", "#00b8d9"];
const PIE_DATA = [
  { name: "Completed", value: 60 },
  { name: "Pending", value: 20 },
  { name: "New", value: 10 },
  { name: "Follow-up", value: 10 },
];

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for appointments and UI
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [stats, setStats] = useState<Stats[]>(DEFAULT_STATS);

  // Process appointments data for consistent format
  const processAppointments = useCallback((data: any): Appointment[] => {
    // Check if the API returned appointments array
    if (!data.appointments || !Array.isArray(data.appointments)) {
      return [];
    }
    
    return data.appointments.map((appointment: any) => {
      // Normalize appointment fields (API might return different field names)
      return {
        ...appointment,
        id: appointment.id || appointment.appointment_id || `temp-${Math.random().toString(36).substring(2, 9)}`,
        appointment_id: appointment.appointment_id || appointment.id,
        patient_name: appointment.patient_name || appointment.patientName || "Unknown",
        patient_id: appointment.patient_id || appointment.patientId,
        doctor_name: appointment.doctor_name || appointment.doctorName || "Unknown",
        doctor_id: appointment.doctor_id || appointment.doctorId,
        appointment_status: appointment.appointment_status || appointment.status || "pending",
        fee_type: appointment.fee_type || appointment.type || "default",
        is_valid: appointment.is_valid ?? (appointment.validity === "valid"),
        validity: appointment.validity || (appointment.is_valid ? "valid" : "expired"),
        source: appointment.source || "System",
        time: formatTime(appointment.appointment_time || appointment.time || "")
      };
    });
  }, []);

  // Format time utility function
  const formatTime = useCallback((timeString: string) => {
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

  // Format date for display
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    } catch (e) {
      return "";
    }
  }, []);

  // Calculate statistics
  const updateStats = useCallback((appointmentsData: Appointment[], backendStats = null) => {
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

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add organization ID if needed
      const orgId = sessionStorage.getItem('organizationId');
      if (orgId) queryParams.append("orgId", orgId);
      
      // Default to today if no date selected
      const today = new Date().toISOString().split("T")[0];
      queryParams.append("startDate", today);
      queryParams.append("endDate", today);

      // Pagination parameters
      queryParams.append("limit", pagination.limit.toString());
      queryParams.append("offset", pagination.offset.toString());
      
      console.log("Fetching appointments with params:", queryParams.toString());
      
      // Make API call to our new route
      const response = await fetch(`/api/appointments?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Appointments data received:", data);
      
      // Process appointments data
      const processedAppointments = processAppointments(data);
      setAppointments(processedAppointments);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || data.total || 0,
        hasMore: processedAppointments.length === pagination.limit &&
                (pagination.offset + processedAppointments.length) < (data.pagination?.total || data.total || 0)
      }));
      
      // Update stats
      updateStats(processedAppointments, data.stats);
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to fetch appointments");
      
      // Handle specific errors
      if (err.message.includes("Unauthorized") || err.message.includes("AUTH_REQUIRED")) {
        setErrorDetails({
          title: "Authentication Error",
          description: "You need to be logged in to access this data. Please refresh the page or log in again."
        });
      } else if (err.message.includes("Invalid doctor ID format")) {
        setErrorDetails({
          title: "Doctor ID Format Error",
          description: "The API is expecting doctor IDs in UUID format. Please verify your doctor ID selection."
        });
      } else if (err.message.includes("Service unavailable")) {  
        setErrorDetails({
          title: "Service Unavailable",
          description: "The appointments service is currently unavailable. Please try again later."
        });
      }
      
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.offset, processAppointments, updateStats]);

  // Handle page change
  const loadMore = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  }, []);

  // Handle adding a new appointment
  const handleNewAppointment = useCallback(() => {
    router.push('/appointments/new');
  }, [router]);
  
  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    // If there's an existing diagnosis, go to the diagnosis page
    if (appointment.diagnosis_id) {
      router.push(`/dashboard/op/${appointment.diagnosis_id}`);
    } else {
      // Otherwise, go to appointment detail page
      router.push(`/dashboard/diagnosis/${appointment.id}`);
    }
  }, [router]);

  // Refresh appointments
  const refreshAppointments = useCallback(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Load appointments on initial render
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, pagination.offset, pagination.limit]);

  return (
    <div className="p-8 bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleNewAppointment}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>
          <Button 
            variant="outline" 
            onClick={refreshAppointments} 
            disabled={loading}
            className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none rounded-xl shadow-sm overflow-hidden bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                  {stat.icon}
                </div>
                {stat.label}
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4 px-4">
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Stats Charts */}
        <Card className="md:col-span-4 border-none rounded-xl shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-2 pt-6 px-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Stats Visits
            </h2>
          </CardHeader>
          <CardContent className="px-4 pb-6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={STATS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#37AFE1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 border-none rounded-xl shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-2 pt-6 px-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Completed Visits
            </h2>
          </CardHeader>
          <CardContent className="px-4 pb-6">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={STATS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#36B37E"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 border-none rounded-xl shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-2 pt-6 px-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Visit Status
            </h2>
          </CardHeader>
          <CardContent className="px-4 pb-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="md:col-span-12">
          <Card className="border-none rounded-xl shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2 border-b border-gray-100 pt-6 px-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Today's Appointments
              </h2>
            </CardHeader>

            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Time
                </div>
                <div className="md:col-span-2">Patient Details</div>
                <div>ID</div>
                <div>Visit Type</div>
                <div className="md:col-span-2">Doctor</div>
                <div>Status</div>
                <div>Validity</div>
                <div>Actions</div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {loading ? (
                // Skeleton loading state
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-11 gap-4">
                      <Skeleton className="h-6 w-16" />
                      <div className="md:col-span-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-16" />
                      <div className="md:col-span-2">
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))
              ) : error ? (
                // Error state
                <div className="p-6">
                  <Alert variant="destructive" className="rounded-xl">
                    {errorDetails ? (
                      <>
                        <AlertTitle>{errorDetails.title}</AlertTitle>
                        <AlertDescription>{errorDetails.description}</AlertDescription>
                      </>
                    ) : (
                      <>
                        <AlertTitle>Error Loading Appointments</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </>
                    )}
                  </Alert>
                </div>
              ) : appointments.length === 0 ? (
                // No appointments state
                <div className="p-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No appointments found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    There are no appointments scheduled for today. Try adding a new appointment.
                  </p>
                  <div className="mt-6">
                    <Button 
                      onClick={handleNewAppointment}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Appointment
                    </Button>
                  </div>
                </div>
              ) : (
                // Appointments list
                appointments.map((appointment, index) => (
                  <div 
                    key={appointment.id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                      <div className="text-sm font-medium">
                        {appointment.time || "N/A"}
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="font-medium">{appointment.patient_name}</div>
                        <div className="text-xs text-gray-500">
                          Source: {appointment.source}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {appointment.patient_id?.substring(0, 8) || "Unknown"}
                      </div>
                      
                      <div>
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                          {appointment.fee_type === "recurring" 
                            ? "Recurring" 
                            : appointment.fee_type === "emergency" 
                              ? "Emergency" 
                              : "Default"}
                        </Badge>
                      </div>
                      
                      <div className="md:col-span-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold text-xs mr-2">
                            {appointment.doctor_name?.substring(0, 1) || "?"}
                          </div>
                          <span className="font-medium text-sm">{appointment.doctor_name}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Badge className={
                          STATUS_STYLES[appointment.appointment_status as keyof typeof STATUS_STYLES] || 
                          "bg-gray-100 text-gray-800"
                        }>
                          {appointment.appointment_status === "completed" 
                            ? "Completed" 
                            : appointment.appointment_status === "pending" 
                              ? "Pending" 
                              : appointment.appointment_status === "not_completed" 
                                ? "Not Completed" 
                                : "New"}
                        </Badge>
                      </div>
                      
                      <div>
                        <Badge className={
                          VALIDITY_STYLES[appointment.validity as keyof typeof VALIDITY_STYLES] ||
                          "bg-gray-100 text-gray-800"
                        }>
                          {appointment.validity === "valid" ? "Valid" : "Expired"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Printer className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Link href={`/dashboard/diagnosis/${appointment.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {!loading && !error && appointments.length > 0 && pagination.hasMore && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Load More
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;