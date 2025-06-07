"use client";
import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ChevronDown, Search, X } from "lucide-react";

// Common symptoms database with categories
const SYMPTOMS_DATABASE = [
  // General Symptoms
  { id: 1, name: "Fever", category: "General", severity: ["mild", "moderate", "severe"] },
  { id: 2, name: "Fatigue", category: "General", severity: ["mild", "moderate", "severe"] },
  { id: 3, name: "Weakness", category: "General", severity: ["mild", "moderate", "severe"] },
  { id: 4, name: "Loss of appetite", category: "General", severity: ["mild", "moderate", "severe"] },
  { id: 5, name: "Weight loss", category: "General", severity: ["mild", "moderate", "severe"] },
  { id: 6, name: "Night sweats", category: "General", severity: ["mild", "moderate", "severe"] },
  { id: 7, name: "Chills", category: "General", severity: ["mild", "moderate", "severe"] },
  
  // Respiratory
  { id: 8, name: "Cough", category: "Respiratory", severity: ["mild", "moderate", "severe"] },
  { id: 9, name: "Shortness of breath", category: "Respiratory", severity: ["mild", "moderate", "severe"] },
  { id: 10, name: "Chest pain", category: "Respiratory", severity: ["mild", "moderate", "severe"] },
  { id: 11, name: "Wheezing", category: "Respiratory", severity: ["mild", "moderate", "severe"] },
  { id: 12, name: "Runny nose", category: "Respiratory", severity: ["mild", "moderate", "severe"] },
  { id: 13, name: "Sore throat", category: "Respiratory", severity: ["mild", "moderate", "severe"] },
  { id: 14, name: "Sneezing", category: "Respiratory", severity: ["mild", "moderate", "severe"] },
  
  // Gastrointestinal
  { id: 15, name: "Nausea", category: "Gastrointestinal", severity: ["mild", "moderate", "severe"] },
  { id: 16, name: "Vomiting", category: "Gastrointestinal", severity: ["mild", "moderate", "severe"] },
  { id: 17, name: "Diarrhea", category: "Gastrointestinal", severity: ["mild", "moderate", "severe"] },
  { id: 18, name: "Constipation", category: "Gastrointestinal", severity: ["mild", "moderate", "severe"] },
  { id: 19, name: "Abdominal pain", category: "Gastrointestinal", severity: ["mild", "moderate", "severe"] },
  { id: 20, name: "Heartburn", category: "Gastrointestinal", severity: ["mild", "moderate", "severe"] },
  { id: 21, name: "Bloating", category: "Gastrointestinal", severity: ["mild", "moderate", "severe"] },
  
  // Neurological
  { id: 22, name: "Headache", category: "Neurological", severity: ["mild", "moderate", "severe"] },
  { id: 23, name: "Dizziness", category: "Neurological", severity: ["mild", "moderate", "severe"] },
  { id: 24, name: "Confusion", category: "Neurological", severity: ["mild", "moderate", "severe"] },
  { id: 25, name: "Memory problems", category: "Neurological", severity: ["mild", "moderate", "severe"] },
  { id: 26, name: "Seizures", category: "Neurological", severity: ["mild", "moderate", "severe"] },
  { id: 27, name: "Numbness", category: "Neurological", severity: ["mild", "moderate", "severe"] },
  { id: 28, name: "Tingling", category: "Neurological", severity: ["mild", "moderate", "severe"] },
  
  // Musculoskeletal
  { id: 29, name: "Joint pain", category: "Musculoskeletal", severity: ["mild", "moderate", "severe"] },
  { id: 30, name: "Muscle pain", category: "Musculoskeletal", severity: ["mild", "moderate", "severe"] },
  { id: 31, name: "Back pain", category: "Musculoskeletal", severity: ["mild", "moderate", "severe"] },
  { id: 32, name: "Stiffness", category: "Musculoskeletal", severity: ["mild", "moderate", "severe"] },
  { id: 33, name: "Swelling", category: "Musculoskeletal", severity: ["mild", "moderate", "severe"] },
  
  // Cardiovascular
  { id: 34, name: "Palpitations", category: "Cardiovascular", severity: ["mild", "moderate", "severe"] },
  { id: 35, name: "Irregular heartbeat", category: "Cardiovascular", severity: ["mild", "moderate", "severe"] },
  { id: 36, name: "Chest tightness", category: "Cardiovascular", severity: ["mild", "moderate", "severe"] },
  
  // Dermatological
  { id: 37, name: "Rash", category: "Dermatological", severity: ["mild", "moderate", "severe"] },
  { id: 38, name: "Itching", category: "Dermatological", severity: ["mild", "moderate", "severe"] },
  { id: 39, name: "Dry skin", category: "Dermatological", severity: ["mild", "moderate", "severe"] },
  { id: 40, name: "Bruising", category: "Dermatological", severity: ["mild", "moderate", "severe"] },
  
  // Urinary
  { id: 41, name: "Frequent urination", category: "Urinary", severity: ["mild", "moderate", "severe"] },
  { id: 42, name: "Painful urination", category: "Urinary", severity: ["mild", "moderate", "severe"] },
  { id: 43, name: "Blood in urine", category: "Urinary", severity: ["mild", "moderate", "severe"] },
  
  // Eye/Vision
  { id: 44, name: "Blurred vision", category: "Eye/Vision", severity: ["mild", "moderate", "severe"] },
  { id: 45, name: "Eye pain", category: "Eye/Vision", severity: ["mild", "moderate", "severe"] },
  { id: 46, name: "Double vision", category: "Eye/Vision", severity: ["mild", "moderate", "severe"] },
  
  // Ear/Hearing
  { id: 47, name: "Ear pain", category: "Ear/Hearing", severity: ["mild", "moderate", "severe"] },
  { id: 48, name: "Hearing loss", category: "Ear/Hearing", severity: ["mild", "moderate", "severe"] },
  { id: 49, name: "Ringing in ears", category: "Ear/Hearing", severity: ["mild", "moderate", "severe"] },
  
  // Sleep
  { id: 50, name: "Insomnia", category: "Sleep", severity: ["mild", "moderate", "severe"] },
  { id: 51, name: "Excessive sleepiness", category: "Sleep", severity: ["mild", "moderate", "severe"] },
  { id: 52, name: "Sleep apnea", category: "Sleep", severity: ["mild", "moderate", "severe"] }
];

// Symptom Dropdown Component
const SymptomDropdown = ({ value, onChange, placeholder = "Search or select symptom..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSymptoms, setFilteredSymptoms] = useState(SYMPTOMS_DATABASE);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const filtered = SYMPTOMS_DATABASE.filter(symptom =>
      symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symptom.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSymptoms(filtered);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symptom) => {
    onChange(symptom.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    onChange(inputValue);
    setIsOpen(true);
  };

  const clearSelection = () => {
    onChange("");
    setSearchTerm("");
    setIsOpen(false);
  };

  // Group symptoms by category
  const groupedSymptoms = filteredSymptoms.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {});

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={value || searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="w-full p-2 pr-10 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {value && (
            <button
              onClick={clearSelection}
              className="p-1 text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {Object.keys(groupedSymptoms).length === 0 ? (
            <div className="p-3 text-sm text-gray-500">
              No symptoms found. You can still type your own.
            </div>
          ) : (
            Object.entries(groupedSymptoms).map(([category, symptoms]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                  {category}
                </div>
                {symptoms.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => handleSelect(symptom)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none"
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

// Duration options for symptoms
const DURATION_OPTIONS = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" }
];

// Helper function to generate database-compatible symptoms structure
const generateSymptomsForDatabase = (symptoms) => {
  return {
    primary_symptoms: symptoms.map(symptom => ({
      symptom_id: symptom.id,
      name: symptom.description || symptom.name,
      category: symptom.category || "General",
      severity: symptom.severity || "moderate",
      onset_date: symptom.onset,
      duration: symptom.duration ? {
        value: parseInt(symptom.duration),
        unit: symptom.duration_unit || "days"
      } : null,
      location: symptom.location || null,
      description: symptom.notes || null,
      triggers: symptom.triggers ? symptom.triggers.split(',').map(t => t.trim()).filter(Boolean) : [],
      relieving_factors: symptom.relieving_factors ? symptom.relieving_factors.split(',').map(f => f.trim()).filter(Boolean) : [],
      associated_symptoms: symptom.associated_symptoms ? symptom.associated_symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
      progression: symptom.progression || null,
      frequency: symptom.frequency || null,
      timing: symptom.timing || null,
      quality: symptom.quality || null,
      radiation: symptom.radiation || null,
      scale_rating: symptom.scale_rating || null
    })),
    symptom_timeline: symptoms.map(symptom => ({
      symptom_name: symptom.description || symptom.name,
      onset_date: symptom.onset,
      current_status: "active",
      resolution_date: null
    })),
    symptom_summary: {
      total_count: symptoms.length,
      primary_complaint: symptoms[0]?.description || symptoms[0]?.name,
      duration_range: symptoms.length > 0 ? {
        shortest: Math.min(...symptoms.filter(s => s.duration).map(s => parseInt(s.duration) || 0)),
        longest: Math.max(...symptoms.filter(s => s.duration).map(s => parseInt(s.duration) || 0)),
        unit: symptoms[0]?.duration_unit || "days"
      } : null,
      severity_distribution: {
        mild: symptoms.filter(s => s.severity === "mild").length,
        moderate: symptoms.filter(s => s.severity === "moderate").length,
        severe: symptoms.filter(s => s.severity === "severe").length
      },
      categories: [...new Set(symptoms.map(s => s.category).filter(Boolean))],
      last_updated: new Date().toISOString()
    }
  };
};

// Main Symptoms Section Component
const SymptomsSection = ({ symptoms = [], onChange, onDatabaseStructureChange = null }) => {
  
  // Update database structure whenever symptoms change
  useEffect(() => {
    if (onDatabaseStructureChange && symptoms.length > 0) {
      const dbStructure = generateSymptomsForDatabase(symptoms);
      onDatabaseStructureChange(dbStructure);
    }
  }, [symptoms, onDatabaseStructureChange]);

  const addSymptom = () => {
    const symptomFromDatabase = SYMPTOMS_DATABASE.find(s => s.name === "Fever"); // Default to fever
    const newSymptom = {
      id: Date.now(),
      name: "",
      description: "",
      category: "General",
      severity: "moderate",
      onset: new Date().toISOString().split('T')[0],
      duration: "",
      duration_unit: "days",
      location: "",
      triggers: "",
      relieving_factors: "",
      associated_symptoms: "",
      notes: "",
      // Additional fields for comprehensive symptom tracking
      progression: "", // worsening, improving, stable
      frequency: "", // constant, intermittent, periodic
      timing: "", // morning, evening, night, with meals, etc.
      quality: "", // sharp, dull, burning, cramping, etc.
      radiation: "", // where pain/symptom spreads to
      scale_rating: null // 1-10 pain/severity scale
    };
    onChange([...symptoms, newSymptom]);
  };

  const removeSymptom = (index) => {
    if (symptoms.length > 1) {
      onChange(symptoms.filter((_, i) => i !== index));
    }
  };

  const updateSymptom = (index, field, value) => {
    const updated = symptoms.map((symptom, i) => {
      if (i === index) {
        const updatedSymptom = { ...symptom, [field]: value };
        
        // Auto-populate category if symptom name matches database
        if (field === 'description' || field === 'name') {
          const dbSymptom = SYMPTOMS_DATABASE.find(s => 
            s.name.toLowerCase() === value.toLowerCase()
          );
          if (dbSymptom) {
            updatedSymptom.category = dbSymptom.category;
          }
        }
        
        return updatedSymptom;
      }
      return symptom;
    });
    onChange(updated);
  };

  // Ensure we have at least one symptom
  useEffect(() => {
    if (symptoms.length === 0) {
      addSymptom();
    }
  }, []);

  return (
    <div className="space-y-6">
      {onDatabaseStructureChange && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Database Integration</h3>
          <p className="text-xs text-blue-600">
            Symptoms are automatically structured for database storage in JSONB format. 
            This includes primary symptoms, timeline, and summary data for medical records.
          </p>
        </div>
      )}

      {symptoms.map((symptom, index) => (
        <div key={symptom.id || index} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              Symptom {index + 1}
            </h4>
            {symptoms.length > 1 && (
              <button
                onClick={() => removeSymptom(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                title="Remove symptom"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Main symptom description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Symptom *
            </label>
            <SymptomDropdown
              value={symptom.description || symptom.name || ""}
              onChange={(value) => updateSymptom(index, "description", value)}
              placeholder="Search or type symptom name..."
            />
          </div>

          {/* Severity, Duration, and Scale Rating Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="number"
                value={symptom.duration || ""}
                onChange={(e) => updateSymptom(index, "duration", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Duration"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration Unit
              </label>
              <select
                value={symptom.duration_unit || "days"}
                onChange={(e) => updateSymptom(index, "duration_unit", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {DURATION_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pain/Severity Scale (1-10)
              </label>
              <input
                type="number"
                value={symptom.scale_rating || ""}
                onChange={(e) => updateSymptom(index, "scale_rating", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1-10"
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* Onset Date, Location, and Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Onset Date
              </label>
              <input
                type="date"
                value={symptom.onset || ""}
                onChange={(e) => updateSymptom(index, "onset", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location/Body Part
              </label>
              <input
                type="text"
                value={symptom.location || ""}
                onChange={(e) => updateSymptom(index, "location", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., chest, abdomen, right arm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={symptom.category || ""}
                onChange={(e) => updateSymptom(index, "category", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                placeholder="Auto-populated"
                readOnly
              />
            </div>
          </div>

          {/* Quality, Progression, and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality/Character
              </label>
              <input
                type="text"
                value={symptom.quality || ""}
                onChange={(e) => updateSymptom(index, "quality", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="sharp, dull, burning, cramping"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progression
              </label>
              <select
                value={symptom.progression || ""}
                onChange={(e) => updateSymptom(index, "progression", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select...</option>
                <option value="worsening">Worsening</option>
                <option value="improving">Improving</option>
                <option value="stable">Stable</option>
                <option value="fluctuating">Fluctuating</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={symptom.frequency || ""}
                onChange={(e) => updateSymptom(index, "frequency", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select...</option>
                <option value="constant">Constant</option>
                <option value="intermittent">Intermittent</option>
                <option value="periodic">Periodic</option>
                <option value="episodic">Episodic</option>
              </select>
            </div>
          </div>

          {/* Timing and Radiation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timing/Pattern
              </label>
              <input
                type="text"
                value={symptom.timing || ""}
                onChange={(e) => updateSymptom(index, "timing", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="morning, evening, with meals, after activity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radiation/Spread
              </label>
              <input
                type="text"
                value={symptom.radiation || ""}
                onChange={(e) => updateSymptom(index, "radiation", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="where symptom spreads or radiates to"
              />
            </div>
          </div>

          {/* Triggers and Relieving Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Triggers/Aggravating Factors
              </label>
              <textarea
                value={symptom.triggers || ""}
                onChange={(e) => updateSymptom(index, "triggers", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="What makes it worse? (separate with commas)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relieving Factors
              </label>
              <textarea
                value={symptom.relieving_factors || ""}
                onChange={(e) => updateSymptom(index, "relieving_factors", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="What makes it better? (separate with commas)"
              />
            </div>
          </div>

          {/* Associated Symptoms */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Associated Symptoms
            </label>
            <textarea
              value={symptom.associated_symptoms || ""}
              onChange={(e) => updateSymptom(index, "associated_symptoms", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Other symptoms occurring with this one (separate with commas)..."
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={symptom.notes || ""}
              onChange={(e) => updateSymptom(index, "notes", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Any additional details about this symptom..."
            />
          </div>
        </div>
      ))}

      {/* Add Symptom Button */}
      <button
        onClick={addSymptom}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Add Another Symptom</span>
      </button>

      {/* Database Structure Preview */}
      {symptoms.length > 0 && onDatabaseStructureChange && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Database JSON Structure Preview:</h4>
          <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
            {JSON.stringify(generateSymptomsForDatabase(symptoms), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SymptomsSection;