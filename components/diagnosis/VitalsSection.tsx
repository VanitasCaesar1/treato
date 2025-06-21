"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Check, Info, Heart, Thermometer, Activity, Ruler, Weight, Droplets } from "lucide-react";

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
  maxLength?: number;
  normalRange: { min: number; max: number; unit: string };
  suggestions?: string[];
  validation: (value: string) => { isValid: boolean; message?: string; level?: 'error' | 'warning' | 'info' };
  inputFilter?: (value: string) => string;
  readonly?: boolean;
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
    maxLength: 5,
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
    maxLength: 3,
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
    maxLength: 7,
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
      
      // Enhanced validation for blood pressure format
      const bpPattern = /^\d{2,3}\/\d{2,3}$/;
      if (!bpPattern.test(value)) {
        return { isValid: false, message: 'Format: systolic/diastolic (e.g., 120/80)' };
      }
      
      const parts = value.split('/');
      if (parts.length !== 2) {
        return { isValid: false, message: 'Must contain exactly one "/" separator' };
      }
      
      const [systolicStr, diastolicStr] = parts;
      const systolic = parseInt(systolicStr);
      const diastolic = parseInt(diastolicStr);
      
      // Check if values are valid numbers
      if (isNaN(systolic) || isNaN(diastolic)) {
        return { isValid: false, message: 'Both systolic and diastolic must be numbers' };
      }
      
      // Range validation
      if (systolic < 70 || systolic > 300) {
        return { isValid: false, message: 'Systolic pressure must be between 70-300 mmHg' };
      }
      if (diastolic < 40 || diastolic > 200) {
        return { isValid: false, message: 'Diastolic pressure must be between 40-200 mmHg' };
      }
      
      // Logical validation
      if (systolic <= diastolic) {
        return { isValid: false, message: 'Systolic pressure must be higher than diastolic' };
      }
      
      // Clinical validation
      if (systolic >= 180 || diastolic >= 120) {
        return { isValid: true, message: 'Hypertensive crisis - urgent medical attention needed', level: 'error' };
      }
      if (systolic >= 160 || diastolic >= 100) {
        return { isValid: true, message: 'Stage 2 high blood pressure', level: 'warning' };
      }
      if (systolic >= 140 || diastolic >= 90) {
        return { isValid: true, message: 'Stage 1 high blood pressure', level: 'warning' };
      }
      if (systolic >= 130 || diastolic >= 80) {
        return { isValid: true, message: 'Elevated blood pressure', level: 'info' };
      }
      if (systolic < 90 || diastolic < 60) {
        return { isValid: true, message: 'Low blood pressure (hypotension)', level: 'warning' };
      }
      if (systolic <= 120 && diastolic <= 80) {
        return { isValid: true, message: 'Normal blood pressure', level: 'info' };
      }
      
      return { isValid: true, message: 'Blood pressure recorded', level: 'info' };
    }
  },
  {
    key: 'blood_sugar',
    label: 'Blood Sugar',
    unit: 'mg/dL',
    placeholder: '100',
    icon: Droplets,
    type: 'number',
    min: 30,
    max: 600,
    step: 1,
    maxLength: 3,
    normalRange: { min: 70, max: 140, unit: 'mg/dL (fasting/random)' },
    suggestions: ['90', '100', '110', '120'],
    inputFilter: (value: string) => {
      // Allow only numbers
      return value.replace(/[^0-9]/g, '');
    },
    validation: (value: string) => {
      if (!value) return { isValid: true };
      const bloodSugar = parseInt(value);
      if (isNaN(bloodSugar)) return { isValid: false, message: 'Please enter a valid blood sugar level' };
      if (bloodSugar < 30 || bloodSugar > 600) {
        return { isValid: false, message: 'Blood sugar must be between 30-600 mg/dL' };
      }
      
      // Critical levels
      if (bloodSugar < 54) {
        return { isValid: true, message: 'Severe hypoglycemia - immediate treatment needed', level: 'error' };
      }
      if (bloodSugar > 400) {
        return { isValid: true, message: 'Severe hyperglycemia - seek immediate medical care', level: 'error' };
      }
      
      // Warning levels
      if (bloodSugar < 70) {
        return { isValid: true, message: 'Hypoglycemia - low blood sugar', level: 'warning' };
      }
      if (bloodSugar > 300) {
        return { isValid: true, message: 'Very high blood sugar - medical attention advised', level: 'warning' };
      }
      if (bloodSugar > 200) {
        return { isValid: true, message: 'High blood sugar - monitor closely', level: 'warning' };
      }
      
      // Normal ranges (context-dependent)
      if (bloodSugar >= 70 && bloodSugar <= 100) {
        return { isValid: true, message: 'Normal fasting blood sugar', level: 'info' };
      }
      if (bloodSugar >= 70 && bloodSugar <= 140) {
        return { isValid: true, message: 'Normal random blood sugar', level: 'info' };
      }
      if (bloodSugar > 140 && bloodSugar <= 180) {
        return { isValid: true, message: 'Elevated blood sugar - consider diabetes screening', level: 'info' };
      }
      
      return { isValid: true, message: 'Blood sugar recorded', level: 'info' };
    }
  },
  {
    key: 'height',
    label: 'Height',
    unit: 'cm',
    placeholder: '170',
    icon: Ruler,
    type: 'number',
    min: 50,
    max: 250,
    step: 1,
    maxLength: 3,
    normalRange: { min: 150, max: 200, unit: 'cm' },
    inputFilter: (value: string) => {
      // Allow only numbers and one decimal point
      return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    },
    validation: (value: string) => {
      if (!value) return { isValid: true };
      const height = parseFloat(value);
      if (isNaN(height)) return { isValid: false, message: 'Please enter a valid height' };
      if (height < 50 || height > 250) return { isValid: false, message: 'Height must be between 50-250 cm' };
      if (height < 100) return { isValid: true, message: 'Very short stature', level: 'info' };
      if (height > 220) return { isValid: true, message: 'Very tall stature', level: 'info' };
      return { isValid: true, message: 'Height recorded', level: 'info' };
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
    maxLength: 5,
    normalRange: { min: 50, max: 90, unit: 'kg' },
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
  },
  {
    key: 'bmi',
    label: 'BMI',
    unit: 'kg/m²',
    placeholder: 'Auto-calculated',
    icon: Activity,
    type: 'text',
    readonly: true,
    maxLength: 5,
    normalRange: { min: 18.5, max: 24.9, unit: 'kg/m²' },
    inputFilter: (value: string) => value, // No filtering for readonly field
    validation: (value: string) => {
      if (!value) return { isValid: true, message: 'Enter height and weight to calculate BMI', level: 'info' };
      const bmi = parseFloat(value);
      if (isNaN(bmi)) return { isValid: true };
      
      if (bmi < 16) return { isValid: true, message: 'Severely underweight', level: 'error' };
      if (bmi < 18.5) return { isValid: true, message: 'Underweight', level: 'warning' };
      if (bmi >= 18.5 && bmi <= 24.9) return { isValid: true, message: 'Normal weight', level: 'info' };
      if (bmi >= 25 && bmi <= 29.9) return { isValid: true, message: 'Overweight', level: 'warning' };
      if (bmi >= 30 && bmi <= 34.9) return { isValid: true, message: 'Obesity Class I', level: 'warning' };
      if (bmi >= 35 && bmi <= 39.9) return { isValid: true, message: 'Obesity Class II', level: 'error' };
      if (bmi >= 40) return { isValid: true, message: 'Obesity Class III (Severe)', level: 'error' };
      
      return { isValid: true, message: 'BMI calculated', level: 'info' };
    }
  }
];

const convertVitalsForBackend = (vitals) => {
  const converted = { ...vitals };
  
  // Convert numeric fields to proper types, send null for empty values
  const numericFields = [
    'temperature', 'heart_rate', 'weight', 'height', 'bmi', 'blood_sugar'
  ];
  
  numericFields.forEach(field => {
    const value = vitals[field];
    if (!value || value === '') {
      converted[field] = null;
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        converted[field] = numValue;
      } else {
        converted[field] = null;
      }
    }
  });
  
  return converted;
};

const prepareDiagnosisData = (formData) => {
  const diagnosisData = {
    ...formData,
    // Send vitals as strings (empty string for null values)
    temperature: formData.temperature || "",
    heart_rate: formData.heart_rate || "",
    weight: formData.weight || "",
    height: formData.height || "",
    bmi: formData.bmi || "",
    blood_pressure: formData.blood_pressure || "",
    blood_sugar: formData.blood_sugar || "",
  };
  
  return diagnosisData;
};

// Alternative: If you want to keep numeric conversion but ensure consistency
const prepareDiagnosisDataWithNumbers = (formData) => {
  const diagnosisData = {
    ...formData,
    // Convert to numbers, but send null for empty values (not empty strings)
    temperature: formData.temperature && formData.temperature !== '' ? parseFloat(formData.temperature) : null,
    heart_rate: formData.heart_rate && formData.heart_rate !== '' ? parseInt(formData.heart_rate) : null,
    weight: formData.weight && formData.weight !== '' ? parseFloat(formData.weight) : null,
    height: formData.height && formData.height !== '' ? parseFloat(formData.height) : null,
    bmi: formData.bmi && formData.bmi !== '' ? parseFloat(formData.bmi) : null,
    blood_pressure: formData.blood_pressure || "",
    blood_sugar: formData.blood_sugar && formData.blood_sugar !== '' ? parseInt(formData.blood_sugar) : null,
  };
  
  return diagnosisData;
};

// Helper function to calculate BMI
const calculateBMI = (weight, height) => {
  if (!weight || !height || weight === '' || height === '') return '';
  
  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);
  
  if (isNaN(weightNum) || isNaN(heightNum) || heightNum === 0) return '';
  
  // Convert height from cm to meters
  const heightInMeters = heightNum / 100;
  const bmi = weightNum / (heightInMeters * heightInMeters);
  
  return bmi.toFixed(1);
};

// Modified VitalInput component with better data handling
const VitalInput = ({ field, value, onChange, error, showSuggestions }) => {
  const [focused, setFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const IconComponent = field.icon;

  const handleInputChange = (inputValue) => {
    // Apply maxLength constraint
    if (field.maxLength && inputValue.length > field.maxLength) {
      inputValue = inputValue.substring(0, field.maxLength);
    }
    
    // Apply input filter if available
    const filteredValue = field.inputFilter ? field.inputFilter(inputValue) : inputValue;
    onChange(filteredValue);
  };

  const handleKeyPress = (e) => {
    // Prevent input for readonly fields
    if (field.readonly) {
      e.preventDefault();
      return;
    }
    
    // For number inputs, prevent non-numeric characters (except allowed ones)
    if (field.type === 'number') {
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      const allowedChars = field.key === 'temperature' ? '0123456789.-' : '0123456789.';
      
      if (!allowedKeys.includes(e.key) && !allowedChars.includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  const handlePaste = (e) => {
    if (field.readonly) {
      e.preventDefault();
      return;
    }
    
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    let filteredText = field.inputFilter ? field.inputFilter(pastedText) : pastedText;
    
    // Apply maxLength constraint
    if (field.maxLength && filteredText.length > field.maxLength) {
      filteredText = filteredText.substring(0, field.maxLength);
    }
    
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

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
        <IconComponent className="h-4 w-4 mr-2 text-gray-500" />
        {field.label}
        <span className="ml-1 text-gray-400">({field.unit})</span>
        {field.readonly && <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Auto</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onPaste={handlePaste}
          onFocus={() => {
            setFocused(true);
            if (field.suggestions && showSuggestions && !field.readonly) setShowDropdown(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setShowDropdown(false), 200);
          }}
          className={`w-full p-3 pr-10 border rounded-lg transition-all duration-200 ${getStatusColor()} ${
            field.readonly ? 'bg-gray-50 cursor-not-allowed' : ''
          }`}
          placeholder={field.placeholder}
          autoComplete="off"
          spellCheck="false"
          readOnly={field.readonly}
          maxLength={field.maxLength}
        />
        
        {/* Status Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getStatusIcon()}
        </div>
        
        {/* Suggestions Dropdown */}
        {field.suggestions && showDropdown && showSuggestions && !field.readonly && (
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
      {focused && !field.readonly && (
        <div className="mt-1 text-xs text-gray-500 flex items-center">
          <Info className="h-3 w-3 mr-1 flex-shrink-0" />
          Normal range: {field.normalRange.min}{field.normalRange.unit.includes('systolic') ? '' : `-${field.normalRange.max}`} {field.normalRange.unit}
        </div>
      )}
    </div>
  );
};

export default function VitalsSection({ vitals, onChange }) {
  const [validationErrors, setValidationErrors] = useState<Record<string, { isValid: boolean; message?: string; level?: 'error' | 'warning' | 'info' }>>({});
  const [showSuggestions, setShowSuggestions] = useState(true);

  const updateVital = (field, value) => {
    // Update the vital value
    const newVitals = { ...vitals, [field]: value };
    
    // Auto-calculate BMI when height or weight changes
    if (field === 'height' || field === 'weight') {
      const height = field === 'height' ? value : vitals.height;
      const weight = field === 'weight' ? value : vitals.weight;
      const bmi = calculateBMI(weight, height);
      newVitals.bmi = bmi;
    }
    
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
    
    // Also validate BMI if it was updated
    if (field === 'height' || field === 'weight') {
      const bmiField = VITAL_FIELDS.find(f => f.key === 'bmi');
      if (bmiField) {
        const bmiValidation = bmiField.validation(newVitals.bmi);
        setValidationErrors(prev => ({
          ...prev,
          bmi: bmiValidation
        }));
      }
    }
  };

  // Validate all fields on mount and when vitals change
  useEffect(() => {
    const errors = {};
    VITAL_FIELDS.forEach(field => {
      const value = vitals[field.key] || '';
      errors[field.key] = field.validation(value);
    });
    setValidationErrors(errors);
  }, [vitals]);

  const getOverallStatus = () => {
    const hasErrors = Object.values(validationErrors).some((error) => !error.isValid);
    const hasWarnings = Object.values(validationErrors).some((error) => error.level === 'error' || error.level === 'warning');
    
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
                height: vitals.height || '',
                weight: vitals.weight || '',
                bmi: ''
              };
              // Recalculate BMI if height and weight exist
              if (normalVitals.height && normalVitals.weight) {
                normalVitals.bmi = calculateBMI(normalVitals.weight, normalVitals.height);
              }
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
              }, {});
              onChange({ ...emptyVitals, timestamp: vitals.timestamp });
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* BMI Information */}
      {vitals.bmi && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">BMI Information</h4>
          <div className="text-sm text-blue-700">
            <p><strong>Current BMI:</strong> {vitals.bmi} kg/m²</p>
            <div className="mt-2 text-xs">
              <p><strong>BMI Categories:</strong></p>
              <p>• Underweight: &lt; 18.5 • Normal: 18.5-24.9 • Overweight: 25-29.9 • Obese: ≥ 30</p>
            </div>
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-500 text-right">
        Last updated: {new Date(vitals.timestamp || new Date()).toLocaleString()}
      </div>
    </div>
  );
}

// Export the helper functions for use in parent components
export { convertVitalsForBackend, prepareDiagnosisData };