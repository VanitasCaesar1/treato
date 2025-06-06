import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CollapsibleSection = ({ 
  sectionKey, 
  section, 
  isOpen, 
  onToggle, 
  children,
  className = ""
}) => {
  const { icon, title, color, bgColor, textColor, borderColor } = section;
  
  return (
    <div className={`rounded-2xl border-2 shadow-lg transition-all duration-300 ${borderColor} ${className}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between rounded-t-2xl transition-colors duration-200 ${
          isOpen 
            ? `${bgColor} ${textColor}` 
            : 'bg-white hover:bg-gray-50 text-gray-700'
        }`}
      >
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${
            isOpen 
              ? 'bg-white/20' 
              : `${bgColor} ${textColor}`
          }`}>
            {React.cloneElement(icon, { className: "h-6 w-6" })}
          </div>
          
          {/* Title */}
          <div className="text-left">
            <h3 className={`text-lg font-bold ${
              isOpen 
                ? 'text-current' 
                : 'text-gray-800'
            }`}>
              {title}
            </h3>
            <p className={`text-sm ${
              isOpen 
                ? 'text-current opacity-80' 
                : 'text-gray-500'
            }`}>
              {getSectionDescription(sectionKey)}
            </p>
          </div>
        </div>
        
        {/* Chevron */}
        <div className={`p-2 rounded-lg ${
          isOpen 
            ? 'bg-white/20' 
            : 'bg-gray-100'
        }`}>
          <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </button>
      
      {/* Content */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 bg-white rounded-b-2xl border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

// Helper function to get section descriptions
const getSectionDescription = (sectionKey) => {
  const descriptions = {
    vitals: "Record patient's vital signs and measurements",
    symptoms: "Document reported symptoms and observations", 
    specialization: "Specialized assessment tools and evaluations",
    diagnosis: "Clinical diagnosis and medical conditions",
    treatment: "Treatment plans, medications, and procedures",
    notes: "Additional clinical notes and observations"
  };
  return descriptions[sectionKey] || "Section details";
};

// Clean version with status indicators
const CollapsibleSectionWithStatus = ({ 
  sectionKey, 
  section, 
  isOpen, 
  onToggle, 
  children,
  isComplete = false,
  hasErrors = false,
  className = ""
}) => {
  const { icon, title, color, bgColor, textColor, borderColor } = section;
  
  return (
    <div className={`relative rounded-2xl border-2 shadow-lg transition-all duration-300 ${
      hasErrors ? 'border-red-300' : 
      isComplete ? 'border-green-300' : 
      borderColor
    } ${className}`}>
      {/* Status indicator */}
      {(isComplete || hasErrors) && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ${
          hasErrors ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {hasErrors ? '!' : '✓'}
        </div>
      )}
      
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-5 flex items-center justify-between rounded-t-2xl transition-colors duration-200 ${
          isOpen 
            ? `${bgColor} ${textColor}` 
            : hasErrors 
              ? 'bg-red-50 hover:bg-red-100 text-red-700'
              : isComplete
                ? 'bg-green-50 hover:bg-green-100 text-green-700'
                : 'bg-white hover:bg-gray-50 text-gray-700'
        }`}
      >
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${
            isOpen 
              ? 'bg-white/20' 
              : hasErrors
                ? 'bg-red-100 text-red-600'
                : isComplete
                  ? 'bg-green-100 text-green-600'
                  : `${bgColor} ${textColor}`
          }`}>
            {React.cloneElement(icon, { className: "h-6 w-6" })}
          </div>
          
          {/* Title */}
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold">
                {title}
              </h3>
              
              {/* Status badges */}
              {isComplete && !isOpen && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
                  Complete
                </span>
              )}
              {hasErrors && !isOpen && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                  Needs Attention
                </span>
              )}
            </div>
            
            <p className={`text-sm mt-1 ${
              isOpen 
                ? 'text-current opacity-80' 
                : 'text-gray-500'
            }`}>
              {getSectionDescription(sectionKey)}
            </p>
          </div>
        </div>
        
        {/* Chevron */}
        <div className={`p-2 rounded-lg ${
          isOpen 
            ? 'bg-white/20' 
            : 'bg-gray-100'
        }`}>
          <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </div>
      </button>
      
      {/* Content */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 bg-white rounded-b-2xl border-t border-gray-100">
          {children}
        </div>
      </div>
      
      {/* Side accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300 ${
        isOpen 
          ? `bg-gradient-to-b from-current via-current to-transparent opacity-50`
          : hasErrors
            ? 'bg-red-400 opacity-60'
            : isComplete 
              ? 'bg-green-400 opacity-60'
              : 'bg-gray-300 opacity-30'
      }`}></div>
    </div>
  );
};

export default CollapsibleSection;