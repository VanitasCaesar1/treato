"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Save, Printer, User, Stethoscope, Calendar, Star } from "lucide-react";
import { PrescriptionPDF, createPrescriptionData } from '@/components/diagnosis/PrescriptionPDF';
import TreatmentPlan from "@/components/diagnosis/TreatmentPlanSection";
import DiagnosisSection from '@/components/diagnosis/DiagnosisSection'
import VitalsSection from "@/components/diagnosis/VitalsSection";
import SymptomsSection from "@/components/diagnosis/SymptomsSection";
import DermatologySection from "@/components/diagnosis/DermatologySection";
import CardiologySection from "@/components/diagnosis/CardiologySection";
import OrthopedicsSection from "@/components/diagnosis/OrthopedicsSection";
import NeurologySection from "@/components/diagnosis/NeurologySection";
import PsychiatrySection from "@/components/diagnosis/PsychiatrySection";

// ===== SPECIALIZATION CONFIGURATION =====
const SPECIALIZATION_CONFIG = {
  'dermatology': {
    component: DermatologySection,
    icon: '🧴',
    title: 'Dermatology Assessment',
    description: 'Skin conditions, lesions, and dermatological examination',
    fields: ['lesion_description', 'distribution', 'skin_color_changes', 'affected_areas']
  },
  'dermatologist': {
    component: DermatologySection,
    icon: '🧴',
    title: 'Dermatology Assessment',
    description: 'Skin conditions, lesions, and dermatological examination',
    fields: ['lesion_description', 'distribution', 'skin_color_changes', 'affected_areas']
  },
  'cardiology': {
    component: CardiologySection,
    icon: '❤️',
    title: 'Cardiac Assessment',
    description: 'Heart conditions, ECG findings, and cardiovascular examination',
    fields: ['ecg_findings', 'heart_sounds', 'chest_pain_assessment', 'cardiac_risk_factors']
  },
  'cardiologist': {
    component: CardiologySection,
    icon: '❤️',
    title: 'Cardiac Assessment',
    description: 'Heart conditions, ECG findings, and cardiovascular examination',
    fields: ['ecg_findings', 'heart_sounds', 'chest_pain_assessment', 'cardiac_risk_factors']
  },
  'neurology': {
    component: NeurologySection,
    icon: '🧠',
    title: 'Neurological Assessment',
    description: 'Neurological examination, reflexes, and cognitive assessment',
    fields: ['neurological_exam', 'reflexes', 'cognitive_status', 'motor_function']
  },
  'neurologist': {
    component: NeurologySection,
    icon: '🧠',
    title: 'Neurological Assessment',
    description: 'Neurological examination, reflexes, and cognitive assessment',
    fields: ['neurological_exam', 'reflexes', 'cognitive_status', 'motor_function']
  },
  'orthopedics': {
    component: OrthopedicsSection,
    icon: '🦴',
    title: 'Orthopedic Assessment',
    description: 'Musculoskeletal examination, joint mobility, and bone health',
    fields: ['joint_examination', 'range_of_motion', 'muscle_strength', 'gait_analysis']
  },
  'orthopedist': {
    component: OrthopedicsSection,
    icon: '🦴',
    title: 'Orthopedic Assessment',
    description: 'Musculoskeletal examination, joint mobility, and bone health',
    fields: ['joint_examination', 'range_of_motion', 'muscle_strength', 'gait_analysis']
  },
  'psychiatry': {
    component: PsychiatrySection,
    icon: '🧠',
    title: 'Psychiatric Assessment',
    description: 'Mental health evaluation and psychological assessment',
    fields: ['mental_status', 'mood_assessment', 'cognitive_function', 'risk_assessment']
  },
  'psychiatrist': {
    component: PsychiatrySection,
    icon: '🧠',
    title: 'Psychiatric Assessment',
    description: 'Mental health evaluation and psychological assessment',
    fields: ['mental_status', 'mood_assessment', 'cognitive_function', 'risk_assessment']
  },
};

// Fixed specialization utility functions
const getSpecializationConfig = (specialization) => {
  if (!specialization) return null;
  
  let normalized;
  
  // Handle different data types
  if (typeof specialization === 'string') {
    normalized = specialization.toLowerCase().trim();
  } else if (typeof specialization === 'object' && specialization !== null) {
    // Try different possible property names
    const possibleKeys = ['name', 'type', 'primary', 'title', 'specialty'];
    let found = false;
    
    for (const key of possibleKeys) {
      if (specialization[key]) {
        normalized = String(specialization[key]).toLowerCase().trim();
        found = true;
        break;
      }
    }
    
    if (!found) {
      // If it's an object but no recognized keys, convert to string
      normalized = String(specialization).toLowerCase().trim();
    }
  } else {
    normalized = String(specialization).toLowerCase().trim();
  }
  
  // Handle edge cases
  if (!normalized || 
      normalized === '[object object]' || 
      normalized === 'undefined' || 
      normalized === 'null' ||
      normalized === 'nan') {
    return null;
  }
  
  // Check for exact matches first
  if (SPECIALIZATION_CONFIG[normalized]) {
    return SPECIALIZATION_CONFIG[normalized];
  }
  
  // Check for partial matches (e.g., if someone enters "cardiac" for "cardiology")
  const partialMatches = Object.keys(SPECIALIZATION_CONFIG).filter(key => 
    key.includes(normalized) || normalized.includes(key)
  );
  
  if (partialMatches.length > 0) {
    return SPECIALIZATION_CONFIG[partialMatches[0]];
  }
  
  return null;
};

// Enhanced function to extract specialization from doctor data
const getSpecializationFromDoctor = (doctorData) => {
  if (!doctorData) {
    console.log('❌ No doctor data provided');
    return null;
  }
  
  console.log('🔍 Extracting specialization from doctor data:', doctorData);
  
  // Handle the JSONB specialization object from your backend
  if (doctorData.specialization) {
    console.log('📋 Found specialization field:', doctorData.specialization);
    
    // If it's already a parsed object with primary field
    if (typeof doctorData.specialization === 'object' && doctorData.specialization.primary) {
      console.log('✅ Found specialization.primary:', doctorData.specialization.primary);
      return doctorData.specialization.primary.toLowerCase().trim();
    }
    
    // If it's a string representation of the specialization
    if (typeof doctorData.specialization === 'string') {
      try {
        const parsed = JSON.parse(doctorData.specialization);
        if (parsed.primary) {
          console.log('✅ Parsed specialization.primary:', parsed.primary);
          return parsed.primary.toLowerCase().trim();
        }
      } catch (e) {
        // If it's just a plain string, use it directly
        console.log('✅ Using specialization as plain string:', doctorData.specialization);
        return doctorData.specialization.toLowerCase().trim();
      }
    }
    
    // If specialization is an object but doesn't have primary, try other common fields
    if (typeof doctorData.specialization === 'object') {
      const possibleFields = ['name', 'type', 'specialty', 'field', 'department'];
      for (const field of possibleFields) {
        if (doctorData.specialization[field]) {
          console.log(`✅ Found specialization.${field}:`, doctorData.specialization[field]);
          return doctorData.specialization[field].toLowerCase().trim();
        }
      }
    }
  }
  
  // Try other possible field names at the root level
  const possibleFields = [
    'specialty', 'Specialty', 'department', 'Department', 
    'field', 'Field', 'medical_specialty', 'doctor_specialty'
  ];
  
  for (const field of possibleFields) {
    if (doctorData[field]) {
      console.log(`✅ Found root level ${field}:`, doctorData[field]);
      
      // Handle if it's an object
      if (typeof doctorData[field] === 'object' && doctorData[field].primary) {
        return doctorData[field].primary.toLowerCase().trim();
      }
      
      // Handle if it's a string
      if (typeof doctorData[field] === 'string') {
        return doctorData[field].toLowerCase().trim();
      }
    }
  }
  
  console.log('❌ No specialization found in doctor data');
  console.log('🔍 Available fields:', Object.keys(doctorData));
  return null;
};


// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }
  
  return current;
};


// Updated SpecializationWrapper component with better debugging
const SpecializationWrapper = ({ doctorData, specializationData, onSpecializationChange }) => {
  const specialization = getSpecializationFromDoctor(doctorData);
  const config = getSpecializationConfig(specialization);

  console.log('🔬 SpecializationWrapper Debug:', {
    doctorData: doctorData,
    extractedSpecialization: specialization,
    config: config,
    specializationData: specializationData,
    availableConfigs: Object.keys(SPECIALIZATION_CONFIG)
  });

  // Enhanced debug section for better troubleshooting
  if (!specialization) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Star className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium mb-2">No specialization information found</p>
        
        {/* Enhanced Debug Information */}
        <details className="text-xs text-gray-500 mt-4 text-left">
          <summary className="cursor-pointer mb-2">🔍 Debug Information (Click to expand)</summary>
          <div className="mt-2 p-4 bg-gray-50 rounded text-left space-y-2">
            <div>
              <strong>Doctor Data Structure:</strong>
              <pre className="mt-1 bg-white p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(doctorData, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Available Doctor Fields:</strong> 
              <span className="ml-2">{Object.keys(doctorData || {}).join(', ')}</span>
            </div>
            <div>
              <strong>Specialization Field Value:</strong>
              <pre className="mt-1 bg-white p-2 rounded text-xs">
                {JSON.stringify(doctorData?.specialization, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Available Specialization Configs:</strong> 
              <span className="ml-2">{Object.keys(SPECIALIZATION_CONFIG).join(', ')}</span>
            </div>
          </div>
        </details>
      </div>
    );
  }

  // If specialization found but no config, show coming soon
  if (!config) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
          <Star className="h-8 w-8 text-purple-400" />
        </div>
        <h4 className="font-semibold text-lg mb-2 text-gray-800">
          {specialization.charAt(0).toUpperCase() + specialization.slice(1)}
        </h4>
        <p className="text-gray-600 mb-2">
          Specialized assessment tools for this field are coming soon.
        </p>
        <p className="text-sm text-purple-600 font-medium">
          Currently using general assessment
        </p>
        
        {/* Debug info for unmatched specializations */}
        <details className="text-xs text-gray-500 mt-4">
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-2 p-2 bg-gray-50 rounded text-left">
            <p><strong>Found Specialization:</strong> "{specialization}"</p>
            <p><strong>Available Configs:</strong> {Object.keys(SPECIALIZATION_CONFIG).join(', ')}</p>
            <p><strong>Suggestion:</strong> Add "{specialization}" to SPECIALIZATION_CONFIG</p>
          </div>
        </details>
      </div>
    );
  }

    // Render the specialization component
  const SpecializationComponent = config.component;

  return (
    <div>
      <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{config.icon}</span>
          <h4 className="font-semibold text-purple-800 text-lg">
            {config.title}
          </h4>
        </div>
        <p className="text-sm text-purple-600">
          {config.description}
        </p>
      </div>
      <SpecializationComponent
        data={specializationData || {}}
        onChange={onSpecializationChange}
        doctorInfo={doctorData}
      />
    </div>
  );
};

// ===== HOOKS =====
const useURLParams = () => {
  const [params, setParams] = useState({});
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setParams(Object.fromEntries(urlParams));
    }
  }, []);
  return { get: (key) => params[key] || null };
};

const useRouter = () => ({
  back: () => window?.history.back(),
  push: (url) => window && (window.location.href = url)
});

// ===== TYPES & CONSTANTS =====
interface DiagnosisFormData {
  appointment_id: string; 
  patient_id: string; 
  doctor_id: string; 
  org_id: string;
  vitals: any; 
  symptoms: any[]; 
  diagnosis_info: any[]; 
  status: string;
  treatment_plan?: any; 
  notes?: string;
  clinical_notes?: string; 
  specialization?: { 
    type: string; 
    data: any;
  };
}

const DEFAULT_FORM: DiagnosisFormData = {
  appointment_id: "", patient_id: "", doctor_id: "", org_id: "",
  vitals: { timestamp: new Date().toISOString() },
  symptoms: [{ id: Date.now(), name: "", severity: "moderate" }],
  diagnosis_info: [{ condition: "", code: "", notes: "" }],
  status: "draft", notes: "",
  treatment_plan: { 
    follow_up: { date: "", duration: "", notes: "" }, 
    medications: [], procedures: [], lifestyle_changes: [], referrals: []
  },
  specialization: { type: "", data: {} }
};

const SECTIONS = {
  vitals: { icon: "🌡️", title: "Vital Signs" },
  symptoms: { icon: "⚡", title: "Symptoms" },
  diagnosis: { icon: "🩺", title: "Diagnosis" },
  specialization: { icon: "🔬", title: "Specialization", dynamic: true },
  treatment: { icon: "🛡️", title: "Treatment Plan" },
  notes: { icon: "✏️", title: "Additional Notes" }
};

// ===== UTILITY FUNCTIONS =====
class APIError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(endpoint, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  
  const data = await response.text().then(text => text ? JSON.parse(text) : {});
  
  if (!response.ok) {
    throw new APIError(data?.error || data?.message || `HTTP ${response.status}`, response.status);
  }
  return data;
};

const fetchExistingDiagnosis = async (appointmentId: string) => {
  try {
    const response = await apiCall(`/api/diagnosis/${encodeURIComponent(appointmentId)}`);
    return response?.diagnosis || response?.diagnoses?.[0] || (response?.id ? response : null);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};

// Transform diagnosis data to form format
const transformDiagnosisToForm = (diagnosis: any): DiagnosisFormData => {
  const vitals = diagnosis.vitals || {
    temperature: diagnosis.temperature,
    blood_pressure: diagnosis.blood_pressure,
    heart_rate: diagnosis.heart_rate,
    weight: diagnosis.weight,
    height: diagnosis.height,
    timestamp: diagnosis.created_at || new Date().toISOString()
  };

  let symptoms = [];
  if (diagnosis.symptoms?.length) {
    symptoms = diagnosis.symptoms.map((symptom, index) => ({
      id: symptom.id || symptom.symptom_id || Date.now() + index,
      name: symptom.name || symptom.description || symptom.symptom || "",
      severity: symptom.severity || "moderate"
    }));
  } else if (diagnosis.chief_complaint) {
    symptoms = [{ 
      id: Date.now(), 
      name: diagnosis.chief_complaint, 
      severity: "moderate" 
    }];
  } else {
    symptoms = [{ id: Date.now(), name: "", severity: "moderate" }];
  }

  let diagnosis_info = [];
  if (diagnosis.primary_diagnosis) {
    diagnosis_info.push({ condition: diagnosis.primary_diagnosis, code: diagnosis.icd_codes?.[0] || "", notes: diagnosis.clinical_notes || "" });
    diagnosis.secondary_diagnoses?.forEach((condition, index) => {
      if (condition) diagnosis_info.push({ condition, code: diagnosis.icd_codes?.[index + 1] || "", notes: "" });
    });
  }
  if (!diagnosis_info.length) diagnosis_info = [{ condition: "", code: "", notes: "" }];

  const medications = diagnosis.medications?.map(med => ({
    name: med.name || "", dosage: med.dosage || "", frequency: med.frequency || "",
    duration: med.duration || "", instructions: med.instructions || "", route: med.route || "oral"
  })) || [];

  // Parse specialization data
  let specializationData = {};
  let specializationType = "";
    // Try to extract specialization type
  if (diagnosis.specialty) {
    specializationType = diagnosis.specialty;
  } else if (diagnosis.doctor_specialty) {
    specializationType = diagnosis.doctor_specialty;
  }

   if (diagnosis.specialty_data) {
    try {
      if (typeof diagnosis.specialty_data === 'string') {
        specializationData = JSON.parse(diagnosis.specialty_data);
      } else if (typeof diagnosis.specialty_data === 'object') {
        specializationData = diagnosis.specialty_data;
      }
    } catch (e) {
      console.warn('Failed to parse specialty_data:', e);
      specializationData = {};
    }
  }

  return {
    appointment_id: diagnosis.appointment_id || "",
    patient_id: diagnosis.patient_id || "",
    doctor_id: diagnosis.doctor_id || "",
    org_id: diagnosis.org_id || "",
    vitals, symptoms, diagnosis_info,
    status: diagnosis.status || "draft",
    notes: diagnosis.clinical_notes || diagnosis.physical_exam || "",
    treatment_plan: {
      follow_up: { date: diagnosis.follow_up_date || "", duration: "", notes: diagnosis.follow_up_notes || "" },
      medications, procedures: diagnosis.procedures || [],
      lifestyle_changes: diagnosis.recommendations ? [diagnosis.recommendations] : [],
      referrals: diagnosis.referrals || [], lab_orders: diagnosis.lab_orders || []
    },
    specialization: {
      type: specializationType,
      data: specializationData
    }
  };
};

// ===== COMPONENTS =====
// Enhanced CollapsibleSection for specialization
const CollapsibleSection = ({ sectionKey, section, isOpen, onToggle, children, doctorData }) => {
  // Special handling for specialization section
  if (sectionKey === 'specialization') {
    const specialization = getSpecializationFromDoctor(doctorData);
    const config = getSpecializationConfig(specialization);

    if (config) {
      section = {
        ...section,
        icon: config.icon,
        title: config.title,
        description: config.description
      };
    } else {
      section = {
        ...section,
        icon: "🔬",
        title: specialization ? `${specialization.charAt(0).toUpperCase() + specialization.slice(1)} Assessment` : "Specialization Assessment",
        description: specialization ? `Assessment tools for ${specialization}` : "Specialized medical assessment"
      };
    }
  }
return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        onClick={onToggle} 
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{section.icon}</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-gray-600">{section.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {sectionKey === 'specialization' && doctorData && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {getSpecializationFromDoctor(doctorData) || "General"}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-6 pt-0 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const NotesSection = ({ notes, onChange }) => {
  const handleNotesChange = (value) => {
    console.log('📝 Notes changed:', { value, length: value.length });
    onChange(value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Clinical Notes
      </label>
      <textarea
        value={notes || ""}
        onChange={(e) => handleNotesChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows={4}
        placeholder="Additional clinical notes, observations, or recommendations..."
      />
      {notes && (
        <div className="mt-2 text-sm text-gray-500">
          {notes.length} characters
        </div>
      )}
    </div>
  );
};

const PrescriptionHeader = ({ appointmentData, doctorData }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <Stethoscope className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Medical Diagnosis</h1>
          <p className="text-gray-600">Patient: {appointmentData?.patient_name || "Loading..."}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">Doctor</p>
        <p className="font-medium text-gray-800">{doctorData?.name || "Loading..."}</p>
        <p className="text-sm text-gray-500">{getSpecializationFromDoctor(doctorData) || ""}</p>
      </div>
    </div>
  </div>
);

const SidebarPanel = ({ patientData, medicalHistory, loading }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <User className="h-5 w-5 mr-2" />Patient Information
      </h3>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {['id', 'name', 'age', 'gender', 'phone'].map(field => (
            <div key={field}>
              <span className="text-gray-500 capitalize">{field}:</span>
              <p className="font-medium">{patientData?.[field] || "N/A"}{field === 'age' ? ' years' : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <Calendar className="h-5 w-5 mr-2" />Medical History
      </h3>
      <div className="space-y-3 text-sm">
        {medicalHistory?.length ? (
          medicalHistory.slice(0, 5).map(item => (
            <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">{item.condition}</p>
              <p className="text-gray-500">
                {new Date(item.diagnosis_date).toLocaleDateString()}
                {item.doctor_name && ` • Dr. ${item.doctor_name}`}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No medical history available</p>
        )}
      </div>
    </div>
  </div>
);

const ActionButtons = ({ submitting, onBack, onSave, prescriptionData }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />Back
      </Button>
      <div className="flex space-x-3">
        <PrescriptionPDF data={prescriptionData} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Printer className="h-4 w-4 mr-2" />Print
        </PrescriptionPDF>
        <Button onClick={onSave} disabled={submitting}>
          <Save className="h-4 w-4 mr-2" />{submitting ? "Saving..." : "Save Diagnosis"}
        </Button>
      </div>
    </div>
  </div>
);

// Transform form data for API
const transformDiagnosisData = (form, appointmentData, doctorData, patientData) => {
  const symptoms = form.symptoms
    ?.filter(s => s.name?.trim())
    .map((s, index) => ({
      symptom_id: s.id || index + 1,
      name: s.name || "",
      description: s.name || "",
      severity: s.severity || "moderate",
      category: "General",
      onset_date: null,
      duration: null,
      location: null,
      notes: null,
      frequency: null,
      progression: null,
      radiation: null,
      scale_rating: null
    })) || [];

  console.log('🔍 Frontend sending symptoms as structured objects:', symptoms);

  const symptomTimeline = symptoms.map(s => ({
    symptom_name: s.name,
    onset_date: null,
    current_status: "active",
    resolution_date: null,
    severity_progression: [{
      date: new Date().toISOString().split('T')[0],
      severity: s.severity,
      scale_rating: null
    }]
  }));

  const symptomSummary = {
    total_count: symptoms.length,
    primary_complaint: symptoms[0]?.name || "",
    duration_range: null,
    severity_distribution: {
      mild: symptoms.filter(s => s.severity === 'mild').length,
      moderate: symptoms.filter(s => s.severity === 'moderate').length,
      severe: symptoms.filter(s => s.severity === 'severe').length
    },
    categories: ["General"],
    locations: [],
    avg_pain_scale: null,
    last_updated: new Date().toISOString()
  };

  const medications = form.treatment_plan?.medications?.filter(m => m.name?.trim()).map(m => ({
    name: m.name.trim(),
    dosage: m.dosage || "",
    frequency: m.frequency || "",
    duration: m.duration || "",
    instructions: m.instructions || "",
    route: m.route || "oral"
  })) || [];

  const validDiagnoses = form.diagnosis_info?.filter(d => d.condition?.trim()) || [];
  const clinicalNotes = form.notes || form.clinical_notes || "";
  
  console.log('📝 Frontend clinical notes processing:', {
    form_notes: form.notes,
    form_clinical_notes: form.clinical_notes,
    final_clinical_notes: clinicalNotes,
    notes_length: clinicalNotes.length
  });

  // Handle specialization data
  const specializationData = form.specialization?.data || {};
  const specializationType = form.specialization?.type || getSpecializationFromDoctor(doctorData) || "";
  
  return {
    appointment_id: form.appointment_id,
    patient_id: form.patient_id,
    doctor_id: form.doctor_id,
    org_id: form.org_id || "",
    status: form.status || "finalized",
    
    patient_name: appointmentData?.patient_name || patientData?.name || "",
    patient_age: patientData?.age || null,
    patient_gender: patientData?.gender || "",
    
    doctor_name: doctorData?.name || "",
    doctor_specialty: getSpecializationFromDoctor(doctorData) || "",
    
    temperature: form.vitals?.temperature?.toString() || "",
    blood_pressure: form.vitals?.blood_pressure?.toString() || "",
    heart_rate: form.vitals?.heart_rate?.toString() || "",
    weight: form.vitals?.weight?.toString() || "",
    height: form.vitals?.height?.toString() || "",
    bmi: form.vitals?.bmi?.toString() || "",
    respiratory_rate: form.vitals?.respiratory_rate?.toString() || "",
    oxygen_saturation: form.vitals?.oxygen_saturation?.toString() || "",
    
    symptoms: symptoms,
    chief_complaint: symptoms[0]?.name || "",
    primary_complaint: symptoms[0]?.name || "",
    
    symptom_timeline: JSON.stringify(symptomTimeline),
    symptom_summary: JSON.stringify(symptomSummary),
    symptom_categories: ["General"],
    
    symptom_triggers: null,
    symptom_relieving_factors: null,
    symptom_quality_details: null,
    symptom_progression: null,
    symptom_radiation_patterns: null,
    
    physical_exam: clinicalNotes,
    clinical_notes: clinicalNotes,
    notes: clinicalNotes,
    
    primary_diagnosis: validDiagnoses[0]?.condition || "Pending diagnosis",
    secondary_diagnoses: validDiagnoses.slice(1).map(d => d.condition.trim()).filter(Boolean),
    icd_codes: validDiagnoses.map(d => d.code).filter(Boolean),
    
    medications,
    procedures: form.treatment_plan?.procedures || [],
    recommendations: form.treatment_plan?.lifestyle_changes?.filter(Boolean).join('; ') || "",
    
    follow_up_date: form.treatment_plan?.follow_up?.date || null,
    follow_up_notes: form.treatment_plan?.follow_up?.notes || "",
    
    lab_orders: form.treatment_plan?.lab_orders || [],
    referrals: form.treatment_plan?.referrals || [],
    specialty: specializationType,
    specialty_data: JSON.stringify(specializationData),
    test_results: [],
    attachments: []
  };
};

// ===== MAIN COMPONENT =====
export default function DiagnosisPage() {
  const router = useRouter();
  const { get } = useURLParams();
  const appointmentId = get("appointmentId");
  
  const [state, setState] = useState({
    loading: true, appointmentData: null, doctorData: null, patientData: null,
    medicalHistory: [], error: null, submitting: false
  });

  const [form, setForm] = useState<DiagnosisFormData>(DEFAULT_FORM);
  const [openSections, setOpenSections] = useState({
    vitals: true, symptoms: true, diagnosis: true, specialization: true, treatment: true, notes: false
  });

  const prescriptionData = createPrescriptionData(appointmentId || '', state.appointmentData, state.doctorData, state.patientData, form);

  useEffect(() => {
    const loadData = async () => {
      if (!appointmentId) {
        setState(prev => ({ ...prev, error: "No appointment ID provided", loading: false }));
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const [appointmentRes, doctorRes] = await Promise.all([
          apiCall(`/api/appointments/${appointmentId}`),
          apiCall(`/api/user/profile`)
        ]);

        const appointmentData = appointmentRes.appointment || appointmentRes;
        const doctorData = doctorRes.user || doctorRes;
        const doctorId = doctorData.id || doctorData.user_id || doctorData.UserID || doctorData.doctor_id;
        const orgId = doctorData.org_id || doctorData.hospital_id || doctorData.HospitalID;

        if (!doctorId) throw new Error("Doctor ID not found in profile data");

        const normalizedDoctorData = {
          ...doctorData, id: doctorId, org_id: orgId,
          name: doctorData.name || doctorData.Name,
          specialization: doctorData.specialization || doctorData.Specialization || { primary: null }
        };

        const [patientRes, historyRes] = await Promise.all([
          apiCall(`/api/patients/${appointmentData.patient_id}`).catch(() => ({ patient: null })),
          apiCall(`/api/patients/medical-history/${appointmentData.patient_id}`).catch(() => ({ history: [] }))
        ]);

        let existingDiagnosis = null;
        try {
          existingDiagnosis = await fetchExistingDiagnosis(appointmentId);
        } catch (error) {
          console.warn('Failed to fetch existing diagnosis:', error);
        }

        const patientData = patientRes.patient || null;
        const medicalHistory = historyRes.history || [];

        setForm(prev => ({
          ...prev,
          appointment_id: appointmentId,
          patient_id: appointmentData.patient_id,
          doctor_id: doctorId,
          org_id: orgId,
          ...(existingDiagnosis ? transformDiagnosisToForm(existingDiagnosis) : {})
        }));

        setState(prev => ({
          ...prev,
          appointmentData,
          doctorData: normalizedDoctorData,
          patientData,
          medicalHistory,
          loading: false
        }));

      } catch (error) {
        console.error('Error loading data:', error);
        setState(prev => ({
          ...prev,
          error: `Failed to load data: ${error.message}`,
          loading: false
        }));
      }
    };

    loadData();
  }, [appointmentId]);

  const handleFormChange = (field, value) => {
    console.log(`📝 Form field changed: ${field}`, value);
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecializationChange = (data) => {
  console.log('🔬 Specialization data changed:', {
    newData: data,
    dataType: typeof data,
    keys: Object.keys(data || {})
  });
  
  setForm(prev => ({
    ...prev,
    specialization: {
      ...prev.specialization,
      data: { ...prev.specialization.data, ...data }
    }
  }));
};

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      const diagnosisData = transformDiagnosisData(form, state.appointmentData, state.doctorData, state.patientData);
      
      console.log('💾 Saving diagnosis data:', diagnosisData);

      const response = await apiCall('/api/diagnosis', {
        method: 'POST',
        body: JSON.stringify(diagnosisData),
      });

      console.log('✅ Diagnosis saved successfully:', response);
      
      // Show success message or redirect
      alert('Diagnosis saved successfully!');
      
    } catch (error) {
      console.error('❌ Error saving diagnosis:', error);
      setState(prev => ({
        ...prev,
        error: `Failed to save diagnosis: ${error.message}`
      }));
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading diagnosis form...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{state.error}</AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto p-6">
        <PrescriptionHeader 
          appointmentData={state.appointmentData} 
          doctorData={state.doctorData}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Vitals Section */}
            <CollapsibleSection
              sectionKey="vitals"
              section={SECTIONS.vitals}
              isOpen={openSections.vitals}
              onToggle={() => toggleSection('vitals')}
              doctorData={state.doctorData}
            >
              <VitalsSection
                vitals={form.vitals}
                onChange={(vitals) => handleFormChange('vitals', vitals)}
              />
            </CollapsibleSection>

            {/* Symptoms Section */}
            <CollapsibleSection
              sectionKey="symptoms"
              section={SECTIONS.symptoms}
              isOpen={openSections.symptoms}
              onToggle={() => toggleSection('symptoms')}
              doctorData={state.doctorData}
            >
              <SymptomsSection
                symptoms={form.symptoms}
                onChange={(symptoms) => handleFormChange('symptoms', symptoms)}
              />
            </CollapsibleSection>

            {/* Diagnosis Section */}
            <CollapsibleSection
              sectionKey="diagnosis"
              section={SECTIONS.diagnosis}
              isOpen={openSections.diagnosis}
              onToggle={() => toggleSection('diagnosis')}
              doctorData={state.doctorData}
            >
              <DiagnosisSection
                diagnosis_info={form.diagnosis_info}
                onChange={(diagnosis_info) => handleFormChange('diagnosis_info', diagnosis_info)}
              />
            </CollapsibleSection>

            {/* Specialization Section */}
            <CollapsibleSection
              sectionKey="specialization"
              section={SECTIONS.specialization}
              isOpen={openSections.specialization}
              onToggle={() => toggleSection('specialization')}
              doctorData={state.doctorData}
            >
              <SpecializationWrapper
                doctorData={state.doctorData}
                specializationData={form.specialization?.data}
                onSpecializationChange={handleSpecializationChange}
              />
            </CollapsibleSection>

            {/* Treatment Plan Section */}
            <CollapsibleSection
              sectionKey="treatment"
              section={SECTIONS.treatment}
              isOpen={openSections.treatment}
              onToggle={() => toggleSection('treatment')}
              doctorData={state.doctorData}
            >
              <TreatmentPlan
                treatment_plan={form.treatment_plan}
                onChange={(treatment_plan) => handleFormChange('treatment_plan', treatment_plan)}
              />
            </CollapsibleSection>

            {/* Notes Section */}
            <CollapsibleSection
              sectionKey="notes"
              section={SECTIONS.notes}
              isOpen={openSections.notes}
              onToggle={() => toggleSection('notes')}
              doctorData={state.doctorData}
            >
              <NotesSection
                notes={form.notes}
                onChange={(notes) => handleFormChange('notes', notes)}
              />
            </CollapsibleSection>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SidebarPanel
              patientData={state.patientData}
              medicalHistory={state.medicalHistory}
              loading={state.loading}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons
        submitting={state.submitting}
        onBack={handleBack}
        onSave={handleSave}
        prescriptionData={prescriptionData}
      />
    </div>
  );
}