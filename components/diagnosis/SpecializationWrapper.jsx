// components/diagnosis/SpecializationWrapper.js
import React from 'react';
import { Star } from "lucide-react";
import DermatologySection from "@/components/diagnosis/DermatologySection";
import CardiologySection from "@/components/diagnosis/CardiologySection";
import OrthopedicsSection from "@/components/diagnosis/OrthopedicsSection";
import NeurologySection from "@/components/diagnosis/NeurologySection";
import PsychiatrySection from "@/components/diagnosis/PsychiatrySection";

// Available specializations mapping
const AVAILABLE_SPECIALIZATIONS = {
  'dermatology': { component: DermatologySection, name: 'Dermatology' },
  'cardiology': { component: CardiologySection, name: 'Cardiology' },
  'orthopedics': { component: OrthopedicsSection, name: 'Orthopedics' },
  'neurology': { component: NeurologySection, name: 'Neurology' },
  'psychiatry': { component: PsychiatrySection, name: 'Psychiatry' },
};

const SpecializationWrapper = ({ doctorData, form, updateSpecialization }) => {
  if (!doctorData?.specialization?.primary) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Star className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">No specialization information available</p>
      </div>
    );
  }

  const primarySpecialization = doctorData.specialization.primary.toLowerCase();
  const specializationConfig = AVAILABLE_SPECIALIZATIONS[primarySpecialization];

  if (!specializationConfig) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
          <Star className="h-8 w-8 text-purple-400" />
        </div>
        <h4 className="font-semibold text-lg mb-2 text-gray-800">{doctorData.specialization.primary}</h4>
        <p className="text-gray-600 mb-2">We're working on adding specialized assessment tools for this field.</p>
        <p className="text-sm text-purple-600 font-medium">Coming soon!</p>
      </div>
    );
  }

  const SpecializationComponent = specializationConfig.component;
  
  return (
    <div>
      <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
        <h4 className="font-semibold text-purple-800 mb-1 text-lg">
          {specializationConfig.name} Assessment
        </h4>
        <p className="text-sm text-purple-600">
          Specialized assessment tools for {specializationConfig.name.toLowerCase()}
        </p>
      </div>
      <SpecializationComponent
        data={form[primarySpecialization] || {}}
        onChange={(data) => updateSpecialization(primarySpecialization, data)}
      />
    </div>
  );
};

export default SpecializationWrapper;