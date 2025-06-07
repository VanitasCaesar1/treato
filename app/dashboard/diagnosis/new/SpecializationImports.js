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
  
  // Handle different data types that might be passed
  let normalized;
  
  if (typeof specialization === 'string') {
    normalized = specialization.toLowerCase().trim();
  } else if (typeof specialization === 'object') {
    // If it's an object, try to extract a string value
    if (specialization.name) {
      normalized = String(specialization.name).toLowerCase().trim();
    } else if (specialization.type) {
      normalized = String(specialization.type).toLowerCase().trim();
    } else if (specialization.primary) {
      normalized = String(specialization.primary).toLowerCase().trim();
    } else {
      // Convert object to string as fallback
      normalized = String(specialization).toLowerCase().trim();
    }
  } else {
    // Convert any other type to string
    normalized = String(specialization).toLowerCase().trim();
  }
  
  // Handle edge cases where conversion might result in unwanted strings
  if (normalized === '[object object]' || normalized === 'undefined' || normalized === 'null') {
    return null;
  }
  
  return SPECIALIZATION_CONFIG[normalized] || null;
};

// Main component for rendering specialization sections
export const SpecializationSection = ({ 
  doctorData, 
  specializationData, 
  onChange,
  isOpen = true,
  onToggle 
}) => {
  // Extract specialization from doctor data
  const getSpecialization = () => {
    if (!doctorData) return null;
    
    // Try multiple possible fields for specialization
    return (
      doctorData.specialization?.primary ||
      doctorData.specialization?.type ||
      doctorData.Specialization?.primary ||
      doctorData.Specialization ||
      doctorData.specialty ||
      doctorData.department ||
      null
    );
  };

  const specialization = getSpecialization();
  const config = getSpecializationConfig(specialization);

  // If no matching specialization found, don't render anything
  if (!config) {
    return null;
  }

  const SpecializationComponent = config.component;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        onClick={onToggle} 
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{config.icon}</span>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-800">{config.title}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {specialization}
          </span>
          {isOpen ? 
            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
            <ChevronDown className="h-5 w-5 text-gray-500" />
          }
        </div>
      </button>
      
      {isOpen && (
        <div className="p-6 pt-0 border-t border-gray-100">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading {config.title}...</span>
            </div>
          }>
            <ErrorBoundary fallback={
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>Failed to load {config.title}</span>
                </div>
              </div>
            }>
              <SpecializationComponent
                data={specializationData}
                onChange={onChange}
                doctorInfo={doctorData}
              />
            </ErrorBoundary>
          </Suspense>
        </div>
      )}
    </div>
  );
};

// Error boundary component using hooks (modern approach)
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      console.error('Specialization component error:', error, errorInfo);
      setHasError(true);
    };

    // Reset error state when children change
    setHasError(false);

    // Add global error handler
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [children]);

  if (hasError) {
    return fallback;
  }

  return children;
};

// Hook for managing specialization data
export const useSpecializationData = (initialData = {}) => {
  const [data, setData] = useState(initialData);

  const updateData = (newData) => {
    setData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const resetData = () => {
    setData({});
  };

  return {
    data,
    updateData,
    resetData,
    hasData: Object.keys(data).length > 0
  };
};

// Utility to get all available specializations
export const getAvailableSpecializations = () => {
  return Object.keys(SPECIALIZATION_CONFIG).map(key => ({
    key,
    ...SPECIALIZATION_CONFIG[key]
  }));
};

// Export default
export default SpecializationSection;