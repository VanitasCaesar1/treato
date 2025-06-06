// components/diagnosis/SymptomsSection.js
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Search, ChevronDown } from "lucide-react";

// Comprehensive list of common medical symptoms
const COMMON_SYMPTOMS = [
  // General symptoms
  "Fever", "Chills", "Fatigue", "Weakness", "Weight loss", "Weight gain", "Loss of appetite", "Night sweats",
  
  // Pain symptoms
  "Headache", "Back pain", "Chest pain", "Abdominal pain", "Muscle pain", "Joint pain", "Neck pain", 
  "Sharp pain", "Dull ache", "Burning pain", "Cramping", "Stiffness",
  
  // Respiratory symptoms
  "Cough", "Shortness of breath", "Wheezing", "Chest tightness", "Sore throat", "Runny nose", 
  "Stuffy nose", "Sneezing", "Difficulty breathing", "Rapid breathing",
  
  // Digestive symptoms
  "Nausea", "Vomiting", "Diarrhea", "Constipation", "Bloating", "Gas", "Heartburn", "Indigestion",
  "Stomach cramps", "Loss of appetite", "Difficulty swallowing",
  
  // Neurological symptoms
  "Dizziness", "Lightheadedness", "Confusion", "Memory problems", "Numbness", "Tingling",
  "Seizures", "Tremors", "Balance problems", "Coordination problems",
  
  // Skin symptoms
  "Rash", "Itching", "Redness", "Swelling", "Bruising", "Dry skin", "Skin discoloration",
  "Bumps", "Blisters", "Hives",
  
  // Sleep symptoms
  "Insomnia", "Excessive sleepiness", "Sleep disturbances", "Snoring", "Restless sleep",
  
  // Mental health symptoms
  "Anxiety", "Depression", "Mood changes", "Irritability", "Restlessness", "Panic attacks",
  
  // Eye symptoms
  "Blurred vision", "Double vision", "Eye pain", "Red eyes", "Dry eyes", "Light sensitivity",
  "Vision loss", "Eye discharge",
  
  // Ear symptoms
  "Ear pain", "Hearing loss", "Ringing in ears", "Ear discharge", "Dizziness from ear problems",
  
  // Urinary symptoms
  "Frequent urination", "Painful urination", "Blood in urine", "Difficulty urinating",
  "Urgent need to urinate", "Incontinence",
  
  // Cardiovascular symptoms
  "Heart palpitations", "Irregular heartbeat", "Rapid heartbeat", "Slow heartbeat",
  "High blood pressure symptoms", "Low blood pressure symptoms",
  
  // Women's health symptoms
  "Irregular periods", "Heavy periods", "Painful periods", "Hot flashes", "Breast pain",
  
  // Miscellaneous
  "Swollen lymph nodes", "Easy bleeding", "Easy bruising", "Hair loss", "Nail changes",
  "Cold intolerance", "Heat intolerance", "Excessive thirst", "Excessive hunger"
];

const SymptomsSection = ({ symptoms = [], onChange }) => {
  const [searchTerms, setSearchTerms] = useState({});
  const [showDropdowns, setShowDropdowns] = useState({});
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(index => {
        if (dropdownRefs.current[index] && !dropdownRefs.current[index].contains(event.target)) {
          setShowDropdowns(prev => ({ ...prev, [index]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSymptom = () => {
    const newSymptoms = [...symptoms, {
      description: "",
      severity: "moderate",
      onset: new Date().toISOString().split('T')[0],
      duration: "",
      notes: ""
    }];
    onChange(newSymptoms);
  };

  const removeSymptom = (index) => {
    const newSymptoms = symptoms.filter((_, i) => i !== index);
    // Clean up state for removed symptom
    const newSearchTerms = { ...searchTerms };
    const newShowDropdowns = { ...showDropdowns };
    delete newSearchTerms[index];
    delete newShowDropdowns[index];
    
    // Reindex remaining items
    const reindexedSearchTerms = {};
    const reindexedShowDropdowns = {};
    Object.keys(newSearchTerms).forEach(key => {
      const numKey = parseInt(key);
      if (numKey < index) {
        reindexedSearchTerms[key] = newSearchTerms[key];
        reindexedShowDropdowns[key] = newShowDropdowns[key];
      } else if (numKey > index) {
        reindexedSearchTerms[numKey - 1] = newSearchTerms[key];
        reindexedShowDropdowns[numKey - 1] = newShowDropdowns[key];
      }
    });
    
    setSearchTerms(reindexedSearchTerms);
    setShowDropdowns(reindexedShowDropdowns);
    onChange(newSymptoms);
  };

  const updateSymptom = (index, field, value) => {
    const newSymptoms = symptoms.map((symptom, i) =>
      i === index ? { ...symptom, [field]: value } : symptom
    );
    onChange(newSymptoms);
  };

  const handleSearchChange = (index, value) => {
    setSearchTerms(prev => ({ ...prev, [index]: value }));
    updateSymptom(index, "description", value);
    setShowDropdowns(prev => ({ ...prev, [index]: value.length > 0 }));
  };

  const selectSymptom = (index, symptom) => {
    updateSymptom(index, "description", symptom);
    setSearchTerms(prev => ({ ...prev, [index]: symptom }));
    setShowDropdowns(prev => ({ ...prev, [index]: false }));
  };

  const toggleDropdown = (index) => {
    setShowDropdowns(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getFilteredSymptoms = (index) => {
    const searchTerm = searchTerms[index] || '';
    if (!searchTerm) return COMMON_SYMPTOMS;
    
    return COMMON_SYMPTOMS.filter(symptom =>
      symptom.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-4">
      {symptoms.map((symptom, index) => (
        <div key={index} className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium text-blue-800">Symptom {index + 1}</h4>
            {symptoms.length > 1 && (
              <Button
                onClick={() => removeSymptom(index)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Symptom Description */}
            <div className="relative" ref={el => dropdownRefs.current[index] = el}>
              <label className="block text-sm font-medium mb-2 text-gray-700">Description *</label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search or type symptom"
                    value={searchTerms[index] || symptom.description || ''}
                    onChange={(e) => handleSearchChange(index, e.target.value)}
                    onFocus={() => setShowDropdowns(prev => ({ ...prev, [index]: true }))}
                    className="rounded-xl border-gray-300 pl-10 pr-10"
                  />
                  <Button
                    onClick={() => toggleDropdown(index)}
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                      showDropdowns[index] ? 'rotate-180' : ''
                    }`} />
                  </Button>
                </div>
                
                {showDropdowns[index] && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {getFilteredSymptoms(index).length > 0 ? (
                      getFilteredSymptoms(index).map((symptomOption, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => selectSymptom(index, symptomOption)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none first:rounded-t-xl last:rounded-b-xl transition-colors"
                        >
                          {symptomOption}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No symptoms found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Severity */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Severity</label>
              <select
                value={symptom.severity || 'moderate'}
                onChange={(e) => updateSymptom(index, "severity", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Onset Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Onset Date</label>
              <Input
                type="date"
                value={symptom.onset || new Date().toISOString().split('T')[0]}
                onChange={(e) => updateSymptom(index, "onset", e.target.value)}
                className="rounded-xl border-gray-300"
              />
            </div>
            
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Duration</label>
              <Input
                type="text"
                placeholder="e.g., 3 days, 2 weeks"
                value={symptom.duration || ''}
                onChange={(e) => updateSymptom(index, "duration", e.target.value)}
                className="rounded-xl border-gray-300"
              />
            </div>
          </div>
          
          {/* Additional Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Additional Notes</label>
            <textarea
              placeholder="Any additional details about this symptom"
              value={symptom.notes || ''}
              onChange={(e) => updateSymptom(index, "notes", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>
        </div>
      ))}
      
      <Button
        onClick={addSymptom}
        variant="outline"
        className="w-full rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Symptom
      </Button>
    </div>
  );
};

export default SymptomsSection;