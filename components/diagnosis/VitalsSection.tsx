"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Check, Info, Heart, Thermometer, Activity, Wind, Droplets, Weight } from "lucide-react";

interface VitalsProps {
  vitals: any;
  onChange: (vitals: any) => void;
}

interface VitalField {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  icon: any;
  type: 'number' | 'text' | 'select';
  min?: number;
  max?: number;
  step?: number;
  normalRange: { min: number; max: number; unit: string };
  suggestions?: string[];
  validation: (value: string) => { isValid: boolean; message?: string; level?: 'error' | 'warning' | 'info' };
  inputFilter?: (value: string) => string;
}

const VITAL_FIELDS: VitalField[] = [
  {
    key: 'temperature',
    label: 'Body Temperature',
    unit: '°C',
    placeholder: '37.0',
    icon: Thermometer,
    type: 'number',
    min: 30,
    max: 45,
    step: 0.1,
    normalRange: { min: 36.5, max: 37.5, unit: '°C' },
    inputFilter: (value: string) => {
      // Allow only numbers, one decimal point, and minus sign
      return value.replace(/[^0-9.-]/g, '').replace(/(\..*)\./g, '$1').replace(/(?!^)-/g, '');
    },
    validation: (value: string) => {
      if (!value) return { isValid: true };
      const temp = parseFloat(value);
      if (isNaN(temp)) return { isValid: false, message: 'Please enter a valid temperature' };
      if (temp < 30 || temp > 45) return { isValid: false, message: 'Temperature must be between 30-45°C' };
      if (temp < 35) return { isValid: true, message: 'Hypothermia - critically low temperature', level: 'error' };
      if (temp > 40) return { isValid: true, message: 'Hyperthermia - high fever, seek immediate care', level: 'error' };
      if (temp < 36.1) return { isValid: true, message: 'Below normal range', level: 'warning' };
      if (temp > 37.8) return { isValid: true, message: 'Fever detected', level: 'warning' };
      if (temp < 36.5 || temp > 37.5) return { isValid: true, message: 'Slightly outside normal range', level: 'info' };
      return { isValid: true, message: 'Normal temperature', level: 'info' };
    }
  },
  {
    key: 'heart_rate',
    label: 'Heart Rate',
    unit: 'bpm',
    placeholder: '72',
    icon: Heart,
    type: 'number',
    min: 30,
    max: 220,
    step: 1,
    normalRange: { min: 60, max: 100, unit: 'bpm' },
    inputFilter: (value: string) => {
      // Allow only numbers
      return value.replace(/[^0-9]/g, '');
    },
    validation: (value: string) => {
      if (!value) return { isValid: true };
      const hr = parseInt(value);
      if (isNaN(hr)) return { isValid: false, message: 'Please enter a valid heart rate' };
      if (hr < 30 || hr > 220) return { isValid: false, message: 'Heart rate must be between 30-220 bpm' };
      if (hr < 50) return { isValid: true, message: 'Bradycardia - low heart rate', level: 'warning' };
      if (hr > 120) return { isValid: true, message: 'Tachycardia - elevated heart rate', level: 'warning' };
      if (hr < 60 || hr > 100) return { isValid: true, message: 'Outside normal resting range', level: 'info' };
      return { isValid: true, message: 'Normal heart rate', level: 'info' };
    }
  },
  {
    key: 'blood_pressure',
    label: 'Blood Pressure',
    unit: 'mmHg',
    placeholder: '120/80',
    icon: Activity,
    type: 'text',
    normalRange: { min: 120, max: 80, unit: 'mmHg (systolic/diastolic)' },
    suggestions: ['120/80', '110/70', '130/85', '140/90'],
    inputFilter: (value: string) => {
      // Allow only numbers and forward slash, ensure only one slash
      let filtered = value.replace(/[^0-9/]/g, '');
      const slashCount = (filtered.match(/\//g) || []).length;
      if (slashCount > 1) {
        const firstSlashIndex = filtered.indexOf('/');
        filtered = filtered.substring(0, firstSlashIndex + 1) + filtered.substring(firstSlashIndex + 1).replace(/\//g, '');
      }
      return filtered;
    },
    validation: (value: string) => {
      if (!value) return { isValid: true };
      const bpPattern = /^\d{2,3}\/\d{2,3}$/;
      if (!bpPattern.test(value)) return { isValid: false, message: 'Format: systolic/diastolic (e.g., 120/80)' };
      
      const [systolic, diastolic] = value.split('/').map(Number);
      if (systolic < 70 || systolic > 250) return { isValid: false, message: 'Systolic must be 70-250 mmHg' };
      if (diastolic < 40 || diastolic > 150) return { isValid: false, message: 'Diastolic must be 40-150 mmHg' };
      if (systolic <= diastolic) return { isValid: false, message: 'Systolic must be higher than diastolic' };
      
      if (systolic >= 180 || diastolic >= 120) return { isValid: true, message: 'Hypertensive crisis - urgent care needed', level: 'error' };
      if (systolic >= 140 || diastolic >= 90) return { isValid: true, message: 'High blood pressure', level: 'warning' };
      if (systolic < 90 || diastolic < 60) return { isValid: true, message: 'Low blood pressure', level: 'warning' };
      if (systolic <= 120 && diastolic <= 80) return { isValid: true, message: 'Normal blood pressure', level: 'info' };
      return { isValid: true, message: 'Elevated blood pressure', level: 'info' };
    }
  },
  {
    key: 'respiratory_rate',
    label: 'Respiratory Rate',
    unit: '/min',
    placeholder: '16',
    icon: Wind,
    type: 'number',
    min: 8,
    max: 40,
    step: 1,
    normalRange: { min: 12, max: 20, unit: 'breaths/min' },
    inputFilter: (value: string) => {
      // Allow only numbers
      return value.replace(/[^0-9]/g, '');
    },
    validation: (value: string) => {
      if (!value) return { isValid: true };
      const rr = parseInt(value);
      if (isNaN(rr)) return { isValid: false, message: 'Please enter a valid respiratory rate' };
      if (rr < 8 || rr > 40) return { isValid: false, message: 'Respiratory rate must be between 8-40/min' };
      if (rr < 10) return { isValid: true, message: 'Bradypnea - slow breathing', level: 'warning' };
      if (rr > 24) return { isValid: true, message: 'Tachypnea - rapid breathing', level: 'warning' };
      if (rr < 12 || rr > 20) return { isValid: true, message: 'Outside normal range', level: 'info' };
      return { isValid: true, message: 'Normal respiratory rate', level: 'info' };
    }
  },
  {
    key: 'oxygen_saturation',
    label: 'Oxygen Saturation',
    unit: '%',
    placeholder: '98',
    icon: Droplets,
    type: 'number',
    min: 70,
    max: 100,
    step: 1,
    normalRange: { min: 95, max: 100, unit: '%' },
    inputFilter: (value: string) => {
      // Allow only numbers
      return value.replace(/[^0-9]/g, '');
    },
    validation: (value: string) => {
      if (!value) return { isValid: true };
      const spo2 = parseInt(value);
      if (isNaN(spo2)) return { isValid: false, message: 'Please enter a valid oxygen saturation' };
      if (spo2 < 70 || spo2 > 100) return { isValid: false, message: 'Oxygen saturation must be between 70-100%' };
      if (spo2 < 90) return { isValid: true, message: 'Severe hypoxemia - immediate attention needed', level: 'error' };
      if (spo2 < 95) return { isValid: true, message: 'Mild hypoxemia', level: 'warning' };
      return { isValid: true, message: 'Normal oxygen saturation', level: 'info' };
    }
  },
  {
    key: 'weight',
    label: 'Weight',
    unit: 'kg',
    placeholder: '70.0',
    icon: Weight,
    type: 'number',
    min: 20,
    max: 300,
    step: 0.1,
    normalRange: { min: 50, max: 90, unit: 'kg (varies by individual)' },
    inputFilter: (value: string) => {
      // Allow only numbers and one decimal point
      return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    },
    validation: (value: string) => {
      if (!value) return { isValid: true };
      const weight = parseFloat(value);
      if (isNaN(weight)) return { isValid: false, message: 'Please enter a valid weight' };
      if (weight < 20 || weight > 300) return { isValid: false, message: 'Weight must be between 20-300 kg' };
      if (weight < 30) return { isValid: true, message: 'Significantly underweight', level: 'warning' };
      if (weight > 150) return { isValid: true, message: 'Consider BMI assessment', level: 'info' };
      return { isValid: true, message: 'Weight recorded', level: 'info' };
    }
  }
];

const VitalInput = ({ field, value, onChange, error, showSuggestions }: {
  field: VitalField;
  value: string;
  onChange: (value: string) => void;
  error?: { isValid: boolean; message?: string; level?: 'error' | 'warning' | 'info' };
  showSuggestions?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const IconComponent = field.icon;

  const handleInputChange = (inputValue: string) => {
    // Apply input filter if available
    const filteredValue = field.inputFilter ? field.inputFilter(inputValue) : inputValue;
    onChange(filteredValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // For number inputs, prevent non-numeric characters (except allowed ones)
    if (field.type === 'number') {
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      const allowedChars = field.key === 'temperature' ? '0123456789.-' : '0123456789.';
      
      if (!allowedKeys.includes(e.key) && !allowedChars.includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const filteredText = field.inputFilter ? field.inputFilter(pastedText) : pastedText;
    onChange(filteredText);
  };

  const getStatusColor = () => {
    if (!error?.isValid) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (error?.level === 'error') return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (error?.level === 'warning') return 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500';
    if (error?.level === 'info') return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  const getStatusIcon = () => {
    if (!error?.isValid) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (error?.level === 'error') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (error?.level === 'warning') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (error?.level === 'info') return <Check className="h-4 w-4 text-green-500" />;
    return null;
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
        <IconComponent className="h-4 w-4 mr-2 text-gray-500" />
        {field.label}
        <span className="ml-1 text-gray-400">({field.unit})</span>
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onPaste={handlePaste}
          onFocus={() => {
            setFocused(true);
            if (field.suggestions && showSuggestions) setShowDropdown(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setShowDropdown(false), 200);
          }}
          className={`w-full p-3 pr-10 border rounded-lg transition-all duration-200 ${getStatusColor()}`}
          placeholder={field.placeholder}
          autoComplete="off"
          spellCheck="false"
        />
        
        {/* Status Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getStatusIcon()}
        </div>
        
        {/* Suggestions Dropdown */}
        {field.suggestions && showDropdown && showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {field.suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion} {field.unit}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Validation Message */}
      {error?.message && (
        <div className={`mt-1 text-sm flex items-center ${
          error.level === 'error' || !error.isValid ? 'text-red-600' :
          error.level === 'warning' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          <Info className="h-3 w-3 mr-1 flex-shrink-0" />
          {error.message}
        </div>
      )}
      
      {/* Normal Range Info */}
      {focused && (
        <div className="mt-1 text-xs text-gray-500 flex items-center">
          <Info className="h-3 w-3 mr-1 flex-shrink-0" />
          Normal range: {field.normalRange.min}{field.normalRange.unit.includes('systolic') ? '' : `-${field.normalRange.max}`} {field.normalRange.unit}
        </div>
      )}
    </div>
  );
};

export default function VitalsSection({ vitals, onChange }: VitalsProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, any>>({});
  const [showSuggestions, setShowSuggestions] = useState(true);

  const updateVital = (field: string, value: string) => {
    // Update the vital value
    const newVitals = { ...vitals, [field]: value };
    onChange(newVitals);

    // Validate the field
    const vitalField = VITAL_FIELDS.find(f => f.key === field);
    if (vitalField) {
      const validation = vitalField.validation(value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: validation
      }));
    }
  };

  // Validate all fields on mount
  useEffect(() => {
    const errors: Record<string, any> = {};
    VITAL_FIELDS.forEach(field => {
      const value = vitals[field.key] || '';
      errors[field.key] = field.validation(value);
    });
    setValidationErrors(errors);
  }, [vitals]);

  const getOverallStatus = () => {
    const hasErrors = Object.values(validationErrors).some((error: any) => !error.isValid);
    const hasWarnings = Object.values(validationErrors).some((error: any) => error.level === 'error' || error.level === 'warning');
    
    if (hasErrors) return { color: 'red', message: 'Please fix validation errors' };
    if (hasWarnings) return { color: 'yellow', message: 'Some values need attention' };
    return { color: 'green', message: 'All vitals look good' };
  };

  const status = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            status.color === 'red' ? 'bg-red-500' :
            status.color === 'yellow' ? 'bg-yellow-500' :
            'bg-green-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-700">{status.message}</span>
        </div>
        
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showSuggestions ? 'Hide' : 'Show'} suggestions
        </button>
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VITAL_FIELDS.map((field) => (
          <VitalInput
            key={field.key}
            field={field}
            value={vitals[field.key] || ''}
            onChange={(value) => updateVital(field.key, value)}
            error={validationErrors[field.key]}
            showSuggestions={showSuggestions}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const normalVitals = {
                temperature: '37.0',
                heart_rate: '72',
                blood_pressure: '120/80',
                respiratory_rate: '16',
                oxygen_saturation: '98',
                weight: vitals.weight || ''
              };
              onChange({ ...vitals, ...normalVitals });
            }}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
          >
            Set Normal Values
          </button>
          
          <button
            onClick={() => {
              const emptyVitals = Object.keys(vitals).reduce((acc, key) => {
                if (key !== 'timestamp') acc[key] = '';
                return acc;
              }, {} as any);
              onChange({ ...emptyVitals, timestamp: vitals.timestamp });
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-xs text-gray-500 text-right">
        Last updated: {new Date(vitals.timestamp || new Date()).toLocaleString()}
      </div>
    </div>
  );
}