"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, X, Calendar, Camera, Eye, ChevronDown } from "lucide-react";

// Default empty dermatology form structure
const DEFAULT_DERMATOLOGY_FORM = {
  lesion_description: "",
  distribution: "",
  skin_color_changes: "",
  affected_areas: [],
  custom_affected_area: "",
  descriptive_findings: "",
  diagnostic_procedures: [],
  lesion_characteristics: {
    morphology: [],
    size: "",
    color: [],
    border: null,
    surface: ""
  },
  skincare_recommendations: {
    products: [],
    general_care: []
  },
  imaging_notes: ""
};

// Available options for various fields
const AFFECTED_AREAS_OPTIONS = [
  'scalp', 'face', 'neck', 'chest', 'back', 'abdomen',
  'arms', 'hands', 'legs', 'feet', 'nails', 'mucosa', 'genitalia', 'other'
];

const DIAGNOSTIC_PROCEDURES = [
  { value: 'woods_lamp_examination', label: "Wood's Lamp Examination" },
  { value: 'koh_preparation', label: 'KOH Preparation' },
  { value: 'skin_scraping', label: 'Skin Scraping' },
  { value: 'culture', label: 'Culture' },
  { value: 'biopsy', label: 'Biopsy' },
  { value: 'dermoscopy', label: 'Dermoscopy' },
  { value: 'patch_testing', label: 'Patch Testing' },
  { value: 'other', label: 'Other' }
];

const MORPHOLOGY_OPTIONS = [
  'macule', 'papule', 'nodule', 'vesicle', 'bulla', 'pustule',
  'wheal', 'plaque', 'patch', 'ulcer', 'erosion', 'scale', 'crust', 'other'
];

const BORDER_OPTIONS = [
  { value: 'well_defined', label: 'Well Defined' },
  { value: 'ill_defined', label: 'Ill Defined' },
  { value: 'irregular', label: 'Irregular' },
  { value: 'scalloped', label: 'Scalloped' }
];

const COLOR_SUGGESTIONS = [
  'Red', 'Pink', 'Brown', 'Black', 'White', 'Yellow', 'Blue', 'Purple', 'Tan', 'Flesh-colored'
];

// New dropdown options
const DISTRIBUTION_OPTIONS = [
  'Localized', 'Generalized', 'Symmetric', 'Asymmetric', 'Bilateral', 'Unilateral',
  'Clustered', 'Linear', 'Zosteriform', 'Segmental', 'Scattered', 'Confluent'
];

const SKIN_COLOR_CHANGES_OPTIONS = [
  'Hyperpigmentation', 'Hypopigmentation', 'Depigmentation', 'Erythema',
  'Post-inflammatory hyperpigmentation', 'Melasma', 'Vitiligo', 'Café-au-lait',
  'Livedo reticularis', 'Poikiloderma', 'No color changes', 'Other'
];

const SIZE_OPTIONS = [
  '< 1mm', '1-2mm', '2-5mm', '5mm-1cm', '1-2cm', '2-5cm', '5-10cm', '> 10cm',
  'Pinpoint', 'Punctate', 'Small', 'Medium', 'Large', 'Variable sizes'
];

const SURFACE_OPTIONS = [
  'Smooth', 'Rough', 'Scaly', 'Crusted', 'Keratotic', 'Verrucous',
  'Ulcerated', 'Eroded', 'Lichenified', 'Atrophic', 'Hyperkeratotic', 'Greasy'
];

export default function DermatologySection({ dermatologyData = DEFAULT_DERMATOLOGY_FORM, onChange }) {
  const [localData, setLocalData] = useState(dermatologyData);
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Update local state and notify parent
  const updateField = (path, value) => {
    const newData = { ...localData };
    const pathArray = path.split('.');
    
    if (pathArray.length === 1) {
      newData[pathArray[0]] = value;
    } else if (pathArray.length === 2) {
      if (!newData[pathArray[0]]) newData[pathArray[0]] = {};
      newData[pathArray[0]][pathArray[1]] = value;
    }
    
    setLocalData(newData);
    onChange(newData);
  };

  // Dropdown toggle
  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  // Enhanced dropdown component
  const CustomDropdown = ({ value, options, onChange, placeholder, dropdownKey, allowCustom = false }) => {
    const [customValue, setCustomValue] = useState('');
    const isOpen = openDropdowns[dropdownKey];
    
    const handleSelect = (option) => {
      if (option === 'custom' && allowCustom) {
        // Don't close dropdown for custom option
        return;
      }
      onChange(option);
      setOpenDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
    };

    const handleCustomSubmit = () => {
      if (customValue.trim()) {
        onChange(customValue.trim());
        setCustomValue('');
        setOpenDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
      }
    };

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleDropdown(dropdownKey)}
          className="w-full flex items-center justify-between p-3 bg-white/90 border-2 border-teal-200 rounded-xl 
                   hover:border-teal-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
        >
          <span className={value ? "text-gray-800" : "text-gray-500"}>
            {value || placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-teal-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full text-left px-4 py-3 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-150
                         border-b border-gray-100 last:border-b-0 text-gray-700"
              >
                {option}
              </button>
            ))}
            {allowCustom && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="Enter custom value..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  />
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Array field helpers
  const toggleArrayItem = (field, item) => {
    const currentArray = localData[field] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateField(field, newArray);
  };

  const toggleNestedArrayItem = (parentField, childField, item) => {
    const currentArray = localData[parentField]?.[childField] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    const newParent = { ...localData[parentField] };
    newParent[childField] = newArray;
    updateField(parentField, newParent);
  };

  const addColorTag = (color) => {
    const currentColors = localData.lesion_characteristics?.color || [];
    if (!currentColors.includes(color)) {
      const newColors = [...currentColors, color];
      const newCharacteristics = { ...localData.lesion_characteristics };
      newCharacteristics.color = newColors;
      updateField('lesion_characteristics', newCharacteristics);
    }
  };

  const removeColorTag = (colorToRemove) => {
    const currentColors = localData.lesion_characteristics?.color || [];
    const newColors = currentColors.filter(color => color !== colorToRemove);
    const newCharacteristics = { ...localData.lesion_characteristics };
    newCharacteristics.color = newColors;
    updateField('lesion_characteristics', newCharacteristics);
  };

  // Procedure management
  const addProcedure = () => {
    const newProcedure = {
      procedure_name: "",
      custom_procedure: "",
      date_performed: "",
      results: "",
      notes: ""
    };
    const newProcedures = [...(localData.diagnostic_procedures || []), newProcedure];
    updateField('diagnostic_procedures', newProcedures);
  };

  const updateProcedure = (index, field, value) => {
    const newProcedures = [...(localData.diagnostic_procedures || [])];
    if (newProcedures[index]) {
      newProcedures[index][field] = value;
      updateField('diagnostic_procedures', newProcedures);
    }
  };

  const removeProcedure = (index) => {
    const newProcedures = (localData.diagnostic_procedures || []).filter((_, i) => i !== index);
    updateField('diagnostic_procedures', newProcedures);
  };

  // Product management
  const addProduct = () => {
    const newProduct = {
      product_name: "",
      brand: "",
      usage_instructions: "",
      frequency: ""
    };
    const currentProducts = localData.skincare_recommendations?.products || [];
    const newProducts = [...currentProducts, newProduct];
    const newRecommendations = { ...localData.skincare_recommendations };
    newRecommendations.products = newProducts;
    updateField('skincare_recommendations', newRecommendations);
  };

  const updateProduct = (index, field, value) => {
    const currentProducts = localData.skincare_recommendations?.products || [];
    const newProducts = [...currentProducts];
    if (newProducts[index]) {
      newProducts[index][field] = value;
      const newRecommendations = { ...localData.skincare_recommendations };
      newRecommendations.products = newProducts;
      updateField('skincare_recommendations', newRecommendations);
    }
  };

  const removeProduct = (index) => {
    const currentProducts = localData.skincare_recommendations?.products || [];
    const newProducts = currentProducts.filter((_, i) => i !== index);
    const newRecommendations = { ...localData.skincare_recommendations };
    newRecommendations.products = newProducts;
    updateField('skincare_recommendations', newRecommendations);
  };

  const addGeneralCare = (care) => {
    const currentCare = localData.skincare_recommendations?.general_care || [];
    if (!currentCare.includes(care)) {
      const newCare = [...currentCare, care];
      const newRecommendations = { ...localData.skincare_recommendations };
      newRecommendations.general_care = newCare;
      updateField('skincare_recommendations', newRecommendations);
    }
  };

  const removeGeneralCare = (careToRemove) => {
    const currentCare = localData.skincare_recommendations?.general_care || [];
    const newCare = currentCare.filter(care => care !== careToRemove);
    const newRecommendations = { ...localData.skincare_recommendations };
    newRecommendations.general_care = newCare;
    updateField('skincare_recommendations', newRecommendations);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl">
      {/* Header */}
      <div className="text-center pb-6 border-b border-teal-200">
        <h3 className="text-3xl font-bold text-teal-800 mb-2">Dermatology Assessment</h3>
        <p className="text-teal-600">Comprehensive skin examination documentation</p>
      </div>

      {/* Basic Lesion Information */}
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-2 border-teal-100 rounded-2xl shadow-lg">
        <h4 className="text-xl font-semibold text-teal-700 flex items-center gap-3 mb-6">
          <Eye className="h-6 w-6 text-teal-600" />
          Lesion Assessment
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Lesion Description</label>
              <Textarea
                placeholder="Describe the lesions in detail..."
                value={localData.lesion_description || ""}
                onChange={(e) => updateField('lesion_description', e.target.value)}
                className="bg-white/90 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl min-h-32 p-4 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Distribution Pattern</label>
              <CustomDropdown
                value={localData.distribution}
                options={DISTRIBUTION_OPTIONS}
                onChange={(value) => updateField('distribution', value)}
                placeholder="Select distribution pattern..."
                dropdownKey="distribution"
                allowCustom={true}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Skin Color Changes</label>
              <CustomDropdown
                value={localData.skin_color_changes}
                options={SKIN_COLOR_CHANGES_OPTIONS}
                onChange={(value) => updateField('skin_color_changes', value)}
                placeholder="Select skin color changes..."
                dropdownKey="skin_color_changes"
                allowCustom={true}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Affected Areas */}
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-2 border-teal-100 rounded-2xl shadow-lg">
        <h4 className="text-xl font-semibold text-teal-700 mb-6">Affected Body Areas</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {AFFECTED_AREAS_OPTIONS.map((area) => (
            <Button
              key={area}
              type="button"
              variant={localData.affected_areas?.includes(area) ? "default" : "outline"}
              onClick={() => toggleArrayItem('affected_areas', area)}
              className={`text-sm py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                localData.affected_areas?.includes(area)
                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg border-0'
                  : 'bg-white/90 hover:bg-teal-50 border-2 border-teal-200 text-teal-700 hover:border-teal-300'
              }`}
            >
              {area.charAt(0).toUpperCase() + area.slice(1).replace('_', ' ')}
            </Button>
          ))}
        </div>
        
        {localData.affected_areas?.includes('other') && (
          <div className="mt-6">
            <Input
              placeholder="Specify other affected area..."
              value={localData.custom_affected_area || ""}
              onChange={(e) => updateField('custom_affected_area', e.target.value)}
              className="bg-white/90 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl p-4"
            />
          </div>
        )}
      </Card>

      {/* Lesion Characteristics */}
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-2 border-indigo-100 rounded-2xl shadow-lg">
        <h4 className="text-xl font-semibold text-indigo-700 mb-6">Detailed Lesion Characteristics</h4>
        
        {/* Morphology */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-gray-700 mb-4 block">Morphology</label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {MORPHOLOGY_OPTIONS.map((morph) => (
              <Button
                key={morph}
                type="button"
                variant={localData.lesion_characteristics?.morphology?.includes(morph) ? "default" : "outline"}
                onClick={() => toggleNestedArrayItem('lesion_characteristics', 'morphology', morph)}
                className={`text-xs py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  localData.lesion_characteristics?.morphology?.includes(morph)
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md border-0'
                    : 'bg-white/90 hover:bg-indigo-50 border-2 border-indigo-200 text-indigo-700 hover:border-indigo-300'
                }`}
              >
                {morph.charAt(0).toUpperCase() + morph.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Size */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Size</label>
            <CustomDropdown
              value={localData.lesion_characteristics?.size}
              
              options={SIZE_OPTIONS}
              onChange={(value) => {
                const newChar = { ...localData.lesion_characteristics };
                newChar.size = value;
                updateField('lesion_characteristics', newChar);
              }}
              placeholder="Select size..."
              dropdownKey="size"
              allowCustom={true}
            />
          </div>

          {/* Surface */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Surface</label>
            <CustomDropdown
              value={localData.lesion_characteristics?.surface}
              options={SURFACE_OPTIONS}
              onChange={(value) => {
                const newChar = { ...localData.lesion_characteristics };
                newChar.surface = value;
                updateField('lesion_characteristics', newChar);
              }}
              placeholder="Select surface..."
              dropdownKey="surface"
              allowCustom={true}
            />
          </div>

          {/* Border */}
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Border Characteristics</label>
            <div className="grid grid-cols-2 gap-2">
              {BORDER_OPTIONS.map((border) => (
                <Button
                  key={border.value}
                  type="button"
                  variant={localData.lesion_characteristics?.border === border.value ? "default" : "outline"}
                  onClick={() => {
                    const newChar = { ...localData.lesion_characteristics };
                    newChar.border = border.value;
                    updateField('lesion_characteristics', newChar);
                  }}
                  className={`text-sm py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    localData.lesion_characteristics?.border === border.value
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md border-0'
                      : 'bg-white/90 hover:bg-purple-50 border-2 border-purple-200 text-purple-700 hover:border-purple-300'
                  }`}
                >
                  {border.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Color */}
        <div className="mt-8">
          <label className="text-sm font-semibold text-gray-700 mb-4 block">Lesion Colors</label>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {COLOR_SUGGESTIONS.map((color) => (
                <Button
                  key={color}
                  type="button"
                  variant="outline"
                  onClick={() => addColorTag(color)}
                  className="text-sm py-2 px-4 rounded-full bg-white/90 hover:bg-rose-50 border-2 border-rose-200 text-rose-700 hover:border-rose-300 transition-all duration-200 transform hover:scale-105"
                >
                  + {color}
                </Button>
              ))}
            </div>
            
            {localData.lesion_characteristics?.color?.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {localData.lesion_characteristics.color.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 px-4 py-2 rounded-full text-sm border border-rose-300 shadow-sm"
                  >
                    <span className="font-medium">{color}</span>
                    <button
                      type="button"
                      onClick={() => removeColorTag(color)}
                      className="text-rose-600 hover:text-rose-800 transition-colors duration-150 hover:bg-rose-300 rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Descriptive Findings */}
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-2 border-teal-100 rounded-2xl shadow-lg">
        <label className="text-lg font-semibold text-teal-700 mb-4 block">Detailed Descriptive Findings</label>
        <Textarea
          placeholder="Comprehensive description of examination findings..."
          value={localData.descriptive_findings || ""}
          onChange={(e) => updateField('descriptive_findings', e.target.value)}
          className="bg-white/90 border-2 border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 rounded-xl min-h-40 p-4 text-base"
        />
      </Card>

      {/* Diagnostic Procedures */}
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-2 border-emerald-100 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-emerald-700">Diagnostic Procedures</h4>
          <Button
            type="button"
            onClick={addProcedure}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl px-6 py-3 shadow-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Add Procedure
          </Button>
        </div>

        <div className="space-y-4">
          {localData.diagnostic_procedures?.map((procedure, index) => (
            <Card key={index} className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl shadow-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <select
                    value={procedure.procedure_name || ""}
                    onChange={(e) => updateProcedure(index, 'procedure_name', e.target.value)}
                    className="flex-1 p-3 border-2 border-emerald-200 rounded-xl bg-white/90 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200"
                  >
                    <option value="">Select procedure...</option>
                    {DIAGNOSTIC_PROCEDURES.map((proc) => (
                      <option key={proc.value} value={proc.value}>
                        {proc.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeProcedure(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 ml-3 transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {procedure.procedure_name === 'other' && (
                  <Input
                    placeholder="Specify custom procedure..."
                    value={procedure.custom_procedure || ""}
                    onChange={(e) => updateProcedure(index, 'custom_procedure', e.target.value)}
                    className="bg-white/90 border-2 border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl p-3"
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Date Performed</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={procedure.date_performed || ""}
                        onChange={(e) => updateProcedure(index, 'date_performed', e.target.value)}
                        className="w-full p-3 border-2 border-emerald-200 rounded-xl bg-white/90 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                      <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Results</label>
                    <Input
                      placeholder="Procedure results..."
                      value={procedure.results || ""}
                      onChange={(e) => updateProcedure(index, 'results', e.target.value)}
                      className="bg-white/90 border-2 border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Additional Notes</label>
                  <Textarea
                    placeholder="Any additional notes about this procedure..."
                    value={procedure.notes || ""}
                    onChange={(e) => updateProcedure(index, 'notes', e.target.value)}
                    className="bg-white/90 border-2 border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl min-h-24 p-3"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Skincare Recommendations */}
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-2 border-blue-100 rounded-2xl shadow-lg">
        <h4 className="text-xl font-semibold text-blue-700 mb-6">Skincare Recommendations</h4>
        
        {/* Product Recommendations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-medium text-gray-700">Recommended Products</label>
            <Button
              type="button"
              onClick={addProduct}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl px-5 py-2 shadow-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>

          <div className="space-y-4">
            {localData.skincare_recommendations?.products?.map((product, index) => (
              <Card key={index} className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-lg font-medium text-blue-700">Product {index + 1}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeProduct(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-all duration-200"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Product Name</label>
                      <Input
                        placeholder="e.g., Moisturizing Cream"
                        value={product.product_name || ""}
                        onChange={(e) => updateProduct(index, 'product_name', e.target.value)}
                        className="bg-white/90 border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl p-3"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Brand</label>
                      <Input
                        placeholder="e.g., CeraVe, Neutrogena"
                        value={product.brand || ""}
                        onChange={(e) => updateProduct(index, 'brand', e.target.value)}
                        className="bg-white/90 border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl p-3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Usage Instructions</label>
                      <Textarea
                        placeholder="How to use this product..."
                        value={product.usage_instructions || ""}
                        onChange={(e) => updateProduct(index, 'usage_instructions', e.target.value)}
                        className="bg-white/90 border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl min-h-24 p-3"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Frequency</label>
                      <Input
                        placeholder="e.g., Twice daily, Morning only"
                        value={product.frequency || ""}
                        onChange={(e) => updateProduct(index, 'frequency', e.target.value)}
                        className="bg-white/90 border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl p-3"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* General Care Recommendations */}
        <div>
          <label className="text-lg font-medium text-gray-700 mb-4 block">General Care Instructions</label>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add general care instruction..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    addGeneralCare(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
                className="flex-1 bg-white/90 border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl p-3"
              />
              <Button
                type="button"
                onClick={(e) => {
                  const input = e.target.parentElement.querySelector('input');
                  if (input.value.trim()) {
                    addGeneralCare(input.value.trim());
                    input.value = '';
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl px-5 py-3 shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {localData.skincare_recommendations?.general_care?.length > 0 && (
              <div className="space-y-2">
                {localData.skincare_recommendations.general_care.map((care, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-xl border border-blue-300 shadow-sm"
                  >
                    <span className="font-medium">{care}</span>
                    <button
                      type="button"
                      onClick={() => removeGeneralCare(care)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-150 hover:bg-blue-300 rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Imaging Notes */}
      <Card className="p-6 bg-white/70 backdrop-blur-sm border-2 border-purple-100 rounded-2xl shadow-lg">
        <h4 className="text-xl font-semibold text-purple-700 flex items-center gap-3 mb-6">
          <Camera className="h-6 w-6 text-purple-600" />
          Imaging & Photography Notes
        </h4>
        <Textarea
          placeholder="Notes about clinical photography, dermoscopy images, or other imaging findings..."
          value={localData.imaging_notes || ""}
          onChange={(e) => updateField('imaging_notes', e.target.value)}
          className="bg-white/90 border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl min-h-32 p-4 text-base"
        />
      </Card>

      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-teal-100 to-blue-100 border-2 border-teal-200 rounded-2xl shadow-lg">
        <h4 className="text-xl font-semibold text-teal-800 mb-4">Assessment Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/70 p-4 rounded-xl border border-teal-200">
            <strong className="text-teal-700">Affected Areas:</strong>
            <p className="mt-1 text-gray-700">
              {localData.affected_areas?.length > 0 
                ? localData.affected_areas.join(', ')
                : 'None specified'
              }
            </p>
          </div>
          
          <div className="bg-white/70 p-4 rounded-xl border border-teal-200">
            <strong className="text-teal-700">Distribution:</strong>
            <p className="mt-1 text-gray-700">
              {localData.distribution || 'Not specified'}
            </p>
          </div>
          
          <div className="bg-white/70 p-4 rounded-xl border border-teal-200">
            <strong className="text-teal-700">Procedures:</strong>
            <p className="mt-1 text-gray-700">
              {localData.diagnostic_procedures?.length > 0 
                ? `${localData.diagnostic_procedures.length} procedure(s)`
                : 'None recorded'
              }
            </p>
          </div>
          
          <div className="bg-white/70 p-4 rounded-xl border border-teal-200">
            <strong className="text-teal-700">Morphology:</strong>
            <p className="mt-1 text-gray-700">
              {localData.lesion_characteristics?.morphology?.length > 0 
                ? localData.lesion_characteristics.morphology.join(', ')
                : 'Not specified'
              }
            </p>
          </div>
          
          <div className="bg-white/70 p-4 rounded-xl border border-teal-200">
            <strong className="text-teal-700">Colors:</strong>
            <p className="mt-1 text-gray-700">
              {localData.lesion_characteristics?.color?.length > 0 
                ? localData.lesion_characteristics.color.join(', ')
                : 'Not specified'
              }
            </p>
          </div>
          
          <div className="bg-white/70 p-4 rounded-xl border border-teal-200">
            <strong className="text-teal-700">Products:</strong>
            <p className="mt-1 text-gray-700">
              {localData.skincare_recommendations?.products?.length > 0 
                ? `${localData.skincare_recommendations.products.length} product(s)`
                : 'None recommended'
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}