// SpecializationImports.js - Dynamic import system for medical specializations

import { lazy, Suspense, useState, useEffect } from 'react';
import { AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

// Lazy load specialization components
const DermatologySection = lazy(() => import('@/components/diagnosis/DermatologySection'));
const CardiologySection = lazy(() => import('@/components/diagnosis/CardiologySection'));
const NeurologySection = lazy(() => import('@/components/diagnosis/NeurologySection'));
const OrthopedicsSection = lazy(() => import('@/components/diagnosis/OrthopedicsSection'));
const PsychiatrySection = lazy(() => import('@/components/diagnosis/PsychiatrySection'));

// Specialization configuration mapping
export const SPECIALIZATION_CONFIG = {
  // Dermatology and Skin Conditions
  'dermatology': {
    component: DermatologySection,
    icon: '🧴',
    title: 'Dermatology Assessment',
    description: 'Skin conditions, lesions, and dermatological examination',
    fields: ['lesion_description', 'distribution', 'skin_color_changes', 'affected_areas']
  },
  'dermatologist': {
    component: DermatologySection,
    icon: '🧴',
    title: 'Dermatology Assessment',
    description: 'Skin conditions, lesions, and dermatological examination',
    fields: ['lesion_description', 'distribution', 'skin_color_changes', 'affected_areas']
  },

  // Cardiology
  'cardiology': {
    component: CardiologySection,
    icon: '❤️',
    title: 'Cardiac Assessment',
    description: 'Heart conditions, ECG findings, and cardiovascular examination',
    fields: ['ecg_findings', 'heart_sounds', 'chest_pain_assessment', 'cardiac_risk_factors']
  },
  'cardiologist': {
    component: CardiologySection,
    icon: '❤️',
    title: 'Cardiac Assessment',
    description: 'Heart conditions, ECG findings, and cardiovascular examination',
    fields: ['ecg_findings', 'heart_sounds', 'chest_pain_assessment', 'cardiac_risk_factors']
  },

  // Neurology
  'neurology': {
    component: NeurologySection,
    icon: '🧠',
    title: 'Neurological Assessment',
    description: 'Neurological examination, reflexes, and cognitive assessment',
    fields: ['neurological_exam', 'reflexes', 'cognitive_status', 'motor_function']
  },
  'neurologist': {
    component: NeurologySection,
    icon: '🧠',
    title: 'Neurological Assessment',
    description: 'Neurological examination, reflexes, and cognitive assessment',
    fields: ['neurological_exam', 'reflexes', 'cognitive_status', 'motor_function']
  },

  // Orthopedics
  'orthopedics': {
    component: OrthopedicsSection,
    icon: '🦴',
    title: 'Orthopedic Assessment',
    description: 'Musculoskeletal examination, joint mobility, and bone health',
    fields: ['joint_examination', 'range_of_motion', 'muscle_strength', 'gait_analysis']
  },
  'orthopedist': {
    component: OrthopedicsSection,
    icon: '🦴',
    title: 'Orthopedic Assessment',
    description: 'Musculoskeletal examination, joint mobility, and bone health',
    fields: ['joint_examination', 'range_of_motion', 'muscle_strength', 'gait_analysis']
  },
};
// Utility function to get specialization configuration
export const getSpecializationConfig = (specialization) => {
  if (!specialization) return null;
  
  let normalized;
  
  if (typeof specialization === 'string') {
    normalized = specialization.toLowerCase().trim();
  } else if (typeof specialization === 'object' && specialization !== null) {
    const possibleKeys = ['name', 'type', 'primary', 'title', 'specialty'];
    let found = false;
    
    for (const key of possibleKeys) {
      if (specialization[key]) {
        normalized = String(specialization[key]).toLowerCase().trim();
        found = true;
        break;
      }
    }
    
    if (!found) {
      normalized = String(specialization).toLowerCase().trim();
    }
  } else {
    normalized = String(specialization).toLowerCase().trim();
  }
  
  if (!normalized || 
      normalized === '[object object]' || 
      normalized === 'undefined' || 
      normalized === 'null' ||
      normalized === 'nan') {
    return null;
  }
  
  if (SPECIALIZATION_CONFIG[normalized]) {
    return SPECIALIZATION_CONFIG[normalized];
  }
  
  const partialMatches = Object.keys(SPECIALIZATION_CONFIG).filter(key => 
    key.includes(normalized) || normalized.includes(key)
  );
  
  if (partialMatches.length > 0) {
    return SPECIALIZATION_CONFIG[partialMatches[0]];
  }
  
  return null;
};

const getSpecializationFromDoctor = (doctorData) => {
  if (!doctorData) {
    console.log('❌ No doctor data provided');
    return null;
  }
  
  console.log('🔍 Extracting specialization from doctor data:', doctorData);
  
  if (doctorData.specialization) {
    console.log('📋 Found specialization field:', doctorData.specialization);
    
    if (typeof doctorData.specialization === 'object' && doctorData.specialization !== null) {
      if (doctorData.specialization.primary) {
        console.log('✅ Found specialization.primary:', doctorData.specialization.primary);
        return doctorData.specialization.primary.toLowerCase().trim();
      }
      
      const possibleFields = ['name', 'type', 'specialty', 'field', 'department', 'main', 'title'];
      for (const field of possibleFields) {
        if (doctorData.specialization[field]) {
          console.log(`✅ Found specialization.${field}:`, doctorData.specialization[field]);
          return doctorData.specialization[field].toLowerCase().trim();
        }
      }
    }
    
    if (typeof doctorData.specialization === 'string') {
      try {
        const parsed = JSON.parse(doctorData.specialization);
        if (parsed && typeof parsed === 'object' && parsed.primary) {
          console.log('✅ Parsed specialization.primary:', parsed.primary);
          return parsed.primary.toLowerCase().trim();
        }
      } catch (e) {
        console.log('✅ Using specialization as plain string:', doctorData.specialization);
        return doctorData.specialization.toLowerCase().trim();
      }
    }
  }
  
  const possibleRootFields = [
    'specialty', 'Specialty', 'department', 'Department', 
    'field', 'Field', 'medical_specialty', 'doctor_specialty',
    'primary_specialty', 'main_specialty'
  ];
  
  for (const field of possibleRootFields) {
    if (doctorData[field]) {
      console.log(`✅ Found root level ${field}:`, doctorData[field]);
      
      if (typeof doctorData[field] === 'object' && doctorData[field] !== null) {
        if (doctorData[field].primary) {
          return doctorData[field].primary.toLowerCase().trim();
        }
        const firstValue = Object.values(doctorData[field])[0];
        if (typeof firstValue === 'string') {
          return firstValue.toLowerCase().trim();
        }
      }
      
      if (typeof doctorData[field] === 'string') {
        return doctorData[field].toLowerCase().trim();
      }
    }
  }
  
  console.log('❌ No specialization found in doctor data');
  console.log('🔍 Available fields:', Object.keys(doctorData));
  return null;
};

const DiagnosisDebugComponent = () => {
  // Test cases - including your exact data structure
  const testCases = [
    {
      name: "Your actual data (object)",
      doctorData: {
        id: "f67ee211-d149-4ed1-b963-5aeacedbc3e3",
        name: "Chakravarthi Chintapatla",
        specialization: {"primary": "Dermatology"}
      }
    },
    {
      name: "Your actual data (as string)",
      doctorData: {
        id: "f67ee211-d149-4ed1-b963-5aeacedbc3e3",
        name: "Chakravarthi Chintapatla",
        specialization: '{"primary": "Dermatology"}'
      }
    },
    {
      name: "String specialization",
      doctorData: {
        id: "test1",
        name: "Test Doctor",
        specialization: "dermatology"
      }
    },
    {
      name: "JSON string specialization",
      doctorData: {
        id: "test2",
        name: "Test Doctor 2",
        specialization: '{"primary": "Cardiology"}'
      }
    },
    {
      name: "Root level specialty",
      doctorData: {
        id: "test3",
        name: "Test Doctor 3",
        specialty: "Neurology"
      }
    }
  ];

  const [selectedTest, setSelectedTest] = useState(0);
  const currentTest = testCases[selectedTest];
  
  // Run the extraction
  const extractedSpecialization = getSpecializationFromDoctor(currentTest.doctorData);
  const config = getSpecializationConfig(extractedSpecialization);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🔬 Diagnosis Specialization Debug Tool
      </h1>
      
      {/* Test Case Selector */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-3 text-blue-800">Select Test Case:</h2>
        <div className="space-y-2">
          {testCases.map((testCase, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name="testCase"
                checked={selectedTest === index}
                onChange={() => setSelectedTest(index)}
                className="text-blue-600"
              />
              <span className={`${selectedTest === index ? 'font-medium text-blue-800' : 'text-gray-700'}`}>
                {testCase.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Input Data */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold mb-3 text-gray-800 flex items-center">
          📥 Input Doctor Data
        </h2>
        <pre className="text-sm bg-white p-3 rounded border overflow-auto">
          {JSON.stringify(currentTest.doctorData, null, 2)}
        </pre>
      </div>

      {/* Extraction Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h2 className="font-semibold mb-3 text-yellow-800 flex items-center">
            🔍 Extraction Result
          </h2>
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 ${extractedSpecialization ? 'text-green-700' : 'text-red-700'}`}>
              {extractedSpecialization ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="font-medium">
                Extracted: {extractedSpecialization ? `"${extractedSpecialization}"` : 'null'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Type: {typeof extractedSpecialization}
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <h2 className="font-semibold mb-3 text-purple-800 flex items-center">
            ⚙️ Config Match
          </h2>
          <div className="space-y-2">
            <div className={`flex items-center space-x-2 ${config ? 'text-green-700' : 'text-red-700'}`}>
              {config ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="font-medium">
                Config Found: {config ? 'Yes' : 'No'}
              </span>
            </div>
            {config && (
              <div className="text-sm space-y-1">
                <div>Title: {config.title}</div>
                <div>Icon: {config.icon}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Configurations */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h2 className="font-semibold mb-3 text-green-800">
          📋 Available Specialization Configs
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {Object.keys(SPECIALIZATION_CONFIG).map(key => (
            <div key={key} className={`p-2 rounded ${extractedSpecialization === key ? 'bg-green-200 font-medium' : 'bg-white'}`}>
              "{key}"
            </div>
          ))}
        </div>
      </div>

      {/* Debugging Steps */}
      <div className="p-4 bg-red-50 rounded-lg">
        <h2 className="font-semibold mb-3 text-red-800 flex items-center">
          🐛 Debug Steps
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 1:</strong> Check if doctor data exists: {currentTest.doctorData ? '✅ Yes' : '❌ No'}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 2:</strong> Check specialization field: {currentTest.doctorData?.specialization ? '✅ Found' : '❌ Missing'}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 3:</strong> Extract specialization string: {extractedSpecialization ? `✅ "${extractedSpecialization}"` : '❌ Failed'}
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Step 4:</strong> Match with config: {config ? '✅ Matched' : '❌ No match'}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-3 text-blue-800">
          💡 Recommendations
        </h2>
        <div className="space-y-2 text-sm">
          {!extractedSpecialization && (
            <div className="p-2 bg-yellow-100 rounded">
              ⚠️ Specialization extraction failed. Check the doctor data structure.
            </div>
          )}
          {extractedSpecialization && !config && (
            <div className="p-2 bg-yellow-100 rounded">
              ⚠️ Specialization "{extractedSpecialization}" found but no matching config. 
              Add it to SPECIALIZATION_CONFIG or check for typos.
            </div>
          )}
          {extractedSpecialization && config && (
            <div className="p-2 bg-green-100 rounded">
              ✅ Everything looks good! The specialization should work.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export default
export default SpecializationSection;