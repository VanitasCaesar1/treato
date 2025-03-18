"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Download, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

// Type definitions
interface Appointment {
  time: string;
  name: string;
  id: string;
  source: string;
  type: "recurring" | "emergency" | "default";
  doctor: string;
  status: "completed" | "pending" | "new";
  duration: string;
  validity: "valid" | "expired";
  validUntil: string;
}
// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

type AppointmentType = "all" | "recurring" | "default" | "emergency";
type TabsType = "all" | "completed" | "pending" | "new";
const Dashboard = () => {
  const [tabType, setTabsType] = useState<TabsType>("all");
  const [appointmentType, setAppointmentType] =
    useState<AppointmentType>("all");

  // Moved data to constants
  const STATS_DATA = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 2000 },
    { name: "Apr", value: 2780 },
    { name: "May", value: 1890 },
    { name: "Jun", value: 2390 },
  ];

  const APPOINTMENTS: Appointment[] = [
    {
      time: "12:30 PM",
      name: "Jennifer Martin",
      id: "99765 47564",
      source: "Google",
      type: "recurring",
      doctor: "Dr. Brandon McIntyre",
      status: "completed",
      duration: "00:00",
      validity: "valid",
      validUntil: "2025-02-28",
    },
    {
      time: "12:30 PM",
      name: "Glen McCann",
      id: "99765 47564",
      source: "Staff",
      type: "emergency",
      doctor: "Dr. Brandon McIntyre",
      status: "pending",
      duration: "00:03",
      validity: "expired",
      validUntil: "2024-12-31",
    },
    {
      time: "2:30 PM",
      name: "Sarah Johnson",
      id: "99765 47565",
      source: "Staff",
      type: "default",
      doctor: "Dr. Brandon McIntyre",
      status: "new",
      duration: "00:00",
      validity: "valid",
      validUntil: "2025-03-31",
    },
  ];

  const PIE_COLORS = ["#36b37e", "#ffab00", "#ff5630", "#00b8d9"];
  const PIE_DATA = [
    { name: "Completed", value: 60 },
    { name: "Pending", value: 20 },
    { name: "New", value: 10 },
    { name: "Follow-up", value: 10 },
  ];

  const STATUS_STYLES = {
    completed: "bg-green-100 text-green-800 hover:bg-green-100",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    new: "bg-red-100 text-red-800 hover:bg-red-100",
    followup: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  } as const;

  const VALIDITY_STYLES = {
    valid: "bg-emerald-100 text-emerald-800",
    expired: "bg-red-100 text-red-800",
  } as const;

  const filteredAppointments = APPOINTMENTS.filter((appointment) => {
    const statusMatch = tabType === "all" || appointment.status === tabType;
    const typeMatch =
      appointmentType === "all" || appointment.type === appointmentType;
    return statusMatch && typeMatch;
  });

  // Added responsive chart dimensions
  const chartDimensions = {
    width: undefined,
    height: 200,
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Stats Cards */}
        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Stats Visits
            </h2>
          </CardHeader>
          <CardContent className="pt-0">
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

        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Completed Visits
            </h2>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={STATS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Visit Status
            </h2>
          </CardHeader>
          <CardContent className="pt-0">
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

        <div className="md:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-2xl font-semibold">Today's Appointments</p>
          <div className="w-full md:w-auto">
            <Select
              value={appointmentType}
              onValueChange={(value: AppointmentType) =>
                setAppointmentType(value)
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="md:col-span-12">
          <Tabs
            value={tabType}
            onValueChange={(value: string) => setTabsType(value as TabsType)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
            </TabsList>

            <Card>
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 text-sm font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
                  <div>Mobile Number</div>
                  <div>Visit Type</div>
                  <div className="md:col-span-2">Doctor</div>
                  <div>Status</div>
                  <div>Validity</div>
                  <div>Actions</div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-11 gap-4 text-sm">
                      <div className="text-gray-900 font-medium">
                        {appointment.time}
                      </div>
                      <div className="md:col-span-2">
                        <Link
                          href={`/appointments/${appointment.id}`}
                          className="font-medium text-[#37AFE1] hover:underline flex items-center gap-1"
                        >
                          {appointment.name}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                          {appointment.source}
                        </div>
                      </div>
                      <div className="text-gray-600 font-medium">
                        {appointment.id}
                      </div>
                      <div className="text-gray-600 capitalize">
                        {appointment.type}
                      </div>
                      <div className="md:col-span-2">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-[#37AFE1]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {appointment.doctor}
                        </div>
                      </div>
                      <div>
                        <Badge
                          variant="secondary"
                          className={STATUS_STYLES[appointment.status]}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <Badge
                          variant="secondary"
                          className={VALIDITY_STYLES[appointment.validity]}
                        >
                          {appointment.validity.charAt(0).toUpperCase() +
                            appointment.validity.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
