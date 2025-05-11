
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VitalsSectionProps {
  onVitalsChange: (field: string, value: string) => void;
  vitals: {
    bloodPressure: string;
    bloodSugar: string;
    temperature: string;
    pulseRate: string;
    weight: string;
    height: string;
    spo2: string;
  };
}

const VitalsSection = ({ onVitalsChange, vitals }: VitalsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="bloodPressure">Blood Pressure</Label>
        <Input
          id="bloodPressure"
          placeholder="120/80 mmHg"
          value={vitals.bloodPressure}
          onChange={(e) => onVitalsChange("bloodPressure", e.target.value)}
          className="bg-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bloodSugar">Blood Sugar</Label>
        <Input
          id="bloodSugar"
          placeholder="mg/dL"
          value={vitals.bloodSugar}
          onChange={(e) => onVitalsChange("bloodSugar", e.target.value)}
          className="bg-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="temperature">Temperature</Label>
        <Input
          id="temperature"
          placeholder="°F"
          value={vitals.temperature}
          onChange={(e) => onVitalsChange("temperature", e.target.value)}
          className="bg-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="pulseRate">Pulse Rate</Label>
        <Input
          id="pulseRate"
          placeholder="bpm"
          value={vitals.pulseRate}
          onChange={(e) => onVitalsChange("pulseRate", e.target.value)}
          className="bg-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="weight">Weight</Label>
        <Input
          id="weight"
          placeholder="kg"
          value={vitals.weight}
          onChange={(e) => onVitalsChange("weight", e.target.value)}
          className="bg-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="height">Height</Label>
        <Input
          id="height"
          placeholder="cm"
          value={vitals.height}
          onChange={(e) => onVitalsChange("height", e.target.value)}
          className="bg-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="spo2">SpO2</Label>
        <Input
          id="spo2"
          placeholder="%"
          value={vitals.spo2}
          onChange={(e) => onVitalsChange("spo2", e.target.value)}
          className="bg-white"
        />
      </div>
    </div>
  );
};

export default VitalsSection;