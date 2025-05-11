import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Medication {
  name: string;
  dosage: string;
  pattern: string;
}

interface PrescriptionSectionProps {
  medications: Medication[];
  onAddMedication: (med: Medication) => void;
  onRemoveMedication: (index: number) => void;
}

const PrescriptionSection = ({ 
  medications,
  onAddMedication,
  onRemoveMedication
}: PrescriptionSectionProps) => {
  const [newMedication, setNewMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [selectedPattern, setSelectedPattern] = useState("OD");

  const patterns = [
    { id: "OD", label: "OD (Once Daily)" },
    { id: "BD", label: "BD (Twice Daily)" },
    { id: "TDS", label: "TDS (Thrice Daily)" },
    { id: "QID", label: "QID (Four times Daily)" },
    { id: "SOS", label: "SOS (As Needed)" },
  ];

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      onAddMedication({
        name: newMedication.trim(),
        dosage: dosage.trim(),
        pattern: selectedPattern,
      });
      setNewMedication("");
      setDosage("");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Prescription</h3>
      
      <div className="space-y-4 mb-4 p-4 bg-white rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="medicationName">Medication</Label>
            <Input
              id="medicationName"
              placeholder="Search or enter medication..."
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              className="bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input
              id="dosage"
              placeholder="Enter dosage instructions..."
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Dosage Pattern</Label>
          <div className="flex flex-wrap gap-2">
            {patterns.map(pattern => (
              <Button
                key={pattern.id}
                type="button"
                variant={selectedPattern === pattern.id ? "default" : "outline"}
                size="sm"
                className={selectedPattern === pattern.id ? 
                  "bg-purple-600 hover:bg-purple-700" : 
                  "bg-white hover:bg-gray-100"
                }
                onClick={() => setSelectedPattern(pattern.id)}
              >
                {pattern.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleAddMedication}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Medication
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {medications.map((med, index) => (
          <div 
            key={index}
            className="flex justify-between items-start p-3 bg-white rounded-lg border border-l-4 border-l-purple-500"
          >
            <div>
              <div className="font-medium">{med.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="mr-3">{med.dosage}</span>
                <Badge variant="outline">{med.pattern}</Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRemoveMedication(index)}
              className="text-gray-500 hover:text-red-500 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionSection;