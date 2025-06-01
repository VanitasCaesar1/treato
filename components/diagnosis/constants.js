// components/diagnosis/constants.js
import { 
  Thermometer, Activity, FileText, Stethoscope, 
  Shield, PenTool 
} from "lucide-react";

// Common symptom suggestions for quick entry
export const SYMPTOM_SUGGESTIONS = [
  "Fever", "Headache", "Cough", "Fatigue", "Nausea", 
  "Sore Throat", "Shortness of Breath"
];

// Default empty form structure to prevent null errors
export const DEFAULT_DIAGNOSIS_FORM = {
  appointment_id: "",
  patient_id: "",
  doctor_id: "",
  org_id: "",
  vitals: {
    temperature: "",
    heart_rate: "",
    blood_pressure: "",
    respiratory_rate: "",
    oxygen_saturation: "",
    timestamp: new Date().toISOString()
  },
  medical_history: { notes: "" },
  symptoms: [{ 
    description: "", 
    severity: "moderate", 
    onset: new Date().toISOString().split('T')[0] 
  }],
  diagnosis_info: [{ 
    condition: "", 
    code: "", 
    notes: "" 
  }],
  status: "draft",
  notes: "",
  treatment_plan: { 
    follow_up: "", 
    medications: [], 
    procedures: [] 
  }
};

// Section configuration for DRY approach
export const SECTIONS_CONFIG = {
  vitals: {
    icon: <Thermometer className="h-5 w-5" />,
    title: "Vitals",
    color: "bg-rose-500",
    gradient: "bg-gradient-to-r from-rose-400 to-red-400",
    bgColor: "bg-gradient-to-r from-rose-50 to-red-50",
    accentColor: "from-rose-100 to-red-100"
  },
  symptoms: {
    icon: <Activity className="h-5 w-5" />,
    title: "Symptoms",
    color: "bg-blue-500",
    gradient: "bg-gradient-to-r from-blue-400 to-indigo-400",
    bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
    accentColor: "from-blue-100 to-indigo-100"
  },
  medicalHistory: {
    icon: <FileText className="h-5 w-5" />,
    title: "Medical History",
    color: "bg-purple-500",
    gradient: "bg-gradient-to-r from-purple-400 to-violet-400",
    bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
    accentColor: "from-purple-100 to-violet-100"
  },
  diagnosis: {
    icon: <Stethoscope className="h-5 w-5" />,
    title: "Diagnosis",
    color: "bg-amber-500",
    gradient: "bg-gradient-to-r from-amber-400 to-yellow-400",
    bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
    accentColor: "from-amber-100 to-yellow-100"
  },
  treatment: {
    icon: <Shield className="h-5 w-5" />,
    title: "Prescription",
    color: "bg-emerald-500",
    gradient: "bg-gradient-to-r from-emerald-400 to-green-400",
    bgColor: "bg-gradient-to-r from-emerald-50 to-green-50",
    accentColor: "from-emerald-100 to-green-100"
  },
  notes: {
    icon: <PenTool className="h-5 w-5" />,
    title: "Additional Notes",
    color: "bg-gray-500",
    gradient: "bg-gradient-to-r from-gray-400 to-slate-400",
    bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
    accentColor: "from-gray-100 to-slate-100"
  }
};

// Severity options and styling
export const SEVERITY_OPTIONS = {
  mild: {
    label: "Mild",
    className: "bg-green-100 text-green-700 border-green-100 hover:bg-green-200 shadow-sm"
  },
  moderate: {
    label: "Moderate", 
    className: "bg-yellow-100 text-yellow-700 border-yellow-100 hover:bg-yellow-200 shadow-sm"
  },
  severe: {
    label: "Severe",
    className: "bg-red-100 text-red-700 border-red-100 hover:bg-red-200 shadow-sm"
  }
};

// Status options for diagnosis
export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-700" },
  { value: "tentative", label: "Tentative", color: "bg-yellow-100 text-yellow-700" },
];