"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Download,
  Share,
  User,
  Calendar,
  Clock,
  Activity,
  FileText,
  Stethoscope,
  Pill,
  TestTube,
  Heart,
  Thermometer,
  Eye,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal
} from "lucide-react";

// Theme colors
const PRIMARY = "#37AFE1";
const SECONDARY = "#4CC9FE";

const statusConfig = {
  verified: {
    color: `bg-[${PRIMARY}]`,
    textColor: `text-[${PRIMARY}]`,
    bgColor: `bg-[${SECONDARY}]/20`,
    icon: CheckCircle,
    label: "Verified"
  },
  pending: {
    color: `bg-yellow-400`,
    textColor: `text-yellow-700`,
    bgColor: `bg-yellow-50`,
    icon: AlertCircle,
    label: "Pending"
  },
  completed: {
    color: `bg-[${SECONDARY}]`,
    textColor: `text-[${SECONDARY}]`,
    bgColor: `bg-[${SECONDARY}]/20`,
    icon: CheckCircle,
    label: "Completed"
  },
};

const recordTypeConfig = {
  confidential: {
    color: `bg-[${PRIMARY}]`,
    textColor: `text-[${PRIMARY}]`,
    bgColor: `bg-[${SECONDARY}]/20`,
    label: "Confidential"
  },
  financial: {
    color: `bg-purple-500`,
    textColor: `text-purple-700`,
    bgColor: `bg-purple-50`,
    label: "Financial"
  },
  restricted: {
    color: `bg-orange-500`,
    textColor: `text-orange-700`,
    bgColor: `bg-orange-50`,
    label: "Restricted"
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = config.icon;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgColor}`}
      style={{ background: status === 'verified' || status === 'completed' ? SECONDARY + '22' : undefined }}>
      <IconComponent className={`h-3.5 w-3.5 ${config.textColor}`} style={{ color: status === 'verified' || status === 'completed' ? PRIMARY : undefined }} />
      <span className={`text-xs font-medium ${config.textColor}`} style={{ color: status === 'verified' || status === 'completed' ? PRIMARY : undefined }}>
        {config.label}
      </span>
    </div>
  );
}

function RecordTypeBadge({ type }) {
  const config = recordTypeConfig[type] || recordTypeConfig.restricted;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgColor}`}
      style={{ background: type === 'confidential' ? SECONDARY + '22' : undefined }}>
      <div className={`w-2 h-2 rounded-full ${config.color}`} style={{ background: type === 'confidential' ? PRIMARY : undefined }} />
      <span className={`text-xs font-medium ${config.textColor}`} style={{ color: type === 'confidential' ? PRIMARY : undefined }}>
        {config.label}
      </span>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, unit }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2" style={{ background: SECONDARY + '22', borderRadius: '0.75rem' }}>
            <Icon className="h-4 w-4" style={{ color: PRIMARY }} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <div className="p-2" style={{ background: SECONDARY + '22', borderRadius: '0.75rem' }}>
            <Icon className="h-5 w-5" style={{ color: PRIMARY }} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

function ListItem({ children, onClick, showChevron = false }) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${onClick ? 'cursor-pointer active:bg-gray-50/50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex-1">
        {children}
      </div>
      {showChevron && <ChevronRight className="h-4 w-4 text-gray-400" />}
    </div>
  );
}

export default function RecordDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/diagnosis/${id}`);
        if (!res.ok) throw new Error('Failed to fetch record');
        const data = await res.json();
        if (!data.diagnosis) throw new Error('Record not found');
        // Map API data to UI format
        setRecord({
          type: "diagnosis",
          date: data.diagnosis.created_at?.split('T')[0] || '-',
          patientName: data.diagnosis.patient_name || data.diagnosis.patient_id || '-',
          id: data.diagnosis.id || data.diagnosis.diagnosis_id || data.diagnosis.appointment_id || id,
          category: "Diagnosis",
          doctor: data.diagnosis.doctor_name || data.diagnosis.doctor_id || '-',
          status: data.diagnosis.status || 'verified',
          recordType: "confidential",
          description: data.diagnosis.primary_diagnosis || data.diagnosis.chief_complaint || 'Diagnosis record',
          details: {
            vitals: data.diagnosis.vitals || {},
            symptoms: (data.diagnosis.symptoms || []).map(s => s.name || s.description || s) || [],
            medications: data.diagnosis.medications || [],
            lab_orders: data.diagnosis.lab_orders || [],
            recommendations: data.diagnosis.recommendations ? (Array.isArray(data.diagnosis.recommendations) ? data.diagnosis.recommendations : [data.diagnosis.recommendations]) : [],
            primary_diagnosis: data.diagnosis.primary_diagnosis,
            secondary_diagnoses: data.diagnosis.secondary_diagnoses || [],
            icd_codes: data.diagnosis.icd_codes || [],
            chief_complaint: data.diagnosis.chief_complaint,
            physical_exam: data.diagnosis.physical_exam,
            clinical_notes: data.diagnosis.clinical_notes,
            follow_up_date: data.diagnosis.follow_up_date,
            follow_up_notes: data.diagnosis.follow_up_notes
          }
        });
      } catch (err) {
        setError("Failed to load record");
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading record...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <AlertTriangle className="mr-2" /> {error}
        <Button variant="outline" className="ml-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }
  if (!record) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-10">
      <div className="max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{record.category} Record</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" /> {record.date}
              <User className="h-4 w-4 ml-4" /> {record.patientName}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={statusStyles[record.status] || ""}>{record.status}</Badge>
            <Badge className={recordTypeStyles[record.recordType] || ""}>{record.recordType}</Badge>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-gray-700 font-medium mb-1">Description</div>
          <div className="text-gray-900">{record.description}</div>
        </div>
        <div className="mb-4">
          <div className="text-gray-700 font-medium mb-1">Doctor</div>
          <div className="text-gray-900">{record.doctor}</div>
        </div>
        {/* Show more details if available */}
        {record.details && (
          <div className="mb-4">
            <div className="text-gray-700 font-medium mb-1">Details</div>
            <pre className="bg-gray-50 rounded p-3 text-xs text-gray-700 overflow-x-auto">
              {JSON.stringify(record.details, null, 2)}
            </pre>
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </div>
    </div>
  );
}
