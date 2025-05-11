
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import PatientHeader from "@/components/diagnosis/PatientHeader";
import VitalsSection from "@/components/diagnosis/VitalsSection";
import ComplaintsSection from "@/components/diagnosis/ComplaintsSection";
import DiagnosisSection from "@/components/diagnosis/DiagnosisSection";
import NextVisitSection from "@/components/diagnosis/NextVisitSection";
import PrescriptionSection from "@/components/diagnosis/PrescriptionSection";

interface Medication {
  name: string;
  dosage: string;
  pattern: string;
}

const PatientDiagnosisForm = () => {
  // Patient Details (these would typically come from props or a context in a real app)
  const patientDetails = {
    name: "John Doe",
    gender: "Male",
    id: "P-12345",
  };
  
  // State for vitals
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    bloodSugar: "",
    temperature: "",
    pulseRate: "",
    weight: "",
    height: "",
    spo2: "",
  });
  
  // State for complaints
  const [complaints, setComplaints] = useState<string[]>([]);
  
  // State for diagnosis
  const [diagnosis, setDiagnosis] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  // State for next visit
  const [nextVisitDate, setNextVisitDate] = useState<Date | undefined>(undefined);
  
  // State for medications
  const [medications, setMedications] = useState<Medication[]>([]);
  
  const handleVitalsChange = (field: string, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleAddComplaint = (complaint: string) => {
    setComplaints((prev) => [...prev, complaint]);
  };
  
  const handleRemoveComplaint = (index: number) => {
    setComplaints((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleAddMedication = (medication: Medication) => {
    setMedications((prev) => [...prev, medication]);
  };
  
  const handleRemoveMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = () => {
    // In a real app, you would submit this data to an API
    console.log({
      patientDetails,
      vitals,
      complaints,
      diagnosis,
      additionalNotes,
      nextVisitDate,
      medications,
    });
    
    toast.success("Patient diagnosis saved successfully!");
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-purple-800">Medical Record</h1>
      
      <PatientHeader 
        name={patientDetails.name}
        gender={patientDetails.gender}
        id={patientDetails.id}
      />
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <VitalsSection 
            vitals={vitals}
            onVitalsChange={handleVitalsChange}
          />
          
          <ComplaintsSection
            complaints={complaints}
            onAddComplaint={handleAddComplaint}
            onRemoveComplaint={handleRemoveComplaint}
          />
          
          <DiagnosisSection
            diagnosis={diagnosis}
            onDiagnosisChange={setDiagnosis}
            additionalNotes={additionalNotes}
            onAdditionalNotesChange={setAdditionalNotes}
          />
          
          <NextVisitSection
            nextVisitDate={nextVisitDate}
            onNextVisitDateChange={setNextVisitDate}
          />
          
          <PrescriptionSection
            medications={medications}
            onAddMedication={handleAddMedication}
            onRemoveMedication={handleRemoveMedication}
          />
          
          <div className="mt-8 flex justify-end">
            <Button 
              variant="outline" 
              className="mr-4"
              onClick={() => toast.info("Form reset")}
            >
              Cancel
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleSubmit}
            >
              Save Medical Record
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDiagnosisForm;
