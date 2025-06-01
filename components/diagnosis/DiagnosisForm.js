// components/diagnosis/DiagnosisForm.js
import { Textarea } from "@/components/ui/textarea";
import SectionCard from "./SectionCard";
import VitalsSection from "./VitalsSection";
import SymptomsSection from "./SymptomsSection";
import DiagnosisSection from "./DiagnosisSection";
import PrescriptionSection from "@/components/appointment/PrescriptionSection";
import { SECTIONS_CONFIG } from "./constants";
import { useFormHandlers } from "./hooks/useFormHandlers";

export default function DiagnosisForm({ 
  diagnosisForm, 
  setDiagnosisForm, 
  openSections, 
  setOpenSections, 
  onSubmit 
}) {
  const { updateFormField, arrayOperations, addSuggestedSymptom } = useFormHandlers(
    diagnosisForm, 
    setDiagnosisForm
  );

  // Toggle accordion section
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <form id="diagnosis-form" onSubmit={onSubmit} className="space-y-6">
      {/* Vitals Section */}
      <SectionCard 
        config={SECTIONS_CONFIG.vitals}
        isOpen={openSections.vitals}
        onToggle={() => toggleSection('vitals')}
      >
        <VitalsSection 
          vitals={diagnosisForm.vitals || {}} 
          onChange={(field, value) => updateFormField(`vitals.${field}`, value)} 
        />
      </SectionCard>
      
      {/* Symptoms Section */}
      <SectionCard 
        config={SECTIONS_CONFIG.symptoms}
        isOpen={openSections.symptoms}
        onToggle={() => toggleSection('symptoms')}
      >
        <SymptomsSection 
          symptoms={diagnosisForm.symptoms || []} 
          updateSymptom={(field, value, index) => updateFormField(`symptoms.${field}`, value, index)}
          addSymptom={() => arrayOperations.add("symptoms")}
          removeSymptom={index => arrayOperations.remove("symptoms", index)}
          addSuggestion={addSuggestedSymptom}
        />
      </SectionCard>
      
      {/* Medical History Section */}
      <SectionCard 
        config={SECTIONS_CONFIG.medicalHistory}
        isOpen={openSections.medicalHistory}
        onToggle={() => toggleSection('medicalHistory')}
      >
        <Textarea 
          placeholder="Enter relevant medical history details"
          className="min-h-32 resize-y rounded-xl border-purple-200 focus:border-purple-300 focus:ring focus:ring-purple-100 transition-colors"
          value={diagnosisForm.medical_history?.notes || ""}
          onChange={(e) => updateFormField("medical_history.notes", e.target.value)}
        />
      </SectionCard>
      
      {/* Diagnosis Section */}
      <SectionCard 
        config={SECTIONS_CONFIG.diagnosis}
        isOpen={openSections.diagnosis}
        onToggle={() => toggleSection('diagnosis')}
      >
        <DiagnosisSection 
          diagnoses={diagnosisForm.diagnosis_info || []}
          updateDiagnosis={(field, value, index) => updateFormField(`diagnosis_info.${field}`, value, index)}
          addDiagnosis={() => arrayOperations.add("diagnosis_info")}
          removeDiagnosis={index => arrayOperations.remove("diagnosis_info", index)}
          status={diagnosisForm.status || "draft"}
          onStatusChange={(value) => updateFormField("root.status", value)}
        />
      </SectionCard>
      
      {/* Prescription Section */}
      <SectionCard 
        config={SECTIONS_CONFIG.treatment}
        isOpen={openSections.treatment}
        onToggle={() => toggleSection('treatment')}
      >
        <PrescriptionSection 
          treatmentPlan={diagnosisForm.treatment_plan || {}}
          updateTreatmentPlan={(field, value) => {
            setDiagnosisForm(prev => {
              const newState = JSON.parse(JSON.stringify(prev));
              if (!newState.treatment_plan) newState.treatment_plan = {};
              newState.treatment_plan[field] = value;
              return newState;
            });
          }}
        />
      </SectionCard>
      
      {/* Notes Section */}
      <SectionCard 
        config={SECTIONS_CONFIG.notes}
        isOpen={openSections.notes}
        onToggle={() => toggleSection('notes')}
      >
        <Textarea 
          placeholder="Any additional notes for this diagnosis"
          className="min-h-32 resize-y rounded-xl border-gray-200 focus:border-gray-400 focus:ring focus:ring-gray-100 transition-colors"
          value={diagnosisForm.notes || ""}
          onChange={(e) => updateFormField("root.notes", e.target.value)}
        />
      </SectionCard>
    </form>
  );
}