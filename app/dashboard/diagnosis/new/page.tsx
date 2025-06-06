"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, X, Check, ChevronDown, ChevronUp, Save, Printer, Download, FileText, Plus, Trash2, Calendar, User, Stethoscope } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PrescriptionPDF, createPrescriptionData, PrescriptionData } from '@/components/diagnosis/PrescriptionPDF';

// Custom hooks for URL parameters and navigation
const useURLParams = () => {
  const [params, setParams] = useState({});
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramsObj = {};
      for (const [key, value] of urlParams.entries()) {
        paramsObj[key] = value;
      }
      setParams(paramsObj);
    }
  }, []);
  
  return {
    get: (key) => params[key] || null
  };
};

const useRouter = () => ({
  back: () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  },
  push: (url) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  }
});

// Types
interface DiagnosisFormData {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  org_id: string;
  vitals: any;
  symptoms: any[];
  diagnosis_info: any[];
  status: 'draft' | 'finalized' | 'amended' | 'cancelled';
  treatment_plan?: any;
  notes?: string;
  specialization?: { type: string; data: any };
}

interface MedicalHistoryItem {
  id: string;
  condition: string;
  diagnosis_date: string;
  status: string;
  doctor_name?: string;
}

interface MedicineSearchResult {
  id: string;
  name: string;
  company: string;
  unit: string;
  strength?: string;
}

// Constants
const DEFAULT_FORM: DiagnosisFormData = {
  appointment_id: "", patient_id: "", doctor_id: "", org_id: "",
  vitals: { timestamp: new Date().toISOString() },
  symptoms: [{ description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] }],
  diagnosis_info: [{ condition: "", code: "", notes: "" }],
  status: "draft", notes: "",
  treatment_plan: { 
    follow_up: { date: "", duration: "", notes: "" }, 
    medications: [], procedures: [], lifestyle_changes: [], referrals: []
  }
};

const SECTIONS = {
  vitals: { icon: "🌡️", title: "Vital Signs", color: "red" },
  symptoms: { icon: "⚡", title: "Symptoms", color: "blue" },
  specialization: { icon: "⭐", title: "Specialization Assessment", color: "purple" },
  diagnosis: { icon: "🩺", title: "Diagnosis", color: "orange" },
  treatment: { icon: "🛡️", title: "Treatment Plan", color: "green" },
  notes: { icon: "✏️", title: "Additional Notes", color: "gray" }
};

// API Functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Component: CollapsibleSection
const CollapsibleSection = ({ sectionKey, section, isOpen, onToggle, children }: any) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{section.icon}</span>
        <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
      </div>
      {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
    </button>
    {isOpen && <div className="p-6 pt-0 border-t border-gray-100">{children}</div>}
  </div>
);

// Component: VitalsSection
const VitalsSection = ({ vitals, onChange }: any) => {
  const updateVital = (field: string, value: string) => {
    onChange({ ...vitals, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°F)</label>
        <input
          type="number"
          value={vitals.temperature || ""}
          onChange={(e) => updateVital("temperature", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="98.6"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
        <input
          type="number"
          value={vitals.heart_rate || ""}
          onChange={(e) => updateVital("heart_rate", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="72"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
        <input
          type="text"
          value={vitals.blood_pressure || ""}
          onChange={(e) => updateVital("blood_pressure", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="120/80"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate</label>
        <input
          type="number"
          value={vitals.respiratory_rate || ""}
          onChange={(e) => updateVital("respiratory_rate", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="16"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Oxygen Saturation (%)</label>
        <input
          type="number"
          value={vitals.oxygen_saturation || ""}
          onChange={(e) => updateVital("oxygen_saturation", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="98"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Weight (lbs)</label>
        <input
          type="number"
          value={vitals.weight || ""}
          onChange={(e) => updateVital("weight", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="150"
        />
      </div>
    </div>
  );
};

// Component: SymptomsSection
const SymptomsSection = ({ symptoms, onChange }: any) => {
  const addSymptom = () => {
    onChange([...symptoms, { description: "", severity: "moderate", onset: new Date().toISOString().split('T')[0] }]);
  };

  const removeSymptom = (index: number) => {
    onChange(symptoms.filter((_: any, i: number) => i !== index));
  };

  const updateSymptom = (index: number, field: string, value: string) => {
    const updated = symptoms.map((symptom: any, i: number) => 
      i === index ? { ...symptom, [field]: value } : symptom
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {symptoms.map((symptom: any, index: number) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium text-gray-800">Symptom {index + 1}</h4>
            {symptoms.length > 1 && (
              <button
                onClick={() => removeSymptom(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={symptom.description || ""}
                onChange={(e) => updateSymptom(index, "description", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Describe the symptom..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={symptom.severity || "moderate"}
                onChange={(e) => updateSymptom(index, "severity", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Onset Date</label>
            <input
              type="date"
              value={symptom.onset || ""}
              onChange={(e) => updateSymptom(index, "onset", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      ))}
      <Button onClick={addSymptom} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Symptom
      </Button>
    </div>
  );
};

// Component: DiagnosisSection
const DiagnosisSection = ({ diagnosis_info, onChange }: any) => {
  const addDiagnosis = () => {
    onChange([...diagnosis_info, { condition: "", code: "", notes: "" }]);
  };

  const removeDiagnosis = (index: number) => {
    onChange(diagnosis_info.filter((_: any, i: number) => i !== index));
  };

  const updateDiagnosis = (index: number, field: string, value: string) => {
    const updated = diagnosis_info.map((diagnosis: any, i: number) => 
      i === index ? { ...diagnosis, [field]: value } : diagnosis
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {diagnosis_info.map((diagnosis: any, index: number) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium text-gray-800">Diagnosis {index + 1}</h4>
            {diagnosis_info.length > 1 && (
              <button
                onClick={() => removeDiagnosis(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <input
                type="text"
                value={diagnosis.condition || ""}
                onChange={(e) => updateDiagnosis(index, "condition", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Primary diagnosis..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ICD Code</label>
              <input
                type="text"
                value={diagnosis.code || ""}
                onChange={(e) => updateDiagnosis(index, "code", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ICD-10 code..."
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={diagnosis.notes || ""}
              onChange={(e) => updateDiagnosis(index, "notes", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>
        </div>
      ))}
      <Button onClick={addDiagnosis} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Diagnosis
      </Button>
    </div>
  );
};

// Component: TreatmentPlanSection with Medicine Search
const TreatmentPlanSection = ({ treatment_plan, onChange }: any) => {
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState<MedicineSearchResult[]>([]);
  const [searchingMedicine, setSearchingMedicine] = useState(false);

  const searchMedicines = async (term: string) => {
    if (!term.trim()) {
      setMedicineResults([]);
      return;
    }

    setSearchingMedicine(true);
    try {
      const response = await apiCall(`/api/medicines/search?term=${encodeURIComponent(term)}&limit=10`);
      setMedicineResults(response.medicines || []);
    } catch (error) {
      console.error('Error searching medicines:', error);
      setMedicineResults([]);
    } finally {
      setSearchingMedicine(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMedicines(medicineSearch);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [medicineSearch]);

  const addMedication = (medicine?: MedicineSearchResult) => {
    const newMedication = medicine 
      ? { 
          name: medicine.name, 
          dosage: medicine.strength || "", 
          frequency: "", 
          instructions: "",
          medicine_id: medicine.id 
        }
      : { name: "", dosage: "", frequency: "", instructions: "" };

    const updated = {
      ...treatment_plan,
      medications: [...(treatment_plan.medications || []), newMedication]
    };
    onChange(updated);
    setMedicineSearch("");
    setMedicineResults([]);
  };

  const removeMedication = (index: number) => {
    const updated = {
      ...treatment_plan,
      medications: treatment_plan.medications.filter((_: any, i: number) => i !== index)
    };
    onChange(updated);
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = {
      ...treatment_plan,
      medications: treatment_plan.medications.map((med: any, i: number) => 
        i === index ? { ...med, [field]: value } : med
      )
    };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-800 mb-3">Medications</h4>
        
        {/* Medicine Search */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search & Add Medicine</label>
          <input
            type="text"
            value={medicineSearch}
            onChange={(e) => setMedicineSearch(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search for medicines..."
          />
          {searchingMedicine && (
            <div className="absolute right-2 top-9 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
          
          {/* Search Results */}
          {medicineResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {medicineResults.map((medicine) => (
                <button
                  key={medicine.id}
                  onClick={() => addMedication(medicine)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="font-medium text-gray-800">{medicine.name}</div>
                  <div className="text-sm text-gray-600">
                    {medicine.company} • {medicine.unit}
                    {medicine.strength && ` • ${medicine.strength}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {(treatment_plan.medications || []).map((medication: any, index: number) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-700">Medication {index + 1}</span>
                <button
                  onClick={() => removeMedication(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={medication.name || ""}
                  onChange={(e) => updateMedication(index, "name", e.target.value)}
                  className="p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Medication name"
                />
                <input
                  type="text"
                  value={medication.dosage || ""}
                  onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                  className="p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dosage"
                />
                <input
                  type="text"
                  value={medication.frequency || ""}
                  onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                  className="p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Frequency"
                />
                <input
                  type="text"
                  value={medication.instructions || ""}
                  onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                  className="p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Instructions"
                />
              </div>
            </div>
          ))}
          <Button onClick={() => addMedication()} variant="outline" size="sm">
            <Plus className="h-3 w-3 mr-2" />
            Add Medication Manually
          </Button>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-800 mb-3">Follow-up</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
            <input
              type="date"
              value={treatment_plan.follow_up?.date || ""}
              onChange={(e) => onChange({
                ...treatment_plan,
                follow_up: { ...treatment_plan.follow_up, date: e.target.value }
              })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input
              type="text"
              value={treatment_plan.follow_up?.duration || ""}
              onChange={(e) => onChange({
                ...treatment_plan,
                follow_up: { ...treatment_plan.follow_up, duration: e.target.value }
              })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2 weeks"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Component: NotesSection
const NotesSection = ({ notes, onChange }: any) => (
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

// Component: SpecializationWrapper
const SpecializationWrapper = ({ doctorData, form, updateSpecialization }: any) => {
  if (!doctorData?.specialization?.primary) return null;

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h4 className="font-medium text-purple-800 mb-2">
        {doctorData.specialization.primary} Assessment
      </h4>
      <textarea
        value={form.specialization?.data?.notes || ""}
        onChange={(e) => updateSpecialization(
          doctorData.specialization.primary.toLowerCase(),
          { notes: e.target.value }
        )}
        className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        rows={3}
        placeholder={`Specialized ${doctorData.specialization.primary.toLowerCase()} assessment notes...`}
      />
    </div>
  );
};

// Component: PrescriptionHeader
const PrescriptionHeader = ({ appointmentData, doctorData, form }: any) => (
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

// Component: ActionButtons
const ActionButtons = ({ submitting, onBack, onSave, prescriptionData }: any) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="flex space-x-3">
        {/* Use the PrescriptionPDF component */}
        <PrescriptionPDF 
          data={prescriptionData} 
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </PrescriptionPDF>
        
        <Button onClick={onSave} disabled={submitting}>
          <Save className="h-4 w-4 mr-2" />
          {submitting ? "Saving..." : "Save Diagnosis"}
        </Button>
      </div>
    </div>
  </div>
);

// Component: SidebarPanel
const SidebarPanel = ({ patientData, loading }: any) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
      <User className="h-5 w-5 mr-2" />
      Patient Information
    </h3>
    {loading ? (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ) : (
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-gray-500">Patient ID:</span>
          <p className="font-medium">{patientData?.id || "N/A"}</p>
        </div>
        <div>
          <span className="text-gray-500">Name:</span>
          <p className="font-medium">{patientData?.name || "N/A"}</p>
        </div>
        <div>
          <span className="text-gray-500">Age:</span>
          <p className="font-medium">{patientData?.age || "N/A"} years</p>
        </div>
        <div>
          <span className="text-gray-500">Gender:</span>
          <p className="font-medium">{patientData?.gender || "N/A"}</p>
        </div>
        <div>
          <span className="text-gray-500">Phone:</span>
          <p className="font-medium">{patientData?.phone || "N/A"}</p>
        </div>
      </div>
    )}
  </div>
);

// Component: MedicalHistory
const MedicalHistory = ({ patientId, medicalHistory, loading }: any) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
      <Calendar className="h-5 w-5 mr-2" />
      Medical History
    </h3>
    {loading ? (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    ) : (
      <div className="space-y-3 text-sm">
        {medicalHistory && medicalHistory.length > 0 ? (
          medicalHistory.slice(0, 5).map((item: MedicalHistoryItem) => (
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
    )}
  </div>
);

// Main Component
export default function DiagnosisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  
 const [state, setState] = useState({
    loading: true,
    appointmentData: null,
    doctorData: null,
    patientData: null,
    medicalHistory: [],
    error: null,
    submitting: false
  });

  const [form, setForm] = useState<DiagnosisFormData>(DEFAULT_FORM);
  const [openSections, setOpenSections] = useState({
    vitals: true,
    symptoms: true,
    specialization: false,
    diagnosis: true,
    treatment: true,
    notes: false
  });

  const prescriptionData: PrescriptionData = createPrescriptionData(
    appointmentId || '',
    state.appointmentData,
    state.doctorData,
    state.patientData,
    form
  );

useEffect(() => {
  const loadData = async () => {
    if (!appointmentId) {
      setState(prev => ({ ...prev, error: "No appointment ID provided", loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load appointment and doctor data first
      const [appointmentRes, doctorRes] = await Promise.all([
        apiCall(`/api/appointments/${appointmentId}`),
        apiCall(`/api/user/profile`)
      ]);

      console.log('Appointment Response:', appointmentRes); // Debug log
      console.log('Doctor Response:', doctorRes); // Debug log

      // Check if appointment data exists and has the expected structure
      if (!appointmentRes) {
        throw new Error("Appointment data not found");
      }

      // Handle different possible response structures
      const appointmentData = appointmentRes.appointment || appointmentRes;
      const doctorData = doctorRes.user || doctorRes;

      if (!appointmentData.patient_id) {
        throw new Error("Patient ID not found in appointment data");
      }

      // Handle different possible doctor ID field names
      const doctorId = doctorData.id || doctorData.user_id || doctorData.UserID || doctorData.doctor_id;
      const orgId = doctorData.org_id || doctorData.hospital_id || doctorData.HospitalID;
      
      if (!doctorId) {
        console.error('Doctor data structure:', doctorData);
        throw new Error("Doctor ID not found in profile data. Available fields: " + Object.keys(doctorData).join(', '));
      }

      // Normalize the doctor data structure
      const normalizedDoctorData = {
        ...doctorData,
        id: doctorId,
        org_id: orgId,
        name: doctorData.name || doctorData.Name,
        specialization: doctorData.specialization || doctorData.Specialization
      };

      // Load patient data and medical history
      const [patientRes, historyRes] = await Promise.all([
        apiCall(`/api/patients/${appointmentData.patient_id}`).catch(err => {
          console.warn('Failed to load patient data:', err);
          return { patient: null };
        }),
        apiCall(`/api/patients/medical-history/${appointmentData.patient_id}`).catch(err => {
          console.warn('Failed to load medical history:', err);
          return { history: [] };
        })
      ]);

      // Initialize form with appointment data
      const initialForm = {
        ...DEFAULT_FORM,
        appointment_id: appointmentId,
        patient_id: appointmentData.patient_id,
        doctor_id: doctorId,
        org_id: orgId || ""
      };

      setState(prev => ({
        ...prev,
        appointmentData: appointmentData,
        doctorData: normalizedDoctorData,
        patientData: patientRes?.patient || null,
        medicalHistory: historyRes?.history || [],
        loading: false
      }));

      setForm(initialForm);

    } catch (error) {
      console.error('Error loading data:', error);
      setState(prev => ({
        ...prev,
        error: error.message || "Failed to load appointment data",
        loading: false
      }));
    }
  };

  loadData();
}, [appointmentId]);

  // Section toggle handler
  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Form update handlers
  const updateVitals = (vitals: any) => {
    setForm(prev => ({ ...prev, vitals }));
  };

  const updateSymptoms = (symptoms: any[]) => {
    setForm(prev => ({ ...prev, symptoms }));
  };

  const updateDiagnosis = (diagnosis_info: any[]) => {
    setForm(prev => ({ ...prev, diagnosis_info }));
  };

  const updateTreatmentPlan = (treatment_plan: any) => {
    setForm(prev => ({ ...prev, treatment_plan }));
  };

  const updateNotes = (notes: string) => {
    setForm(prev => ({ ...prev, notes }));
  };

  const updateSpecialization = (type: string, data: any) => {
    setForm(prev => ({
      ...prev,
      specialization: { type, data }
    }));
  };

  // Save diagnosis
  const handleSave = async () => {
    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      const response = await apiCall('/api/diagnosis', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          status: 'finalized'
        })
      });

      // Show success message
      alert('Diagnosis saved successfully!');
      
      // Navigate back or to next page
      router.back();

    } catch (error: any) {
      console.error('Error saving diagnosis:', error);
      setState(prev => ({
        ...prev,
        error: error.message || "Failed to save diagnosis",
        submitting: false
      }));
    }
  };
  const handleBack = () => {
    router.back();
  };

  // Loading state
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

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto p-6">
        <PrescriptionHeader 
          appointmentData={state.appointmentData}
          doctorData={state.doctorData}
          form={form}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Error Alert */}
            {state.error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{state.error}</AlertDescription>
              </Alert>
            )}

            {/* Vitals Section */}
            <CollapsibleSection
              sectionKey="vitals"
              section={SECTIONS.vitals}
              isOpen={openSections.vitals}
              onToggle={() => toggleSection('vitals')}
            >
              <VitalsSection vitals={form.vitals} onChange={updateVitals} />
            </CollapsibleSection>

            {/* Symptoms Section */}
            <CollapsibleSection
              sectionKey="symptoms"
              section={SECTIONS.symptoms}
              isOpen={openSections.symptoms}
              onToggle={() => toggleSection('symptoms')}
            >
              <SymptomsSection symptoms={form.symptoms} onChange={updateSymptoms} />
            </CollapsibleSection>

            {/* Specialization Section */}
            {state.doctorData?.specialization?.primary && (
              <CollapsibleSection
                sectionKey="specialization"
                section={SECTIONS.specialization}
                isOpen={openSections.specialization}
                onToggle={() => toggleSection('specialization')}
              >
                <SpecializationWrapper
                  doctorData={state.doctorData}
                  form={form}
                  updateSpecialization={updateSpecialization}
                />
              </CollapsibleSection>
            )}

            {/* Diagnosis Section */}
            <CollapsibleSection
              sectionKey="diagnosis"
              section={SECTIONS.diagnosis}
              isOpen={openSections.diagnosis}
              onToggle={() => toggleSection('diagnosis')}
            >
              <DiagnosisSection diagnosis_info={form.diagnosis_info} onChange={updateDiagnosis} />
            </CollapsibleSection>

            {/* Treatment Plan Section */}
            <CollapsibleSection
              sectionKey="treatment"
              section={SECTIONS.treatment}
              isOpen={openSections.treatment}
              onToggle={() => toggleSection('treatment')}
            >
              <TreatmentPlanSection treatment_plan={form.treatment_plan} onChange={updateTreatmentPlan} />
            </CollapsibleSection>

            {/* Notes Section */}
            <CollapsibleSection
              sectionKey="notes"
              section={SECTIONS.notes}
              isOpen={openSections.notes}
              onToggle={() => toggleSection('notes')}
            >
              <NotesSection notes={form.notes} onChange={updateNotes} />
            </CollapsibleSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SidebarPanel patientData={state.patientData} loading={false} />
            <MedicalHistory
              patientId={state.patientData?.id}
              medicalHistory={state.medicalHistory}
              loading={false}
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