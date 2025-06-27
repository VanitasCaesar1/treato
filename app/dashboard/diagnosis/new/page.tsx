"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Save, Printer, User, Stethoscope, Calendar, Star, Settings } from "lucide-react";
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
  'general': {
    component: null, // No special component for general
    icon: '🩺',
    title: 'General Assessment',
    description: 'Standard medical examination and assessment',
    fields: []
  },
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

// Get available specializations for dropdown
const getAvailableSpecializations = () => {
  return Object.keys(SPECIALIZATION_CONFIG).map(key => ({
    value: key,
    label: SPECIALIZATION_CONFIG[key].title,
    icon: SPECIALIZATION_CONFIG[key].icon,
    description: SPECIALIZATION_CONFIG[key].description
  }));
};

// Utility function to get specialization config
const getSpecializationConfig = (specialization) => {
  if (!specialization || typeof specialization !== 'string') {
    return SPECIALIZATION_CONFIG['general'];
  }
  
  const normalized = specialization.toLowerCase().trim();
  return SPECIALIZATION_CONFIG[normalized] || SPECIALIZATION_CONFIG['general'];
};

// Enhanced function to extract specialization from doctor data (fallback only)
const getSpecializationFromDoctor = (doctorData) => {
  if (!doctorData) return 'general';
  
  if (doctorData.specialization) {
    if (typeof doctorData.specialization === 'object' && doctorData.specialization !== null) {
      if (doctorData.specialization.primary) {
        return doctorData.specialization.primary.toLowerCase().trim();
      }
    }
    
    if (typeof doctorData.specialization === 'string') {
      try {
        const parsed = JSON.parse(doctorData.specialization);
        if (parsed && typeof parsed === 'object' && parsed.primary) {
          return parsed.primary.toLowerCase().trim();
        }
      } catch (e) {
        return doctorData.specialization.toLowerCase().trim();
      }
    }
  }
  
  // Try other possible field names
  const possibleFields = ['specialty', 'department', 'field', 'medical_specialty'];
  for (const field of possibleFields) {
    if (doctorData[field]) {
      if (typeof doctorData[field] === 'string') {
        return doctorData[field].toLowerCase().trim();
      }
    }
  }
  
  return 'general';
};

// Specialization Selector Component
const SpecializationSelector = ({ selectedSpecialization, onSpecializationChange, doctorData }) => {
  const availableSpecializations = getAvailableSpecializations();
  const suggestedSpecialization = getSpecializationFromDoctor(doctorData);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Specialization Assessment</h3>
            <p className="text-sm text-gray-600">Select the appropriate medical specialization for this diagnosis</p>
          </div>
        </div>
        {suggestedSpecialization && suggestedSpecialization !== 'general' && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Suggested based on profile:</p>
            <p className="text-sm font-medium text-purple-600 capitalize">{suggestedSpecialization}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableSpecializations.map((spec) => (
          <button
            key={spec.value}
            onClick={() => onSpecializationChange(spec.value)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedSpecialization === spec.value
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{spec.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${
                  selectedSpecialization === spec.value ? 'text-purple-800' : 'text-gray-800'
                }`}>
                  {spec.label}
                </p>
                <p className={`text-xs mt-1 ${
                  selectedSpecialization === spec.value ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {spec.description}
                </p>
                {spec.value === suggestedSpecialization && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Suggested
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Updated SpecializationWrapper component
const SpecializationWrapper = ({ selectedSpecialization, specializationData, onSpecializationChange, doctorData, specializations, onSaveSpecialization }) => {
  const config = getSpecializationConfig(selectedSpecialization);
  const availableSpecializations = getAvailableSpecializations();

  // Handler for changing specialization type
  const handleTypeChange = (type) => {
    if (type !== selectedSpecialization) {
      onSpecializationChange({ type, data: {} });
    }
  };

  // Get only specializations that have been worked on (have data)
  const getWorkedOnSpecializations = () => {
    return Object.entries(specializations || {})
      .filter(([type, data]) => {
        // Check if this specialization has meaningful data
        if (!data || typeof data !== 'object') return false;
        
        // Check if any field has content
        const hasContent = Object.values(data).some(value => {
          if (typeof value === 'string') return value.trim().length > 0;
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(v => 
              typeof v === 'string' ? v.trim().length > 0 : 
              Array.isArray(v) ? v.length > 0 : 
              Boolean(v)
            );
          }
          return Boolean(value);
        });
        
        return hasContent;
      })
      .reduce((acc, [type, data]) => {
        const canonical = getCanonicalSpecialty(type);
        if (!acc[canonical]) acc[canonical] = { type, data };
        return acc;
      }, {});
  };

  const workedOnSpecializations = getWorkedOnSpecializations();

  return (
    <div>
      {/* Specialization options selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {availableSpecializations.map((spec) => (
            <button
              key={spec.value}
              type="button"
              onClick={() => handleTypeChange(spec.value)}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 flex items-center gap-2
                ${selectedSpecialization === spec.value
                  ? 'border-purple-500 bg-purple-50 text-purple-800 shadow'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-25'}
              `}
            >
              <span className="text-lg">{spec.icon}</span>
              <span>{spec.label}</span>
              {selectedSpecialization === spec.value && (
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Specialization content */}
      {!config?.component ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">{config?.icon}</span>
          </div>
          <h4 className="font-semibold text-lg mb-2 text-gray-800">
            {config?.title}
          </h4>
          <p className="text-gray-600 mb-4">
            {config?.description}
          </p>
          <p className="text-sm text-blue-600 font-medium">
            Using standard diagnosis workflow
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{config.icon}</span>
              <h4 className="font-semibold text-purple-800 text-lg">
                {config.title}
              </h4>
              <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm text-purple-600">
              {config.description}
            </p>
          </div>
          {/* Render the dynamic specialization component */}
          <config.component
            data={specializationData || {}}
            onChange={onSpecializationChange}
            doctorInfo={doctorData}
          />
        </>
      )}

      {/* Show previously worked on specializations only if there are any with meaningful data */}
      {Object.keys(workedOnSpecializations).length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="font-semibold mb-3 text-gray-700 flex items-center">
            <span className="mr-2">📋</span>
            Previously Worked On:
          </h5>
          <div className="flex flex-wrap gap-2">
            {Object.values(workedOnSpecializations).map(({ type, data }) => {
              const canonical = getCanonicalSpecialty(type);
              const isActive = getCanonicalSpecialty(selectedSpecialization) === canonical;
              
              return (
                <button
                  key={canonical}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${isActive 
                      ? 'border-purple-500 bg-purple-50 text-purple-800 shadow' 
                      : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-purple-300 hover:bg-purple-25'}`}
                  onClick={() => onSpecializationChange({ type, data })}
                >
                  <span>{SPECIALIZATION_CONFIG[canonical]?.icon || '🔬'}</span>
                  <span>{SPECIALIZATION_CONFIG[canonical]?.title || canonical}</span>
                  {isActive && (
                    <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Current</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
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
  specializations?: { [key: string]: any }; // Added for multi-specialization
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
  specialization: { type: "general", data: {} },
  specializations: {} // Initialize as empty object
};

const SECTIONS = {
  vitals: { icon: "🌡️", title: "Vital Signs" },
  symptoms: { icon: "⚡", title: "Symptoms" },
  diagnosis: { icon: "🩺", title: "Diagnosis" },
  specialization: { icon: "🔬", title: "Specialization Assessment", dynamic: true },
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
  let specializationType = diagnosis.specialty || "general";

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

  // --- MULTI-SPECIALIZATION: hydrate all specializations if present ---
  let specializations = {};
  if (diagnosis.specializations) {
    try {
      if (typeof diagnosis.specializations === 'string') {
        specializations = JSON.parse(diagnosis.specializations);
      } else if (typeof diagnosis.specializations === 'object') {
        specializations = diagnosis.specializations;
      }
    } catch (e) {
      console.warn('Failed to parse specializations:', e);
      specializations = {};
    }
  }

  // If the selected specialization type exists in specializations, use its data
  if (specializations[specializationType]) {
    specializationData = specializations[specializationType];
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
    },
    specializations // <-- hydrate all specializations
  };
};

// ===== COMPONENTS =====
const CollapsibleSection = ({ sectionKey, section, isOpen, onToggle, children, selectedSpecialization }) => {
  // Special handling for specialization section
  if (sectionKey === 'specialization') {
    const config = getSpecializationConfig(selectedSpecialization);
    section = {
      ...section,
      icon: config.icon,
      title: config.title,
      description: config.description
    };
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
          {sectionKey === 'specialization' && selectedSpecialization && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
              {selectedSpecialization}
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
        <p className="text-sm text-gray-500 capitalize">{getSpecializationFromDoctor(doctorData) || ""}</p>
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
  const specializationType = form.specialization?.type || "general";
  
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
    doctor_specialty: specializationType,
    
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
    
    primary_diagnosis: validDiagnoses[0]?.condition || "",
    secondary_diagnoses: validDiagnoses.slice(1).map(d => d.condition).filter(Boolean),
    icd_codes: validDiagnoses.map(d => d.code).filter(Boolean),
    
    diagnosis_confidence: "high",
    differential_diagnoses: [],
    diagnostic_tests_ordered: [],
    
    clinical_notes: clinicalNotes,
    physical_exam: clinicalNotes,
    assessment_notes: clinicalNotes,
    
    medications: medications,
    procedures: form.treatment_plan?.procedures || [],
    recommendations: form.treatment_plan?.lifestyle_changes?.join("; ") || "",
    follow_up_date: form.treatment_plan?.follow_up?.date || "",
    follow_up_notes: form.treatment_plan?.follow_up?.notes || "",
    referrals: form.treatment_plan?.referrals || [],
    lab_orders: form.treatment_plan?.lab_orders || [],
    
    specialty: specializationType,
    specialty_data: JSON.stringify(specializationData),
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// ===== MULTI-SPECIALIZATION HOOK =====
function useMultiSpecialization(form, setForm) {
  // Store all specializations in a map: { [type]: data }
  const specializations = form.specializations || {};
  const selectedType = form.specialization?.type || 'general';
  const selectedData = form.specialization?.data || {};

  // Save/update the current specialization data before switching
  const saveCurrentSpecialization = (type, data) => {
    setForm(prev => {
      const prevSpecs = prev.specializations || {};
      return {
        ...prev,
        specializations: {
          ...prevSpecs,
          [type]: data
        }
      };
    });
  };

  // When changing specialization type, save current and switch
  const handleSpecializationChange = (payload) => {
    if (payload && typeof payload === 'object' && 'type' in payload) {
      // Save current before switching
      saveCurrentSpecialization(selectedType, selectedData);
      setForm(prev => ({
        ...prev,
        specialization: {
          type: payload.type,
          data: prev.specializations?.[payload.type] || {}
        }
      }));
    } else {
      // Update data for current specialization
      setForm(prev => ({
        ...prev,
        specialization: {
          ...prev.specialization,
          data: { ...prev.specialization.data, ...payload }
        }
      }));
    }
  };

  // On mount, if specializations exist, load the selected one
  useEffect(() => {
    if (form.specializations && form.specialization?.type) {
      setForm(prev => ({
        ...prev,
        specialization: {
          type: prev.specialization.type,
          data: prev.specializations?.[prev.specialization.type] || {}
        }
      }));
    }
    // eslint-disable-next-line
  }, []);

  return {
    specializations,
    selectedType,
    selectedData,
    handleSpecializationChange,
    saveCurrentSpecialization
  };
}

// Main component
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

  // Always use 5 arguments for createPrescriptionData
  const prescriptionData = createPrescriptionData(
    appointmentId || '',
    state.appointmentData,
    state.doctorData,
    state.patientData,
    form
  );

  // Multi-specialization hook
  const {
    specializations,
    selectedType,
    selectedData,
    handleSpecializationChange,
    saveCurrentSpecialization
  } = useMultiSpecialization(form, setForm);

  useEffect(() => {
    const loadData = async () => {
      if (!appointmentId) {
        setState(prev => ({ ...prev, error: "No appointment ID provided", loading: false }));
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Fetch appointment and doctor profile (robust normalization)
        const [appointmentRes, doctorRes] = await Promise.all([
          apiCall(`/api/appointments/${appointmentId}`),
          apiCall(`/api/user/profile`)
        ]);

        const appointmentData = appointmentRes.appointment || appointmentRes;
        const doctorData = doctorRes.user || doctorRes;
        const doctorId = doctorData.id || doctorData.user_id || doctorData.UserID || doctorData.doctor_id;
        const orgId = doctorData.org_id || doctorData.hospital_id || doctorData.HospitalID;

        if (!doctorId) throw new Error("Doctor ID not found in profile data");

        // Normalize doctorData for robust specialization extraction
        const normalizedDoctorData = {
          ...doctorData, id: doctorId, org_id: orgId,
          name: doctorData.name || doctorData.Name,
          specialization: doctorData.specialization || doctorData.Specialization || { primary: null }
        };

        // Fetch patient and history
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

        setForm(prev => {
          let hydrated = {
            ...prev,
            appointment_id: appointmentId,
            patient_id: appointmentData.patient_id,
            doctor_id: doctorId,
            org_id: orgId,
            ...(existingDiagnosis ? transformDiagnosisToForm(existingDiagnosis) : {})
          };
          // --- Ensure specializations is always an object ---
          let specs = hydrated.specializations;
          if (typeof specs === 'string') {
            try { specs = JSON.parse(specs); } catch { specs = {}; }
          }
          // If missing, synthesize from existingDiagnosis.specialty/specialty_data
          if ((!specs || typeof specs !== 'object' || Object.keys(specs).length === 0) && existingDiagnosis) {
            const specialty = existingDiagnosis.specialty;
            let specialty_data = existingDiagnosis.specialty_data;
            if (specialty && specialty_data) {
              try {
                specialty_data = typeof specialty_data === 'string' ? JSON.parse(specialty_data) : specialty_data;
              } catch { specialty_data = {}; }
              specs = { [specialty]: specialty_data };
            }
          }
          hydrated.specializations = specs || {};
          // --- Ensure specialization.data is always in sync with specializations[selectedType] ---
          const type = hydrated.specialization?.type || (existingDiagnosis && existingDiagnosis.specialty) || Object.keys(specs)[0] || 'general';
          hydrated.specialization = {
            type,
            data: specs[type] || {}
          };
          return hydrated;
        });

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
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));
      const diagnosisData = transformDiagnosisData(form, state.appointmentData, state.doctorData, state.patientData);
      await apiCall('/api/diagnosis', {
        method: 'POST',
        body: JSON.stringify(diagnosisData),
      });
      alert('Diagnosis saved successfully!');
    } catch (error) {
      setState(prev => ({ ...prev, error: `Failed to save diagnosis: ${error.message}` }));
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
              selectedSpecialization={form.specialization?.type || ''}
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
              selectedSpecialization={form.specialization?.type || ''}
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
              selectedSpecialization={form.specialization?.type || ''}
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
              selectedSpecialization={selectedType}
            >
              <SpecializationWrapper
                selectedSpecialization={selectedType}
                specializationData={selectedData}
                onSpecializationChange={handleSpecializationChange}
                doctorData={state.doctorData}
                specializations={specializations}
                onSaveSpecialization={() => saveCurrentSpecialization(selectedType, selectedData)}
              />
              {/* List and switch between saved specializations */}
              <div className="mt-4">
                <h5 className="font-semibold mb-2 text-gray-700">Saved Specializations:</h5>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(specializations).length === 0 && <span className="text-gray-400 text-sm">None yet</span>}
                  {/* Deduplicate by canonical specialty, always use canonical key and data */}
                  {(() => {
                    // Always dedupe by canonical key, and always use the canonical key/data for tab switching
                    const canonicalMap = {};
                    Object.entries(specializations).forEach(([type, data]) => {
                      const canonical = getCanonicalSpecialty(type);
                      // Prefer canonical key if present, else first encountered
                      if (!canonicalMap[canonical] || canonical === type) {
                        canonicalMap[canonical] = { type: canonical, data: specializations[canonical] || data };
                      }
                    });
                    return Object.entries(canonicalMap).map(([canonical, value]) => {
                      const isActive = getCanonicalSpecialty(selectedType) === canonical;
                      return (
                        <button
                          key={canonical}
                          className={`px-3 py-1 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center gap-2
                            ${isActive ? 'border-purple-500 bg-purple-50 text-purple-800' : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-25'}`}
                          onClick={() => handleSpecializationChange({ type: canonical, data: (value as any).data })}
                        >
                          <span>{SPECIALIZATION_CONFIG[canonical]?.icon || '🔬'}</span>
                          <span>{SPECIALIZATION_CONFIG[canonical]?.title || canonical}</span>
                          {isActive && (
                            <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </CollapsibleSection>

            {/* Treatment Plan Section */}
            <CollapsibleSection
              sectionKey="treatment"
              section={SECTIONS.treatment}
              isOpen={openSections.treatment}
              onToggle={() => toggleSection('treatment')}
              selectedSpecialization={form.specialization?.type || ''}
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
              selectedSpecialization={form.specialization?.type || ''}
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

// Canonical mapping for specializations to deduplicate tabs
const CANONICAL_SPECIALTY = {
  'dermatology': 'dermatology',
  'dermatologist': 'dermatology',
  'cardiology': 'cardiology',
  'cardiologist': 'cardiology',
  'neurology': 'neurology',
  'neurologist': 'neurology',
  'orthopedics': 'orthopedics',
  'orthopedist': 'orthopedics',
  'psychiatry': 'psychiatry',
  'psychiatrist': 'psychiatry',
  'general': 'general',
};

function getCanonicalSpecialty(type) {
  if (!type) return 'general';
  const norm = type.toLowerCase().trim();
  return CANONICAL_SPECIALTY[norm] || norm;
}