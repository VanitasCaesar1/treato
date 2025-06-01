"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, ArrowLeft, ChevronDown, ChevronUp, X, Save, 
  Plus, Thermometer, Heart, Activity, Droplets, Wind, User, 
  FileText, Stethoscope, Shield, Check, PenTool, Star, Wrench,
  Download, Printer, Calendar, Clock
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Import Specialization Components
import PrescriptionSection from "@/components/appointment/PrescriptionSection";
import DermatologySection from "@/components/diagnosis/DermatologySection";
import CardiologySection from "@/components/diagnosis/CardiologySection";
import OrthopedicsSection from "@/components/diagnosis/OrthopedicsSection";
import NeurologySection from "@/components/diagnosis/NeurologySection";
import PsychiatrySection from "@/components/diagnosis/PsychiatrySection";
import MedicalHistory from "@/components/diagnosis/MedicalHistory";
import { Badge } from "@/components/ui/badge";
const SYMPTOM_SUGGESTIONS = ["Fever", "Headache", "Cough", "Fatigue", "Nausea", "Sore Throat"];

const DEFAULT_FORM = {
  appointment_id: "", patient_id: "", doctor_id: "", org_id: "",
  vitals: { temperature: "", heart_rate: "", blood_pressure: "", respiratory_rate: "", oxygen_saturation: "" },
  symptoms: [{ description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] }],
  diagnosis_info: [{ condition: "", code: "", notes: "" }],
  status: "draft", notes: "",
  treatment_plan: { follow_up: "", medications: [], procedures: [] },
  // Dynamic specialization fields
  dermatology: null,
  cardiology: null,
  orthopedics: null,
  neurology: null,
  psychiatry: null,
};

const SECTIONS = {
  vitals: { icon: <Thermometer className="h-5 w-5" />, title: "Vital Signs", color: "red", bgColor: "bg-red-50", textColor: "text-red-600", borderColor: "border-red-100" },
  symptoms: { icon: <Activity className="h-5 w-5" />, title: "Symptoms", color: "blue", bgColor: "bg-blue-50", textColor: "text-blue-600", borderColor: "border-blue-100" },
  specialization: { icon: <Star className="h-5 w-5" />, title: "Specialization Assessment", color: "purple", bgColor: "bg-purple-50", textColor: "text-purple-600", borderColor: "border-purple-100" },
  diagnosis: { icon: <Stethoscope className="h-5 w-5" />, title: "Diagnosis", color: "orange", bgColor: "bg-orange-50", textColor: "text-orange-600", borderColor: "border-orange-100" },
  treatment: { icon: <Shield className="h-5 w-5" />, title: "Treatment Plan", color: "green", bgColor: "bg-green-50", textColor: "text-green-600", borderColor: "border-green-100" },
  notes: { icon: <PenTool className="h-5 w-5" />, title: "Additional Notes", color: "gray", bgColor: "bg-gray-50", textColor: "text-gray-600", borderColor: "border-gray-100" }
};

// Available specializations mapping
const AVAILABLE_SPECIALIZATIONS = {
  'dermatology': { component: DermatologySection, name: 'Dermatology' },
  'cardiology': { component: CardiologySection, name: 'Cardiology' },
  'orthopedics': { component: OrthopedicsSection, name: 'Orthopedics' },
  'neurology': { component: NeurologySection, name: 'Neurology' },
  'psychiatry': { component: PsychiatrySection, name: 'Psychiatry' },
};

export default function DiagnosisPage() {
  const router = useRouter();
  const appointmentId = useSearchParams().get("appointmentId");
  
  const [loading, setLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [openSections, setOpenSections] = useState({
    vitals: true, symptoms: true, specialization: false, 
    diagnosis: false, treatment: false, notes: false
  });
  const [form, setForm] = useState(DEFAULT_FORM);

  // PDF Generation Function
  const generatePrescriptionPDF = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Medical Prescription</title>
    <style>
        @page { size: A4; margin: 20mm; }
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.4; 
            color: #000; 
            background: #fff;
            margin: 0;
            padding: 0;
        }
        .rx-header {
            border: 3px solid #2563eb;
            padding: 20px;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 10px;
        }
        .rx-symbol {
            font-size: 48px;
            font-weight: bold;
            color: #2563eb;
            float: left;
            margin-right: 20px;
            line-height: 1;
        }
        .doctor-info {
            margin-left: 80px;
        }
        .doctor-name {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .doctor-details {
            font-size: 14px;
            color: #64748b;
        }
        .patient-section, .diagnosis-section, .prescription-section {
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
        }
        .patient-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .field-group {
            margin-bottom: 10px;
        }
        .field-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 3px;
        }
        .field-value {
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: #f9fafb;
        }
        .vitals-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 15px;
        }
        .medication-item {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 10px;
        }
        .medication-name {
            font-weight: bold;
            color: #0c4a6e;
            font-size: 16px;
        }
        .medication-details {
            color: #0369a1;
            font-size: 14px;
            margin-top: 5px;
        }
        .rx-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .signature-section {
            text-align: right;
        }
        .signature-line {
            border-bottom: 2px solid #374151;
            width: 200px;
            height: 50px;
            margin-bottom: 5px;
        }
        .date-issued {
            font-size: 12px;
            color: #6b7280;
        }
        .rx-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(37, 99, 235, 0.05);
            z-index: -1;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="rx-watermark">Rx</div>
    
    <!-- Header -->
    <div class="rx-header">
        <div class="rx-symbol">℞</div>
        <div class="doctor-info">
            <div class="doctor-name">Dr. ${doctorData?.name || 'Doctor Name'}</div>
            <div class="doctor-details">
                ${doctorData?.specialization?.primary || 'General Practice'} • License: ${doctorData?.license_number || 'MD-XXXX'}<br>
                ${doctorData?.contact?.phone || 'Phone: (XXX) XXX-XXXX'} • ${doctorData?.contact?.email || 'email@clinic.com'}
            </div>
        </div>
        <div style="clear: both;"></div>
    </div>

    <!-- Patient Information -->
    <div class="patient-section">
        <div class="section-title">Patient Information</div>
        <div class="patient-grid">
            <div class="field-group">
                <div class="field-label">Patient Name:</div>
                <div class="field-value">${appointmentData?.patient_name || 'Patient Name'}</div>
            </div>
            <div class="field-group">
                <div class="field-label">Date:</div>
                <div class="field-value">${new Date().toLocaleDateString()}</div>
            </div>
            <div class="field-group">
                <div class="field-label">Patient ID:</div>
                <div class="field-value">${form.patient_id || 'N/A'}</div>
            </div>
            <div class="field-group">
                <div class="field-label">Appointment ID:</div>
                <div class="field-value">${form.appointment_id || 'N/A'}</div>
            </div>
        </div>
    </div>

    <!-- Vital Signs -->
    ${Object.values(form.vitals).some(v => v) ? `
    <div class="patient-section">
        <div class="section-title">Vital Signs</div>
        <div class="vitals-grid">
            ${form.vitals.temperature ? `<div><strong>Temperature:</strong> ${form.vitals.temperature}°F</div>` : ''}
            ${form.vitals.heart_rate ? `<div><strong>Heart Rate:</strong> ${form.vitals.heart_rate} bpm</div>` : ''}
            ${form.vitals.blood_pressure ? `<div><strong>Blood Pressure:</strong> ${form.vitals.blood_pressure}</div>` : ''}
            ${form.vitals.respiratory_rate ? `<div><strong>Respiratory Rate:</strong> ${form.vitals.respiratory_rate}</div>` : ''}
            ${form.vitals.oxygen_saturation ? `<div><strong>Oxygen Saturation:</strong> ${form.vitals.oxygen_saturation}%</div>` : ''}
        </div>
    </div>
    ` : ''}

    <!-- Diagnosis -->
    <div class="diagnosis-section">
        <div class="section-title">Diagnosis</div>
        ${form.diagnosis_info.map((diagnosis, index) => `
            <div style="margin-bottom: 15px;">
                <div><strong>Condition:</strong> ${diagnosis.condition || 'Not specified'}</div>
                ${diagnosis.code ? `<div><strong>ICD Code:</strong> ${diagnosis.code}</div>` : ''}
                ${diagnosis.notes ? `<div><strong>Notes:</strong> ${diagnosis.notes}</div>` : ''}
            </div>
        `).join('')}
    </div>

    <!-- Prescription -->
    <div class="prescription-section">
        <div class="section-title">Prescription</div>
        ${form.treatment_plan.medications && form.treatment_plan.medications.length > 0 ? 
          form.treatment_plan.medications.map((med, index) => `
            <div class="medication-item">
                <div class="medication-name">${med.name || 'Medication Name'}</div>
                <div class="medication-details">
                    ${med.dosage ? `Dosage: ${med.dosage}` : ''} ${med.frequency ? `• Frequency: ${med.frequency}` : ''}<br>
                    ${med.duration ? `Duration: ${med.duration}` : ''} ${med.instructions ? `• Instructions: ${med.instructions}` : ''}
                </div>
            </div>
          `).join('') : '<div style="color: #6b7280; font-style: italic;">No medications prescribed</div>'
        }
        
        ${form.treatment_plan.follow_up ? `
        <div style="margin-top: 20px; padding: 10px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px;">
            <strong>Follow-up Instructions:</strong><br>
            ${form.treatment_plan.follow_up}
        </div>
        ` : ''}
    </div>

    ${form.notes ? `
    <div class="patient-section">
        <div class="section-title">Additional Notes</div>
        <div>${form.notes}</div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="rx-footer">
        <div class="date-issued">
            Issued on: ${new Date().toLocaleDateString()}<br>
            Time: ${new Date().toLocaleTimeString()}
        </div>
        <div class="signature-section">
            <div class="signature-line"></div>
            <div style="font-weight: bold;">Dr. ${doctorData?.name || 'Doctor Name'}</div>
            <div style="font-size: 12px; color: #6b7280;">Medical License: ${doctorData?.license_number || 'MD-XXXX'}</div>
        </div>
    </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    if (!appointmentId) {
      setError("No appointment ID provided");
      setLoading(false);
      return;
    }
    
    // Fetch appointment data
    fetch(`/api/appointments/${appointmentId}`)
      .then(res => res.ok ? res.json() : Promise.reject(`Failed: ${res.status}`))
      .then(data => {
        const appointment = data.appointment || data;
        setAppointmentData(appointment);
        
        // Set basic form data
        setForm(prev => ({
          ...prev,
          appointment_id: appointment.appointment_id || "",
          patient_id: appointment.patient_id || "",
          doctor_id: appointment.doctor_id || "",
          org_id: appointment.org_id || "",
          symptoms: appointment.symptoms?.length ? appointment.symptoms : prev.symptoms
        }));

        // Fetch doctor data to get specialization
        if (appointment.doctor_id) {
          return fetch(`/api/doctors/${appointment.doctor_id}/profile`);
        }
        throw new Error("No doctor ID found in appointment");
      })
      .then(res => res.ok ? res.json() : Promise.reject(`Failed to fetch doctor: ${res.status}`))
      .then(doctorData => {
        setDoctorData(doctorData);
        
        // Initialize specialization data based on doctor's primary specialization
        const primarySpecialization = doctorData.specialization?.primary?.toLowerCase();
        if (primarySpecialization && AVAILABLE_SPECIALIZATIONS[primarySpecialization]) {
          setForm(prev => ({
            ...prev,
            [primarySpecialization]: getDefaultSpecializationData(primarySpecialization)
          }));
        }
      })
      .catch(err => setError(err.message || "Failed to load appointment"))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const getDefaultSpecializationData = (specialization) => {
    switch (specialization) {
      case 'dermatology':
        return {
          lesion_description: "",
          distribution: "",
          skin_color_changes: "",
          affected_areas: [],
          custom_affected_area: "",
          descriptive_findings: "",
          diagnostic_procedures: [],
          lesion_characteristics: {
            morphology: [],
            size: "",
            color: [],
            border: null,
            surface: ""
          },
          skincare_recommendations: {
            products: [],
            general_care: []
          },
          imaging_notes: ""
        };
      case 'cardiology':
        return {
          chest_pain_assessment: "",
          cardiac_rhythm: "",
          heart_sounds: "",
          murmurs: "",
          ecg_findings: "",
          echo_findings: "",
          stress_test_results: ""
        };
      case 'orthopedics':
        return {
          joint_assessment: "",
          range_of_motion: "",
          muscle_strength: "",
          deformities: "",
          gait_analysis: "",
          imaging_findings: "",
          functional_assessment: ""
        };
      case 'neurology':
        return {
          neurological_history: "",
          mental_status: "",
          cranial_nerves: "",
          motor_function: "",
          sensory_function: "",
          reflexes: "",
          coordination_balance: "",
          imaging_tests: ""
        };
      case 'psychiatry':
        return {
          mental_status_exam: "",
          cognitive_assessment: "",
          mood_affect: "",
          thought_process: "",
          thought_content: "",
          perceptual_disturbances: "",
          risk_assessment: "",
          insight_judgment: ""
        };
      default:
        return {};
    }
  };
  
  const validateForm = () => {
    const errors = [];
    
    if (!form.appointment_id) errors.push("Appointment ID is required");
    if (!form.patient_id) errors.push("Patient ID is required");
    if (!form.doctor_id) errors.push("Doctor ID is required");
    
    // Validate symptoms
    if (!form.symptoms.length || !form.symptoms[0].description.trim()) {
      errors.push("At least one symptom is required");
    }
    
    // Validate diagnosis
    if (!form.diagnosis_info.length || !form.diagnosis_info[0].condition.trim()) {
      errors.push("At least one diagnosis is required");
    }
    
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/diagnosis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addSymptom = () => {
    setForm(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, { 
        description: "", 
        severity: "moderate", 
        onset: new Date().toISOString().split('T')[0] 
      }]
    }));
  };

  const removeSymptom = (index) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const updateSymptom = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.map((symptom, i) => 
        i === index ? { ...symptom, [field]: value } : symptom
      )
    }));
  };

  const addDiagnosis = () => {
    setForm(prev => ({
      ...prev,
      diagnosis_info: [...prev.diagnosis_info, { condition: "", code: "", notes: "" }]
    }));
  };

  const removeDiagnosis = (index) => {
    setForm(prev => ({
      ...prev,
      diagnosis_info: prev.diagnosis_info.filter((_, i) => i !== index)
    }));
  };

  const updateDiagnosis = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      diagnosis_info: prev.diagnosis_info.map((diagnosis, i) => 
        i === index ? { ...diagnosis, [field]: value } : diagnosis
      )
    }));
  };

  const updateVitals = (field, value) => {
    setForm(prev => ({
      ...prev,
      vitals: { ...prev.vitals, [field]: value }
    }));
  };

  const updateSpecialization = (specialization, data) => {
    setForm(prev => ({
      ...prev,
      [specialization]: data
    }));
  };

  const renderSection = (sectionKey, children) => {
    const section = SECTIONS[sectionKey];
    const isOpen = openSections[sectionKey];
    
    return (
      <div className={`${section.borderColor} backdrop-blur-lg bg-white/90 rounded-2xl mb-4 shadow-lg transition-all duration-200 hover:shadow-xl border-2`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between p-5 ${section.bgColor} hover:bg-opacity-80 transition-all duration-200 rounded-2xl border-b-2 ${section.borderColor}`}
        >
          <div className="flex items-center gap-4">
            <div className={`${section.textColor} p-2 rounded-xl bg-white/80 shadow-sm`}>
              {section.icon}
            </div>
            <h3 className={`font-bold text-lg ${section.textColor}`}>
              {section.title}
            </h3>
          </div>
          <div className={`${section.textColor} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-5 w-5" />
          </div>
        </button>
        {isOpen && (
          <div className="p-6 pt-0">
            <div className="pt-4">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSpecializationSection = () => {
    if (!doctorData?.specialization?.primary) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No specialization information available</p>
        </div>
      );
    }

    const primarySpecialization = doctorData.specialization.primary.toLowerCase();
    const specializationConfig = AVAILABLE_SPECIALIZATIONS[primarySpecialization];

    if (!specializationConfig) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Star className="h-8 w-8 text-purple-400" />
          </div>
          <h4 className="font-semibold text-lg mb-2 text-gray-800">{doctorData.specialization.primary}</h4>
          <p className="text-gray-600 mb-2">We're working on adding specialized assessment tools for this field.</p>
          <p className="text-sm text-purple-600 font-medium">Coming soon!</p>
        </div>
      );
    }

    const SpecializationComponent = specializationConfig.component;
    
    return (
      <div>
        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <h4 className="font-semibold text-purple-800 mb-1 text-lg">
            {specializationConfig.name} Assessment
          </h4>
          <p className="text-sm text-purple-600">
            Specialized assessment tools for {specializationConfig.name.toLowerCase()}
          </p>
        </div>
        <SpecializationComponent
          data={form[primarySpecialization] || {}}
          onChange={(data) => updateSpecialization(primarySpecialization, data)}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4 rounded-xl" />
            <Skeleton className="h-6 w-96 rounded-xl" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="mb-6 rounded-2xl border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* RX Pad Header */}
        <div className="mb-8 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-4 border-blue-200 overflow-hidden">
          {/* Medical Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-6xl font-bold opacity-90">℞</div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Medical Prescription</h1>
                  <p className="text-blue-100">Digital Health Record System</p>
                </div>
              </div>
              <div className="text-right text-sm text-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor & Patient Info */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Doctor Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Dr.</span> {doctorData?.name || 'Doctor Name'}</p>
                  <p className="text-blue-600">{doctorData?.specialization?.primary || 'General Practice'}</p>
                  <p className="text-gray-600">License: {doctorData?.license_number || 'MD-XXXX'}</p>
                </div>
              </div>
              
              <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Name:</span> {appointmentData?.patient_name || 'Patient Name'}</p>
                  <p><span className="font-semibold">ID:</span> {form.patient_id || 'N/A'}</p>
                  <p><span className="font-semibold">Appointment:</span> {form.appointment_id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <Alert className="mb-6 rounded-2xl border-green-200 bg-green-50">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Diagnosis saved successfully!</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 rounded-2xl border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Vital Signs Section */}
        {renderSection("vitals", (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                Temperature (°F)
              </label>
              <Input
                type="number"
                placeholder="98.6"
                value={form.vitals.temperature}
                onChange={(e) => updateVitals("temperature", e.target.value)}
                className="rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Heart Rate (bpm)
              </label>
              <Input
                type="number"
                placeholder="72"
                value={form.vitals.heart_rate}
                onChange={(e) => updateVitals("heart_rate", e.target.value)}
                className="rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-500" />
                Blood Pressure
              </label>
              <Input
                placeholder="120/80"
                value={form.vitals.blood_pressure}
                onChange={(e) => updateVitals("blood_pressure", e.target.value)}
                className="rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Wind className="h-4 w-4 text-red-500" />
                Respiratory Rate
              </label>
              <Input
                type="number"
                placeholder="16"
                value={form.vitals.respiratory_rate}
                onChange={(e) => updateVitals("respiratory_rate", e.target.value)}
                className="rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-red-500" />
                Oxygen Saturation (%)
              </label>
              <Input
                type="number"
                placeholder="98"
                value={form.vitals.oxygen_saturation}
                onChange={(e) => updateVitals("oxygen_saturation", e.target.value)}
                className="rounded-xl border-gray-200 focus:border-red-300 focus:ring-red-200"
              />
            </div>
          </div>
        ))}

        {/* Symptoms Section */}
        {renderSection("symptoms", (
          <div className="space-y-4">
            {form.symptoms.map((symptom, index) => (
              <div key={index} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-blue-800">Symptom {index + 1}</h4>
                  {form.symptoms.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSymptom(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <Input
                      placeholder="Describe the symptom..."
                      value={symptom.description}
                      onChange={(e) => updateSymptom(index, "description", e.target.value)}
                      className="rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SYMPTOM_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => updateSymptom(index, "description", suggestion)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Severity</label>
                      <select
                        value={symptom.severity}
                        onChange={(e) => updateSymptom(index, "severity", e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-xl focus:border-blue-300 focus:ring-blue-200 focus:ring-2 focus:ring-opacity-20"
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Onset Date</label>
                      <Input
                        type="date"
                        value={symptom.onset}
                        onChange={(e) => updateSymptom(index, "onset", e.target.value)}
                        className="rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addSymptom}
              className="w-full rounded-xl border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Symptom
            </Button>
          </div>
        ))}

        {/* Specialization Section */}
        {renderSection("specialization", renderSpecializationSection())}

        {/* Diagnosis Section */}
        {renderSection("diagnosis", (
          <div className="space-y-4">
            {form.diagnosis_info.map((diagnosis, index) => (
              <div key={index} className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-orange-800">Diagnosis {index + 1}</h4>
                  {form.diagnosis_info.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDiagnosis(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Condition/Disease</label>
                    <Input
                      placeholder="Enter diagnosis..."
                      value={diagnosis.condition}
                      onChange={(e) => updateDiagnosis(index, "condition", e.target.value)}
                      className="rounded-xl border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">ICD Code (Optional)</label>
                    <Input
                      placeholder="e.g., J00.0"
                      value={diagnosis.code}
                      onChange={(e) => updateDiagnosis(index, "code", e.target.value)}
                      className="rounded-xl border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Additional Notes</label>
                  <Textarea
                    placeholder="Additional diagnostic notes..."
                    value={diagnosis.notes}
                    onChange={(e) => updateDiagnosis(index, "notes", e.target.value)}
                    className="rounded-xl border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                    rows={3}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addDiagnosis}
              className="w-full rounded-xl border-dashed border-2 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Diagnosis
            </Button>
          </div>
        ))}

        {/* Treatment Plan Section */}
        {renderSection("treatment", (
          <div className="space-y-6">
            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prescription & Medications
              </h4>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Follow-up Instructions</label>
                <Textarea
                  placeholder="Enter follow-up care instructions..."
                  value={form.treatment_plan.follow_up}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    treatment_plan: { ...prev.treatment_plan, follow_up: e.target.value }
                  }))}
                  className="rounded-xl border-gray-200 focus:border-green-300 focus:ring-green-200"
                  rows={4}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Additional Notes Section */}
        {renderSection("notes", (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Additional Clinical Notes</label>
              <Textarea
                placeholder="Any additional observations, recommendations, or notes..."
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                className="rounded-xl border-gray-200 focus:border-gray-300 focus:ring-gray-200"
                rows={5}
              />
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-blue-100 p-4 shadow-2xl">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Button>
            
            <Button
              onClick={generatePrescriptionPDF}
              variant="outline"
              className="flex-1 rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
            
            <Button
              onClick={generatePrescriptionPDF}
              variant="outline"
              className="flex-1 rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Prescription
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white shadow-lg"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Diagnosis
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Debug Info (Development Only) */}
        {debugInfo && (
          <div className="mt-8 bg-gray-100 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
       <div className="w-96">
    <MedicalHistory patientId={form.patient_id} />
  </div>
    </div>
  );
}