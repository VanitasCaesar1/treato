import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DiagnosisSectionProps {
  diagnosis: string;
  onDiagnosisChange: (value: string) => void;
  additionalNotes: string;
  onAdditionalNotesChange: (value: string) => void;
}

const commonDiagnoses = [
  "Hypertension",
  "Type 2 Diabetes",
  "Acute Bronchitis",
  "Migraine",
  "Osteoarthritis",
  "Gastroesophageal Reflux Disease (GERD)",
  "Urinary Tract Infection",
  "Allergic Rhinitis",
];

const DiagnosisSection = ({ 
  diagnosis, 
  onDiagnosisChange,
  additionalNotes,
  onAdditionalNotesChange
}: DiagnosisSectionProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="diagnosis" className="text-lg font-medium">
          Diagnosis
        </Label>
        <div className="flex flex-col space-y-3">
          <Select 
            value={diagnosis} 
            onValueChange={onDiagnosisChange}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select or type diagnosis" />
            </SelectTrigger>
            <SelectContent>
              {commonDiagnoses.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="diagnosis"
            placeholder="Or type custom diagnosis"
            value={diagnosis}
            onChange={(e) => onDiagnosisChange(e.target.value)}
            className="bg-white"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="additionalNotes" className="text-lg font-medium">
          Additional Notes & Instructions
        </Label>
        <Textarea
          id="additionalNotes"
          placeholder="Enter additional notes and instructions..."
          rows={4}
          value={additionalNotes}
          onChange={(e) => onAdditionalNotesChange(e.target.value)}
          className="bg-white resize-none"
        />
      </div>
    </div>
  );
};

export default DiagnosisSection;