import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CardiologySection({ cardiologyData, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...cardiologyData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Chest Pain Assessment
          </label>
          <Textarea
            placeholder="Describe chest pain characteristics, location, radiation, triggers..."
            value={cardiologyData?.chest_pain_assessment || ""}
            onChange={(e) => updateField("chest_pain_assessment", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Cardiac Rhythm
          </label>
          <Input
            placeholder="Regular, irregular, arrhythmic..."
            value={cardiologyData?.cardiac_rhythm || ""}
            onChange={(e) => updateField("cardiac_rhythm", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Heart Sounds
          </label>
          <Input
            placeholder="S1, S2, gallops, etc..."
            value={cardiologyData?.heart_sounds || ""}
            onChange={(e) => updateField("heart_sounds", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Murmurs
          </label>
          <Input
            placeholder="Systolic, diastolic, grade..."
            value={cardiologyData?.murmurs || ""}
            onChange={(e) => updateField("murmurs", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            ECG Findings
          </label>
          <Textarea
            placeholder="ECG interpretation and findings..."
            value={cardiologyData?.ecg_findings || ""}
            onChange={(e) => updateField("ecg_findings", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Echo Findings
          </label>
          <Textarea
            placeholder="Echocardiogram results and interpretation..."
            value={cardiologyData?.echo_findings || ""}
            onChange={(e) => updateField("echo_findings", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Stress Test Results
        </label>
        <Textarea
          placeholder="Exercise stress test or pharmacological stress test results..."
          value={cardiologyData?.stress_test_results || ""}
          onChange={(e) => updateField("stress_test_results", e.target.value)}
          className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
        />
      </div>
    </div>
  );
}