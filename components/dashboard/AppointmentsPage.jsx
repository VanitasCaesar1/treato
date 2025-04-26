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
  Calendar,
  Plus,
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

// Updated appointments data structure based on the MongoDB schema
const appointments = [
  {
    patient_id: "ABCD1234",
    doctor_id: "550e8400-e29b-41d4-a716-446655440000",
    org_id: "org_123456789ABCDEFGHIJKLMNOPQ",
    patient_name: "Jennifer Martin",
    doctor_name: "Dr. Brandon McIntyre",
    appointment_status: "completed",
    payment_method: "Insurance",
    fee_type: "default",
    appointment_fee: 150,
    appointment_date: "2025-04-26T12:30:00Z",
    created_at: "2025-04-20T09:15:00Z",
    is_valid: true,
    next_visit_date: "2025-05-26T12:30:00Z"
  },
  {
    patient_id: "EFGH5678",
    doctor_id: "550e8400-e29b-41d4-a716-446655440001",
    org_id: "org_123456789ABCDEFGHIJKLMNOPQ",
    patient_name: "Glen McCann",
    doctor_name: "Dr. Sarah Johnson",
    appointment_status: "not_completed",
    payment_method: "Cash",
    fee_type: "emergency",
    appointment_fee: 200,
    appointment_date: "2025-04-26T14:00:00Z",
    created_at: "2025-04-25T18:30:00Z",
    is_valid: false,
    next_visit_date: "2025-05-10T15:45:00Z"
  },
  {
    patient_id: "IJKL9012",
    doctor_id: "550e8400-e29b-41d4-a716-446655440000",
    org_id: "org_123456789ABCDEFGHIJKLMNOPQ",
    patient_name: "Michael Peters",
    doctor_name: "Dr. Brandon McIntyre",
    appointment_status: "not_completed",
    payment_method: "Credit Card",
    fee_type: "recurring",
    appointment_fee: 120,
    appointment_date: "2025-04-26T16:15:00Z",
    created_at: "2025-04-22T11:20:00Z",
    is_valid: true,
    next_visit_date: "2025-05-15T16:15:00Z"
  }
];

const statusStyles = {
  completed: "bg-green-50 text-green-600 hover:bg-green-100",
  not_completed: "bg-amber-50 text-amber-600 hover:bg-amber-100",
};

const validityStyles = {
  true: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  false: "bg-red-50 text-red-600 hover:bg-red-100",
};

export default async function AppointmentsPage() {
  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date to show full date
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients or doctors..."
                  className="pl-10 h-10 bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900"
                />
              </div>
              
              <Select>
                <SelectTrigger className="w-[140px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not_completed">Not Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-[140px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="550e8400-e29b-41d4-a716-446655440000">Dr. Brandon McIntyre</SelectItem>
                  <SelectItem value="550e8400-e29b-41d4-a716-446655440001">Dr. Sarah Johnson</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
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
              
              <Select>
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
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
            <div className="grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr_1fr_1fr_100px] gap-4">
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

          <div>
            {appointments.map((appointment, index) => (
              <div
                key={index}
                className="px-6 py-4 grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr_1fr_1fr_100px] gap-4 items-center border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-200"
              >
                <div className="text-sm text-gray-900">
                  {formatDate(appointment.appointment_date)}
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(appointment.appointment_date).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                  </div>
                </div>
                <div>
                  <Link
                    href={`/appointments/${appointment.patient_id}`}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center gap-1 group"
                  >
                    {appointment.patient_name}
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      Next visit: {new Date(appointment.next_visit_date).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{appointment.patient_id}</div>
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
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${validityStyles[appointment.is_valid.toString()]}`}
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
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">12</span> appointments
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="text-gray-400">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-gray-100">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>

        {/* Ad space */}
        <div className="h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
          Advertisement Space
        </div>
      </div>
    </div>
  );
}