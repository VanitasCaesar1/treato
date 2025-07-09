"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  ArrowLeft, 
  Save, 
  Printer, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Activity,
  Clock,
  FileText,
  Heart,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { PrescriptionPDF, createPrescriptionData } from '@/components/diagnosis/PrescriptionPDF';
import TreatmentPlan from "@/components/diagnosis/TreatmentPlanSection";
import DiagnosisSection from '@/components/diagnosis/DiagnosisSection';
import { useRouter, useSearchParams } from "next/navigation";

type DiagnosisConfidence = "primary" | "secondary" | "rule-out";

interface DiagnosisItem {
  id: string;
  condition: string;
  code: string;
  notes: string;
  confidence: DiagnosisConfidence;
  category: string;
}

interface TreatmentPlanType {
  follow_up: { date: string; duration: string; notes: string };
  medications: any[];
  procedures: any[];
  lifestyle_changes: any[];
  referrals: any[];
  lab_orders: any[];
}

interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  gender: string;
  emergency_contact: string;
  medical_history: any[];
  allergies: string[];
  current_medications: any[];
  insurance_provider: string;
  insurance_id: string;
}

interface RxPadForm {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis_info: DiagnosisItem[];
  primary_diagnosis: string;
  treatment_plan: TreatmentPlanType;
  clinical_notes: string;
  physical_exam: string;
  symptoms: any[];
  notes: string;
  specialty: string;
  specialty_data: any;
}

const DEFAULT_FORM: RxPadForm = {
  appointment_id: "",
  patient_id: "",
  doctor_id: "",
  diagnosis_info: [{
    id: "",
    condition: "",
    code: "",
    notes: "",
    confidence: "primary",
    category: ""
  }],
  primary_diagnosis: "",
  treatment_plan: {
    follow_up: { date: "", duration: "", notes: "" },
    medications: [], 
    procedures: [], 
    lifestyle_changes: [], 
    referrals: [], 
    lab_orders: []
  },
  clinical_notes: "",
  physical_exam: "",
  symptoms: [],
  notes: "",
  specialty: "general",
  specialty_data: {}
};

export default function RxPadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isExistingDiagnosis, setIsExistingDiagnosis] = useState(false);

  // For print PDF
  const prescriptionData = createPrescriptionData(
    form.appointment_id,
    { id: form.appointment_id },
    { id: form.doctor_id },
    patientData || { id: form.patient_id },
    form
  );

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch patient data
  const fetchPatientData = async (patientId: string) => {
    if (!patientId) return;
    
    setLoadingPatient(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPatientData(data);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoadingPatient(false);
    }
  };

  // Fetch existing diagnosis data
  const fetchDiagnosisData = async (appointmentId: string) => {
    if (!appointmentId) return;

    setLoadingDiagnosis(true);
    try {
      const response = await fetch(`/api/diagnosis/${appointmentId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.diagnosis) {
          setIsExistingDiagnosis(true);
          hydrateDiagnosisData(data.diagnosis);
        }
      } else if (response.status === 404) {
        // No existing diagnosis found, this is a new prescription
        console.log('No existing diagnosis found for appointment:', appointmentId);
        setIsExistingDiagnosis(false);
      } else {
        console.error('Error fetching diagnosis data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching diagnosis data:', error);
    } finally {
      setLoadingDiagnosis(false);
    }
  };

  // Hydrate form with existing diagnosis data
  const hydrateDiagnosisData = (diagnosis: any) => {
    console.log('Hydrating diagnosis data:', diagnosis);

    // Transform diagnosis data to match form structure
    const diagnosisInfo: DiagnosisItem[] = [];
    
    // Add primary diagnosis
    if (diagnosis.primary_diagnosis) {
      diagnosisInfo.push({
        id: "primary",
        condition: diagnosis.primary_diagnosis,
        code: diagnosis.icd_codes?.[0] || "",
        notes: diagnosis.clinical_notes || "",
        confidence: "primary",
        category: "Primary"
      });
    }

    // Add secondary diagnoses
    if (diagnosis.secondary_diagnoses && Array.isArray(diagnosis.secondary_diagnoses)) {
      diagnosis.secondary_diagnoses.forEach((condition: string, index: number) => {
        diagnosisInfo.push({
          id: `secondary_${index}`,
          condition,
          code: diagnosis.icd_codes?.[index + 1] || "",
          notes: "",
          confidence: "secondary",
          category: "Secondary"
        });
      });
    }

    // Ensure we have at least one diagnosis item
    if (diagnosisInfo.length === 0) {
      diagnosisInfo.push({
        id: "default",
        condition: "",
        code: "",
        notes: "",
        confidence: "primary",
        category: ""
      });
    }

    // Transform treatment plan
    const treatmentPlan: TreatmentPlanType = {
      follow_up: {
        date: diagnosis.follow_up_date || "",
        duration: "30 minutes",
        notes: diagnosis.follow_up_notes || ""
      },
      medications: diagnosis.medications || [],
      procedures: diagnosis.procedures || [],
      lifestyle_changes: diagnosis.recommendations ? 
        [{ description: diagnosis.recommendations }] : [],
      referrals: diagnosis.referrals || [],
      lab_orders: diagnosis.lab_orders || []
    };

    // Update form with hydrated data
    setForm(prev => ({
      ...prev,
      diagnosis_info: diagnosisInfo,
      primary_diagnosis: diagnosis.primary_diagnosis || "",
      treatment_plan: treatmentPlan,
      clinical_notes: diagnosis.clinical_notes || "",
      physical_exam: diagnosis.physical_exam || "",
      symptoms: diagnosis.symptoms || [],
      specialty: diagnosis.specialty || "general",
      specialty_data: diagnosis.specialty_data || {}
    }));
  };

  // Get query params from URL
  useEffect(() => {
    if (searchParams) {
      const appointment_id = searchParams.get("appointment_id") || "";
      const patient_id = searchParams.get("patient_id") || "";
      const doctor_id = searchParams.get("doctor_id") || "";
      
      setForm(prev => ({
        ...prev,
        appointment_id,
        patient_id,
        doctor_id
      }));

      // Fetch patient data if patient_id is available
      if (patient_id) {
        fetchPatientData(patient_id);
      }

      // Fetch existing diagnosis data if appointment_id is available
      if (appointment_id) {
        fetchDiagnosisData(appointment_id);
      }
    }
  }, [searchParams]);

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Update primary_diagnosis when diagnosis_info changes
    if (field === 'diagnosis_info' && Array.isArray(value) && value.length > 0) {
      const primaryDiagnosis = value.find((d: DiagnosisItem) => d.confidence === 'primary');
      if (primaryDiagnosis) {
        setForm(prev => ({ ...prev, primary_diagnosis: primaryDiagnosis.condition }));
      }
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.appointment_id) errors.push("Appointment ID is required");
    if (!form.patient_id) errors.push("Patient ID is required");
    if (!form.doctor_id) errors.push("Doctor ID is required");
    
    if (form.diagnosis_info.length === 0 || !form.diagnosis_info[0].condition) {
      errors.push("At least one diagnosis is required");
    }
    
    return errors;
  };

  const prepareDiagnosisPayload = () => {
    const symptoms = form.diagnosis_info.map((diagnosis, index) => ({
      symptom_id: index + 1,
      name: diagnosis.condition,
      category: diagnosis.category || "General",
      severity: "moderate",
      onset_date: null,
      duration: null,
      location: null,
      description: diagnosis.notes || diagnosis.condition,
      progression: null,
      frequency: null,
      radiation: null,
      scale_rating: null
    }));

    const payload = {
      appointment_id: form.appointment_id,
      patient_id: form.patient_id,
      doctor_id: form.doctor_id,
      primary_diagnosis: form.primary_diagnosis || form.diagnosis_info[0]?.condition || "Pending diagnosis",
      symptoms: symptoms,
      clinical_notes: form.clinical_notes || form.notes || "",
      physical_exam: form.physical_exam || form.clinical_notes || "",
      treatment_plan: {
        medications: form.treatment_plan.medications.map(med => ({
          name: med.name || '',
          dosage: med.dosage || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || '',
          route: med.route || 'oral',
          ...(med.medicine_id && { medicine_id: med.medicine_id })
        })),
        procedures: form.treatment_plan.procedures || [],
        follow_up: form.treatment_plan.follow_up,
        referrals: form.treatment_plan.referrals || [],
        lab_orders: form.treatment_plan.lab_orders || []
      },
      medications: form.treatment_plan.medications,
      procedures: form.treatment_plan.procedures,
      lab_orders: form.treatment_plan.lab_orders,
      referrals: form.treatment_plan.referrals,
      follow_up_date: form.treatment_plan.follow_up?.date || null,
      follow_up_notes: form.treatment_plan.follow_up?.notes || "",
      recommendations: form.treatment_plan.lifestyle_changes?.map(lc => lc.description).join('; ') || "",
      specialty: form.specialty || "general",
      specialty_data: form.specialty_data || {},
      secondary_diagnoses: form.diagnosis_info.filter(d => d.confidence === 'secondary').map(d => d.condition),
      icd_codes: form.diagnosis_info.map(d => d.code).filter(Boolean),
      status: "finalized"
    };

    return payload;
  };

 const handleSave = async () => {
  setSubmitting(true);
  setError("");
  setSuccess("");
  
  try {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    const payload = prepareDiagnosisPayload();
    
    console.log('📤 Sending diagnosis payload:', payload);

    // Always use POST to /api/diagnosis - the backend handles create/update logic
    const response = await fetch('/api/diagnosis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Diagnosis saved successfully:', result);
    
    setSuccess(`Prescription ${isExistingDiagnosis ? 'updated' : 'created'} successfully!`);
    
    // If this was a new diagnosis, mark it as existing for future updates
    if (!isExistingDiagnosis) {
      setIsExistingDiagnosis(true);
    }
    
  } catch (e: any) {
    console.error('❌ Error saving diagnosis:', e);
    setError(e.message || "Failed to save prescription");
  } finally {
    setSubmitting(false);
  }
};

  const isLoading = loadingPatient || loadingDiagnosis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Prescription Pad</h1>
                {isExistingDiagnosis && (
                  <p className="text-sm text-blue-600 mt-1">Editing existing prescription</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <PrescriptionPDF 
                data={prescriptionData} 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Preview
              </PrescriptionPDF>
              
              <Button 
                onClick={handleSave} 
                disabled={submitting || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isExistingDiagnosis ? 'Update Prescription' : 'Save Prescription'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Patient/Appointment/Doctor Summary Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{patientData ? `${patientData.first_name} ${patientData.last_name}`.trim() : 'Patient'}</h2>
              <div className="text-sm text-gray-600">
                ID: {form.patient_id || 'N/A'}
                {patientData?.date_of_birth && (
                  <> • Age: {calculateAge(patientData.date_of_birth)}</>
                )}
                {patientData?.gender && (
                  <> • Gender: {patientData.gender}</>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              Appointment: <span className="font-medium text-gray-800">{form.appointment_id || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              Doctor: <span className="font-medium text-gray-800">{form.doctor_id || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading prescription data...</span>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6 shadow-sm">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 mb-6 shadow-sm">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Layout: Diagnosis & Prescription on left, Patient Details on right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Section: Diagnosis and Prescription */}
          <div className="lg:col-span-4 space-y-6">
            {/* Diagnosis and Prescription in side-by-side layout */}
            <div className="grid grid-cols-2 xl:grid-cols-2 gap-6">
              {/* Diagnosis Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Diagnosis</h3>
                    <p className="text-sm text-gray-500">Primary and secondary conditions</p>
                  </div>
                </div>
                {/* Show loading state for diagnosis section */}
                {loadingDiagnosis ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading diagnosis data...
                  </div>
                ) : (
                  <DiagnosisSection
                    diagnosis_info={form.diagnosis_info}
                    onChange={diagnosis_info => handleFormChange('diagnosis_info', diagnosis_info)}
                  />
                )}
              </div>

              {/* Prescription Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Prescription</h3>
                    <p className="text-sm text-gray-500">Medications and follow-up care</p>
                  </div>
                </div>
                
                <TreatmentPlan
                  treatment_plan={form.treatment_plan}
                  onChange={treatment_plan => handleFormChange('treatment_plan', treatment_plan)}
                />
              </div>
            </div>

            {/* Clinical Notes Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Clinical Notes</h3>
                  <p className="text-sm text-gray-5000">Additional observations and notes</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinical Notes
                  </label>
                  <textarea
                    value={form.clinical_notes}
                    onChange={(e) => handleFormChange('clinical_notes', e.target.value)}
                    rows={4}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter clinical observations, patient complaints, examination findings..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Physical Examination
                  </label>
                  <textarea
                    value={form.physical_exam}
                    onChange={(e) => handleFormChange('physical_exam', e.target.value)}
                    rows={3}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter physical examination findings..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}