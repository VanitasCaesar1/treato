"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, ArrowLeft, ChevronDown, ChevronUp, X, Save, 
  Plus, Thermometer, Heart, Activity, Droplets, Wind, User, 
  FileText, Stethoscope, Shield, Check, PenTool, Star
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PrescriptionSection from "@/components/appointment/PrescriptionSection";
import DermatologySection from "@/components/diagnosis/DermatologySection";

const SYMPTOM_SUGGESTIONS = ["Fever", "Headache", "Cough", "Fatigue", "Nausea", "Sore Throat"];

const DEFAULT_FORM = {
  appointment_id: "", patient_id: "", doctor_id: "", org_id: "",
  vitals: { temperature: "", heart_rate: "", blood_pressure: "", respiratory_rate: "", oxygen_saturation: "" },
  medical_history: { notes: "" },
  symptoms: [{ description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] }],
  diagnosis_info: [{ condition: "", code: "", notes: "" }],
  status: "draft", notes: "",
  treatment_plan: { follow_up: "", medications: [], procedures: [] },
  // Dynamic specialization fields
  dermatology: null,
  cardiology: null,
  orthopedics: null,
  // Add other specializations as needed
};

const SECTIONS = {
  vitals: { icon: <Thermometer className="h-5 w-5" />, title: "Vitals", color: "rose" },
  symptoms: { icon: <Activity className="h-5 w-5" />, title: "Symptoms", color: "blue" },
  medicalHistory: { icon: <FileText className="h-5 w-5" />, title: "Medical History", color: "purple" },
  specialization: { icon: <Star className="h-5 w-5" />, title: "Specialization Assessment", color: "teal" },
  diagnosis: { icon: <Stethoscope className="h-5 w-5" />, title: "Diagnosis", color: "amber" },
  treatment: { icon: <Shield className="h-5 w-5" />, title: "Prescription", color: "emerald" },
  notes: { icon: <PenTool className="h-5 w-5" />, title: "Additional Notes", color: "gray" }
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
  const [openSections, setOpenSections] = useState({
    vitals: true, medicalHistory: true, symptoms: true,
    specialization: false, diagnosis: false, treatment: false, notes: false
  });
  const [form, setForm] = useState(DEFAULT_FORM);

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
        if (primarySpecialization) {
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
      default:
        return {};
    }
  };

  const updateField = (path, value, index = null) => {
    setForm(prev => {
      const newForm = { ...prev };
      const [section, field] = path.split(".");
      
      if (index !== null) {
        if (!Array.isArray(newForm[section])) newForm[section] = [];
        while (newForm[section].length <= index) {
          newForm[section].push(section === "symptoms" ? 
            { description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] } :
            { condition: "", code: "", notes: "" });
        }
        newForm[section][index][field] = value;
      } else if (section === "root") {
        newForm[field] = value;
      } else if (field) {
        if (!newForm[section]) newForm[section] = {};
        newForm[section][field] = value;
      } else {
        newForm[section] = value;
      }
      return newForm;
    });
  };

  const updateSpecializationData = (specialization, data) => {
    setForm(prev => ({
      ...prev,
      [specialization]: data
    }));
  };

  const renderSpecializationSection = () => {
    if (!doctorData?.specialization?.primary) return null;

    const primarySpecialization = doctorData.specialization.primary.toLowerCase();
    
    switch (primarySpecialization) {
      case 'dermatology':
        return (
          <DermatologySection
            dermatologyData={form.dermatology}
            onChange={(data) => updateSpecializationData('dermatology', data)}
          />
        );
      
      case 'cardiology':
        return <CardiologySection 
          cardiologyData={form.cardiology}
          onChange={(data) => updateSpecializationData('cardiology', data)}
        />;
      
      case 'orthopedics':
        return <OrthopedicsSection 
          orthopedicsData={form.orthopedics}
          onChange={(data) => updateSpecializationData('orthopedics', data)}
        />;
      
      default:
        return (
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-gray-600">
              Specialized assessment forms for {doctorData.specialization.primary} are coming soon.
            </p>
          </div>
        );
    }
  };

  const getSpecializationTitle = () => {
    if (!doctorData?.specialization?.primary) return "Specialization Assessment";
    return `${doctorData.specialization.primary} Assessment`;
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form submission started"); // Debug log
    console.log("Current form data:", form); // Debug log
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError("Validation failed: " + validationErrors.join(", "));
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare the data for submission
      const submissionData = {
        ...form,
        appointment_id: appointmentId, // Ensure we use the URL parameter
        // Clean up empty entries
        symptoms: form.symptoms.filter(s => s.description?.trim()),
        diagnosis_info: form.diagnosis_info.filter(d => d.condition?.trim()),
        // Ensure vitals are properly formatted
        vitals: {
          temperature: form.vitals.temperature || null,
          heart_rate: form.vitals.heart_rate || null,
          blood_pressure: form.vitals.blood_pressure || null,
          respiratory_rate: form.vitals.respiratory_rate || null,
          oxygen_saturation: form.vitals.oxygen_saturation || null,
        }
      };
      
      console.log("Submitting data:", submissionData); // Debug log
      setDebugInfo(submissionData); // Store for debugging
      
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData),
      });
      
      console.log("Response status:", response.status); // Debug log
      console.log("Response headers:", Object.fromEntries(response.headers.entries())); // Debug log
      
      const responseText = await response.text();
      console.log("Response text:", responseText); // Debug log
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Server returned invalid JSON. Status: ${response.status}, Body: ${responseText.substring(0, 200)}...`);
      }
      
      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log("Success result:", result); // Debug log
      
      setSaveSuccess(true);
      
      // Navigate to the diagnosis view or dashboard after a delay
      setTimeout(() => {
        if (result.diagnosis?.diagnosis_id) {
          router.push(`/dashboard/op/${result.diagnosis.diagnosis_id}`);
        } else {
          router.push("/dashboard");
        }
      }, 1500);
      
    } catch (err) {
      console.error("Submission error:", err); // Debug log
      setError(`Failed to save diagnosis: ${err.message}`);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} onBack={() => router.push("/dashboard")} />;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {saveSuccess && <SuccessAlert />}
      
      <Header 
        patientName={appointmentData?.patient_name || "Patient"} 
        doctorSpecialization={doctorData?.specialization?.primary}
        onBackClick={() => router.back()}
      />
      
      <div className="max-w-7xl mx-auto p-6 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard section="vitals" config={SECTIONS.vitals} isOpen={openSections.vitals} 
            onToggle={() => setOpenSections(prev => ({ ...prev, vitals: !prev.vitals }))}>
            <VitalsSection vitals={form.vitals} onChange={(field, value) => updateField(`vitals.${field}`, value)} />
          </SectionCard>
          
          <SectionCard section="symptoms" config={SECTIONS.symptoms} isOpen={openSections.symptoms}
            onToggle={() => setOpenSections(prev => ({ ...prev, symptoms: !prev.symptoms }))}>
            <SymptomsSection 
              symptoms={form.symptoms} 
              updateSymptom={(field, value, index) => updateField(`symptoms.${field}`, value, index)}
              addSymptom={() => setForm(prev => ({ ...prev, symptoms: [...prev.symptoms, { description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] }] }))}
              removeSymptom={index => setForm(prev => ({ ...prev, symptoms: prev.symptoms.filter((_, i) => i !== index) }))}
              addSuggestion={(suggestion) => {
                const emptyIndex = form.symptoms.findIndex(s => !s.description);
                if (emptyIndex >= 0) updateField("symptoms.description", suggestion, emptyIndex);
                else setForm(prev => ({ ...prev, symptoms: [...prev.symptoms, { description: suggestion, severity: "moderate", onset: new Date().toISOString().split('T')[0] }] }));
              }}
            />
          </SectionCard>
          
          <SectionCard section="medicalHistory" config={SECTIONS.medicalHistory} isOpen={openSections.medicalHistory}
            onToggle={() => setOpenSections(prev => ({ ...prev, medicalHistory: !prev.medicalHistory }))}>
            <Textarea 
              placeholder="Enter relevant medical history details"
              className="min-h-32"
              value={form.medical_history?.notes || ""}
              onChange={(e) => updateField("medical_history.notes", e.target.value)}
            />
          </SectionCard>
          
          {/* Dynamic Specialization Section */}
          {doctorData?.specialization?.primary && (
            <SectionCard 
              section="specialization" 
              config={{
                ...SECTIONS.specialization,
                title: getSpecializationTitle()
              }} 
              isOpen={openSections.specialization}
              onToggle={() => setOpenSections(prev => ({ ...prev, specialization: !prev.specialization }))}
            >
              {renderSpecializationSection()}
            </SectionCard>
          )}
          
          <SectionCard section="diagnosis" config={SECTIONS.diagnosis} isOpen={openSections.diagnosis}
            onToggle={() => setOpenSections(prev => ({ ...prev, diagnosis: !prev.diagnosis }))}>
            <DiagnosisSection 
              diagnoses={form.diagnosis_info}
              updateDiagnosis={(field, value, index) => updateField(`diagnosis_info.${field}`, value, index)}
              addDiagnosis={() => setForm(prev => ({ ...prev, diagnosis_info: [...prev.diagnosis_info, { condition: "", code: "", notes: "" }] }))}
              removeDiagnosis={index => setForm(prev => ({ ...prev, diagnosis_info: prev.diagnosis_info.filter((_, i) => i !== index) }))}
              status={form.status}
              onStatusChange={(value) => updateField("root.status", value)}
            />
          </SectionCard>
          
          <SectionCard section="treatment" config={SECTIONS.treatment} isOpen={openSections.treatment}
            onToggle={() => setOpenSections(prev => ({ ...prev, treatment: !prev.treatment }))}>
            <PrescriptionSection 
              treatmentPlan={form.treatment_plan}
              updateTreatmentPlan={(field, value) => setForm(prev => ({ ...prev, treatment_plan: { ...prev.treatment_plan, [field]: value } }))}
            />
          </SectionCard>
          
          <SectionCard section="notes" config={SECTIONS.notes} isOpen={openSections.notes}
            onToggle={() => setOpenSections(prev => ({ ...prev, notes: !prev.notes }))}>
            <Textarea 
              placeholder="Any additional notes"
              className="min-h-32"
              value={form.notes || ""}
              onChange={(e) => updateField("root.notes", e.target.value)}
            />
          </SectionCard>
        </form>
      </div>
      
      <ActionButtons onCancel={() => router.back()} isSubmitting={submitting} />
    </div>
  );
}

// Placeholder components for other specializations
function CardiologySection({ cardiologyData, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Chest Pain Assessment</label>
          <Textarea
            placeholder="Describe chest pain characteristics..."
            value={cardiologyData?.chest_pain_assessment || ""}
            onChange={(e) => onChange({ ...cardiologyData, chest_pain_assessment: e.target.value })}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Cardiac Rhythm</label>
          <Input
            placeholder="Regular, irregular, arrhythmic..."
            value={cardiologyData?.cardiac_rhythm || ""}
            onChange={(e) => onChange({ ...cardiologyData, cardiac_rhythm: e.target.value })}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Heart Sounds</label>
          <Input
            placeholder="S1, S2, gallops, etc..."
            value={cardiologyData?.heart_sounds || ""}
            onChange={(e) => onChange({ ...cardiologyData, heart_sounds: e.target.value })}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Murmurs</label>
          <Input
            placeholder="Systolic, diastolic, grade..."
            value={cardiologyData?.murmurs || ""}
            onChange={(e) => onChange({ ...cardiologyData, murmurs: e.target.value })}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">ECG Findings</label>
        <Textarea
          placeholder="ECG interpretation and findings..."
          value={cardiologyData?.ecg_findings || ""}
          onChange={(e) => onChange({ ...cardiologyData, ecg_findings: e.target.value })}
          className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
        />
      </div>
    </div>
  );
}

function OrthopedicsSection({ orthopedicsData, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Joint Assessment</label>
          <Textarea
            placeholder="Joint examination findings..."
            value={orthopedicsData?.joint_assessment || ""}
            onChange={(e) => onChange({ ...orthopedicsData, joint_assessment: e.target.value })}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Range of Motion</label>
          <Textarea
            placeholder="ROM measurements and limitations..."
            value={orthopedicsData?.range_of_motion || ""}
            onChange={(e) => onChange({ ...orthopedicsData, range_of_motion: e.target.value })}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Muscle Strength</label>
          <Input
            placeholder="Muscle strength grading..."
            value={orthopedicsData?.muscle_strength || ""}
            onChange={(e) => onChange({ ...orthopedicsData, muscle_strength: e.target.value })}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Deformities</label>
          <Input
            placeholder="Visible deformities or abnormalities..."
            value={orthopedicsData?.deformities || ""}
            onChange={(e) => onChange({ ...orthopedicsData, deformities: e.target.value })}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Gait Analysis</label>
        <Textarea
          placeholder="Gait pattern and abnormalities..."
          value={orthopedicsData?.gait_analysis || ""}
          onChange={(e) => onChange({ ...orthopedicsData, gait_analysis: e.target.value })}
          className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Skeleton className="h-12 w-3/4 mb-4" />
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full mb-4" />)}
    </div>
  );
}

function ErrorDisplay({ error, onBack }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button variant="outline" onClick={onBack} className="mt-4">Return to Dashboard</Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function SuccessAlert() {
  return (
    <div className="fixed top-4 right-4 z-50 bg-green-100 rounded-xl px-6 py-4 shadow-lg flex items-center gap-3">
      <Check className="text-green-600 h-5 w-5" />
      <span className="text-green-800">Diagnosis saved successfully!</span>
    </div>
  );
}

function Header({ patientName, doctorSpecialization, onBackClick }) {
  return (
    <header className="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 bg-white/90 backdrop-blur-lg">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onBackClick} className="mr-4 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" /> {patientName}
          </h1>
        </div>
      </div>
      {doctorSpecialization && (
        <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
          {doctorSpecialization}
        </div>
      )}
    </header>
  );
}

function SectionCard({ config, isOpen, onToggle, children }) {
  const { icon, title, color } = config;
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm">
      <div 
        className={`flex justify-between items-center p-4 cursor-pointer bg-${color}-50 hover:bg-${color}-100`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-${color}-500 text-white`}>{icon}</div>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </div>
      {isOpen && <div className="p-6 bg-white">{children}</div>}
    </div>
  );
}

function VitalsSection({ vitals, onChange }) {
  const vitalsConfig = [
    { key: "temperature", label: "Temperature", unit: "°C", icon: <Thermometer className="h-4 w-4" /> },
    { key: "heart_rate", label: "Heart Rate", unit: "BPM", icon: <Heart className="h-4 w-4" /> },
    { key: "blood_pressure", label: "Blood Pressure", unit: "mmHg", icon: <Activity className="h-4 w-4" /> },
    { key: "respiratory_rate", label: "Respiratory Rate", unit: "/min", icon: <Wind className="h-4 w-4" /> },
    { key: "oxygen_saturation", label: "Oxygen Saturation", unit: "%", icon: <Droplets className="h-4 w-4" /> }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {vitalsConfig.map(({ key, label, unit, icon }) => (
        <div key={key} className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-sm font-medium">{label}</span>
          </div>
          <div className="flex items-center bg-white rounded-lg px-3 py-2">
            <Input
              value={vitals[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="border-none p-0 text-xl font-semibold"
            />
            <span className="text-lg text-gray-500 ml-1">{unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SymptomsSection({ symptoms, updateSymptom, addSymptom, removeSymptom, addSuggestion }) {
  return (
    <div className="space-y-4">
      {symptoms.map((symptom, index) => (
        <div key={index} className="p-4 rounded-xl bg-blue-50 flex flex-col gap-3">
          <div className="flex justify-between">
            <Input 
              placeholder="Enter symptom"
              value={symptom.description || ""}
              onChange={(e) => updateSymptom("description", e.target.value, index)}
              className="border-none bg-transparent text-lg font-medium"
            />
            <Button type="button" variant="ghost" onClick={() => removeSymptom(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            {["mild", "moderate", "severe"].map((severity) => (
              <Button
                key={severity}
                type="button"
                size="sm"
                variant={symptom.severity === severity ? "default" : "outline"}
                onClick={() => updateSymptom("severity", severity, index)}
              >
                {severity}
              </Button>
            ))}
            <input
              type="date"
              value={symptom.onset || ""}
              onChange={(e) => updateSymptom("onset", e.target.value, index)}
              className="px-2 py-1 border rounded"
            />
          </div>
        </div>
      ))}
      
      <Button type="button" variant="outline" onClick={addSymptom}>
        <Plus className="h-4 w-4 mr-2" /> Add symptom
      </Button>
      
      <div className="flex flex-wrap gap-2">
        {SYMPTOM_SUGGESTIONS.map((suggestion, i) => (
          <Button
            key={i}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => addSuggestion(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}

function DiagnosisSection({ diagnoses, updateDiagnosis, addDiagnosis, removeDiagnosis, status, onStatusChange }) {
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "confirmed", label: "Confirmed" },
    { value: "tentative", label: "Tentative" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={status === option.value ? "default" : "outline"}
            onClick={() => onStatusChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      
      {diagnoses.map((diagnosis, index) => (
        <div key={index} className="p-4 rounded-xl bg-amber-50 space-y-3">
          <div className="flex justify-between">
            <Input 
              placeholder="Diagnosis description"
              value={diagnosis.condition || ""}
              onChange={(e) => updateDiagnosis("condition", e.target.value, index)}
              className="border-none bg-transparent text-lg font-medium"
            />
            <Button type="button" variant="ghost" onClick={() => removeDiagnosis(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="ICD-10 code"
              value={diagnosis.code || ""}
              onChange={(e) => updateDiagnosis("code", e.target.value, index)}
            />
           <Input 
              placeholder="Additional notes"
              value={diagnosis.notes || ""}
              onChange={(e) => updateDiagnosis("notes", e.target.value, index)}
            />
          </div>
        </div>
      ))}
      
      <Button type="button" variant="outline" onClick={addDiagnosis}>
        <Plus className="h-4 w-4 mr-2" /> Add diagnosis
      </Button>
    </div>
  );
}

function ActionButtons({ onCancel, isSubmitting }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 justify-end">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Diagnosis
          </>
        )}
      </Button>
    </div>
  );
}