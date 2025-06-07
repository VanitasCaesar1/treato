import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicineSearchResult {
  id: string;
  name: string;
  company: string;
  unit: string;
  strength?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  medicine_id?: string;
}

interface TreatmentPlan {
  medications: Medication[];
  follow_up: {
    date: string;
    duration: string;
    notes: string;
  };
  procedures?: string[];
  lifestyle_changes?: string[];
  referrals?: string[];
}

interface TreatmentPlanProps {
  treatment_plan: TreatmentPlan;
  onChange: (plan: TreatmentPlan) => void;
}
// Dropdown options
const DOSAGE_OPTIONS = [
  '1-0-0-0', '0-1-0-0', '0-0-1-0', '0-0-0-1',
  '1-1-0-0', '1-0-1-0', '1-0-0-1', '0-1-1-0', '0-1-0-1', '0-0-1-1',
  '1-1-1-0', '1-1-0-1', '1-0-1-1', '0-1-1-1',
  '1-1-1-1',
  '2-0-0-0', '0-2-0-0', '0-0-2-0', '0-0-0-2',
  '2-2-0-0', '2-0-2-0', '2-0-0-2', '0-2-2-0', '0-2-0-2', '0-0-2-2',
  '2-2-2-0', '2-2-0-2', '2-0-2-2', '0-2-2-2',
  '2-2-2-2',
  '1/2-0-0-0', '0-1/2-0-0', '0-0-1/2-0', '0-0-0-1/2',
  '1/2-1/2-0-0', '1/2-0-1/2-0', '1/2-0-0-1/2',
  '1/2-1/2-1/2-0', '1/2-1/2-0-1/2', '1/2-0-1/2-1/2', '0-1/2-1/2-1/2',
  '1/2-1/2-1/2-1/2'
];

const FREQUENCY_OPTIONS = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
  'Before meals', 'After meals', 'With meals',
  'Before breakfast', 'After breakfast',
  'Before lunch', 'After lunch',
  'Before dinner', 'After dinner',
  'At bedtime', 'Upon waking',
  'As needed', 'As directed',
  'Weekly', 'Twice weekly', 'Every other day'
];

const INSTRUCTION_OPTIONS = [
  'Take with food',
  'Take on empty stomach',
  'Take with plenty of water',
  'Do not crush or chew',
  'Swallow whole',
  'Dissolve in water',
  'Take before meals',
  'Take after meals',
  'Take at bedtime',
  'Take in the morning',
  'Avoid alcohol',
  'Avoid dairy products',
  'Do not take with antacids',
  'Complete the full course',
  'Take as needed for pain',
  'Take as needed for fever',
  'Apply topically',
  'Use as directed',
  'Store in refrigerator',
  'Shake well before use'
];

// Enhanced Dropdown Component
const Dropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
  id?: string;
}> = ({ value, onChange, options, placeholder, className = '', id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
    setSelectedIndex(-1);
  }, [value, options]);

  useEffect(() => {
    if (selectedIndex >= 0 && optionsListRef.current) {
      const selectedElement = optionsListRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        setSelectedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
          const selectedOption = filteredOptions[selectedIndex];
          onChange(selectedOption);
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const selectOption = (option: string, index: number) => {
    onChange(option);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const [shouldOpenUpward, setShouldOpenUpward] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(200, filteredOptions.length * 40);
      
      setShouldOpenUpward(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            handleOpen();
          }}
          onFocus={handleOpen}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
          placeholder={placeholder}
          id={id}
        />
        <ChevronDown 
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform pointer-events-none ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
      
      {isOpen && filteredOptions.length > 0 && (
        <div 
          ref={optionsListRef}
          className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto ${
            shouldOpenUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          style={{ zIndex: 9999 }}
        >
          {filteredOptions.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectOption(option, index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full p-2 text-left text-sm focus:outline-none first:rounded-t-lg last:rounded-b-lg transition-colors ${
                index === selectedIndex 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// API function for medicine search
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

// Helper function to safely get medications array
const getMedicationsArray = (medications: any): Medication[] => {
  if (Array.isArray(medications)) {
    return medications;
  }
  if (medications === null || medications === undefined) {
    return [];
  }
  if (typeof medications === 'object' && medications.medications) {
    return Array.isArray(medications.medications) ? medications.medications : [];
  }
  return [];
};

// Helper function to safely get follow-up object
const getFollowUpObject = (followUp: any) => {
  if (followUp && typeof followUp === 'object') {
    return {
      date: followUp.date || '',
      duration: followUp.duration || '',
      notes: followUp.notes || ''
    };
  }
  return {
    date: '',
    duration: '',
    notes: ''
  };
};

const TreatmentPlan: React.FC<TreatmentPlanProps> = ({ treatment_plan, onChange }) => {
  // Medicine search states
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState<MedicineSearchResult[]>([]);
  const [searchingMedicine, setSearchingMedicine] = useState(false);
  
  const [individualSearches, setIndividualSearches] = useState<{[key: number]: string}>({});
  const [individualResults, setIndividualResults] = useState<{[key: number]: MedicineSearchResult[]}>({});
  const [individualSearching, setIndividualSearching] = useState<{[key: number]: boolean}>({});

  // FIXED: Direct state management without internal state duplication
  const currentPlan = React.useMemo(() => ({
    medications: getMedicationsArray(treatment_plan?.medications),
    follow_up: getFollowUpObject(treatment_plan?.follow_up),
    procedures: treatment_plan?.procedures || [],
    lifestyle_changes: treatment_plan?.lifestyle_changes || [],
    referrals: treatment_plan?.referrals || []
  }), [treatment_plan]);

  // FIXED: Direct update function that immediately calls onChange
  const updatePlan = useCallback((updater: (prev: TreatmentPlan) => TreatmentPlan) => {
    const newPlan = updater(currentPlan);
    console.log('🔄 Updating treatment plan:', newPlan);
    onChange(newPlan);
  }, [currentPlan, onChange]);

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

  const searchIndividualMedicine = async (term: string, medicationIndex: number) => {
    if (!term.trim()) {
      setIndividualResults(prev => ({ ...prev, [medicationIndex]: [] }));
      return;
    }

    setIndividualSearching(prev => ({ ...prev, [medicationIndex]: true }));
    try {
      const response = await apiCall(`/api/medicines/search?term=${encodeURIComponent(term)}&limit=10`);
      setIndividualResults(prev => ({ ...prev, [medicationIndex]: response.medicines || [] }));
    } catch (error) {
      console.error('Error searching medicines:', error);
      setIndividualResults(prev => ({ ...prev, [medicationIndex]: [] }));
    } finally {
      setIndividualSearching(prev => ({ ...prev, [medicationIndex]: false }));
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMedicines(medicineSearch);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [medicineSearch]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    Object.entries(individualSearches).forEach(([index, term]) => {
      const timer = setTimeout(() => {
        searchIndividualMedicine(term, parseInt(index));
      }, 300);
      timers.push(timer);
    });
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [individualSearches]);

  const addMedication = (medicine?: MedicineSearchResult) => {
    console.log('➕ Adding medication:', medicine);
    
    const newMedication: Medication = medicine 
      ? { 
          name: medicine.name, 
          dosage: medicine.strength || "", 
          frequency: "", 
          instructions: "",
          medicine_id: medicine.id 
        }
      : { name: "", dosage: "", frequency: "", instructions: "" };

    updatePlan(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
    
    setMedicineSearch("");
    setMedicineResults([]);
  };

  const removeMedication = (index: number) => {
    console.log('🗑️ Removing medication at index:', index);
    updatePlan(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    console.log(`✏️ Updating medication ${index}, field ${field}:`, value);
    updatePlan(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const selectMedicineForSlot = (medicine: MedicineSearchResult, medicationIndex: number) => {
    console.log('🎯 Selecting medicine for slot:', medicine, medicationIndex);
    
    updatePlan(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === medicationIndex ? { 
          ...med, 
          name: medicine.name,
          dosage: medicine.strength || med.dosage,
          medicine_id: medicine.id 
        } : med
      )
    }));
    
    setIndividualSearches(prev => {
      const newSearches = { ...prev };
      delete newSearches[medicationIndex];
      return newSearches;
    });
    setIndividualResults(prev => ({ ...prev, [medicationIndex]: [] }));
  };

  const updateIndividualSearch = (medicationIndex: number, value: string) => {
    setIndividualSearches(prev => ({ ...prev, [medicationIndex]: value }));
    updateMedication(medicationIndex, "name", value);
  };

  const updateFollowUp = (field: string, value: string) => {
    console.log(`📅 Updating follow-up ${field}:`, value);
    updatePlan(prev => ({
      ...prev,
      follow_up: {
        ...prev.follow_up,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-yellow-50 p-2 rounded text-xs text-gray-600">
        <strong>Debug:</strong> Medications count: {currentPlan.medications.length}
        <br />
        <strong>Raw data:</strong> {JSON.stringify(currentPlan.medications.slice(0, 2))}
      </div>

      {/* Medications Section */}
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
            <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 10000 }}>
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

        {/* Medications List */}
        <div className="space-y-4">
          {currentPlan.medications.length === 0 ? (
            <div className="text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
              No medications added yet. Use the search above or click "Add Medication Manually".
            </div>
          ) : (
            currentPlan.medications.map((medication, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Medication {index + 1}</span>
                  <button
                    onClick={() => removeMedication(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Medicine Name with Search */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Medicine Name</label>
                    <input
                      type="text"
                      value={individualSearches[index] !== undefined ? individualSearches[index] : (medication.name || "")}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateIndividualSearch(index, value);
                      }}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search medicine name..."
                    />
                    {individualSearching[index] && (
                      <div className="absolute right-2 top-7 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    
                    {/* Individual Search Results */}
                    {individualResults[index] && individualResults[index].length > 0 && (
                      <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 10001 }}>
                        {individualResults[index].map((medicine) => (
                          <button
                            key={medicine.id}
                            onClick={() => selectMedicineForSlot(medicine, index)}
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

                  {/* Dosage with Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Dosage <span className="text-gray-400">(Morning-Afternoon-Evening-Night)</span>
                    </label>
                    <Dropdown
                      value={medication.dosage || ""}
                      onChange={(value) => updateMedication(index, "dosage", value)}
                      options={DOSAGE_OPTIONS}
                      placeholder="e.g., 1-0-1-0"
                      id={`dosage-${index}`}
                    />
                  </div>

                  {/* Frequency with Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
                    <Dropdown
                      value={medication.frequency || ""}
                      onChange={(value) => updateMedication(index, "frequency", value)}
                      options={FREQUENCY_OPTIONS}
                      placeholder="e.g., Twice daily"
                      id={`frequency-${index}`}
                    />
                  </div>

                  {/* Instructions with Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
                    <Dropdown
                      value={medication.instructions || ""}
                      onChange={(value) => updateMedication(index, "instructions", value)}
                      options={INSTRUCTION_OPTIONS}
                      placeholder="e.g., Take with food"
                      id={`instructions-${index}`}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
          
          <Button onClick={() => addMedication()} variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Medication Manually
          </Button>
        </div>
      </div>

      {/* Follow-up Section */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">Follow-up</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
            <input
              type="date"
              value={currentPlan.follow_up.date || ""}
              onChange={(e) => updateFollowUp("date", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input
              type="text"
              value={currentPlan.follow_up.duration || ""}
              onChange={(e) => updateFollowUp("duration", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2 weeks"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Notes</label>
          <textarea
            value={currentPlan.follow_up.notes || ""}
            onChange={(e) => updateFollowUp("notes", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Additional follow-up instructions..."
          />
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlan;