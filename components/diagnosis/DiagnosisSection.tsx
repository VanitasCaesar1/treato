"use client"
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Plus, ChevronDown, Search, Stethoscope, Heart, Brain, Eye, Bone, Activity } from "lucide-react";

interface Diagnosis {
  condition: string;
  code?: string;
  notes?: string;
}

interface DiagnosisSectionProps {
  diagnosis_info: Diagnosis[];
  onChange: (newDiagnoses: Diagnosis[]) => void;
  specialty: string;
  patientId: string;
  appointmentId: string;
}

const MEDICAL_SPECIALTIES = {
  general: { icon: Stethoscope, color: 'bg-blue-500', name: 'General Medicine' },
  cardiology: { icon: Heart, color: 'bg-red-500', name: 'Cardiology' },
  neurology: { icon: Brain, color: 'bg-purple-500', name: 'Neurology' },
  ophthalmology: { icon: Eye, color: 'bg-green-500', name: 'Ophthalmology' },
  orthopedics: { icon: Bone, color: 'bg-orange-500', name: 'Orthopedics' },
  pulmonology: { icon: Activity, color: 'bg-teal-500', name: 'Pulmonology' }
};

const DIAGNOSIS_DATABASE = {
  general: [
    { condition: "Essential Hypertension", code: "I10" },
    { condition: "Type 2 Diabetes Mellitus", code: "E11.9" },
    { condition: "Acute Upper Respiratory Infection", code: "J06.9" },
    { condition: "Gastroesophageal Reflux Disease", code: "K21.9" },
    { condition: "Migraine", code: "G43.909" },
    { condition: "Major Depressive Disorder", code: "F32.9" },
    { condition: "Anxiety Disorder", code: "F41.9" },
    { condition: "Asthma", code: "J45.9" },
    { condition: "Osteoarthritis", code: "M19.90" },
    { condition: "Acute Bronchitis", code: "J20.9" },
    { condition: "Urinary Tract Infection", code: "N39.0" },
    { condition: "Pneumonia", code: "J18.9" },
    { condition: "Influenza", code: "J11.1" },
    { condition: "Allergic Rhinitis", code: "J30.9" },
    { condition: "Hyperlipidemia", code: "E78.5" }
  ],
  cardiology: [
    { condition: "Atrial Fibrillation", code: "I48.91" },
    { condition: "Coronary Artery Disease", code: "I25.10" },
    { condition: "Heart Failure", code: "I50.9" },
    { condition: "Myocardial Infarction", code: "I21.9" },
    { condition: "Angina Pectoris", code: "I20.9" },
    { condition: "Hypertensive Heart Disease", code: "I11.9" },
    { condition: "Cardiomyopathy", code: "I42.9" },
    { condition: "Ventricular Tachycardia", code: "I47.2" },
    { condition: "Aortic Stenosis", code: "I35.0" },
    { condition: "Mitral Regurgitation", code: "I34.0" }
  ],
  neurology: [
    { condition: "Stroke", code: "I63.9" },
    { condition: "Epilepsy", code: "G40.9" },
    { condition: "Alzheimer's Disease", code: "F03.90" },
    { condition: "Parkinson's Disease", code: "G20" },
    { condition: "Multiple Sclerosis", code: "G35" },
    { condition: "Migraine", code: "G43.909" },
    { condition: "Tension Headache", code: "G44.209" },
    { condition: "Peripheral Neuropathy", code: "G62.9" }
  ],
  ophthalmology: [
    { condition: "Glaucoma", code: "H40.9" },
    { condition: "Cataract", code: "H25.9" },
    { condition: "Diabetic Retinopathy", code: "E11.319" },
    { condition: "Macular Degeneration", code: "H35.30" },
    { condition: "Conjunctivitis", code: "H10.9" },
    { condition: "Dry Eye Syndrome", code: "H04.12" }
  ],
  orthopedics: [
    { condition: "Osteoarthritis", code: "M19.90" },
    { condition: "Rheumatoid Arthritis", code: "M06.9" },
    { condition: "Fracture", code: "S72.009A" },
    { condition: "Lower Back Pain", code: "M54.5" },
    { condition: "Carpal Tunnel Syndrome", code: "G56.00" },
    { condition: "Torn Meniscus", code: "S83.209A" }
  ],
  pulmonology: [
    { condition: "Asthma", code: "J45.9" },
    { condition: "COPD", code: "J44.1" },
    { condition: "Pneumonia", code: "J18.9" },
    { condition: "Pulmonary Embolism", code: "I26.99" },
    { condition: "Sleep Apnea", code: "G47.33" },
    { condition: "Lung Cancer", code: "C78.00" }
  ]
};

// Main DiagnosisSection component - this is what should be exported and used
const DiagnosisSection: React.FC<DiagnosisSectionProps> = ({ 
  diagnosis_info = [{ condition: "", code: "", notes: "" }], 
  onChange,
  specialty = "general",
  patientId,
  appointmentId
}) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const [isExpanded, setIsExpanded] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSpecialty = MEDICAL_SPECIALTIES[specialty as keyof typeof MEDICAL_SPECIALTIES] || MEDICAL_SPECIALTIES.general;
  const SpecialtyIcon = currentSpecialty.icon;

  const getDiagnosisOptions = useCallback(() => {
    const specKey = specialty as keyof typeof DIAGNOSIS_DATABASE;
    const specialtyDiagnoses = DIAGNOSIS_DATABASE[specKey] || [];
    const generalDiagnoses = DIAGNOSIS_DATABASE.general;
    
    // Combine specialty-specific and general diagnoses, removing duplicates
    const combined = [...specialtyDiagnoses, ...generalDiagnoses];
    return combined.filter((item, index, self) => 
      index === self.findIndex(d => d.code === item.code)
    );
  }, [specialty]);

  const getFilteredDiagnoses = useCallback((index: number) => {
    const searchTerm = searchTerms[index] || diagnosis_info[index]?.condition || '';
    const options = getDiagnosisOptions();
    
    if (!searchTerm.trim()) return options.slice(0, 10);
    
    return options.filter(item =>
      item.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [searchTerms, diagnosis_info, getDiagnosisOptions]);

  const updateDiagnosis = useCallback((index: number, updates: Partial<Diagnosis>) => {
    if (!onChange) return;
    const newDiagnoses = diagnosis_info.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    );
    onChange(newDiagnoses);
  }, [diagnosis_info, onChange]);

  const addDiagnosis = useCallback(() => {
    if (!onChange) return;
    onChange([...diagnosis_info, { condition: "", code: "", notes: "" }]);
  }, [diagnosis_info, onChange]);

  const removeDiagnosis = useCallback((index: number) => {
    if (!onChange || diagnosis_info.length <= 1) return;
    const newDiagnoses = diagnosis_info.filter((_, i) => i !== index);
    const newSearchTerms = { ...searchTerms };
    delete newSearchTerms[index];
    setSearchTerms(newSearchTerms);
    setActiveDropdown(null);
    onChange(newDiagnoses);
  }, [diagnosis_info, onChange, searchTerms]);

  const handleConditionChange = useCallback((index: number, value: string) => {
    updateDiagnosis(index, { condition: value });
    setSearchTerms(prev => ({ ...prev, [index]: value }));
    if (value.trim()) {
      setActiveDropdown(index);
    }
  }, [updateDiagnosis]);

  const selectDiagnosis = useCallback((index: number, diagnosis: { condition: string; code: string }) => {
    updateDiagnosis(index, { condition: diagnosis.condition, code: diagnosis.code });
    setSearchTerms(prev => ({ ...prev, [index]: '' }));
    setActiveDropdown(null);
  }, [updateDiagnosis]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveDiagnoses = async () => {
    try {
      const payload = {
        patient_id: patientId,
        appointment_id: appointmentId,
        primary_diagnosis: diagnosis_info[0]?.condition || '',
        secondary_diagnoses: diagnosis_info.slice(1).map(d => d.condition).filter(Boolean),
        icd_codes: diagnosis_info.map(d => d.code).filter(Boolean),
        clinical_notes: diagnosis_info.map(d => d.notes).filter(Boolean).join('\n\n'),
        specialty: specialty,
        status: 'draft'
      };

      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Diagnosis saved successfully');
      }
    } catch (error) {
      console.error('Error saving diagnosis:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${currentSpecialty.color}`}>
            <SpecialtyIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Diagnosis</h3>
            <p className="text-sm text-gray-600">Clinical diagnosis and medical conditions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{currentSpecialty.name}</span>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Specialty Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <p className="text-sm text-blue-800">
                <strong>Specialization:</strong> {currentSpecialty.name} - {getDiagnosisOptions().length} diagnoses available
              </p>
            </div>
          </div>

          {/* Diagnosis Entries */}
          {diagnosis_info.map((diagnosis, index) => (
            <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Diagnosis {index + 1}</h4>
                {diagnosis_info.length > 1 && (
                  <button
                    onClick={() => removeDiagnosis(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Condition Search */}
                <div className="relative" ref={activeDropdown === index ? dropdownRef : null}>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Condition
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type to search or select from dropdown"
                      value={diagnosis.condition}
                      onChange={(e) => handleConditionChange(index, e.target.value)}
                      onFocus={() => setActiveDropdown(index)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === index ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  
                  {/* Dropdown */}
                  {activeDropdown === index && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {getFilteredDiagnoses(index).length > 0 ? (
                        getFilteredDiagnoses(index).map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            type="button"
                            onClick={() => selectDiagnosis(index, option)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{option.condition}</div>
                            <div className="text-sm text-blue-600 mt-1">{option.code}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                          <Search className="h-6 w-6 mx-auto mb-2 opacity-40" />
                          <div className="text-sm">No matching diagnoses found</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* ICD Code */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    ICD Code
                  </label>
                  <input
                    type="text"
                    placeholder="E11.9"
                    value={diagnosis.code || ""}
                    onChange={(e) => updateDiagnosis(index, { code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Notes</label>
                <textarea
                  placeholder="Additional clinical notes..."
                  value={diagnosis.notes || ""}
                  onChange={(e) => updateDiagnosis(index, { notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
          ))}
          
          {/* Add Diagnosis Button */}
          <button
            onClick={addDiagnosis}
            type="button"
            className="w-full py-4 px-6 border-2 border-dashed border-orange-300 text-orange-600 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            Add New Diagnosis
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={saveDiagnoses}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Save Diagnosis
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the types and component
export type { Diagnosis, DiagnosisSectionProps };
export default DiagnosisSection;