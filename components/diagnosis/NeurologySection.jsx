import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NeurologySection({ neurologyData, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...neurologyData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Neurological History
          </label>
          <Textarea
            placeholder="Previous neurological conditions, seizures, head injuries..."
            value={neurologyData?.neurological_history || ""}
            onChange={(e) => updateField("neurological_history", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Mental Status
          </label>
          <Textarea
            placeholder="Orientation, memory, attention, language..."
            value={neurologyData?.mental_status || ""}
            onChange={(e) => updateField("mental_status", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Cranial Nerves
          </label>
          <Textarea
            placeholder="CN I-XII examination findings..."
            value={neurologyData?.cranial_nerves || ""}
            onChange={(e) => updateField("cranial_nerves", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Motor Function
          </label>
          <Textarea
            placeholder="Muscle strength, tone, involuntary movements..."
            value={neurologyData?.motor_function || ""}
            onChange={(e) => updateField("motor_function", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Sensory Function
          </label>
          <Textarea
            placeholder="Touch, pain, vibration, position sense..."
            value={neurologyData?.sensory_function || ""}
            onChange={(e) => updateField("sensory_function", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Reflexes
          </label>
          <Input
            placeholder="Deep tendon reflexes, pathological reflexes..."
            value={neurologyData?.reflexes || ""}
            onChange={(e) => updateField("reflexes", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Coordination & Balance
          </label>
          <Textarea
            placeholder="Cerebellar function, gait, balance tests..."
            value={neurologyData?.coordination_balance || ""}
            onChange={(e) => updateField("coordination_balance", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Imaging & Tests
          </label>
          <Textarea
            placeholder="CT, MRI, EEG, EMG findings..."
            value={neurologyData?.imaging_tests || ""}
            onChange={(e) => updateField("imaging_tests", e.target.value)}
            className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring focus:ring-teal-100 rounded-xl min-h-24"
          />
        </div>
      </div>
    </div>
  );
}