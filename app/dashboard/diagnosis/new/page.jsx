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
    title: "Prescription", // Changed from "Treatment Plan" to "Prescription"
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
        <div className="fixed top-4 right-4 z-50 bg-green-100 rounded-xl px-6 py-4 shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
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
          <form id="diagnosis-form" onSubmit={handleSubmit} className="space-y-6">
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
                className="min-h-32 resize-y rounded-xl border-purple-200 focus:border-purple-300 focus:ring focus:ring-purple-100 transition-colors"
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
    <header className="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 shadow-sm backdrop-blur-lg bg-white/90">
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
          className="rounded-full px-5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 hover:bg-blue-100 transition-all shadow-sm"
        >
          Patient overview
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full px-5 py-2 border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 hover:bg-emerald-100 transition-all shadow-sm"
        >
          Prescription Pad
        </Button>
      </div>
    </header>
  );
}

// Enhanced section card component for accordion sections with iOS design influence
function SectionCard({ config, isOpen, onToggle, children }) {
  const { icon, title, color, gradient, bgColor, accentColor } = config;
  
  return (
    <div className={`rounded-2xl overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'shadow-md' : 'shadow-sm'}`}>
      <div 
        className={`flex justify-between items-center p-4 cursor-pointer ${isOpen ? `bg-gradient-to-r ${accentColor}` : bgColor}`}
        onClick={onToggle}
        style={{ borderRadius: '1rem' }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${gradient} text-white shadow-sm`}>
            {icon}
          </div>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm">
          {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </div>
      </div>
      {isOpen && (
        <div className="p-6 bg-white rounded-2xl mt-1 shadow-inner" style={{ marginTop: '-0.5rem', paddingTop: '1.5rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Vital Input component for capturing vital signs with iOS/macOS inspired design
function VitalInput({ label, value, onChange, placeholder, unit, icon, min, max, step = "any", bgColor = "bg-gray-50", highlightColor = "ring-red-200" }) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md backdrop-blur-sm`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-gray-600">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center mt-1 bg-white/70 rounded-xl px-3 py-2 backdrop-blur-sm">
        <input
          type="text"
          min={min} 
          max={max}
          step={step}
          placeholder={placeholder}
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)}
          className={`text-2xl font-semibold bg-transparent border-none w-full p-0 focus:outline-none focus:ring-1 ${highlightColor} rounded-lg`}
          aria-label={label}
        />
        <span className="text-xl text-gray-500 font-medium ml-1 shrink-0">{unit}</span>
      </div>
    </div>
  );
}

// Vitals Section component with iOS-inspired design
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
        highlightColor="ring-red-200"
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
        highlightColor="ring-pink-200"
      />
      
      <VitalInput
        label="Blood Pressure"
        value={vitals.blood_pressure}
        onChange={(value) => onChange("blood_pressure", value)}
        placeholder="120/80"
        unit="mmHg"
        icon={<Activity className="h-4 w-4" />}
        bgColor="bg-gradient-to-br from-orange-50 to-amber-50"
        highlightColor="ring-orange-200"
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
        highlightColor="ring-sky-200"
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
        highlightColor="ring-indigo-200"
      />
    </div>
  );
}

// Symptoms Section component with improved iOS/macOS design
function SymptomsSection({ symptoms, updateSymptom, addSymptom, removeSymptom, addSuggestion }) {
  // Define severity classes for buttons with iOS-style
  const severityClasses = {
    mild: "bg-green-100 text-green-700 border-green-100 hover:bg-green-200 shadow-sm",
    moderate: "bg-yellow-100 text-yellow-700 border-yellow-100 hover:bg-yellow-200 shadow-sm", 
    severe: "bg-red-100 text-red-700 border-red-100 hover:bg-red-200 shadow-sm"
  };

  return (
    <div className="space-y-4">
      {Array.isArray(symptoms) ? (
        symptoms.map((symptom, index) => (
          <div 
            key={index} 
            className="flex flex-col gap-3 p-4 rounded-xl shadow-sm transition-all duration-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow group backdrop-blur-sm"
          >
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
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-70 group-hover:opacity-100 bg-white/80 hover:bg-white shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1 bg-white/60 rounded-lg p-1 backdrop-blur-sm">
                {["mild", "moderate", "severe"].map((severity) => (
                  <Button
                    key={severity}
                    type="button"
                    className={`text-xs px-2 py-1 rounded-md ${symptom.severity === severity ? severityClasses[severity] : 'bg-white text-gray-600 border-transparent hover:bg-gray-100'}`}
                    onClick={() => updateSymptom("severity", severity, index)}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center bg-white/60 rounded-lg px-2 py-1 backdrop-blur-sm">
                <span className="text-xs text-gray-500 mr-2">Onset:</span>
                <input
                  type="date"
                  className="text-xs p-1 border-none rounded-md bg-transparent"
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
          className="flex items-center gap-2 bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100 rounded-xl shadow-sm"
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
              variant="ghost"
              className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
              onClick={() => addSuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Diagnosis Section component with improved design
function DiagnosisSection({ diagnoses, updateDiagnosis, addDiagnosis, removeDiagnosis, status, onStatusChange }) {
  const statusOptions = [
    { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700" },
    { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-700" },
    { value: "tentative", label: "Tentative", color: "bg-yellow-100 text-yellow-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Status selector */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Diagnosis Status:</p>
        <div className="flex gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              className={`rounded-lg ${status === option.value ? option.color : 'bg-white text-gray-600'}`}
              onClick={() => onStatusChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      
      {Array.isArray(diagnoses) ? (
        diagnoses.map((diagnosis, index) => (
          <div 
            key={index} 
            className="p-4 rounded-xl shadow-sm bg-gradient-to-r from-amber-50 to-yellow-50 transition-all duration-200 hover:shadow group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="w-full">
                <Input 
                  placeholder="Diagnosis description"
                  className="text-lg font-medium p-0 focus-within:ring-0 border-0 bg-transparent border-b-2 border-amber-100 focus:border-amber-300"
                  value={diagnosis.condition || ""}
                  onChange={(e) => updateDiagnosis("condition", e.target.value, index)}
                />
              </div>
              <button 
                type="button"
                onClick={() => removeDiagnosis(index)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-70 group-hover:opacity-100 bg-white/80 hover:bg-white shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Diagnosis Code</label>
                <Input 
                  placeholder="ICD-10 or other code"
                  className="bg-white/60 backdrop-blur-sm border-amber-100 focus:border-amber-300 focus:ring focus:ring-amber-100"
                  value={diagnosis.code || ""}
                  onChange={(e) => updateDiagnosis("code", e.target.value, index)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Additional Notes</label>
                <Input 
                  placeholder="Additional details"
                  className="bg-white/60 backdrop-blur-sm border-amber-100 focus:border-amber-300 focus:ring focus:ring-amber-100"
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
          className="flex items-center gap-2 bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100 rounded-xl shadow-sm"
          onClick={addDiagnosis}
        >
          <Plus className="h-4 w-4" /> Add diagnosis
        </Button>
      </div>
    </div>
  );
}

// Patient Sidebar component with detailed patient information
function PatientSidebar() {
  // This would typically be populated with patient data from an API
  // For now, we'll use placeholder content
  return (
    <div className="hidden lg:block w-80 bg-white border-l p-6 sticky top-[73px] h-[calc(100vh-73px)] overflow-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Patient Overview</h2>
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <div className="text-sm space-y-2">
              <p><span className="text-gray-500">Age:</span> 45 years</p>
              <p><span className="text-gray-500">Gender:</span> Female</p>
              <p><span className="text-gray-500">Blood Type:</span> O+</p>
              <p><span className="text-gray-500">Weight:</span> 68 kg</p>
              <p><span className="text-gray-500">Height:</span> 165 cm</p>
            </div>
          </Card>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">Allergies</h2>
          <Card className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-red-100">
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span>Penicillin - <span className="text-red-600">Severe</span></span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                <span>Pollen - <span className="text-yellow-600">Moderate</span></span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-green-500" />
                <span>Latex - <span className="text-green-600">Mild</span></span>
              </li>
            </ul>
          </Card>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">Medical History</h2>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100">
            <ul className="text-sm space-y-2">
              <li className="pb-2 border-b border-purple-100">
                <p className="font-medium">Hypertension</p>
                <p className="text-gray-600">Diagnosed 2015, controlled with medication</p>
              </li>
              <li className="pb-2 border-b border-purple-100">
                <p className="font-medium">Type 2 Diabetes</p>
                <p className="text-gray-600">Diagnosed 2018, diet-controlled</p>
              </li>
              <li>
                <p className="font-medium">Appendectomy</p>
                <p className="text-gray-600">Surgical procedure in 2010</p>
              </li>
            </ul>
          </Card>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">Current Medications</h2>
          <Card className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-100">
            <ul className="text-sm space-y-2">
              <li className="flex justify-between">
                <span>Lisinopril 10mg</span>
                <span className="text-gray-500">Daily</span>
              </li>
              <li className="flex justify-between">
                <span>Metformin 500mg</span>
                <span className="text-gray-500">Twice daily</span>
              </li>
              <li className="flex justify-between">
                <span>Atorvastatin 20mg</span>
                <span className="text-gray-500">Evening</span>
              </li>
            </ul>
          </Card>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Tests</h2>
          <Card className="p-4 bg-gradient-to-r from-cyan-50 to-sky-50 border-cyan-100">
            <div className="text-sm space-y-2">
              <p><span className="text-gray-500">Blood Work:</span> 2 weeks ago</p>
              <p><span className="text-gray-500">ECG:</span> 1 month ago</p>
              <p><span className="text-gray-500">X-Ray (Chest):</span> 3 months ago</p>
            </div>
            <Button 
              variant="link" 
              className="text-sky-600 p-0 mt-2 text-sm hover:text-sky-800"
            >
              View all test results
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Action buttons component for submitting or canceling the form
function ActionButtons({ onCancel, isSubmitting }) {
  return (
    <div className="fixed bottom-0 left-0 right-0  border-t shadow-lg px-4 py-3 flex justify-end gap-4 backdrop-blur-md bg-white/90 z-10">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-5 rounded-xl"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="diagnosis-form"
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl shadow-md flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="inline-block h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Diagnosis
          </>
        )}
      </Button>
    </div>
  );
}