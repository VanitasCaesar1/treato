import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Check, X, Stethoscope, FileText, Search } from 'lucide-react';

// Types
interface DiagnosisItem {
  id: string;
  condition: string;
  code: string;
  notes: string;
  confidence: 'primary' | 'secondary' | 'rule-out';
  category: string;
}

interface MedicalCondition {
  id: string;
  name: string;
  icd10_codes: string[];
  category: string;
  description: string;
  common_notes: string[];
}

interface ICD10Code {
  code: string;
  description: string;
  category: string;
  notes: string[];
}

interface DiagnosisSectionProps {
  diagnosis_info?: DiagnosisItem[];
  onChange?: (diagnosis_info: DiagnosisItem[]) => void;
}

// Helper function to generate unique IDs
const generateUniqueId = () => `diagnosis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper function moved to top
const getConfidenceBadgeStyle = (confidence: string) => {
  switch (confidence) {
    case 'primary': return 'bg-green-100 text-green-800 border-green-200';
    case 'secondary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rule-out': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to safely format confidence text
const formatConfidence = (confidence: string | undefined) => {
  if (!confidence) return 'Primary';
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
};

// Medical Data
const MEDICAL_CONDITIONS: MedicalCondition[] = [
  {
    id: '1',
    name: 'Hypertension',
    icd10_codes: ['I10', 'I11.0', 'I11.9'],
    category: 'Cardiovascular',
    description: 'High blood pressure',
    common_notes: [
      'Monitor blood pressure daily',
      'Lifestyle modifications recommended',
      'Follow-up in 4-6 weeks'
    ]
  },
  {
    id: '2',
    name: 'Type 2 Diabetes Mellitus',
    icd10_codes: ['E11.9', 'E11.0', 'E11.65'],
    category: 'Endocrine',
    description: 'Non-insulin-dependent diabetes',
    common_notes: [
      'Blood glucose monitoring education',
      'Dietary counseling recommended',
      'HbA1c follow-up in 3 months'
    ]
  },
  {
    id: '3',
    name: 'Upper Respiratory Tract Infection',
    icd10_codes: ['J06.9', 'J00', 'J06.0'],
    category: 'Respiratory',
    description: 'Common cold or upper respiratory infection',
    common_notes: [
      'Symptomatic treatment recommended',
      'Adequate rest and hydration',
      'Return if symptoms worsen'
    ]
  },
  {
    id: '4',
    name: 'Migraine',
    icd10_codes: ['G43.9', 'G43.0', 'G43.1'],
    category: 'Neurological',
    description: 'Recurrent headache disorder',
    common_notes: [
      'Trigger identification recommended',
      'Stress management techniques',
      'Maintain headache diary'
    ]
  },
  {
    id: '5',
    name: 'Gastroesophageal Reflux Disease',
    icd10_codes: ['K21.9', 'K21.0'],
    category: 'Gastrointestinal',
    description: 'GERD - acid reflux disease',
    common_notes: [
      'Dietary modifications recommended',
      'Avoid trigger foods and late meals',
      'Consider PPI therapy'
    ]
  },
  {
    id: '6',
    name: 'Acute Bronchitis',
    icd10_codes: ['J20.9', 'J20.0'],
    category: 'Respiratory',
    description: 'Inflammation of bronchial tubes',
    common_notes: [
      'Rest and increased fluid intake',
      'Cough suppressants if needed',
      'Follow-up if symptoms persist'
    ]
  },
  {
    id: '7',
    name: 'Anxiety Disorder',
    icd10_codes: ['F41.9', 'F41.0', 'F41.1'],
    category: 'Mental Health',
    description: 'Generalized anxiety disorder',
    common_notes: [
      'Cognitive behavioral therapy recommended',
      'Stress management techniques',
      'Consider medication if severe'
    ]
  }
];

const ICD10_CODES: ICD10Code[] = [
  { code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular', notes: ['Monitor BP regularly'] },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine', notes: ['Blood glucose monitoring'] },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory', notes: ['Symptomatic treatment'] },
  { code: 'G43.9', description: 'Migraine, unspecified', category: 'Neurological', notes: ['Trigger avoidance'] },
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis', category: 'Gastrointestinal', notes: ['Dietary modifications'] },
  { code: 'J20.9', description: 'Acute bronchitis, unspecified', category: 'Respiratory', notes: ['Rest and hydration'] },
  { code: 'F41.9', description: 'Anxiety disorder, unspecified', category: 'Mental Health', notes: ['Therapy recommended'] }
];

// Smart Input Component
const SmartInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: 'condition' | 'code';
  onSelect?: (item: any) => void;
}> = ({ value, onChange, placeholder, type, onSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getSuggestions = useCallback((input: string) => {
    if (!input.trim()) return [];
    
    const searchTerm = input.toLowerCase();
    
    if (type === 'condition') {
      return MEDICAL_CONDITIONS.filter(condition =>
        condition.name.toLowerCase().includes(searchTerm) ||
        condition.category.toLowerCase().includes(searchTerm) ||
        condition.description.toLowerCase().includes(searchTerm)
      ).slice(0, 6);
    } else {
      return ICD10_CODES.filter(code =>
        code.code.toLowerCase().includes(searchTerm) ||
        code.description.toLowerCase().includes(searchTerm) ||
        code.category.toLowerCase().includes(searchTerm)
      ).slice(0, 6);
    }
  }, [type]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const newSuggestions = getSuggestions(newValue);
    setSuggestions(newSuggestions);
    setShowDropdown(newSuggestions.length > 0);
    setSelectedIndex(-1);
  }, [onChange, getSuggestions]);

  const handleSuggestionSelect = useCallback((item: any) => {
    const newValue = type === 'condition' ? item.name : item.code;
    onChange(newValue);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSuggestions([]);
    
    if (onSelect) {
      onSelect(item);
    }
    
    // Focus back on input after selection
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [type, onChange, onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showDropdown, suggestions, selectedIndex, handleSuggestionSelect]);

  const handleFocus = useCallback(() => {
    if (value.trim()) {
      const newSuggestions = getSuggestions(value);
      setSuggestions(newSuggestions);
      setShowDropdown(newSuggestions.length > 0);
    }
  }, [value, getSuggestions]);

  const handleBlur = useCallback(() => {
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 150);
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, [onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <Search className="h-3 w-3 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full pl-7 pr-7 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder={placeholder}
          autoComplete="off"
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear input"
            onMouseDown={(e) => e.preventDefault()}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
          role="listbox"
          aria-label="Suggestions"
        >
          {suggestions.map((item, index) => (
            <div
              key={type === 'condition' ? item.id : item.code}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionSelect(item);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="font-medium text-gray-900 text-sm mb-1">
                {type === 'condition' ? item.name : `${item.code}`}
              </div>
              <div className="text-xs text-gray-600 mb-1">
                {type === 'condition' ? item.description : item.description}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
                {type === 'condition' && item.icd10_codes.length > 0 && (
                  <span className="text-xs text-gray-500 font-mono">
                    {item.icd10_codes[0]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Individual Diagnosis Component
const DiagnosisCard: React.FC<{
  diagnosis: DiagnosisItem;
  onUpdate: (id: string, field: keyof DiagnosisItem, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  index: number;
}> = React.memo(({ diagnosis, onUpdate, onRemove, canRemove, index }) => {
  const [showSuggestedNotes, setShowSuggestedNotes] = useState(false);
  
  const suggestedNotes = useMemo(() => {
    const condition = MEDICAL_CONDITIONS.find(c => 
      c.name.toLowerCase() === diagnosis.condition.toLowerCase()
    );
    const code = ICD10_CODES.find(c => c.code === diagnosis.code);
    return [...(condition?.common_notes || []), ...(code?.notes || [])];
  }, [diagnosis.condition, diagnosis.code]);

  const handleConditionSelect = useCallback((condition: MedicalCondition) => {
    onUpdate(diagnosis.id, 'condition', condition.name);
    onUpdate(diagnosis.id, 'category', condition.category);
    if (condition.icd10_codes.length > 0 && !diagnosis.code) {
      onUpdate(diagnosis.id, 'code', condition.icd10_codes[0]);
    }
  }, [diagnosis.id, diagnosis.code, onUpdate]);

  const handleCodeSelect = useCallback((code: ICD10Code) => {
    onUpdate(diagnosis.id, 'code', code.code);
    if (!diagnosis.category) {
      onUpdate(diagnosis.id, 'category', code.category);
    }
  }, [diagnosis.id, diagnosis.category, onUpdate]);

  const addSuggestedNote = useCallback((note: string) => {
    const currentNotes = diagnosis.notes;
    const newNotes = currentNotes 
      ? `${currentNotes}\n• ${note}` 
      : `• ${note}`;
    onUpdate(diagnosis.id, 'notes', newNotes);
  }, [diagnosis.id, diagnosis.notes, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(diagnosis.id);
  }, [diagnosis.id, onRemove]);

  const handleConfidenceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(diagnosis.id, 'confidence', e.target.value);
  }, [diagnosis.id, onUpdate]);

  const handleConditionChange = useCallback((value: string) => {
    onUpdate(diagnosis.id, 'condition', value);
  }, [diagnosis.id, onUpdate]);

  const handleCodeChange = useCallback((value: string) => {
    onUpdate(diagnosis.id, 'code', value);
  }, [diagnosis.id, onUpdate]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(diagnosis.id, 'notes', e.target.value);
  }, [diagnosis.id, onUpdate]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{index + 1}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Diagnosis {index + 1}</h3>
            <div className="flex items-center space-x-1 mt-1">
              <select
                value={diagnosis.confidence || 'primary'}
                onChange={handleConfidenceChange}
                className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${getConfidenceBadgeStyle(diagnosis.confidence || 'primary')}`}
                aria-label="Diagnosis confidence level"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="rule-out">Rule Out</option>
              </select>
              {diagnosis.category && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                  {diagnosis.category}
                </span>
              )}
            </div>
          </div>
        </div>
        {canRemove && (
          <button
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-md transition-colors"
            aria-label="Remove diagnosis"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">
            Medical Condition *
          </label>
          <SmartInput
            value={diagnosis.condition}
            onChange={handleConditionChange}
            placeholder="Search medical conditions..."
            type="condition"
            onSelect={handleConditionSelect}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">
            ICD-10 Code *
          </label>
          <SmartInput
            value={diagnosis.code}
            onChange={handleCodeChange}
            placeholder="Search ICD-10 codes..."
            type="code"
            onSelect={handleCodeSelect}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-700">
            Clinical Notes
          </label>
          {suggestedNotes.length > 0 && (
            <button
              onClick={() => setShowSuggestedNotes(!showSuggestedNotes)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
              aria-label={showSuggestedNotes ? "Hide suggested notes" : "Show suggested notes"}
            >
              <span>Suggested Notes</span>
              {showSuggestedNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>
        
        <textarea
          value={diagnosis.notes}
          onChange={handleNotesChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
          rows={3}
          placeholder="Enter clinical notes, treatment recommendations, follow-up instructions..."
          aria-label="Clinical notes"
        />

        {showSuggestedNotes && suggestedNotes.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200">
            <h4 className="text-xs font-medium text-blue-800 mb-2">Suggested Clinical Notes:</h4>
            <div className="space-y-1">
              {suggestedNotes.map((note, idx) => (
                <button
                  key={`note-${idx}-${note.slice(0, 20)}`}
                  onClick={() => addSuggestedNote(note)}
                  className="flex items-start text-left text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded w-full transition-colors border border-transparent hover:border-blue-200"
                  aria-label={`Add suggested note: ${note}`}
                >
                  <Check className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{note}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

DiagnosisCard.displayName = 'DiagnosisCard';

// Main Component
const DiagnosisSection: React.FC<DiagnosisSectionProps> = ({ diagnosis_info = [], onChange }) => {
  // Initialize with provided data or default empty diagnosis
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>(() => {
    if (diagnosis_info.length > 0) {
      // Ensure all items have unique IDs
      return diagnosis_info.map(item => ({
        ...item,
        id: item.id || generateUniqueId()
      }));
    }
    return [{
      id: generateUniqueId(),
      condition: '',
      code: '',
      notes: '',
      confidence: 'primary' as const,
      category: ''
    }];
  });

  // Debounced change notification
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const notifyParent = useCallback((newDiagnoses: DiagnosisItem[]) => {
    if (onChange) {
      // Clear previous timeout
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      
      // Set new timeout to batch changes
      changeTimeoutRef.current = setTimeout(() => {
        onChange(newDiagnoses);
      }, 100);
    }
  }, [onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  const addDiagnosis = useCallback(() => {
    const newDiagnosis: DiagnosisItem = {
      id: generateUniqueId(),
      condition: '',
      code: '',
      notes: '',
      confidence: 'primary',
      category: ''
    };
    setDiagnoses(prev => {
      const newDiagnoses = [...prev, newDiagnosis];
      notifyParent(newDiagnoses);
      return newDiagnoses;
    });
  }, [notifyParent]);

  const removeDiagnosis = useCallback((id: string) => {
    setDiagnoses(prev => {
      const newDiagnoses = prev.filter(d => d.id !== id);
      notifyParent(newDiagnoses);
      return newDiagnoses;
    });
  }, [notifyParent]);

  const updateDiagnosis = useCallback((id: string, field: keyof DiagnosisItem, value: string) => {
    setDiagnoses(prev => {
      const newDiagnoses = prev.map(diagnosis =>
        diagnosis.id === id ? { ...diagnosis, [field]: value } : diagnosis
      );
      notifyParent(newDiagnoses);
      return newDiagnoses;
    });
  }, [notifyParent]);

  const stats = useMemo(() => {
    const completedDiagnoses = diagnoses.filter(d => d.condition && d.code);
    const primaryCount = completedDiagnoses.filter(d => d.confidence === 'primary').length;
    const uniqueCategories = new Set(completedDiagnoses.map(d => d.category).filter(Boolean)).size;
    
    return { completedDiagnoses, primaryCount, uniqueCategories };
  }, [diagnoses]);

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Medical Diagnosis</h1>
              <p className="text-sm text-gray-600">Enter patient diagnoses with ICD-10 codes and clinical notes</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">{diagnoses.length}</div>
              <div className="text-xs text-gray-500">Total Diagnoses</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Completed</p>
                <p className="text-lg font-bold text-gray-900">{stats.completedDiagnoses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Primary</p>
                <p className="text-lg font-bold text-gray-900">{stats.primaryCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Stethoscope className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Categories</p>
                <p className="text-lg font-bold text-gray-900">{stats.uniqueCategories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis Cards */}
        <div className="space-y-4">
          {diagnoses.map((diagnosis, index) => (
            <DiagnosisCard
              key={diagnosis.id}
              diagnosis={diagnosis}
              onUpdate={updateDiagnosis}
              onRemove={removeDiagnosis}
              canRemove={diagnoses.length > 1}
              index={index}
            />
          ))}
        </div>

        {/* Add Button */}
        <div className="flex justify-center">
          <button
            onClick={addDiagnosis}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            aria-label="Add new diagnosis"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Diagnosis
          </button>
        </div>
        
        {/* Summary */}
        {stats.completedDiagnoses.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Diagnosis Summary</h2>
            <div className="space-y-3">
              {stats.completedDiagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="flex items-start justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">{diagnosis.condition}</span>
                      <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                        {diagnosis.code}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getConfidenceBadgeStyle(diagnosis.confidence || 'primary')}`}>
                        {formatConfidence(diagnosis.confidence)}
                      </span>
                    </div>
                    {diagnosis.notes && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {diagnosis.notes}
                      </p>
                    )}
                  </div>
                  {diagnosis.category && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full ml-4 font-medium">
                      {diagnosis.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisSection;