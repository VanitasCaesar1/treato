"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronRight, RefreshCw, Package, Clock, LogOut, User, DollarSign, TimerIcon, Calendar, TrendingUp, Activity } from "lucide-react";
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
  AreaChart,
  Area,
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
  color: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

const DEFAULT_STATS = [
  { 
    label: "Total Appointments", 
    value: "0", 
    icon: <Calendar className="h-5 w-5" />, 
    color: "from-blue-500 to-blue-600",
    change: "+0%",
    trend: "neutral" as const
  },
  { 
    label: "Waiting", 
    value: "0", 
    icon: <TimerIcon className="h-5 w-5" />, 
    color: "from-amber-500 to-orange-500",
    change: "+0%",
    trend: "neutral" as const
  },
  { 
    label: "In Progress", 
    value: "0", 
    icon: <Activity className="h-5 w-5" />, 
    color: "from-purple-500 to-purple-600",
    change: "+0%",
    trend: "neutral" as const
  },
  { 
    label: "Completed", 
    value: "0", 
    icon: <LogOut className="h-5 w-5" />, 
    color: "from-emerald-500 to-green-600",
    change: "+0%",
    trend: "up" as const
  },
  { 
    label: "Active Doctors", 
    value: "0", 
    icon: <User className="h-5 w-5" />, 
    color: "from-indigo-500 to-indigo-600",
    change: "+0%",
    trend: "neutral" as const
  },
  { 
    label: "Pending Bills", 
    value: "0", 
    icon: <DollarSign className="h-5 w-5" />, 
    color: "from-rose-500 to-pink-600",
    change: "+0%",
    trend: "neutral" as const
  },
];

const STATUS_STYLES = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  pending: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  new: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  not_completed: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  followup: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
} as const;

const VALIDITY_STYLES = {
  valid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-rose-50 text-rose-700 border-rose-200",
} as const;

// Enhanced Chart Data
const STATS_DATA = [
  { name: "Jan", appointments: 45, completed: 38 },
  { name: "Feb", appointments: 52, completed: 45 },
  { name: "Mar", appointments: 48, completed: 42 },
  { name: "Apr", appointments: 61, completed: 55 },
  { name: "May", appointments: 55, completed: 48 },
  { name: "Jun", appointments: 67, completed: 62 },
];

const PIE_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"];
const PIE_DATA = [
  { name: "Completed", value: 60, color: "#10b981" },
  { name: "Pending", value: 20, color: "#f59e0b" },
  { name: "New", value: 12, color: "#3b82f6" },
  { name: "Not Completed", value: 8, color: "#ef4444" },
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Process appointments data for consistent format
  const processAppointments = useCallback((data: any): Appointment[] => {
    if (!data.appointments || !Array.isArray(data.appointments)) {
      return [];
    }
    
    return data.appointments.map((appointment: any) => {
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
    if (backendStats) {
      setStats(DEFAULT_STATS.map((stat, index) => ({
        ...stat,
        value: backendStats[Object.keys(backendStats)[index]]?.toString() || "0"
      })));
      return;
    }
    
    const total = appointmentsData.length;
    const completed = appointmentsData.filter(app => app.appointment_status === "completed").length;
    const pending = appointmentsData.filter(app => app.appointment_status === "pending").length;
    const newAppts = appointmentsData.filter(app => app.appointment_status === "new").length;
    const notCompleted = appointmentsData.filter(app => app.appointment_status === "not_completed").length;
    const uniqueDoctors = new Set(appointmentsData.map(app => app.doctor_id)).size;
    
    setStats([
      { 
        ...DEFAULT_STATS[0], 
        value: total.toString(),
        change: total > 0 ? `+${Math.round((total / 50) * 100)}%` : "0%"
      },
      { 
        ...DEFAULT_STATS[1], 
        value: pending.toString(),
        change: pending > 0 ? `${pending}` : "0"
      },
      { 
        ...DEFAULT_STATS[2], 
        value: newAppts.toString(),
        change: newAppts > 0 ? `${newAppts}` : "0"
      },
      { 
        ...DEFAULT_STATS[3], 
        value: completed.toString(),
        change: completed > 0 ? `+${Math.round((completed / total) * 100)}%` : "0%",
        trend: completed > total * 0.7 ? "up" : "neutral"
      },
      { 
        ...DEFAULT_STATS[4], 
        value: uniqueDoctors.toString()
      },
      { 
        ...DEFAULT_STATS[5], 
        value: notCompleted.toString()
      },
    ]);
  }, []);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      const orgId = sessionStorage.getItem('organizationId');
      if (orgId) queryParams.append("orgId", orgId);
      
      const today = new Date().toISOString().split("T")[0];
      queryParams.append("startDate", today);
      queryParams.append("endDate", today);

      queryParams.append("limit", pagination.limit.toString());
      queryParams.append("offset", pagination.offset.toString());
      
      console.log("Fetching appointments with params:", queryParams.toString());
      
      const response = await fetch(`/api/appointments?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Appointments data received:", data);
      
      const processedAppointments = processAppointments(data);
      setAppointments(processedAppointments);
      
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || data.total || 0,
        hasMore: processedAppointments.length === pagination.limit &&
                (pagination.offset + processedAppointments.length) < (data.pagination?.total || data.total || 0)
      }));
      
      updateStats(processedAppointments, data.stats);
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to fetch appointments");
      
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
  
  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    const appointmentId = appointment.appointment_id || appointment.id;
    router.push(`/dashboard/diagnosis/new?appointmentId=${appointmentId}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-4 md:p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-slate-600 text-lg">
                  Welcome back! Today is {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-slate-500">Current Time</p>
                  <p className="text-xl font-semibold text-slate-700">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={refreshAppointments} 
                  disabled={loading}
                  className="flex items-center gap-3 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-6 py-3 rounded-xl transition-all duration-200"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-emerald-600' : 
                      stat.trend === 'down' ? 'text-rose-600' : 'text-slate-500'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Enhanced Charts */}
          <Card className="xl:col-span-5 border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 pt-8 px-8 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Monthly Overview
                </h2>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={STATS_DATA}>
                  <defs>
                    <linearGradient id="appointmentsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#appointmentsGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#completedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="xl:col-span-3 border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 pt-8 px-8 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Status Distribution
                </h2>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {PIE_DATA.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {PIE_DATA.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: PIE_COLORS[index] }}
                      ></div>
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm text-slate-500">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Appointments Table */}
          <div className="xl:col-span-12">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-6 pt-8 px-8 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      Today's Appointments
                    </h2>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-700">
                    {appointments.length} appointments
                  </Badge>
                </div>
              </CardHeader>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-8 space-y-4">
                    {Array(4).fill(0).map((_, index) => (
                      <div key={index} className="flex items-center gap-6 p-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-8">
                    <Alert className="rounded-xl border-rose-200 bg-rose-50">
                      {errorDetails ? (
                        <>
                          <AlertTitle className="text-rose-800">{errorDetails.title}</AlertTitle>
                          <AlertDescription className="text-rose-700">{errorDetails.description}</AlertDescription>
                        </>
                      ) : (
                        <>
                          <AlertTitle className="text-rose-800">Error Loading Appointments</AlertTitle>
                          <AlertDescription className="text-rose-700">{error}</AlertDescription>
                        </>
                      )}
                    </Alert>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 mb-6">
                      <Calendar className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">No appointments today</h3>
                    <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                      Your schedule is clear for today. Take this opportunity to catch up on other tasks or prepare for upcoming appointments.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {appointments.map((appointment, index) => (
                      <div 
                        key={appointment.id} 
                        className="group p-6 hover:bg-slate-50/80 cursor-pointer transition-all duration-200"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-center gap-6">
                          <div className="text-center min-w-0">
                            <div className="text-lg font-bold text-slate-800">
                              {appointment.time || "N/A"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(appointment.appointment_date || "")}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {appointment.patient_name?.substring(0, 1) || "?"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-800 truncate">
                                  {appointment.patient_name}
                                </div>
                                <div className="text-sm text-slate-500">
                                  ID: {appointment.patient_id?.substring(0, 8) || "Unknown"}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={`border ${
                              appointment.fee_type === "recurring" 
                                ? "bg-blue-50 text-blue-700 border-blue-200" 
                                : appointment.fee_type === "emergency" 
                                  ? "bg-red-50 text-red-700 border-red-200" 
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}>
                              {appointment.fee_type === "recurring" 
                                ? "Recurring" 
                                : appointment.fee_type === "emergency" 
                                  ? "Emergency" 
                                  : "Regular"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {appointment.doctor_name?.substring(0, 1) || "D"}
                              </div>
                              <div className="text-sm text-slate-600">
                                Dr. {appointment.doctor_name || "Unknown"}
                              </div>
                            </div>
                            
                            <Badge 
                              className={`border ${STATUS_STYLES[appointment.appointment_status as keyof typeof STATUS_STYLES] || STATUS_STYLES.pending}`}
                            >
                              {appointment.appointment_status?.replace("_", " ").toUpperCase() || "PENDING"}
                            </Badge>
                            
                            {appointment.validity && (
                              <Badge 
                                className={`border ${VALIDITY_STYLES[appointment.validity as keyof typeof VALIDITY_STYLES] || VALIDITY_STYLES.valid}`}
                              >
                                {appointment.validity === "valid" ? "Valid" : "Expired"}
                              </Badge>
                            )}
                          </div>
                          
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Load More Button */}
              {!loading && !error && pagination.hasMore && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                  <Button 
                    onClick={loadMore}
                    variant="outline"
                    className="w-full border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 rounded-xl py-3 transition-all duration-200"
                  >
                    Load More Appointments
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;