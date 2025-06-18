"use client";
import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ChevronDown, X } from "lucide-react";

// Type definitions
interface Symptom {
  id: number;
  name: string;
  severity: "mild" | "moderate" | "severe";
}

interface SymptomsSectionProps {
  symptoms?: Symptom[];
  onChange?: (symptoms: Symptom[]) => void;
}

// Optimized symptoms database
const SYMPTOMS_DB = [
  // General
  { id: 1, name: "Fever", cat: "General" },
  { id: 2, name: "Fatigue", cat: "General" },
  { id: 3, name: "Weakness", cat: "General" },
  { id: 4, name: "Loss of appetite", cat: "General" },
  { id: 5, name: "Weight loss", cat: "General" },
  { id: 6, name: "Night sweats", cat: "General" },
  { id: 7, name: "Chills", cat: "General" },
  // Respiratory
  { id: 8, name: "Cough", cat: "Respiratory" },
  { id: 9, name: "Shortness of breath", cat: "Respiratory" },
  { id: 10, name: "Chest pain", cat: "Respiratory" },
  { id: 11, name: "Wheezing", cat: "Respiratory" },
  { id: 12, name: "Runny nose", cat: "Respiratory" },
  { id: 13, name: "Sore throat", cat: "Respiratory" },
  { id: 14, name: "Sneezing", cat: "Respiratory" },
  // Gastrointestinal
  { id: 15, name: "Nausea", cat: "Gastrointestinal" },
  { id: 16, name: "Vomiting", cat: "Gastrointestinal" },
  { id: 17, name: "Diarrhea", cat: "Gastrointestinal" },
  { id: 18, name: "Constipation", cat: "Gastrointestinal" },
  { id: 19, name: "Abdominal pain", cat: "Gastrointestinal" },
  { id: 20, name: "Heartburn", cat: "Gastrointestinal" },
  { id: 21, name: "Bloating", cat: "Gastrointestinal" },
  // Neurological
  { id: 22, name: "Headache", cat: "Neurological" },
  { id: 23, name: "Dizziness", cat: "Neurological" },
  { id: 24, name: "Confusion", cat: "Neurological" },
  { id: 25, name: "Memory problems", cat: "Neurological" },
  { id: 26, name: "Seizures", cat: "Neurological" },
  { id: 27, name: "Numbness", cat: "Neurological" },
  { id: 28, name: "Tingling", cat: "Neurological" },
  // Musculoskeletal
  { id: 29, name: "Joint pain", cat: "Musculoskeletal" },
  { id: 30, name: "Muscle pain", cat: "Musculoskeletal" },
  { id: 31, name: "Back pain", cat: "Musculoskeletal" },
  { id: 32, name: "Stiffness", cat: "Musculoskeletal" },
  { id: 33, name: "Swelling", cat: "Musculoskeletal" },
  // Cardiovascular
  { id: 34, name: "Palpitations", cat: "Cardiovascular" },
  { id: 35, name: "Irregular heartbeat", cat: "Cardiovascular" },
  { id: 36, name: "Chest tightness", cat: "Cardiovascular" },
  // Dermatological
  { id: 37, name: "Rash", cat: "Dermatological" },
  { id: 38, name: "Itching", cat: "Dermatological" },
  { id: 39, name: "Dry skin", cat: "Dermatological" },
  { id: 40, name: "Bruising", cat: "Dermatological" },
  // Other categories
  { id: 41, name: "Frequent urination", cat: "Urinary" },
  { id: 42, name: "Painful urination", cat: "Urinary" },
  { id: 43, name: "Blood in urine", cat: "Urinary" },
  { id: 44, name: "Blurred vision", cat: "Eye/Vision" },
  { id: 45, name: "Eye pain", cat: "Eye/Vision" },
  { id: 46, name: "Double vision", cat: "Eye/Vision" },
  { id: 47, name: "Ear pain", cat: "Ear/Hearing" },
  { id: 48, name: "Hearing loss", cat: "Ear/Hearing" },
  { id: 49, name: "Ringing in ears", cat: "Ear/Hearing" },
  { id: 50, name: "Insomnia", cat: "Sleep" },
  { id: 51, name: "Excessive sleepiness", cat: "Sleep" },
  { id: 52, name: "Sleep apnea", cat: "Sleep" }
];

// iOS-style Dropdown
const SymptomDropdown = ({ value, onChange, placeholder = "Search or select symptom..." }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = SYMPTOMS_DB.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.cat.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const grouped = filtered.reduce((acc, symptom) => {
    if (!acc[symptom.cat]) acc[symptom.cat] = [];
    acc[symptom.cat].push(symptom);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={value || search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {value && (
            <button
              onClick={() => { onChange(""); setSearch(""); setIsOpen(false); }}
              className="p-1 text-gray-400 hover:text-gray-600 mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-64 overflow-y-auto">
          {Object.keys(grouped).length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No symptoms found. You can still type your own.
            </div>
          ) : (
            Object.entries(grouped).map(([category, symptoms]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                  {category}
                </div>
                {symptoms.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => {
                      onChange(symptom.name);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="w-full px-4 py-3 text-left text-gray-900 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                  >
                    {symptom.name}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Severity Badge Component
const SeverityBadge = ({ severity, onChange }: {
  severity: "mild" | "moderate" | "severe";
  onChange: (severity: "mild" | "moderate" | "severe") => void;
}) => {
  const severityOptions = [
    { value: "mild" as const, label: "Mild", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "moderate" as const, label: "Moderate", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "severe" as const, label: "Severe", color: "bg-red-100 text-red-800 border-red-200" }
  ];

  return (
    <div className="flex space-x-2">
      {severityOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
            severity === option.value 
              ? option.color 
              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

// Main Component
const SymptomsSection: React.FC<SymptomsSectionProps> = ({ 
  symptoms = [], 
  onChange = () => {} 
}) => {
  const addSymptom = () => {
    const newSymptom: Symptom = {
      id: Date.now(),
      name: "",
      severity: "moderate"
    };
    onChange([...symptoms, newSymptom]);
  };

  const removeSymptom = (index: number) => {
    if (symptoms.length > 1) {
      onChange(symptoms.filter((_, i) => i !== index));
    }
  };

  const updateSymptom = (index: number, field: keyof Symptom, value: any) => {
    const updated = symptoms.map((symptom, i) => {
      if (i === index) {
        return { ...symptom, [field]: value };
      }
      return symptom;
    });
    onChange(updated);
  };

  // Initialize with one symptom if empty
  useEffect(() => {
    if (symptoms.length === 0) {
      const initialSymptom: Symptom = {
        id: Date.now(),
        name: "",
        severity: "moderate"
      };
      onChange([initialSymptom]);
    }
  }, [symptoms.length, onChange]);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-1">Patient Symptoms</h3>
        <p className="text-sm text-blue-600">
          Record symptoms with their severity levels
        </p>
      </div>

      {symptoms.map((symptom, index) => (
        <div key={symptom.id || index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Symptom {index + 1}</h4>
            {symptoms.length > 1 && (
              <button
                onClick={() => removeSymptom(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Symptom Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptom Name
            </label>
            <SymptomDropdown
              value={symptom.name || ""}
              onChange={(value) => updateSymptom(index, "name", value)}
              placeholder="Search or type symptom name..."
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Severity Level
            </label>
            <SeverityBadge
              severity={symptom.severity}
              onChange={(value) => updateSymptom(index, "severity", value)}
            />
          </div>
        </div>
      ))}

      {/* Add Button */}
      <button
        onClick={addSymptom}
        className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 active:scale-95"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Add Another Symptom</span>
      </button>

      {/* Summary */}
      {symptoms.length > 0 && symptoms.some(s => s.name) && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
          <div className="space-y-1">
            {symptoms
              .filter(s => s.name)
              .map((symptom, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{symptom.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    symptom.severity === 'mild' ? 'bg-green-100 text-green-800' :
                    symptom.severity === 'severe' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {symptom.severity}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomsSection;