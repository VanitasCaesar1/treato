"use client"
import React, { useEffect, useState } from "react";
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
  Loader2,
  AlertTriangle,
} from "lucide-react";

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

const RecordsTable = ({ records, showExport = true, search, setSearch, dateRange, setDateRange, showDownload = false }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm overflow-hidden mb-8">
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search records..."
            className="pl-10 h-10 bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px] bg-gray-50 border-0 rounded-lg focus:ring-1 focus:ring-gray-900">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
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
              href={`/dashboard/records/${record.id}`}
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
            {showDownload && record.recordType !== "confidential" && (
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

export default function RecordsPage() {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [transactionRecords, setTransactionRecords] = useState([]);
  const [labRecords, setLabRecords] = useState(labRecordsStatic);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add search and filter state
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");

  // Fetch diagnosis and appointments on mount
  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      setError(null);
      try {
        // Fetch diagnosis records
        const diagnosisRes = await fetch("/api/diagnosis/list?limit=100");
        const diagnosisData = await diagnosisRes.json();
        const diagnosisRecords = (diagnosisData.diagnoses || diagnosisData.diagnosis || []).map((diag) => ({
          date: diag.created_at?.split("T")[0] || "-",
          patientName: diag.patient_name || diag.patient_id || "Unknown",
          id: diag.id || diag.diagnosis_id || diag.appointment_id || "-",
          category: "Diagnosis",
          doctor: diag.doctor_name || diag.doctor_id || "-",
          status: diag.status || "verified",
          recordType: "confidential",
          description: diag.primary_diagnosis || diag.chief_complaint || "Diagnosis record",
        }));

        // Fetch appointments records
        const appointmentsRes = await fetch("/api/appointments/org?limit=100");
        const appointmentsData = await appointmentsRes.json();
        const appointmentsRecords = (appointmentsData.appointments || []).map((appt) => ({
          date: appt.appointment_date?.split("T")[0] || "-",
          patientName: appt.patient_name || appt.patient_id || "Unknown",
          id: appt.appointment_id || appt.id || "-",
          category: "Appointment",
          doctor: appt.doctor_name || appt.doctor_id || "-",
          status: appt.status || appt.appointment_status || "completed",
          recordType: "restricted",
          description: appt.chief_complaint || appt.reason || "Appointment record",
        }));

        // Optionally, fetch transactions from appointments with payment info
        const transactionRecordsFetched = (appointmentsData.appointments || []).filter(a => a.payment_status || a.amount).map((appt) => ({
          date: appt.appointment_date?.split("T")[0] || "-",
          patientName: appt.patient_name || appt.patient_id || "Unknown",
          id: appt.appointment_id || appt.id || "-",
          amount: appt.amount ? `$${appt.amount}` : "-",
          paymentMethod: appt.payment_method || "-",
          status: appt.payment_status || "completed",
          recordType: "financial",
          description: appt.payment_description || "Consultation payment",
        }));

        // Merge with static records
        setMedicalRecords([...diagnosisRecords, ...appointmentsRecords, ...medicalRecordsStatic]);
        setTransactionRecords([...transactionRecordsFetched, ...transactionRecordsStatic]);
        setLabRecords(labRecordsStatic); // Static for now
      } catch (err) {
        setError("Failed to load records");
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  // Filtering logic
  function filterRecords(records) {
    let filtered = records;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(r =>
        (r.patientName && r.patientName.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.doctor && r.doctor.toLowerCase().includes(q)) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    }
    if (dateRange !== "all") {
      const now = new Date();
      filtered = filtered.filter(r => {
        if (!r.date) return false;
        const recDate = new Date(r.date);
        if (dateRange === "today") {
          return recDate.toDateString() === now.toDateString();
        } else if (dateRange === "week") {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return recDate >= weekAgo && recDate <= now;
        } else if (dateRange === "month") {
          return recDate.getMonth() === now.getMonth() && recDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }
    return filtered;
  }

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
         
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <RecordStats
            icon={<Activity className="h-4 w-4" />}
            label="Medical Records"
            value={medicalRecords.length}
          />
          <RecordStats
            icon={<DollarSign className="h-4 w-4" />}
            label="Transaction Records"
            value={transactionRecords.length}
          />
          <RecordStats
            icon={<ClipboardList className="h-4 w-4" />}
            label="Lab Results"
            value={labRecords.length}
          />
          <RecordStats
            icon={<Lock className="h-4 w-4" />}
            label="Restricted Records"
            value={medicalRecords.filter(r => r.recordType === 'confidential' || r.recordType === 'restricted').length}
          />
        </div>

        <Tabs defaultValue="medical" className="space-y-4">
          <TabsList>
            <TabsTrigger value="medical">Medical Records</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Records</TabsTrigger>
            <TabsTrigger value="lab">Lab Results</TabsTrigger>
          </TabsList>

          <TabsContent value="medical">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Loading medical records...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-500">
                <AlertTriangle className="mr-2" /> {error}
              </div>
            ) : (
              <RecordsTable
                records={filterRecords(medicalRecords)}
                showExport={false}
                search={search}
                setSearch={setSearch}
                dateRange={dateRange}
                setDateRange={setDateRange}
                showDownload={true}
              />
            )}
          </TabsContent>

          <TabsContent value="transactions">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Loading transactions...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-500">
                <AlertTriangle className="mr-2" /> {error}
              </div>
            ) : (
              <RecordsTable
                records={filterRecords(transactionRecords)}
                showExport={true}
                search={search}
                setSearch={setSearch}
                dateRange={dateRange}
                setDateRange={setDateRange}
                showDownload={false}
              />
            )}
          </TabsContent>

          <TabsContent value="lab">
            <RecordsTable
              records={filterRecords(labRecords)}
              showExport={true}
              search={search}
              setSearch={setSearch}
              dateRange={dateRange}
              setDateRange={setDateRange}
              showDownload={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Static fallback data for initial render/merge
const medicalRecordsStatic = [
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

const transactionRecordsStatic = [
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

const labRecordsStatic = [
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
