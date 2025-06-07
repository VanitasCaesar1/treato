"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, ChevronDown, ChevronUp, Save, Printer, User, Stethoscope, Calendar } from "lucide-react";
import { PrescriptionPDF, createPrescriptionData } from '@/components/diagnosis/PrescriptionPDF';
import TreatmentPlan from "@/components/diagnosis/TreatmentPlanSection";
import DiagnosisSection from "@/components/diagnosis/DiagnosisSection";
import VitalsSection from "@/components/diagnosis/VitalsSection";
import SymptomsSection from "@/components/diagnosis/SymptomsSection";
import { 
  SpecializationSection, 
  getSpecializationConfig, 
  useSpecializationData 
} from './SpecializationImports'
// Hooks
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

// Types & Constants

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
  specialization?: { 
    type: string; 
    data: any;
  };
}

const DEFAULT_FORM: DiagnosisFormData = {
  appointment_id: "", patient_id: "", doctor_id: "", org_id: "",
  vitals: { timestamp: new Date().toISOString() },
  symptoms: [{ description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] }],
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

// Utility Functions
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
// Updated transformation functions with specialization support
const transformDiagnosisToForm = (diagnosis: any): DiagnosisFormData => {
  const vitals = diagnosis.vitals || {
    temperature: diagnosis.temperature,
    blood_pressure: diagnosis.blood_pressure,
    heart_rate: diagnosis.heart_rate,
    weight: diagnosis.weight,
    height: diagnosis.height,
    timestamp: diagnosis.created_at || new Date().toISOString()
  };

  const symptoms = diagnosis.symptoms?.length ? diagnosis.symptoms : 
    diagnosis.chief_complaint ? [{ description: diagnosis.chief_complaint, severity: "moderate", onset: new Date().toISOString().split('T')[0] }] :
    [{ description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] }];

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
      type: diagnosis.specialty || "",
      data: diagnosis.specialty_data || {}
    }
  };
};
const CollapsibleSection = ({ sectionKey, section, isOpen, onToggle, children, doctorData }) => {
  // For specialization section, check if we should show it
  if (sectionKey === 'specialization') {
    const config = getSpecializationConfig(
      doctorData?.specialization?.primary || 
      doctorData?.Specialization?.primary ||
      doctorData?.specialization ||
      doctorData?.Specialization ||
      doctorData?.specialty
    );
    
    if (!config) {
      return null; // Don't render if no matching specialization
    }
    
    // Update section info with dynamic data
    section = {
      ...section,
      icon: config.icon,
      title: config.title,
      description: config.description
    };
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={onToggle} className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
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
          {sectionKey === 'specialization' && doctorData?.specialization && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {doctorData.specialization.primary || doctorData.specialization}
            </span>
          )}
          {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </div>
      </button>
      {isOpen && <div className="p-6 pt-0 border-t border-gray-100">{children}</div>}
    </div>
  );
};

const NotesSection = ({ notes, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes</label>
    <textarea
      value={notes || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      rows={4}
      placeholder="Additional clinical notes, observations, or recommendations..."
    />
  </div>
);

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
        <p className="text-sm text-gray-500">{doctorData?.specialization?.primary || ""}</p>
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

// Main Component
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
    vitals: true, symptoms: true, diagnosis: true, treatment: true, notes: false
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
        } catch (err) {
          console.warn('Could not fetch existing diagnosis:', err.message);
        }

        const initialForm = existingDiagnosis ? 
          { ...transformDiagnosisToForm(existingDiagnosis), appointment_id: appointmentId, patient_id: appointmentData.patient_id, doctor_id: doctorId, org_id: orgId || "" } :
          { ...DEFAULT_FORM, appointment_id: appointmentId, patient_id: appointmentData.patient_id, doctor_id: doctorId, org_id: orgId || "" };

        setState(prev => ({
          ...prev, appointmentData, doctorData: normalizedDoctorData,
          patientData: patientRes?.patient || null, medicalHistory: historyRes?.history || [],
          loading: false, error: null
        }));

        setForm(initialForm);

      } catch (error: any) {
        setState(prev => ({ ...prev, error: error.message || "Failed to load appointment data", loading: false }));
      }
    };

    loadData();
  }, [appointmentId]);

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const updateForm = (field: string) => (value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const transformDiagnosisData = (form: DiagnosisFormData, appointmentData: any, doctorData: any, patientData: any) => {
    const symptoms = form.symptoms?.filter(s => s.description?.trim()).map(s => ({
      description: s.description.trim(), severity: s.severity || "moderate",
      onset: s.onset || new Date().toISOString().split('T')[0],
      duration: s.duration || "", location: s.location || "", quality: s.quality || "", factors: s.factors || ""
    })) || [];

    const medications = form.treatment_plan?.medications?.filter(m => m.name?.trim()).map(m => ({
      name: m.name.trim(), dosage: m.dosage || "", frequency: m.frequency || "",
      duration: m.duration || "", instructions: m.instructions || "", route: m.route || "oral"
    })) || [];

    const validDiagnoses = form.diagnosis_info?.filter(d => d.condition?.trim()) || [];
    
    return {
      appointment_id: form.appointment_id, patient_id: form.patient_id, doctor_id: form.doctor_id,
      org_id: form.org_id || "", status: form.status || "finalized",
      patient_name: appointmentData?.patient_name || patientData?.name || "",
      patient_age: patientData?.age || null, patient_gender: patientData?.gender || "",
      doctor_name: doctorData?.name || "", doctor_specialty: doctorData?.specialization?.primary || "",
      temperature: form.vitals?.temperature || null, blood_pressure: form.vitals?.blood_pressure || null,
      heart_rate: form.vitals?.heart_rate || null, weight: form.vitals?.weight || null,
      height: form.vitals?.height || null, bmi: form.vitals?.bmi || null,
      respiratory_rate: form.vitals?.respiratory_rate || null, oxygen_saturation: form.vitals?.oxygen_saturation || null,
      chief_complaint: symptoms[0]?.description || "", symptoms, physical_exam: form.notes || "",
      primary_diagnosis: validDiagnoses[0]?.condition || "",
      secondary_diagnoses: validDiagnoses.slice(1).map(d => d.condition.trim()).filter(Boolean),
      icd_codes: validDiagnoses.map(d => d.code).filter(Boolean),
      medications, procedures: form.treatment_plan?.procedures || [],
      recommendations: form.treatment_plan?.lifestyle_changes?.filter(Boolean).join('; ') || "",
      follow_up_date: form.treatment_plan?.follow_up?.date || null,
      follow_up_notes: form.treatment_plan?.follow_up?.notes || "",
      lab_orders: form.treatment_plan?.lab_orders || [], referrals: form.treatment_plan?.referrals || [],
      clinical_notes: form.notes || "", specialty: form.specialization?.type || null,
      specialty_data: form.specialization?.data || {}, test_results: [], attachments: []
    };
  };

  const handleSave = async () => {
    try {
      setState(prev => ({ ...prev, submitting: true }));
      if (!form.appointment_id || !form.patient_id || !form.doctor_id) {
        throw new Error("Missing required appointment, patient, or doctor information");
      }

      const transformedData = transformDiagnosisData(form, state.appointmentData, state.doctorData, state.patientData);
      await apiCall('/api/diagnosis', { method: 'POST', body: JSON.stringify(transformedData) });
      console.log('📤 Sending to API:', transformedData);
      console.log('🔍 Form data before save:', {
  vitals: form.vitals,
  medications: form.treatment_plan?.medications,
  symptoms: form.symptoms,
  diagnosis_info: form.diagnosis_info
});
      setForm(prev => ({ ...prev, status: 'finalized' }));
      alert('Diagnosis saved successfully!');
    } catch (error: any) {
      const errorMessage = error.message || error.data?.error || 'Failed to save diagnosis';
      setState(prev => ({ ...prev, error: errorMessage }));
      alert(`Error: ${errorMessage}`);
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment data...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Go Back
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto p-6">
        <PrescriptionHeader appointmentData={state.appointmentData} doctorData={state.doctorData} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {state.error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{state.error}</AlertDescription>
              </Alert>
            )}

            {Object.entries(SECTIONS).map(([key, section]) => (
              <CollapsibleSection
                key={key}
                sectionKey={key}
                section={section}
                isOpen={openSections[key]}
                onToggle={() => toggleSection(key)}
                doctorData={state.doctorData}
              >
                {key === 'vitals' && <VitalsSection vitals={form.vitals} onChange={updateForm('vitals')} />}
                {key === 'symptoms' && <SymptomsSection symptoms={form.symptoms} onChange={updateForm('symptoms')} />}
                {key === 'diagnosis' && <DiagnosisSection diagnosis_info={form.diagnosis_info} onChange={updateForm('diagnosis_info')} />}
                {key === 'treatment' && <TreatmentPlan treatment_plan={form.treatment_plan} onChange={updateForm('treatment_plan')} />}
                {key === 'notes' && <NotesSection notes={form.notes} onChange={updateForm('notes')} />}
              </CollapsibleSection>
            ))}
          </div>

          <SidebarPanel 
            patientData={state.patientData} 
            medicalHistory={state.medicalHistory} 
            loading={false} 
          />
        </div>
      </div>

      <ActionButtons
        submitting={state.submitting}
        onBack={() => router.back()}
        onSave={handleSave}
        prescriptionData={prescriptionData}
      />
    </div>
  );
}