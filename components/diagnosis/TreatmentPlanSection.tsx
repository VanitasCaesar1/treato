import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

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
  procedures?: string[];
  lifestyle_changes?: string[];
  referrals?: string[];
}

interface TreatmentPlanProps {
  treatment_plan: TreatmentPlan;
  onChange: (plan: TreatmentPlan) => void;
}

// Dropdown options
const OPTIONS = {
  dosage: ['1-0-0-0', '0-1-0-0', '0-0-1-0', '0-0-0-1', '1-1-0-0', '1-0-1-0', '1-0-0-1', '0-1-1-0', '0-1-0-1', '0-0-1-1', '1-1-1-0', '1-1-0-1', '1-0-1-1', '0-1-1-1', '1-1-1-1', '2-0-0-0', '0-2-0-0', '0-0-2-0', '0-0-0-2', '2-2-0-0', '2-0-2-0', '2-0-0-2', '0-2-2-0', '0-2-0-2', '0-0-2-2', '2-2-2-0', '2-2-0-2', '2-0-2-2', '0-2-2-2', '2-2-2-2', '1/2-0-0-0', '0-1/2-0-0', '0-0-1/2-0', '0-0-0-1/2', '1/2-1/2-0-0', '1/2-0-1/2-0', '1/2-0-0-1/2', '1/2-1/2-1/2-0', '1/2-1/2-0-1/2', '1/2-0-1/2-1/2', '0-1/2-1/2-1/2', '1/2-1/2-1/2-1/2'],
  frequency: ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'Before meals', 'After meals', 'With meals', 'Before breakfast', 'After breakfast', 'Before lunch', 'After lunch', 'Before dinner', 'After dinner', 'At bedtime', 'Upon waking', 'As needed', 'As directed', 'Weekly', 'Twice weekly', 'Every other day'],
  instructions: ['Take with food', 'Take on empty stomach', 'Take with plenty of water', 'Do not crush or chew', 'Swallow whole', 'Dissolve in water', 'Take before meals', 'Take after meals', 'Take at bedtime', 'Take in the morning', 'Avoid alcohol', 'Avoid dairy products', 'Do not take with antacids', 'Complete the full course', 'Take as needed for pain', 'Take as needed for fever', 'Apply topically', 'Use as directed', 'Store in refrigerator', 'Shake well before use']
};

// iOS-style Smart Dropdown with fixed onChange signature
interface SmartDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
}

const SmartDropdown: React.FC<SmartDropdownProps> = ({ value, onChange, options, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFiltered(options.filter(opt => opt.toLowerCase().includes(value.toLowerCase())));
  }, [value, options]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          placeholder={placeholder}
        />
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto z-50">
          {filtered.map((option, idx) => (
            <button
              key={idx}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Medicine Search Component with fixed types
interface MedicineSearchProps {
  onSelect: (medicine: MedicineSearchResult | null) => void;
  className?: string;
}

const MedicineSearch: React.FC<MedicineSearchProps> = ({ onSelect, className = '' }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<MedicineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMedicines = async (term: string) => {
    if (!term.trim()) { setResults([]); return; }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/medicines/search?term=${encodeURIComponent(term)}&limit=10`);
      const data = await response.json();
      setResults(data.medicines || []);
    } catch (error) {
      console.error('Medicine search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => searchMedicines(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          placeholder="Search medicines..."
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
          {results.map((medicine) => (
            <button
              key={medicine.id}
              onClick={() => { onSelect(medicine); setSearch(''); setResults([]); }}
              className="w-full p-4 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="font-medium text-gray-900">{medicine.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                {medicine.company} • {medicine.unit}
                {medicine.strength && ` • ${medicine.strength}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TreatmentPlan: React.FC<TreatmentPlanProps> = ({ treatment_plan, onChange }) => {
  const currentPlan = React.useMemo(() => ({
    medications: Array.isArray(treatment_plan?.medications) ? treatment_plan.medications : [],
    procedures: treatment_plan?.procedures || [],
    lifestyle_changes: treatment_plan?.lifestyle_changes || [],
    referrals: treatment_plan?.referrals || []
  }), [treatment_plan]);

  const updatePlan = useCallback((updater: (prev: TreatmentPlan) => TreatmentPlan) => {
    onChange(updater(currentPlan));
  }, [currentPlan, onChange]);

  const addMedication = (medicine: MedicineSearchResult | null) => {
    const newMed: Medication = medicine 
      ? { name: medicine.name, dosage: medicine.strength || '', frequency: '', instructions: '', medicine_id: medicine.id }
      : { name: '', dosage: '', frequency: '', instructions: '' };
    
    updatePlan(prev => ({ ...prev, medications: [...prev.medications, newMed] }));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    updatePlan(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => i === index ? { ...med, [field]: value } : med)
    }));
  };

  const removeMedication = (index: number) => {
    updatePlan(prev => ({ ...prev, medications: prev.medications.filter((_, i) => i !== index) }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Treatment Plan</h2>
        <p className="text-gray-600">Manage medications and prescriptions</p>
      </div>

      {/* Medications Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Medications</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {currentPlan.medications.length} {currentPlan.medications.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        
        {/* Add Medicine */}
        <MedicineSearch onSelect={addMedication} className="mb-6" />
        
        {/* Medications List */}
        <div className="space-y-4">
          {currentPlan.medications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No medications added yet</p>
              <button
                onClick={() => addMedication(null)}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Add First Medication
              </button>
            </div>
          ) : (
            currentPlan.medications.map((medication, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">Medicine {index + 1}</span>
                  <button
                    onClick={() => removeMedication(index)}
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SmartDropdown
                    value={medication.name || ''}
                    onChange={(value) => updateMedication(index, 'name', value)}
                    options={[]} // This would be populated by individual medicine search
                    placeholder="Medicine name"
                  />
                  <SmartDropdown
                    value={medication.dosage || ''}
                    onChange={(value) => updateMedication(index, 'dosage', value)}
                    options={OPTIONS.dosage}
                    placeholder="Dosage (M-A-E-N)"
                  />
                  <SmartDropdown
                    value={medication.frequency || ''}
                    onChange={(value) => updateMedication(index, 'frequency', value)}
                    options={OPTIONS.frequency}
                    placeholder="Frequency"
                  />
                  <SmartDropdown
                    value={medication.instructions || ''}
                    onChange={(value) => updateMedication(index, 'instructions', value)}
                    options={OPTIONS.instructions}
                    placeholder="Instructions"
                  />
                </div>
              </div>
            ))
          )}
        </div>
        
        {currentPlan.medications.length > 0 && (
          <button
            onClick={() => addMedication(null)}
            className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Medication
          </button>
        )}
      </div>
    </div>
  );
};

export default TreatmentPlan;