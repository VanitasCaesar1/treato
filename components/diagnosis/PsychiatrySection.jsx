import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PsychiatrySection({ psychiatryData, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...psychiatryData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Mental Status Examination
          </label>
          <Textarea
            placeholder="Appearance, behavior, speech, mood, affect..."
            value={psychiatryData?.mental_status_exam || ""}
            onChange={(e) => updateField("mental_status_exam", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Cognitive Assessment
          </label>
          <Textarea
            placeholder="Orientation, memory, concentration, abstract thinking..."
            value={psychiatryData?.cognitive_assessment || ""}
            onChange={(e) => updateField("cognitive_assessment", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Mood & Affect
          </label>
          <Input
            placeholder="Current mood state and emotional expression..."
            value={psychiatryData?.mood_affect || ""}
            onChange={(e) => updateField("mood_affect", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Thought Process
          </label>
          <Input
            placeholder="Linear, tangential, circumstantial, flight of ideas..."
            value={psychiatryData?.thought_process || ""}
            onChange={(e) => updateField("thought_process", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Thought Content
          </label>
          <Textarea
            placeholder="Delusions, obsessions, phobias, suicidal ideation..."
            value={psychiatryData?.thought_content || ""}
            onChange={(e) => updateField("thought_content", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Perceptual Disturbances
          </label>
          <Textarea
            placeholder="Hallucinations (auditory, visual, etc.), illusions..."
            value={psychiatryData?.perceptual_disturbances || ""}
            onChange={(e) => updateField("perceptual_disturbances", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Risk Assessment
          </label>
          <Textarea
            placeholder="Suicide risk, violence risk, substance use..."
            value={psychiatryData?.risk_assessment || ""}
            onChange={(e) => updateField("risk_assessment", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Insight & Judgment
          </label>
          <Input
            placeholder="Patient's awareness of illness and decision-making capacity..."
            value={psychiatryData?.insight_judgment || ""}
            onChange={(e) => updateField("insight_judgment", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}