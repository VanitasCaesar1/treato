"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, ArrowLeft, ChevronDown, ChevronUp, X, Save, 
  Plus, CalendarIcon, Thermometer, Heart, Activity, Droplets,
  Wind, User, FileText, Stethoscope, Shield, Check, PenTool
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import PrescriptionSection from "@/components/appointment/PrescriptionSection"; // Import the PrescriptionSection component

// Common symptom suggestions for quick entry
const SYMPTOM_SUGGESTIONS = ["Fever", "Headache", "Cough", "Fatigue", "Nausea", "Sore Throat", "Shortness of Breath"];

// Default empty form structure to prevent null errors
const DEFAULT_DIAGNOSIS_FORM = {
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
  symptoms: [{ description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] }],
  diagnosis_info: [{ condition: "", code: "", notes: "" }],
  status: "draft",
  notes: "",
  treatment_plan: { follow_up: "", medications: [], procedures: [] }
};

// Section configuration for DRY approach
const SECTIONS_CONFIG = {
  vitals: {
    icon: <Thermometer className="h-5 w-5" />,
    title: "Vitals",
    color: "bg-gradient-to-r from-rose-500 to-red-500",
    bgColor: "bg-gradient-to-r from-rose-50 to-red-50",
    borderColor: "border-rose-500"
  },
  symptoms: {
    icon: <Activity className="h-5 w-5" />,
    title: "Symptoms",
    color: "bg-gradient-to-r from-blue-500 to-indigo-500",
    bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
    borderColor: "border-blue-500"
  },
  medicalHistory: {
    icon: <FileText className="h-5 w-5" />,
    title: "Medical History",
    color: "bg-gradient-to-r from-purple-500 to-violet-500",
    bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
    borderColor: "border-purple-500"
  },
  diagnosis: {
    icon: <Stethoscope className="h-5 w-5" />,
    title: "Diagnosis",
    color: "bg-gradient-to-r from-amber-500 to-yellow-500",
    bgColor: "bg-gradient-to-r from-amber-50 to-yellow-50",
    borderColor: "border-amber-500"
  },
  treatment: {
    icon: <Shield className="h-5 w-5" />,
    title: "Prescription", // Changed from "Treatment Plan" to "Prescription"
    color: "bg-gradient-to-r from-emerald-500 to-green-500",
    bgColor: "bg-gradient-to-r from-emerald-50 to-green-50",
    borderColor: "border-emerald-500"
  },
  notes: {
    icon: <PenTool className="h-5 w-5" />,
    title: "Additional Notes",
    color: "bg-gradient-to-r from-gray-500 to-slate-500",
    bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
    borderColor: "border-gray-500"
  }
};

export default function DiagnosisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  
  const [loading, setLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Accordion state
  const [openSections, setOpenSections] = useState({
    vitals: true, medicalHistory: false, symptoms: true,
    diagnosis: false, treatment: false, notes: false
  });
  
  // Form state
  const [diagnosisForm, setDiagnosisForm] = useState(DEFAULT_DIAGNOSIS_FORM);

  // Toggle accordion section
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch appointment data
  useEffect(() => {
    async function fetchAppointmentData() {
      if (!appointmentId) {
        setError("No appointment ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/appointments/${appointmentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch appointment: ${response.status}`);
        }
        
        const data = await response.json();
        const appointment = data.appointment || data;
        setAppointmentData(appointment);
        
        // Initialize form with appointment data
        setDiagnosisForm(prev => {
          const updatedForm = {
            ...DEFAULT_DIAGNOSIS_FORM,
            appointment_id: appointment.appointment_id || "",
            patient_id: appointment.patient_id || "",
            doctor_id: appointment.doctor_id || "",
            org_id: appointment.org_id || "",
          };
          
          if (appointment.symptoms && Array.isArray(appointment.symptoms) && appointment.symptoms.length > 0) {
            updatedForm.symptoms = appointment.symptoms.map(symptom => ({
              description: symptom.description || "",
              severity: symptom.severity || "moderate",
              onset: symptom.onset || new Date().toISOString().split('T')[0]
            }));
          }
          
          return updatedForm;
        });
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError(err.message || "Failed to load appointment information");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAppointmentData();
  }, [appointmentId]);
  
  // Updates any field in the form using a more concise approach
  const updateFormField = (path, value, index = null) => {
    setDiagnosisForm(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      const [section, field] = path.split(".");
      
      if (index !== null) {
        // Ensure array exists
        if (!Array.isArray(newState[section])) {
          newState[section] = section === "symptoms" ? 
            [{ description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] }] :
            [{ condition: "", code: "", notes: "" }];
        }
        
        // Ensure index exists
        while (newState[section].length <= index) {
          newState[section].push(section === "symptoms" ? 
            { description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] } :
            { condition: "", code: "", notes: "" });
        }
        
        newState[section][index][field] = value;
      } else if (section === "root") {
        newState[field] = value;
      } else if (field) {
        if (!newState[section]) newState[section] = {};
        newState[section][field] = value;
      } else {
        newState[section] = value;
      }
      
      return newState;
    });
  };

  // Array item management
  const arrayOperations = {
    add: (section) => {
      setDiagnosisForm(prev => {
        const newState = JSON.parse(JSON.stringify(prev));
        if (!Array.isArray(newState[section])) {
          newState[section] = [];
        }
        
        newState[section].push(section === "symptoms" ? 
          { description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] } :
          { condition: "", code: "", notes: "" });
        
        return newState;
      });
    },
    
    remove: (section, index) => {
      setDiagnosisForm(prev => {
        const newState = JSON.parse(JSON.stringify(prev));
        if (Array.isArray(newState[section]) && index >= 0 && index < newState[section].length) {
          newState[section].splice(index, 1);
          
          // Don't allow empty arrays
          if (newState[section].length === 0) {
            newState[section].push(section === "symptoms" ? 
              { description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] } :
              { condition: "", code: "", notes: "" });
          }
        }
        return newState;
      });
    }
  };

  // Add suggested symptom
  const addSuggestedSymptom = (suggestion) => {
    if (!Array.isArray(diagnosisForm.symptoms)) {
      setDiagnosisForm(prev => ({
        ...prev,
        symptoms: [{ 
          description: suggestion, 
          severity: "moderate", 
          onset: new Date().toISOString().split('T')[0] 
        }]
      }));
      return;
    }
    
    const emptyIndex = diagnosisForm.symptoms.findIndex(s => !s.description);
    if (emptyIndex >= 0) {
      updateFormField("symptoms.description", suggestion, emptyIndex);
    } else {
      arrayOperations.add("symptoms");
      // Wait for state update before setting description
      setTimeout(() => {
        updateFormField("symptoms.description", suggestion, diagnosisForm.symptoms.length);
      }, 0);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!appointmentId) {
      setError("Appointment ID is required");
      return;
    }
    
    setSubmitting(true);
    setSaveSuccess(false);
    
    try {
      const submissionData = {
        ...diagnosisForm,
        appointment_id: diagnosisForm.appointment_id || appointmentId,
      };
      
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create diagnosis');
      }
      
      const result = await response.json();
      setSaveSuccess(true);
      
      // Navigate after success message
      setTimeout(() => {
        router.push(`/dashboard/op/${result.diagnosis.diagnosis_id}`);
      }, 1500);
    } catch (err) {
      console.error("Error creating diagnosis:", err);
      setError(err.message || "Failed to create diagnosis");
      window.scrollTo(0, 0);
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <Skeleton className="h-12 w-3/4" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Success Alert */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border-green-400 border rounded-lg px-6 py-4 shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
          <Check className="text-green-600 h-5 w-5" />
          <span className="text-green-800">Diagnosis saved successfully!</span>
        </div>
      )}
      
      {/* Header */}
      <Header 
        patientName={appointmentData?.patient_name || "Patient"} 
        patientAge={appointmentData?.age || ""}
        patientGender={appointmentData?.gender || ""}
        onBackClick={() => router.back()}
      />
      
      {/* Main content area with sticky action buttons */}
      <div className="flex max-w-screen-2xl mx-auto relative pb-20">
        {/* Main form area */}
        <div className="flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vitals Section */}
            <SectionCard 
              config={SECTIONS_CONFIG.vitals}
              isOpen={openSections.vitals}
              onToggle={() => toggleSection('vitals')}
            >
              <VitalsSection 
                vitals={diagnosisForm.vitals || {}} 
                onChange={(field, value) => updateFormField(`vitals.${field}`, value)} 
              />
            </SectionCard>
            
            {/* Symptoms Section */}
            <SectionCard 
              config={SECTIONS_CONFIG.symptoms}
              isOpen={openSections.symptoms}
              onToggle={() => toggleSection('symptoms')}
            >
              <SymptomsSection 
                symptoms={diagnosisForm.symptoms || []} 
                updateSymptom={(field, value, index) => updateFormField(`symptoms.${field}`, value, index)}
                addSymptom={() => arrayOperations.add("symptoms")}
                removeSymptom={index => arrayOperations.remove("symptoms", index)}
                addSuggestion={addSuggestedSymptom}
              />
            </SectionCard>
            
            {/* Medical History Section */}
            <SectionCard 
              config={SECTIONS_CONFIG.medicalHistory}
              isOpen={openSections.medicalHistory}
              onToggle={() => toggleSection('medicalHistory')}
            >
              <Textarea 
                placeholder="Enter relevant medical history details"
                className="min-h-32 resize-y rounded-xl border-gray-200 focus:border-purple-300 focus:ring focus:ring-purple-100 transition-colors"
                value={diagnosisForm.medical_history?.notes || ""}
                onChange={(e) => updateFormField("medical_history.notes", e.target.value)}
              />
            </SectionCard>
            
            {/* Diagnosis Section */}
            <SectionCard 
              config={SECTIONS_CONFIG.diagnosis}
              isOpen={openSections.diagnosis}
              onToggle={() => toggleSection('diagnosis')}
            >
              <DiagnosisSection 
                diagnoses={diagnosisForm.diagnosis_info || []}
                updateDiagnosis={(field, value, index) => updateFormField(`diagnosis_info.${field}`, value, index)}
                addDiagnosis={() => arrayOperations.add("diagnosis_info")}
                removeDiagnosis={index => arrayOperations.remove("diagnosis_info", index)}
                status={diagnosisForm.status || "draft"}
                onStatusChange={(value) => updateFormField("root.status", value)}
              />
            </SectionCard>
            
            {/* Prescription Section (Previously Treatment Plan Section) */}
            <SectionCard 
              config={SECTIONS_CONFIG.treatment}
              isOpen={openSections.treatment}
              onToggle={() => toggleSection('treatment')}
            >
              <PrescriptionSection 
                treatmentPlan={diagnosisForm.treatment_plan || {}}
                updateTreatmentPlan={(field, value) => {
                  setDiagnosisForm(prev => {
                    const newState = JSON.parse(JSON.stringify(prev));
                    if (!newState.treatment_plan) newState.treatment_plan = {};
                    newState.treatment_plan[field] = value;
                    return newState;
                  });
                }}
              />
            </SectionCard>
            
            {/* Notes Section */}
            <SectionCard 
              config={SECTIONS_CONFIG.notes}
              isOpen={openSections.notes}
              onToggle={() => toggleSection('notes')}
            >
              <Textarea 
                placeholder="Any additional notes for this diagnosis"
                className="min-h-32 resize-y rounded-xl border-gray-200 focus:border-gray-400 focus:ring focus:ring-gray-100 transition-colors"
                value={diagnosisForm.notes || ""}
                onChange={(e) => updateFormField("root.notes", e.target.value)}
              />
            </SectionCard>
          </form>
        </div>
        
        {/* Wider patient sidebar */}
        <PatientSidebar />
      </div>
      
      {/* Sticky Action buttons */}
      <ActionButtons 
        onCancel={() => router.back()} 
        isSubmitting={submitting} 
      />
    </div>
  );
}

// Header component with patient information
function Header({ patientName, patientAge, patientGender, onBackClick }) {
  return (
    <header className="px-6 py-4 bg-white border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="mr-4 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" /> {patientName}
          </h1>
          <p className="text-sm text-gray-500">
            {patientAge && `${patientAge}y`} {patientGender && `| ${patientGender.charAt(0).toUpperCase()}`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          className="rounded-full px-5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:bg-blue-100 transition-all"
        >
          Patient overview
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full px-5 py-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 hover:bg-emerald-100 transition-all"
        >
          Prescription Pad
        </Button>
      </div>
    </header>
  );
}

// Enhanced section card component for accordion sections
function SectionCard({ config, isOpen, onToggle, children }) {
  const { icon, title, color, bgColor, borderColor } = config;
  
  return (
    <div className={`mb-4 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ease-in-out ${isOpen ? `ring-2 ring-offset-2 ring-offset-gray-50 ring-${borderColor.split('-')[1]}` : ''}`}>
      <div 
        className={`flex justify-between items-center p-4 ${bgColor} cursor-pointer border-l-4 ${borderColor}`}
        onClick={onToggle}
        style={{ borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${color} text-white`}>
            {icon}
          </div>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
      </div>
      {isOpen && (
        <div className="p-6 bg-white border-t border-gray-100" style={{ borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Vital Input component for capturing vital signs
function VitalInput({ label, value, onChange, placeholder, unit, icon, min, max, step = "any", bgColor = "bg-gray-50", highlightColor = "border-red-300 ring-red-100" }) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-200`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-gray-500">{icon}</div>
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      </div>
      <div className="flex items-center mt-1">
        <input
          type="text"
          min={min} 
          max={max}
          step={step}
          placeholder={placeholder}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)}
          className={`text-2xl font-semibold bg-transparent border-none w-full p-0 focus:outline-none focus:ring-2 ${highlightColor} rounded-lg`}
          aria-label={label}
        />
        <span className="text-xl text-gray-500 font-medium ml-1 shrink-0">{unit}</span>
      </div>
    </div>
  );
}

// Vitals Section component
function VitalsSection({ vitals, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <VitalInput
        label="Temperature"
        value={vitals.temperature}
        onChange={(value) => onChange("temperature", value)}
        placeholder="37.0"
        unit="°C"
        icon={<Thermometer className="h-4 w-4" />}
        min="35"
        max="42"
        step="0.1"
        bgColor="bg-gradient-to-br from-rose-50 to-red-50"
        highlightColor="border-red-300 ring-red-100"
      />
      
      <VitalInput
        label="Heart Rate"
        value={vitals.heart_rate}
        onChange={(value) => onChange("heart_rate", value)}
        placeholder="80"
        unit="BPM"
        icon={<Heart className="h-4 w-4" />}
        min="40"
        max="200"
        bgColor="bg-gradient-to-br from-pink-50 to-rose-50"
        highlightColor="border-pink-300 ring-pink-100"
      />
      
      <VitalInput
        label="Blood Pressure"
        value={vitals.blood_pressure}
        onChange={(value) => onChange("blood_pressure", value)}
        placeholder="120/80"
        unit="mmHg"
        icon={<Activity className="h-4 w-4" />}
        bgColor="bg-gradient-to-br from-orange-50 to-amber-50"
        highlightColor="border-orange-300 ring-orange-100"
      />
      
      <VitalInput
        label="Respiratory Rate"
        value={vitals.respiratory_rate}
        onChange={(value) => onChange("respiratory_rate", value)}
        placeholder="16"
        unit="/min"
        icon={<Wind className="h-4 w-4" />}
        min="8"
        max="40"
        bgColor="bg-gradient-to-br from-sky-50 to-blue-50"
        highlightColor="border-sky-300 ring-sky-100"
      />
      
      <VitalInput
        label="Oxygen Saturation"
        value={vitals.oxygen_saturation}
        onChange={(value) => onChange("oxygen_saturation", value)}
        placeholder="98"
        unit="%"
        icon={<Droplets className="h-4 w-4" />}
        min="80"
        max="100"
        bgColor="bg-gradient-to-br from-indigo-50 to-violet-50"
        highlightColor="border-indigo-300 ring-indigo-100"
      />
    </div>
  );
}

// Symptoms Section component
function SymptomsSection({ symptoms, updateSymptom, addSymptom, removeSymptom, addSuggestion }) {
  // Define severity classes for buttons
  const severityClasses = {
    mild: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
    moderate: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200", 
    severe: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
  };

  return (
    <div className="space-y-4">
      {Array.isArray(symptoms) ? (
        symptoms.map((symptom, index) => (
          <div key={index} className="flex flex-col gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-300 relative transition-all duration-200 hover:shadow-md group">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <Input 
                  placeholder="Enter symptom"
                  className="text-lg font-medium p-0 focus-within:ring-0 border-0 bg-transparent border-b-2 border-blue-100 focus:border-blue-300"
                  value={symptom.description || ""}
                  onChange={(e) => updateSymptom("description", e.target.value, index)}
                />
              </div>
              <button 
                type="button"
                onClick={() => removeSymptom(index)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-70 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1">
                {["mild", "moderate", "severe"].map((severity) => (
                  <Button
                    key={severity}
                    type="button"
                    className={`text-xs px-2 py-1 rounded-md border ${symptom.severity === severity ? severityClasses[severity] : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                    onClick={() => updateSymptom("severity", severity, index)}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">Onset:</span>
                <input
                  type="date"
                  className="text-xs p-1 border border-gray-200 rounded-md bg-white"
                  value={symptom.onset || ""}
                  onChange={(e) => updateSymptom("onset", e.target.value, index)}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
          Error loading symptoms data. Please try again.
        </div>
      )}
      
      <div>
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2 bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={addSymptom}
        >
          <Plus className="h-4 w-4" /> Add symptom
        </Button>
      </div>
      
      {/* Symptom quick suggestions */}
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">Quick add:</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_SUGGESTIONS.map((suggestion, i) => (
            <Button
              key={i}
              type="button"
              variant="outline"
              className="text-xs px-3 py-1 rounded-full border-blue-200 hover:bg-blue-50"
              onClick={() => addSuggestion(suggestion)}
            >
              + {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiagnosisSection({ diagnoses, updateDiagnosis, addDiagnosis, removeDiagnosis, status, onStatusChange }) {
  const statusOptions = [
    { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200" },
    { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-700 border-green-200" },
    { value: "tentative", label: "Tentative", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { value: "ruled_out", label: "Ruled Out", color: "bg-red-100 text-red-700 border-red-200" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-sm font-medium">Status:</span>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`text-xs px-3 py-1 rounded-full transition-colors border ${
                status === option.value ? option.color : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
              onClick={() => onStatusChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {Array.isArray(diagnoses) ? (
        diagnoses.map((diagnosis, index) => (
          <div 
            key={index} 
            className="flex flex-col gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-300 relative transition-all duration-200 hover:shadow-md group"
          >
            <div className="flex justify-between items-start">
              <div className="w-full">
                <Input 
                  placeholder="Diagnosis"
                  className="text-lg font-medium p-0 focus-within:ring-0 border-0 bg-transparent border-b-2 border-amber-100 focus:border-amber-300"
                  value={diagnosis.condition || ""}
                  onChange={(e) => updateDiagnosis("condition", e.target.value, index)}
                />
              </div>
              <button 
                type="button"
                onClick={() => removeDiagnosis(index)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-70 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <Input 
                  placeholder="Diagnosis code (ICD-10)"
                  className="text-sm border-amber-100 focus:border-amber-300 bg-amber-50/50"
                  value={diagnosis.code || ""}
                  onChange={(e) => updateDiagnosis("code", e.target.value, index)}
                />
              </div>
              
              <div className="flex-1">
                <Textarea 
                  placeholder="Additional notes for this diagnosis"
                  className="text-sm min-h-16 resize-y border-amber-100 focus:border-amber-300 bg-amber-50/50"
                  value={diagnosis.notes || ""}
                  onChange={(e) => updateDiagnosis("notes", e.target.value, index)}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
          Error loading diagnosis data. Please try again.
        </div>
      )}
      
      <div>
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2 bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
          onClick={addDiagnosis}
        >
          <Plus className="h-4 w-4" /> Add diagnosis
        </Button>
      </div>
    </div>
  );
}

// Patient sidebar component
function PatientSidebar() {
  return (
    <div className="w-80 bg-white border-l border-gray-200 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto hidden lg:block">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" /> Patient Overview
        </h3>
        
        {/* Patient summary */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">
            This sidebar would show patient information, history, and relevant details to aid in diagnosis.
          </p>
        </div>
        
        {/* Sample sections that would contain real data */}
        <div className="space-y-4">
          <Card className="p-3 border-blue-200 bg-blue-50">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Allergies</h4>
            <p className="text-xs text-gray-600">No known allergies</p>
          </Card>
          
          <Card className="p-3 border-purple-200 bg-purple-50">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Current Medications</h4>
            <p className="text-xs text-gray-600">No current medications</p>
          </Card>
          
          <Card className="p-3 border-emerald-200 bg-emerald-50">
            <h4 className="text-sm font-medium text-emerald-800 mb-2">Past Visits</h4>
            <p className="text-xs text-gray-600">No previous visit records found</p>
          </Card>
          
          <Card className="p-3 border-amber-200 bg-amber-50">
            <h4 className="text-sm font-medium text-amber-800 mb-2">Lab Results</h4>
            <p className="text-xs text-gray-600">No recent lab results available</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Sticky action buttons for form actions
function ActionButtons({ onCancel, isSubmitting }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end space-x-4 z-20">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="rounded-full px-6"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="diagnosis-form"
        disabled={isSubmitting}
        className="rounded-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 px-6 flex items-center gap-2"
        onClick={(e) => {
          document.getElementById("diagnosis-form")?.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
          );
        }}
      >
        <Save className="h-4 w-4" />
        {isSubmitting ? "Saving..." : "Save Diagnosis"}
      </Button>
    </div>
  );
}