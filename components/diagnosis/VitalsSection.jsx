// components/diagnosis/VitalsSection.js
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

const VitalsSection = ({ vitals = {}, onChange }) => {
  const [dropdownStates, setDropdownStates] = useState({
    temperature: false,
    heart_rate: false,
    blood_pressure: false,
    weight: false,
    height: false
  });

  const dropdownRefs = useRef({});

  const updateVital = (field, value) => {
    onChange({ ...vitals, [field]: value });
  };

  const toggleDropdown = (field) => {
    setDropdownStates(prev => ({
      temperature: false,
      heart_rate: false,
      blood_pressure: false,
      weight: false,
      height: false,
      [field]: !prev[field]
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      temperature: false,
      heart_rate: false,
      blood_pressure: false,
      weight: false,
      height: false
    });
  };

  const selectSuggestion = (field, value) => {
    updateVital(field, value);
    closeAllDropdowns();
  };

  // Validation function to check if a value is within range
  const isWithinRange = (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  };

  // Get validation class for styling
  const getValidationClass = (value, min, max) => {
    if (!value || value === '') return '';
    return isWithinRange(value, min, max) 
      ? 'border-green-500 focus:border-green-500' 
      : 'border-red-500 focus:border-red-500';
  };

  // Temperature suggestions (Celsius)
  const temperatureSuggestions = [
    { value: '36.5', label: '36.5°C - Normal', category: 'Normal' },
    { value: '37.0', label: '37.0°C - Normal', category: 'Normal' },
    { value: '37.5', label: '37.5°C - Low fever', category: 'Fever' },
    { value: '38.0', label: '38.0°C - Mild fever', category: 'Fever' },
    { value: '38.5', label: '38.5°C - Moderate fever', category: 'Fever' },
    { value: '39.0', label: '39.0°C - High fever', category: 'Fever' },
    { value: '35.5', label: '35.5°C - Hypothermia', category: 'Low' },
    { value: '40.0', label: '40.0°C - Hyperthermia', category: 'High' }
  ];

  // Heart rate suggestions
  const heartRateSuggestions = [
    { value: '60', label: '60 bpm - Resting (normal)', category: 'Normal' },
    { value: '72', label: '72 bpm - Average adult', category: 'Normal' },
    { value: '80', label: '80 bpm - Active adult', category: 'Normal' },
    { value: '100', label: '100 bpm - Upper normal', category: 'Normal' },
    { value: '50', label: '50 bpm - Athletic/bradycardia', category: 'Low' },
    { value: '110', label: '110 bpm - Mild tachycardia', category: 'High' },
    { value: '120', label: '120 bpm - Moderate tachycardia', category: 'High' },
    { value: '150', label: '150 bpm - Severe tachycardia', category: 'High' }
  ];

  // Blood pressure suggestions
  const bloodPressureSuggestions = [
    { value: '120/80', label: '120/80 - Normal', category: 'Normal' },
    { value: '110/70', label: '110/70 - Optimal', category: 'Normal' },
    { value: '130/85', label: '130/85 - High normal', category: 'Elevated' },
    { value: '140/90', label: '140/90 - Stage 1 hypertension', category: 'High' },
    { value: '160/100', label: '160/100 - Stage 2 hypertension', category: 'High' },
    { value: '100/60', label: '100/60 - Low normal', category: 'Low' },
    { value: '90/60', label: '90/60 - Hypotension', category: 'Low' },
    { value: '180/110', label: '180/110 - Hypertensive crisis', category: 'Critical' }
  ];

  // Weight suggestions (kg)
  const weightSuggestions = [
    { value: '50', label: '50 kg - Light adult', category: 'Light' },
    { value: '60', label: '60 kg - Average female', category: 'Average' },
    { value: '70', label: '70 kg - Average male', category: 'Average' },
    { value: '80', label: '80 kg - Above average', category: 'Heavy' },
    { value: '90', label: '90 kg - Heavy adult', category: 'Heavy' },
    { value: '100', label: '100 kg - Very heavy', category: 'Heavy' },
    { value: '40', label: '40 kg - Underweight adult', category: 'Light' },
    { value: '15', label: '15 kg - Child/adolescent', category: 'Child' }
  ];

  // Height suggestions (cm)
  const heightSuggestions = [
    { value: '150', label: '150 cm (4\'11") - Short', category: 'Short' },
    { value: '160', label: '160 cm (5\'3") - Below average', category: 'Average' },
    { value: '165', label: '165 cm (5\'5") - Average female', category: 'Average' },
    { value: '170', label: '170 cm (5\'7") - Average', category: 'Average' },
    { value: '175', label: '175 cm (5\'9") - Above average', category: 'Tall' },
    { value: '180', label: '180 cm (5\'11") - Average male', category: 'Tall' },
    { value: '185', label: '185 cm (6\'1") - Tall', category: 'Tall' },
    { value: '190', label: '190 cm (6\'3") - Very tall', category: 'Tall' }
  ];

  // Temperature validation (35-43°C range)
  const handleTemperatureChange = (value) => {
    if (value === '') {
      updateVital("temperature", '');
      return;
    }
    
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    
    let formattedValue = parts[0];
    if (parts[1] !== undefined) {
      formattedValue += '.' + parts[1].slice(0, 1);
    }
    
    updateVital("temperature", formattedValue);
  };

  // Heart Rate validation (30-200 bpm range)
  const handleHeartRateChange = (value) => {
    if (value === '') {
      updateVital("heart_rate", '');
      return;
    }
    
    const numericValue = value.replace(/[^0-9]/g, '');
    updateVital("heart_rate", numericValue);
  };

  // Blood Pressure validation
  const handleBloodPressureChange = (value) => {
    if (value === '') {
      updateVital("blood_pressure", '');
      return;
    }
    
    let formattedValue = value.replace(/[^0-9/]/g, '');
    const slashCount = (formattedValue.match(/\//g) || []).length;
    if (slashCount > 1) {
      const firstSlashIndex = formattedValue.indexOf('/');
      formattedValue = formattedValue.substring(0, firstSlashIndex + 1) + 
                      formattedValue.substring(firstSlashIndex + 1).replace(/\//g, '');
    }
    
    updateVital("blood_pressure", formattedValue);
  };

  // Weight validation (5-500 kg)
  const handleWeightChange = (value) => {
    if (value === '') {
      updateVital("weight", '');
      return;
    }
    
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    
    let formattedValue = parts[0];
    if (parts[1] !== undefined) {
      formattedValue += '.' + parts[1].slice(0, 1);
    }
    
    updateVital("weight", formattedValue);
  };

  // Height validation (50-250 cm)
  const handleHeightChange = (value) => {
    if (value === '') {
      updateVital("height", '');
      return;
    }
    
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    
    let formattedValue = parts[0];
    if (parts[1] !== undefined) {
      formattedValue += '.' + parts[1].slice(0, 1);
    }
    
    updateVital("height", formattedValue);
  };

  // Calculate BMI
  const calculateBMI = () => {
    const weight = parseFloat(vitals.weight);
    const height = parseFloat(vitals.height);
    
    if (!isNaN(weight) && !isNaN(height) && height > 0) {
      // Weight in kg, height in cm
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return '';
  };

  // Auto-calculate BMI when weight or height changes
  useEffect(() => {
    const bmi = calculateBMI();
    if (bmi && bmi !== vitals.bmi) {
      updateVital("bmi", bmi);
    } else if (!bmi && vitals.bmi) {
      updateVital("bmi", '');
    }
  }, [vitals.weight, vitals.height]);

  // Validation helper for blood pressure
  const validateBloodPressure = (value) => {
    if (!value || !value.includes('/')) return false;
    const parts = value.split('/');
    if (parts.length !== 2) return false;
    
    const [systolic, diastolic] = parts;
    const sysNum = parseInt(systolic);
    const diasNum = parseInt(diastolic);
    
    return !isNaN(sysNum) && !isNaN(diasNum) && 
           sysNum >= 70 && sysNum <= 250 && 
           diasNum >= 40 && diasNum <= 150 &&
           systolic !== '' && diastolic !== '';
  };

  // Get BMI category
  const getBMICategory = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (isNaN(bmiValue)) return '';
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  // Check if value is out of range for warnings
  const isOutOfRange = (value, min, max) => {
    if (!value || value === '') return false;
    return !isWithinRange(value, min, max);
  };

  // Dropdown component
  const DropdownInput = ({ 
    field, 
    value, 
    onChange, 
    placeholder, 
    suggestions, 
    validationRange, 
    unit,
    label,
    rangeText 
  }) => (
    <div className="relative" ref={el => dropdownRefs.current[field] = el}>
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
        <span className="text-xs text-gray-500 block font-normal">{rangeText}</span>
      </label>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`rounded-xl border-gray-200 pr-8 ${
            validationRange ? getValidationClass(value, validationRange[0], validationRange[1]) : ''
          }`}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleDropdown(field);
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown size={16} />
        </button>
        
        {dropdownStates[field] && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  selectSuggestion(field, suggestion.value);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
              >
                <div className="font-medium">{suggestion.label}</div>
                <div className="text-xs text-gray-500">{suggestion.category}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {validationRange && isOutOfRange(value, validationRange[0], validationRange[1]) && (
        <span className="text-xs text-red-500 mt-1 block">
          {label} must be between {validationRange[0]} and {validationRange[1]} {unit}
        </span>
      )}
    </div>
  );

  // Click outside to close dropdowns - Fixed version
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideAnyDropdown = Object.values(dropdownRefs.current).some(ref => 
        ref && ref.contains(event.target)
      );
      
      if (!isClickInsideAnyDropdown) {
        closeAllDropdowns();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <DropdownInput
        field="temperature"
        value={vitals.temperature}
        onChange={handleTemperatureChange}
        placeholder="37.0"
        suggestions={temperatureSuggestions}
        validationRange={[35, 43]}
        unit="°C"
        label="Temperature (°C)"
        rangeText="35.0 - 43.0"
      />

      <DropdownInput
        field="heart_rate"
        value={vitals.heart_rate}
        onChange={handleHeartRateChange}
        placeholder="72"
        suggestions={heartRateSuggestions}
        validationRange={[30, 200]}
        unit="bpm"
        label="Heart Rate (bpm)"
        rangeText="30 - 200"
      />

      <div className="relative" ref={el => dropdownRefs.current.blood_pressure = el}>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Blood Pressure
          <span className="text-xs text-gray-500 block font-normal">e.g., 120/80</span>
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder="120/80"
            value={vitals.blood_pressure || ''}
            onChange={(e) => handleBloodPressureChange(e.target.value)}
            className={`rounded-xl border-gray-200 pr-8 ${
              vitals.blood_pressure && validateBloodPressure(vitals.blood_pressure) 
                ? 'border-green-500 focus:border-green-500' 
                : vitals.blood_pressure ? 'border-red-500 focus:border-red-500' : ''
            }`}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleDropdown('blood_pressure');
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <ChevronDown size={16} />
          </button>
          
          {dropdownStates.blood_pressure && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {bloodPressureSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectSuggestion('blood_pressure', suggestion.value);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                >
                  <div className="font-medium">{suggestion.label}</div>
                  <div className="text-xs text-gray-500">{suggestion.category}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {vitals.blood_pressure && !validateBloodPressure(vitals.blood_pressure) && (
          <span className="text-xs text-red-500 mt-1 block">
            Format: systolic/diastolic (70-250/40-150)
          </span>
        )}
      </div>

      <DropdownInput
        field="weight"
        value={vitals.weight}
        onChange={handleWeightChange}
        placeholder="70.0"
        suggestions={weightSuggestions}
        validationRange={[5, 500]}
        unit="kg"
        label="Weight (kg)"
        rangeText="5 - 500"
      />

      <DropdownInput
        field="height"
        value={vitals.height}
        onChange={handleHeightChange}
        placeholder="170.0"
        suggestions={heightSuggestions}
        validationRange={[50, 250]}
        unit="cm"
        label="Height (cm)"
        rangeText="50 - 250"
      />

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          BMI
          <span className="text-xs text-gray-500 block font-normal">Auto-calculated</span>
        </label>
        <Input
          type="text"
          placeholder="24.2"
          value={vitals.bmi || ''}
          readOnly
          className="rounded-xl border-gray-200 bg-gray-50"
        />
        {vitals.bmi && (
          <span className="text-xs text-blue-600 mt-1 block">
            {getBMICategory(vitals.bmi)}
          </span>
        )}
      </div>
    </div>
  );
};

export default VitalsSection;