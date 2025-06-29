import React, { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Heart, Activity, FileText, Calculator, AlertTriangle, CheckCircle, Clock, Download, Eye, Trash2, Plus, Minus, ChevronDown, Save } from "lucide-react";

// Default form structure
const DEFAULT_CARDIO_FORM = {
  age: "",
  gender: "",
  bmi: "",
  systolic_bp: "",
  diastolic_bp: "",
  heart_rate: "",
  rhythm: "",
  chest_pain_type: "",
  chest_pain_severity: "",
  dyspnea_class: "",
  heart_sounds: "",
  murmur_grade: "",
  murmur_location: "",
  peripheral_pulses: "",
  edema_location: "",
  jvd_present: false,
  ecg_rhythm: "",
  ecg_intervals: "",
  ecg_st_changes: "",
  echo_ef: "",
  echo_wall_motion: "",
  echo_valve_findings: "",
  stress_test_type: "",
  stress_test_result: "",
  troponin: "",
  bnp: "",
  total_cholesterol: "",
  hdl_cholesterol: "",
  ldl_cholesterol: "",
  triglycerides: "",
  smoking_status: "",
  diabetes: "",
  hypertension: "",
  family_history_cad: false,
  medications: [],
  risk_factors: [],
  differential_diagnosis: [],
  working_diagnosis: "",
  assessment_notes: "",
  treatment_plan: "",
  follow_up_plan: "",
  referral_needed: false,
  referral_specialty: "",
  uploaded_files: []
};

// Cardiology-specific constants
const CHEST_PAIN_TYPES = [
  'Typical angina', 'Atypical angina', 'Non-anginal chest pain', 'Sharp/stabbing', 
  'Crushing/pressure', 'Burning', 'Pleuritic', 'Positional'
];

const NYHA_CLASSES = [
  'Class I - No symptoms', 'Class II - Slight limitation', 
  'Class III - Marked limitation', 'Class IV - Symptoms at rest'
];

const HEART_RHYTHMS = [
  'Normal sinus rhythm', 'Sinus tachycardia', 'Sinus bradycardia', 
  'Atrial fibrillation', 'Atrial flutter', 'SVT', 'Ventricular tachycardia',
  'Complete heart block', 'First degree AV block', 'Mobitz I', 'Mobitz II'
];

const MURMUR_GRADES = ['1/6', '2/6', '3/6', '4/6', '5/6', '6/6'];

const MURMUR_LOCATIONS = [
  'Aortic area', 'Pulmonic area', 'Tricuspid area', 'Mitral area', 
  'Apex', 'Left sternal border', 'Right sternal border'
];

const ECG_RHYTHMS = [
  'Normal sinus rhythm', 'Sinus arrhythmia', 'Atrial fibrillation', 
  'Atrial flutter', 'Junctional rhythm', 'Ventricular rhythm'
];

const ECG_ST_CHANGES = [
  'Normal', 'ST elevation', 'ST depression', 'T wave inversion', 
  'Q waves present', 'Poor R wave progression', 'LVH', 'RVH'
];

const WALL_MOTION_OPTIONS = [
  'Normal', 'Hypokinetic', 'Akinetic', 'Dyskinetic', 
  'Regional wall motion abnormality', 'Global hypokinesis'
];

const VALVE_FINDINGS = [
  'Normal valves', 'Aortic stenosis', 'Aortic regurgitation', 
  'Mitral stenosis', 'Mitral regurgitation', 'Tricuspid regurgitation',
  'Pulmonary stenosis', 'Bicuspid aortic valve'
];

const STRESS_TEST_TYPES = [
  'Exercise ECG', 'Exercise Echo', 'Exercise Nuclear', 
  'Dobutamine Echo', 'Adenosine Nuclear', 'Dipyridamole Nuclear'
];

const STRESS_TEST_RESULTS = [
  'Normal/Negative', 'Positive for ischemia', 'Equivocal', 
  'Non-diagnostic', 'Stopped due to symptoms', 'Poor exercise tolerance'
];

const CARDIO_RISK_FACTORS = [
  'Family history of CAD', 'Hyperlipidemia', 'Hypertension', 
  'Diabetes mellitus', 'Current smoking', 'Former smoking',
  'Obesity', 'Sedentary lifestyle', 'Chronic kidney disease',
  'Metabolic syndrome', 'Sleep apnea', 'Peripheral arterial disease'
];

const CARDIO_DIAGNOSES = [
  'Acute coronary syndrome', 'STEMI', 'NSTEMI', 'Unstable angina',
  'Stable angina', 'Heart failure with reduced EF', 'Heart failure with preserved EF',
  'Atrial fibrillation', 'Hypertensive heart disease', 'Valvular heart disease',
  'Cardiomyopathy', 'Myocarditis', 'Pericarditis', 'Pulmonary embolism'
];

const CARDIO_SPECIALTIES = [
  'Interventional Cardiology', 'Electrophysiology', 'Heart Failure',
  'Cardiac Surgery', 'Vascular Surgery', 'Pulmonology'
];

export default function AdvancedCardiologySection({ cardiologyData = DEFAULT_CARDIO_FORM, onChange }) {
  const [data, setData] = useState(cardiologyData);
  const [activeTab, setActiveTab] = useState('assessment');
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [riskScore, setRiskScore] = useState(null);
  const fileInputRef = useRef(null);

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
          className="w-full flex items-center justify-between p-3 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-300 focus:border-blue-400 transition-colors"
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

  const addMedication = () => {
    const newMed = { name: "", dosage: "", frequency: "", route: "oral" };
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

  const calculateRiskScore = () => {
    const age = parseInt(data.age) || 0;
    const systolic = parseInt(data.systolic_bp) || 120;
    const cholesterol = parseInt(data.total_cholesterol) || 200;
    const hdl = parseInt(data.hdl_cholesterol) || 50;
    const smoker = data.smoking_status === 'Current smoking';
    const diabetes = data.diabetes === 'yes';
    const hypertension = data.hypertension === 'yes';

    let score = 0;
    if (age > 40) score += (age - 40) * 0.5;
    if (systolic > 140) score += (systolic - 140) * 0.1;
    if (cholesterol > 200) score += (cholesterol - 200) * 0.05;
    if (hdl < 40) score += (40 - hdl) * 0.2;
    if (smoker) score += 10;
    if (diabetes) score += 15;
    if (hypertension) score += 8;

    const risk = Math.min(Math.max(score * 0.8, 1), 40);
    setRiskScore(risk);
  };

  const getRiskLevel = (score) => {
    if (score < 5) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
    if (score < 7.5) return { level: 'Borderline', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score < 20) return { level: 'Intermediate', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const newFiles = [];
    
    for (const file of files) {
      if (file.type.includes('image') || file.type.includes('pdf') || file.type.includes('text')) {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toLocaleString(),
          url: URL.createObjectURL(file)
        };
        newFiles.push(fileData);
      }
    }
    
    updateField('uploaded_files', [...(data.uploaded_files || []), ...newFiles]);
  };

  const removeFile = (fileId) => {
    const files = (data.uploaded_files || []).filter(f => f.id !== fileId);
    updateField('uploaded_files', files);
  };

  const tabs = [
    { id: 'assessment', label: 'Clinical Assessment', icon: Heart },
    { id: 'diagnostics', label: 'Diagnostic Tests', icon: Activity },
    { id: 'treatment', label: 'Treatment Plan', icon: Plus },
    { id: 'reports', label: 'Reports & Files', icon: FileText },
    { id: 'risk', label: 'Risk Assessment', icon: Calculator }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="p-3 bg-red-500 rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Cardiology Assessment</h3>
        </div>
        <p className="text-gray-600">Comprehensive cardiac evaluation and risk stratification</p>
      </div>

      {/* Risk Score Alert */}
      {riskScore !== null && (
        <div className={`p-4 rounded-xl border-l-4 ${getRiskLevel(riskScore).bg} border-l-current`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`w-5 h-5 ${getRiskLevel(riskScore).color}`} />
              <div>
                <span className="font-medium text-gray-800">10-Year ASCVD Risk: </span>
                <span className={`font-bold ${getRiskLevel(riskScore).color}`}>
                  {riskScore.toFixed(1)}% ({getRiskLevel(riskScore).level})
                </span>
              </div>
            </div>
            <Button onClick={calculateRiskScore} className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Recalculate
            </Button>
          </div>
        </div>
      )}

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
            <h4 className="text-lg font-semibold mb-4">Patient Demographics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <Input
                  type="number"
                  placeholder="Years"
                  value={data.age || ""}
                  onChange={(e) => updateField("age", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <CustomDropdown
                  value={data.gender}
                  options={['Male', 'Female']}
                  onChange={(value) => updateField('gender', value)}
                  placeholder="Select gender..."
                  dropdownKey="gender"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">BMI</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="kg/m²"
                  value={data.bmi || ""}
                  onChange={(e) => updateField("bmi", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Vital Signs & Cardiac Exam</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Systolic BP (mmHg)</label>
                <Input
                  type="number"
                  placeholder="120"
                  value={data.systolic_bp || ""}
                  onChange={(e) => updateField("systolic_bp", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Diastolic BP (mmHg)</label>
                <Input
                  type="number"
                  placeholder="80"
                  value={data.diastolic_bp || ""}
                  onChange={(e) => updateField("diastolic_bp", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label>
                <Input
                  type="number"
                  placeholder="72"
                  value={data.heart_rate || ""}
                  onChange={(e) => updateField("heart_rate", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rhythm</label>
                <CustomDropdown
                  value={data.rhythm}
                  options={HEART_RHYTHMS}
                  onChange={(value) => updateField('rhythm', value)}
                  placeholder="Select rhythm..."
                  dropdownKey="rhythm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Chest Pain Type</label>
                <CustomDropdown
                  value={data.chest_pain_type}
                  options={CHEST_PAIN_TYPES}
                  onChange={(value) => updateField('chest_pain_type', value)}
                  placeholder="Select chest pain type..."
                  dropdownKey="chest_pain_type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">NYHA Class</label>
                <CustomDropdown
                  value={data.dyspnea_class}
                  options={NYHA_CLASSES}
                  onChange={(value) => updateField('dyspnea_class', value)}
                  placeholder="Select NYHA class..."
                  dropdownKey="dyspnea_class"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Physical Examination</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Murmur Grade</label>
                <CustomDropdown
                  value={data.murmur_grade}
                  options={MURMUR_GRADES}
                  onChange={(value) => updateField('murmur_grade', value)}
                  placeholder="Select grade..."
                  dropdownKey="murmur_grade"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Murmur Location</label>
                <CustomDropdown
                  value={data.murmur_location}
                  options={MURMUR_LOCATIONS}
                  onChange={(value) => updateField('murmur_location', value)}
                  placeholder="Select location..."
                  dropdownKey="murmur_location"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Heart Sounds & Additional Findings</label>
                <Textarea
                  placeholder="S1, S2, S3, S4, gallops, rubs..."
                  value={data.heart_sounds || ""}
                  onChange={(e) => updateField('heart_sounds', e.target.value)}
                  className="min-h-24 bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Peripheral Examination</label>
                <Textarea
                  placeholder="Pulses, edema, JVD, clubbing..."
                  value={data.peripheral_pulses || ""}
                  onChange={(e) => updateField('peripheral_pulses', e.target.value)}
                  className="min-h-24 bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Risk Factors</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CARDIO_RISK_FACTORS.map((factor) => (
                <Button
                  key={factor}
                  type="button"
                  variant={data.risk_factors?.includes(factor) ? "default" : "outline"}
                  onClick={() => toggleArrayItem('risk_factors', factor)}
                  className="text-sm py-2 justify-start"
                >
                  {factor}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Diagnostics Tab */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">ECG Findings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ECG Rhythm</label>
                <CustomDropdown
                  value={data.ecg_rhythm}
                  options={ECG_RHYTHMS}
                  onChange={(value) => updateField('ecg_rhythm', value)}
                  placeholder="Select ECG rhythm..."
                  dropdownKey="ecg_rhythm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ST Changes</label>
                <CustomDropdown
                  value={data.ecg_st_changes}
                  options={ECG_ST_CHANGES}
                  onChange={(value) => updateField('ecg_st_changes', value)}
                  placeholder="Select ST changes..."
                  dropdownKey="ecg_st_changes"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">ECG Intervals & Additional Findings</label>
              <Textarea
                placeholder="PR interval, QRS duration, QT interval, additional findings..."
                value={data.ecg_intervals || ""}
                onChange={(e) => updateField('ecg_intervals', e.target.value)}
                className="min-h-24 bg-white border-blue-200 focus:border-blue-400"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Echocardiogram</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ejection Fraction (%)</label>
                <Input
                  type="number"
                  placeholder="55-70"
                  value={data.echo_ef || ""}
                  onChange={(e) => updateField("echo_ef", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Wall Motion</label>
                <CustomDropdown
                  value={data.echo_wall_motion}
                  options={WALL_MOTION_OPTIONS}
                  onChange={(value) => updateField('echo_wall_motion', value)}
                  placeholder="Select wall motion..."
                  dropdownKey="echo_wall_motion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valve Findings</label>
                <CustomDropdown
                  value={data.echo_valve_findings}
                  options={VALVE_FINDINGS}
                  onChange={(value) => updateField('echo_valve_findings', value)}
                  placeholder="Select valve findings..."
                  dropdownKey="echo_valve_findings"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Stress Testing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stress Test Type</label>
                <CustomDropdown
                  value={data.stress_test_type}
                  options={STRESS_TEST_TYPES}
                  onChange={(value) => updateField('stress_test_type', value)}
                  placeholder="Select test type..."
                  dropdownKey="stress_test_type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Result</label>
                <CustomDropdown
                  value={data.stress_test_result}
                  options={STRESS_TEST_RESULTS}
                  onChange={(value) => updateField('stress_test_result', value)}
                  placeholder="Select result..."
                  dropdownKey="stress_test_result"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Laboratory Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Troponin (ng/mL)</label>
                <Input
                  placeholder="< 0.04"
                  value={data.troponin || ""}
                  onChange={(e) => updateField("troponin", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">BNP (pg/mL)</label>
                <Input
                  placeholder="< 100"
                  value={data.bnp || ""}
                  onChange={(e) => updateField("bnp", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Cholesterol</label>
                <Input
                  type="number"
                  placeholder="mg/dL"
                  value={data.total_cholesterol || ""}
                  onChange={(e) => updateField("total_cholesterol", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">HDL Cholesterol</label>
                <Input
                  type="number"
                  placeholder="mg/dL"
                  value={data.hdl_cholesterol || ""}
                  onChange={(e) => updateField("hdl_cholesterol", e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
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
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                   placeholder="Medication name..."
                    value={med.name || ""}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    className="bg-white border-blue-200 focus:border-blue-400"
                  />
                  <Input
                    placeholder="Dosage..."
                    value={med.dosage || ""}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    className="bg-white border-blue-200 focus:border-blue-400"
                  />
                  <Input
                    placeholder="Frequency..."
                    value={med.frequency || ""}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    className="bg-white border-blue-200 focus:border-blue-400"
                  />
                  <CustomDropdown
                    value={med.route}
                    options={['Oral', 'IV', 'IM', 'SL', 'Topical', 'Inhaled']}
                    onChange={(value) => updateMedication(index, 'route', value)}
                    placeholder="Route..."
                    dropdownKey={`med-route-${index}`}
                  />
                </div>
              </div>
            ))}

            {(!data.medications || data.medications.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Plus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No medications added yet. Click "Add Medication" to start.</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Differential Diagnosis</h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add diagnosis..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addDiagnosis(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.parentElement.querySelector('input');
                    addDiagnosis(input.value);
                    input.value = '';
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CARDIO_DIAGNOSES.map((diagnosis) => (
                  <Button
                    key={diagnosis}
                    type="button"
                    variant={data.differential_diagnosis?.includes(diagnosis) ? "default" : "outline"}
                    onClick={() => {
                      if (data.differential_diagnosis?.includes(diagnosis)) {
                        removeDiagnosis(diagnosis);
                      } else {
                        addDiagnosis(diagnosis);
                      }
                    }}
                    className="text-sm py-2 justify-start"
                  >
                    {diagnosis}
                  </Button>
                ))}
              </div>

              {data.differential_diagnosis?.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Selected Diagnoses:</h5>
                  <div className="flex flex-wrap gap-2">
                    {data.differential_diagnosis.map((diagnosis) => (
                      <div
                        key={diagnosis}
                        className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {diagnosis}
                        <button
                          type="button"
                          onClick={() => removeDiagnosis(diagnosis)}
                          className="hover:bg-blue-200 rounded-full p-1"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Working Diagnosis & Assessment</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Working Diagnosis</label>
                <Input
                  placeholder="Primary diagnosis..."
                  value={data.working_diagnosis || ""}
                  onChange={(e) => updateField('working_diagnosis', e.target.value)}
                  className="bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Assessment Notes</label>
                <Textarea
                  placeholder="Clinical reasoning, severity assessment, prognosis..."
                  value={data.assessment_notes || ""}
                  onChange={(e) => updateField('assessment_notes', e.target.value)}
                  className="min-h-32 bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Treatment Plan</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Treatment Plan</label>
                <Textarea
                  placeholder="Acute management, interventions, lifestyle modifications..."
                  value={data.treatment_plan || ""}
                  onChange={(e) => updateField('treatment_plan', e.target.value)}
                  className="min-h-32 bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Follow-up Plan</label>
                <Textarea
                  placeholder="Follow-up timeline, monitoring plan, repeat testing..."
                  value={data.follow_up_plan || ""}
                  onChange={(e) => updateField('follow_up_plan', e.target.value)}
                  className="min-h-24 bg-white border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Referrals</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="referral-needed"
                  checked={data.referral_needed || false}
                  onChange={(e) => updateField('referral_needed', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="referral-needed" className="text-sm font-medium">
                  Referral needed
                </label>
              </div>
              
              {data.referral_needed && (
                <div>
                  <label className="block text-sm font-medium mb-2">Referral Specialty</label>
                  <CustomDropdown
                    value={data.referral_specialty}
                    options={CARDIO_SPECIALTIES}
                    onChange={(value) => updateField('referral_specialty', value)}
                    placeholder="Select specialty..."
                    dropdownKey="referral_specialty"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Reports & Files Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">File Upload</h4>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                Drop files here or click "Upload Files" to add ECGs, reports, images
              </p>
              <p className="text-sm text-gray-500">
                Supports: Images, PDFs, Text documents
              </p>
            </div>

            {data.uploaded_files?.length > 0 && (
              <div className="mt-6">
                <h5 className="font-medium mb-3">Uploaded Files ({data.uploaded_files.length})</h5>
                <div className="space-y-2">
                  {data.uploaded_files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • {file.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Generate Reports</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="flex items-center gap-2 justify-center h-12">
                <FileText className="h-5 w-5" />
                Clinical Summary Report
              </Button>
              <Button className="flex items-center gap-2 justify-center h-12">
                <Download className="h-5 w-5" />
                Discharge Summary
              </Button>
              <Button className="flex items-center gap-2 justify-center h-12">
                <Calculator className="h-5 w-5" />
                Risk Assessment Report
              </Button>
              <Button className="flex items-center gap-2 justify-center h-12">
                <Activity className="h-5 w-5" />
                Test Results Summary
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Risk Assessment Tab */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Cardiovascular Risk Assessment</h4>
              <Button onClick={calculateRiskScore} className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculate Risk
              </Button>
            </div>

            {riskScore !== null && (
              <div className="space-y-4">
                <div className={`p-6 rounded-xl ${getRiskLevel(riskScore).bg}`}>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2 text-gray-800">
                      {riskScore.toFixed(1)}%
                    </div>
                    <div className={`text-lg font-semibold ${getRiskLevel(riskScore).color}`}>
                      {getRiskLevel(riskScore).level} Risk
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      10-Year ASCVD Risk Estimate
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium">Risk Factors Present:</h5>
                    <ul className="text-sm space-y-1">
                      {data.age && parseInt(data.age) > 40 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-orange-500" />
                          Age: {data.age} years
                        </li>
                      )}
                      {data.systolic_bp && parseInt(data.systolic_bp) > 140 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-red-500" />
                          Hypertension: {data.systolic_bp} mmHg
                        </li>
                      )}
                      {data.smoking_status === 'Current smoking' && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-red-500" />
                          Current smoker
                        </li>
                      )}
                      {data.diabetes === 'yes' && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-red-500" />
                          Diabetes mellitus
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Recommendations:</h5>
                    <ul className="text-sm space-y-1">
                      {riskScore < 5 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Lifestyle modifications
                        </li>
                      )}
                      {riskScore >= 5 && riskScore < 7.5 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-yellow-500" />
                          Consider statin therapy
                        </li>
                      )}
                      {riskScore >= 7.5 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-red-500" />
                          Statin therapy recommended
                        </li>
                      )}
                      {riskScore >= 20 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-red-500" />
                          Aggressive risk reduction
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Risk Factors Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-red-600">Major Risk Factors</h5>
                <div className="space-y-1 text-sm">
                  {data.risk_factors?.filter(factor => 
                    ['Family history of CAD', 'Hyperlipidemia', 'Hypertension', 'Diabetes mellitus', 'Current smoking'].includes(factor)
                  ).map(factor => (
                    <div key={factor} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-red-500" />
                      {factor}
                    </div>
                  )) || <p className="text-gray-500">None identified</p>}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-orange-600">Modifiable Factors</h5>
                <div className="space-y-1 text-sm">
                  {data.risk_factors?.filter(factor => 
                    ['Obesity', 'Sedentary lifestyle', 'Former smoking'].includes(factor)
                  ).map(factor => (
                    <div key={factor} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-orange-500" />
                      {factor}
                    </div>
                  )) || <p className="text-gray-500">None identified</p>}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-blue-600">Other Factors</h5>
                <div className="space-y-1 text-sm">
                  {data.risk_factors?.filter(factor => 
                    !['Family history of CAD', 'Hyperlipidemia', 'Hypertension', 'Diabetes mellitus', 'Current smoking', 'Obesity', 'Sedentary lifestyle', 'Former smoking'].includes(factor)
                  ).map(factor => (
                    <div key={factor} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-blue-500" />
                      {factor}
                    </div>
                  )) || <p className="text-gray-500">None identified</p>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-center">
        <Button className="flex items-center gap-2 px-8 py-3 text-lg">
          <Save className="h-5 w-5" />
          Save Assessment
        </Button>
      </div>
    </div>
  );
}