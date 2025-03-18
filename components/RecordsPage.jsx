import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Search,
  Clock,
  User,
  FileIcon,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  ChevronRight,
  ClipboardList,
  Activity,
  MessageSquare,
  Lock,
} from "lucide-react";

const medicalRecords = [
  {
    date: "2024-02-01",
    patientName: "Sarah Johnson",
    id: "MR-2024-001",
    category: "Consultation",
    doctor: "Dr. Emily Chen",
    status: "verified",
    recordType: "confidential",
    description: "Annual check-up report with blood work results",
  },
  {
    date: "2024-02-01",
    patientName: "Robert Smith",
    id: "MR-2024-002",
    category: "Surgery",
    doctor: "Dr. James Wilson",
    status: "pending",
    recordType: "restricted",
    description: "Pre-surgery assessment notes",
  },
];

const transactionRecords = [
  {
    date: "2024-02-01",
    patientName: "Michael Brown",
    id: "TR-2024-045",
    amount: "$250.00",
    paymentMethod: "Credit Card",
    status: "completed",
    recordType: "financial",
    description: "Consultation fee payment",
  },
  {
    date: "2024-02-01",
    patientName: "Lisa Anderson",
    id: "TR-2024-046",
    amount: "$500.00",
    paymentMethod: "Insurance",
    status: "pending",
    recordType: "financial",
    description: "Laboratory tests payment",
  },
];

const labRecords = [
  {
    date: "2024-02-01",
    patientName: "David Wilson",
    id: "LR-2024-023",
    category: "Blood Test",
    doctor: "Dr. James Wilson",
    status: "pending",
    recordType: "restricted",
    description: "Comprehensive metabolic panel",
  },
];

const statusStyles = {
  verified: "bg-green-50 text-green-600 hover:bg-green-100",
  pending: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  completed: "bg-blue-50 text-blue-600 hover:bg-blue-100",
};

const recordTypeStyles = {
  confidential: "bg-red-50 text-red-600 hover:bg-red-100",
  financial: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  restricted: "bg-orange-50 text-orange-600 hover:bg-orange-100",
};

const RecordStats = ({ icon, label, value }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between mb-2">
      <div className="text-gray-400">{icon}</div>
      <span className="text-2xl font-medium text-gray-900">{value}</span>
    </div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
);

const RecordsTable = ({ records, showExport = true }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm overflow-hidden mb-8">
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search records..."
            className="pl-10 h-10 bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <Select>
          <SelectTrigger className="w-[140px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
        {showExport && (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>
    </div>

    <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
      <div className="grid grid-cols-[1fr_2fr_1fr_2fr_1fr_1fr_100px] gap-4">
        <div className="text-xs font-medium text-gray-500">Date</div>
        <div className="text-xs font-medium text-gray-500">Patient</div>
        <div className="text-xs font-medium text-gray-500">Record ID</div>
        <div className="text-xs font-medium text-gray-500">Description</div>
        <div className="text-xs font-medium text-gray-500">Status</div>
        <div className="text-xs font-medium text-gray-500">Classification</div>
        <div className="text-xs font-medium text-gray-500 text-right">
          Actions
        </div>
      </div>
    </div>

    <div>
      {records.map((record, index) => (
        <div
          key={index}
          className="px-6 py-4 grid grid-cols-[1fr_2fr_1fr_2fr_1fr_1fr_100px] gap-4 items-center border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors duration-200"
        >
          <div className="text-sm text-gray-900">{record.date}</div>
          <div>
            <Link
              href={`/records/${record.id}`}
              className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center gap-1 group"
            >
              {record.patientName}
              <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              {record.category || record.paymentMethod}
            </div>
          </div>
          <div className="text-sm text-gray-500">{record.id}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
          <div>
            <Badge
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[record.status]}`}
            >
              {record.status}
            </Badge>
          </div>
          <div>
            <Badge
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${recordTypeStyles[record.recordType]}`}
            >
              {record.recordType}
            </Badge>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {record.recordType !== "confidential" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default async function RecordsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">
              Records Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all patient records
            </p>
          </div>
          <Button className="bg-[#FFB347] text-black hover:bg-gray-800 rounded-full px-6">
            New Record
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <RecordStats
            icon={<Activity className="h-4 w-4" />}
            label="Medical Records"
            value="156"
          />
          <RecordStats
            icon={<DollarSign className="h-4 w-4" />}
            label="Transaction Records"
            value="89"
          />
          <RecordStats
            icon={<ClipboardList className="h-4 w-4" />}
            label="Lab Results"
            value="45"
          />
          <RecordStats
            icon={<Lock className="h-4 w-4" />}
            label="Restricted Records"
            value="34"
          />
        </div>

        <Tabs defaultValue="medical" className="space-y-4">
          <TabsList>
            <TabsTrigger value="medical">Medical Records</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Records</TabsTrigger>
            <TabsTrigger value="lab">Lab Results</TabsTrigger>
          </TabsList>

          <TabsContent value="medical">
            <RecordsTable records={medicalRecords} showExport={false} />
          </TabsContent>

          <TabsContent value="transactions">
            <RecordsTable records={transactionRecords} showExport={true} />
          </TabsContent>

          <TabsContent value="lab">
            <RecordsTable records={labRecords} showExport={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
