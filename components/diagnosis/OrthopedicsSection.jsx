import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function OrthopedicsSection({ orthopedicsData, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...orthopedicsData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Joint Assessment
          </label>
          <Textarea
            placeholder="Joint examination findings, swelling, tenderness..."
            value={orthopedicsData?.joint_assessment || ""}
            onChange={(e) => updateField("joint_assessment", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Range of Motion
          </label>
          <Textarea
            placeholder="ROM measurements and limitations..."
            value={orthopedicsData?.range_of_motion || ""}
            onChange={(e) => updateField("range_of_motion", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Muscle Strength
          </label>
          <Input
            placeholder="Muscle strength grading (0-5 scale)..."
            value={orthopedicsData?.muscle_strength || ""}
            onChange={(e) => updateField("muscle_strength", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Deformities
          </label>
          <Input
            placeholder="Visible deformities or abnormalities..."
            value={orthopedicsData?.deformities || ""}
            onChange={(e) => updateField("deformities", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Gait Analysis
          </label>
          <Textarea
            placeholder="Gait pattern and abnormalities..."
            value={orthopedicsData?.gait_analysis || ""}
            onChange={(e) => updateField("gait_analysis", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Functional Assessment
          </label>
          <Textarea
            placeholder="Functional limitations and activities of daily living..."
            value={orthopedicsData?.functional_assessment || ""}
            onChange={(e) => updateField("functional_assessment", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Imaging Findings
        </label>
        <Textarea
          placeholder="X-ray, MRI, CT scan findings and interpretation..."
          value={orthopedicsData?.imaging_findings || ""}
          onChange={(e) => updateField("imaging_findings", e.target.value)}
          className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
        />
      </div>
    </div>
  );
}