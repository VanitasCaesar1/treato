"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, X, Calendar, Camera, Eye, ChevronDown, Save, FileText } from "lucide-react";

// Default form structure
const DEFAULT_FORM = {
  lesion_description: "",
  distribution: "",
  skin_color_changes: "",
  affected_areas: [],
  custom_affected_area: "",
  descriptive_findings: "",
  physical_exam_notes: "",
  diagnostic_procedures: [],
  lesion_characteristics: {
    morphology: [],
    size: "",
    color: [],
    border: null,
    surface: "",
    texture: "",
    elevation: ""
  },
  skincare_recommendations: {
    products: [],
    general_care: []
  },
  medications: [],
  imaging_notes: "",
  clinical_photography: "",
  dermoscopy_findings: "",
  follow_up_recommendations: "",
  referral_needed: false,
  referral_specialty: "",
  referral_reason: "",
  differential_diagnosis: [],
  working_diagnosis: "",
  assessment_notes: "",
  severity_assessment: "",
  prognosis: "",
  patient_education: ""
};

// Constants
const AFFECTED_AREAS = [
  'scalp', 'face', 'forehead', 'nose', 'cheeks', 'lips', 'chin', 'neck', 
  'chest', 'back', 'abdomen', 'shoulders', 'arms', 'hands', 'legs', 'feet', 'other'
];

const DIAGNOSTIC_PROCEDURES = [
  { value: 'woods_lamp_examination', label: "Wood's Lamp Examination" },
  { value: 'koh_preparation', label: 'KOH Preparation' },
  { value: 'skin_scraping', label: 'Skin Scraping' },
  { value: 'punch_biopsy', label: 'Punch Biopsy' },
  { value: 'dermoscopy', label: 'Dermoscopy' },
  { value: 'patch_testing', label: 'Patch Testing' },
  { value: 'other', label: 'Other' }
];

const MORPHOLOGY_OPTIONS = [
  'macule', 'patch', 'papule', 'plaque', 'nodule', 'vesicle', 'bulla',
  'pustule', 'wheal', 'comedone', 'cyst', 'ulcer', 'scale', 'crust'
];

const BORDER_OPTIONS = [
  { value: 'well_defined', label: 'Well Defined' },
  { value: 'ill_defined', label: 'Ill Defined' },
  { value: 'irregular', label: 'Irregular' },
  { value: 'raised', label: 'Raised' }
];

const COLOR_OPTIONS = [
  'Red', 'Pink', 'Brown', 'Black', 'White', 'Yellow', 'Blue', 'Purple',
  'Erythematous', 'Hyperpigmented', 'Hypopigmented'
];

const DISTRIBUTION_OPTIONS = [
  'Localized', 'Generalized', 'Symmetric', 'Asymmetric', 'Linear', 'Grouped'
];

const SKIN_COLOR_CHANGES = [
  'Hyperpigmentation', 'Hypopigmentation', 'Erythema', 'Normal', 'Mixed'
];

const SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe'];

const SIZE_OPTIONS = ['<5mm', '5-10mm', '10-20mm', '>20mm', 'Variable'];

const SURFACE_OPTIONS = ['Smooth', 'Rough', 'Scaly', 'Crusted', 'Ulcerated'];

const TEXTURE_OPTIONS = ['Soft', 'Firm', 'Hard', 'Fluctuant'];

const ELEVATION_OPTIONS = ['Flat', 'Raised', 'Depressed'];

const SKINCARE_PRODUCTS = [
  'Gentle Cleanser', 'Moisturizer', 'Sunscreen SPF 30+', 'Topical Corticosteroid',
  'Antifungal Cream', 'Antibiotic Ointment', 'Emollient'
];

const GENERAL_CARE = [
  'Avoid scratching', 'Keep area clean and dry', 'Use lukewarm water',
  'Pat dry, don\'t rub', 'Avoid harsh soaps', 'Protect from sun'
];

const REFERRAL_SPECIALTIES = [
  'Dermatology', 'Dermatopathology', 'Mohs Surgery', 'Plastic Surgery',
  'Oncology', 'Rheumatology', 'Infectious Disease'
];

export default function DermatologySection({ dermatologyData = DEFAULT_FORM, onChange }) {
  const [data, setData] = useState(dermatologyData);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [activeTab, setActiveTab] = useState('assessment');

  const updateField = (path, value) => {
    const newData = { ...data };
    const keys = path.split('.');
    
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setData(newData);
    onChange?.(newData);
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const CustomDropdown = ({ value, options, onChange, placeholder, dropdownKey }) => {
    const isOpen = openDropdowns[dropdownKey];
    
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleDropdown(dropdownKey)}
          className="w-full flex items-center justify-between p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 focus:border-blue-400 transition-colors"
        >
          <span className={value ? "text-gray-800" : "text-gray-500"}>
            {value || placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onChange(option);
                  toggleDropdown(dropdownKey);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const toggleArrayItem = (field, item) => {
    const current = data[field] || [];
    const updated = current.includes(item) 
      ? current.filter(i => i !== item)
      : [...current, item];
    updateField(field, updated);
  };

  const toggleNestedArrayItem = (parent, child, item) => {
    const current = data[parent]?.[child] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateField(`${parent}.${child}`, updated);
  };

  const addMedication = () => {
    const newMed = { name: "", dosage: "", frequency: "", duration: "", route: "topical" };
    updateField('medications', [...(data.medications || []), newMed]);
  };

  const updateMedication = (index, field, value) => {
    const meds = [...(data.medications || [])];
    if (meds[index]) {
      meds[index][field] = value;
      updateField('medications', meds);
    }
  };

  const removeMedication = (index) => {
    const meds = (data.medications || []).filter((_, i) => i !== index);
    updateField('medications', meds);
  };

  const addDiagnosis = (diagnosis) => {
    const current = data.differential_diagnosis || [];
    if (!current.includes(diagnosis) && diagnosis.trim()) {
      updateField('differential_diagnosis', [...current, diagnosis.trim()]);
    }
  };

  const removeDiagnosis = (diagnosis) => {
    const current = data.differential_diagnosis || [];
    updateField('differential_diagnosis', current.filter(d => d !== diagnosis));
  };

  const tabs = [
    { id: 'assessment', label: 'Assessment', icon: Eye },
    { id: 'treatment', label: 'Treatment', icon: Plus },
    { id: 'documentation', label: 'Documentation', icon: Camera },
    { id: 'followup', label: 'Follow-up', icon: Calendar }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 bg-gray-50 rounded-lg">
      <div className="text-center pb-4 border-b">
        <h3 className="text-2xl font-bold text-gray-800">Dermatology Assessment</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 mb-6">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Assessment Tab */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Clinical Assessment</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Lesion Description</label>
                <Textarea
                  placeholder="Describe the primary lesion..."
                  value={data.lesion_description || ""}
                  onChange={(e) => updateField('lesion_description', e.target.value)}
                  className="min-h-24"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Distribution</label>
                <CustomDropdown
                  value={data.distribution}
                  options={DISTRIBUTION_OPTIONS}
                  onChange={(value) => updateField('distribution', value)}
                  placeholder="Select distribution..."
                  dropdownKey="distribution"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Severity Assessment</label>
                <CustomDropdown
                  value={data.severity_assessment}
                  options={SEVERITY_OPTIONS}
                  onChange={(value) => updateField('severity_assessment', value)}
                  placeholder="Select severity..."
                  dropdownKey="severity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Working Diagnosis</label>
                <Input
                  placeholder="Primary diagnosis..."
                  value={data.working_diagnosis || ""}
                  onChange={(e) => updateField('working_diagnosis', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Differential Diagnosis</label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Add diagnosis..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addDiagnosis(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.parentElement.querySelector('input');
                    if (input.value.trim()) {
                      addDiagnosis(input.value.trim());
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {data.differential_diagnosis?.length > 0 && (
                <div className="space-y-2">
                  {data.differential_diagnosis.map((diagnosis, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                      <span>{diagnosis}</span>
                      <button
                        type="button"
                        onClick={() => removeDiagnosis(diagnosis)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Affected Areas */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Affected Areas</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {AFFECTED_AREAS.map((area) => (
                <Button
                  key={area}
                  type="button"
                  variant={data.affected_areas?.includes(area) ? "default" : "outline"}
                  onClick={() => toggleArrayItem('affected_areas', area)}
                  className="text-sm py-2"
                >
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </Button>
              ))}
            </div>
          </Card>

          {/* Lesion Characteristics */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Lesion Characteristics</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Morphology</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {MORPHOLOGY_OPTIONS.map((morph) => (
                  <Button
                    key={morph}
                    type="button"
                    variant={data.lesion_characteristics?.morphology?.includes(morph) ? "default" : "outline"}
                    onClick={() => toggleNestedArrayItem('lesion_characteristics', 'morphology', morph)}
                    className="text-xs py-2"
                  >
                    {morph}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <CustomDropdown
                  value={data.lesion_characteristics?.size}
                  options={SIZE_OPTIONS}
                  onChange={(value) => updateField('lesion_characteristics.size', value)}
                  placeholder="Select size..."
                  dropdownKey="size"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Surface</label>
                <CustomDropdown
                  value={data.lesion_characteristics?.surface}
                  options={SURFACE_OPTIONS}
                  onChange={(value) => updateField('lesion_characteristics.surface', value)}
                  placeholder="Select surface..."
                  dropdownKey="surface"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Elevation</label>
                <CustomDropdown
                  value={data.lesion_characteristics?.elevation}
                  options={ELEVATION_OPTIONS}
                  onChange={(value) => updateField('lesion_characteristics.elevation', value)}
                  placeholder="Select elevation..."
                  dropdownKey="elevation"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Border</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {BORDER_OPTIONS.map((border) => (
                  <Button
                    key={border.value}
                    type="button"
                    variant={data.lesion_characteristics?.border === border.value ? "default" : "outline"}
                    onClick={() => updateField('lesion_characteristics.border', border.value)}
                    className="text-sm py-2"
                  >
                    {border.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <Button
                    key={color}
                    type="button"
                    variant={data.lesion_characteristics?.color?.includes(color) ? "default" : "outline"}
                    onClick={() => toggleNestedArrayItem('lesion_characteristics', 'color', color)}
                    className="text-xs py-2"
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Treatment Tab */}
      {activeTab === 'treatment' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Medications</h4>
              <Button onClick={addMedication} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Medication
              </Button>
            </div>

            {data.medications?.map((med, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium">Medication {index + 1}</h5>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMedication(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Input
                    placeholder="Medication name..."
                    value={med.name || ""}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Dosage..."
                    value={med.dosage || ""}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  />
                  <Input
                    placeholder="Frequency..."
                    value={med.frequency || ""}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  />
                  <Input
                    placeholder="Duration..."
                    value={med.duration || ""}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  />
                </div>
              </div>
            ))}

            {!data.medications?.length && (
              <div className="text-center py-8 text-gray-500">
                <p>No medications prescribed yet.</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Skincare Recommendations</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Recommended Products</label>
                <div className="space-y-2">
                  {SKINCARE_PRODUCTS.map((product) => (
                    <Button
                      key={product}
                      type="button"
                      variant={data.skincare_recommendations?.products?.includes(product) ? "default" : "outline"}
                      onClick={() => toggleNestedArrayItem('skincare_recommendations', 'products', product)}
                      className="w-full justify-start text-sm"
                    >
                      {product}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">General Care</label>
                <div className="space-y-2">
                  {GENERAL_CARE.map((care) => (
                    <Button
                      key={care}
                      type="button"
                      variant={data.skincare_recommendations?.general_care?.includes(care) ? "default" : "outline"}
                      onClick={() => toggleNestedArrayItem('skincare_recommendations', 'general_care', care)}
                      className="w-full justify-start text-sm"
                    >
                      {care}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Documentation Tab */}
      {activeTab === 'documentation' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Clinical Documentation</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Clinical Photography</label>
                <Textarea
                  placeholder="Description of photos taken..."
                  value={data.clinical_photography || ""}
                  onChange={(e) => updateField('clinical_photography', e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dermoscopy Findings</label>
                <Textarea
                  placeholder="Dermoscopic observations..."
                  value={data.dermoscopy_findings || ""}
                  onChange={(e) => updateField('dermoscopy_findings', e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">Assessment Notes</label>
                <Textarea
                  placeholder="Clinical assessment and diagnostic reasoning..."
                  value={data.assessment_notes || ""}
                  onChange={(e) => updateField('assessment_notes', e.target.value)}
                  className="min-h-32"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Follow-up Tab */}
      {activeTab === 'followup' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Follow-up & Referrals</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Follow-up Recommendations</label>
                <Textarea
                  placeholder="Timeline and instructions for follow-up..."
                  value={data.follow_up_recommendations || ""}
                  onChange={(e) => updateField('follow_up_recommendations', e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Referral Needed?</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={data.referral_needed ? "default" : "outline"}
                      onClick={() => updateField('referral_needed', true)}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={!data.referral_needed ? "default" : "outline"}
                      onClick={() => updateField('referral_needed', false)}
                    >
                      No
                    </Button>
                  </div>
                </div>

                {data.referral_needed && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Referral Specialty</label>
                    <CustomDropdown
                      value={data.referral_specialty}
                      options={REFERRAL_SPECIALTIES}
                      onChange={(value) => updateField('referral_specialty', value)}
                      placeholder="Select specialty..."
                      dropdownKey="referral_specialty"
                    />
                  </div>
                )}
              </div>

              {data.referral_needed && (
                <div>
                  <label className="block text-sm font-medium mb-2">Referral Reason</label>
                  <Textarea
                    placeholder="Reason for referral..."
                    value={data.referral_reason || ""}
                    onChange={(e) => updateField('referral_reason', e.target.value)}
                    className="min-h-20"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Assessment
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </div>
  );
}