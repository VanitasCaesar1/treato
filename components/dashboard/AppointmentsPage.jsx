import React from "react";
import Link from "next/link";
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
import {
  Printer,
  Download,
  Search,
  Clock,
  Globe,
  User,
  Package,
  TimerIcon,
  LogOut,
  DollarSign,
  ChevronRight,
} from "lucide-react";

const stats = [
  {
    label: "Total Appointments",
    value: "12",
    icon: <Package className="h-4 w-4" />,
  },
  { label: "Waiting", value: "4", icon: <TimerIcon className="h-4 w-4" /> },
  { label: "In Progress", value: "5", icon: <Clock className="h-4 w-4" /> },
  { label: "Completed", value: "1", icon: <LogOut className="h-4 w-4" /> },
  { label: "Active Doctors", value: "2", icon: <User className="h-4 w-4" /> },
  {
    label: "Pending Bills",
    value: "1",
    icon: <DollarSign className="h-4 w-4" />,
  },
];

const appointments = [
  {
    time: "12:30 PM",
    name: "Jennifer Martin",
    id: "99765 47564",
    source: "Google",
    type: "Old Patient",
    doctor: "Dr. Brandon McIntyre",
    status: "completed",
    validity: "valid",
  },
  {
    time: "12:30 PM",
    name: "Glen McCann",
    id: "99765 47564",
    source: "Staff",
    type: "Old Patient",
    doctor: "Dr. Brandon McIntyre",
    status: "pending",
    validity: "expired",
  },
];

const specializations = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
];

const statusStyles = {
  completed: "bg-green-50 text-green-600 hover:bg-green-100",
  pending: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  new: "bg-blue-50 text-blue-600 hover:bg-blue-100",
};

const validityStyles = {
  valid: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  expired: "bg-red-50 text-red-600 hover:bg-red-100",
};

export default async function AppointmentsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Appointments</h1>
          <Button className="bg-[#FFB347] text-black hover:bg-gray-800 rounded-full px-6">
            More Settings/Options here
          </Button>
        </div>

        <div className="grid grid-cols-6 gap-6 mb-8">
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

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* Search and filters section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients..."
                  className="pl-10 h-10 bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900"
                />
              </div>
              {["Hospital", "Department", "Doctor", "Status"].map((label) => (
                <Select key={label}>
                  <SelectTrigger className="w-[140px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
                    <SelectValue placeholder={label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{label} 1</SelectItem>
                    <SelectItem value="2">{label} 2</SelectItem>
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>

          <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr_1fr_100px] gap-4">
              <div className="text-xs font-medium text-gray-500">Time</div>
              <div className="text-xs font-medium text-gray-500">Patient</div>
              <div className="text-xs font-medium text-gray-500">ID</div>
              <div className="text-xs font-medium text-gray-500">Type</div>
              <div className="text-xs font-medium text-gray-500">Doctor</div>
              <div className="text-xs font-medium text-gray-500">Status</div>
              <div className="text-xs font-medium text-gray-500">Validity</div>
              <div className="text-xs font-medium text-gray-500 text-right">
                Actions
              </div>
            </div>
          </div>

          <div>
            {appointments.map((appointment, index) => (
              <div
                key={index}
                className="px-6 py-4 grid grid-cols-[1fr_2fr_1fr_1fr_2fr_1fr_1fr_100px] gap-4 items-center border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-200"
              >
                <div className="text-sm text-gray-900">{appointment.time}</div>
                <div>
                  <Link
                    href={`/appointments/${appointment.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center gap-1 group"
                  >
                    {appointment.name}
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Globe className="h-3 w-3" />
                    {appointment.source}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{appointment.id}</div>
                <div className="text-sm text-gray-500">{appointment.type}</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {appointment.doctor}
                  </span>
                </div>
                <div>
                  <Badge
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium  ${statusStyles[appointment.status]}`}
                  >
                    {appointment.status}
                  </Badge>
                </div>
                <div>
                  <Badge
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${validityStyles[appointment.validity]}`}
                  >
                    {appointment.validity}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Added space for ads */}
        <div className="h-32 bg-gray-100 rounded-2xl">{/* Ad space */}</div>
      </div>
    </div>
  );
}
