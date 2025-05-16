import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

export default function DiagnosisPage({ appointmentId, patientId, doctorId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState({
    appointment_id: appointmentId || "",
    patient_id: patientId || "",
    doctor_id: doctorId || "",
    vitals: {
      blood_pressure: "",
      heart_rate: "",
      temperature: "",
      blood_sugar: "",
      weight: "",
      height: "",
      timestamp: new Date().toISOString(),
    },
    symptoms: [],
    diagnosis_info: [],
    history: {
      medical_history: "",
      family_history: "",
      allergies: "",
    },
    status: "draft",
    treatment_plan: {
      medications: [],
      procedures: [],
      follow_up: "",
    },
    lab_diagnostics: {
      tests_ordered: [],
      results: [],
    },
    notes: "",
    specialization: {
      name: "",
      doctor_specialty: "",
    },
  });

  // Function to handle vitals input change
  const handleVitalsChange = (field, value) => {
    setDiagnosisData({
      ...diagnosisData,
      vitals: {
        ...diagnosisData.vitals,
        [field]: value,
      },
    });
  };

  // Function to handle history input change
  const handleHistoryChange = (field, value) => {
    setDiagnosisData({
      ...diagnosisData,
      history: {
        ...diagnosisData.history,
        [field]: value,
      },
    });
  };

  // Function to handle adding symptoms
  const handleAddSymptom = () => {
    const symptomText = document.getElementById("symptom-input").value;
    const severity = document.getElementById("symptom-severity").value;
    
    if (symptomText.trim()) {
      setDiagnosisData({
        ...diagnosisData,
        symptoms: [
          ...diagnosisData.symptoms,
          {
            description: symptomText,
            severity: severity,
            onset: new Date().toISOString(),
          },
        ],
      });
      document.getElementById("symptom-input").value = "";
      toast.success("Symptom added successfully");
    } else {
      toast.error("Please enter symptom description");
    }
  };

  // Function to handle adding diagnosis information
  const handleAddDiagnosis = () => {
    const diagnosisText = document.getElementById("diagnosis-input").value;
    const diagnosisCode = document.getElementById("diagnosis-code").value;
    
    if (diagnosisText.trim()) {
      setDiagnosisData({
        ...diagnosisData,
        diagnosis_info: [
          ...diagnosisData.diagnosis_info,
          {
            condition: diagnosisText,
            code: diagnosisCode || "N/A",
            diagnosed_at: new Date().toISOString(),
          },
        ],
      });
      document.getElementById("diagnosis-input").value = "";
      document.getElementById("diagnosis-code").value = "";
      toast.success("Diagnosis added successfully");
    } else {
      toast.error("Please enter diagnosis information");
    }
  };

  // Function to handle treatment plan changes
  const handleTreatmentChange = (field, value) => {
    setDiagnosisData({
      ...diagnosisData,
      treatment_plan: {
        ...diagnosisData.treatment_plan,
        [field]: value,
      },
    });
  };

  // Function to handle adding medication to treatment plan
  const handleAddMedication = () => {
    const medicationName = document.getElementById("medication-name").value;
    const dosage = document.getElementById("medication-dosage").value;
    
    if (medicationName.trim()) {
      setDiagnosisData({
        ...diagnosisData,
        treatment_plan: {
          ...diagnosisData.treatment_plan,
          medications: [
            ...diagnosisData.treatment_plan.medications,
            {
              name: medicationName,
              dosage: dosage,
              instructions: document.getElementById("medication-instructions").value,
            },
          ],
        },
      });
      document.getElementById("medication-name").value = "";
      document.getElementById("medication-dosage").value = "";
      document.getElementById("medication-instructions").value = "";
      toast.success("Medication added successfully");
    } else {
      toast.error("Please enter medication name");
    }
  };

  // Function to handle lab tests
  const handleAddLabTest = () => {
    const testName = document.getElementById("lab-test-name").value;
    
    if (testName.trim()) {
      setDiagnosisData({
        ...diagnosisData,
        lab_diagnostics: {
          ...diagnosisData.lab_diagnostics,
          tests_ordered: [
            ...diagnosisData.lab_diagnostics.tests_ordered,
            {
              name: testName,
              ordered_at: new Date().toISOString(),
            },
          ],
        },
      });
      document.getElementById("lab-test-name").value = "";
      toast.success("Lab test added successfully");
    } else {
      toast.error("Please enter test name");
    }
  };

  // Function to handle form submission
  const handleSubmit = async (finalStatus) => {
    try {
      setIsLoading(true);
      // Update status before submission if provided
      const dataToSubmit = {
        ...diagnosisData,
        status: finalStatus || diagnosisData.status,
      };
      
      // Validate required fields
      if (!dataToSubmit.appointment_id) {
        toast.error("Appointment ID is required");
        setIsLoading(false);
        return;
      }
      
      if (!dataToSubmit.patient_id) {
        toast.error("Patient ID is required");
        setIsLoading(false);
        return;
      }
      
      if (!dataToSubmit.doctor_id) {
        toast.error("Doctor ID is required");
        setIsLoading(false);
        return;
      }
      
      if (dataToSubmit.symptoms.length === 0) {
        toast.error("At least one symptom is required");
        setIsLoading(false);
        return;
      }
      
      if (dataToSubmit.diagnosis_info.length === 0) {
        toast.error("At least one diagnosis is required");
        setIsLoading(false);
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Saving diagnosis...");

      // Submit diagnosis data to API
      const response = await fetch("/api/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create diagnosis");
      }

      const result = await response.json();
      
      toast.success("Diagnosis has been saved successfully", {
        duration: 5000,
        icon: '🎉',
      });
      
      // Reset form or redirect as needed
      // window.location.href = `/diagnoses/${result.diagnosis.diagnosis_id}`;
      
    } catch (error) {
      toast.error(error.message, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Patient Diagnosis</h1>
      
      <Card className="shadow-lg mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input 
                id="patient-id" 
                value={diagnosisData.patient_id}
                onChange={(e) => setDiagnosisData({...diagnosisData, patient_id: e.target.value})}
                placeholder="8-digit alphanumeric format" 
              />
            </div>
            <div>
              <Label htmlFor="appointment-id">Appointment ID</Label>
              <Input 
                id="appointment-id" 
                value={diagnosisData.appointment_id}
                onChange={(e) => setDiagnosisData({...diagnosisData, appointment_id: e.target.value})}
                placeholder="UUID format" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="doctor-id">Doctor ID</Label>
              <Input 
                id="doctor-id" 
                value={diagnosisData.doctor_id}
                onChange={(e) => setDiagnosisData({...diagnosisData, doctor_id: e.target.value})}
                placeholder="UUID format" 
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={diagnosisData.status} 
                onValueChange={(value) => setDiagnosisData({...diagnosisData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                  <SelectItem value="amended">Amended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Accordion type="single" collapsible className="w-full mb-6">
        {/* Vitals Section */}
        <AccordionItem value="vitals">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-lg font-semibold">Vitals</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blood-pressure">Blood Pressure</Label>
                <Input
                  id="blood-pressure"
                  value={diagnosisData.vitals.blood_pressure}
                  onChange={(e) => handleVitalsChange("blood_pressure", e.target.value)}
                  placeholder="e.g., 120/80 mmHg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heart-rate">Heart Rate</Label>
                <Input
                  id="heart-rate"
                  value={diagnosisData.vitals.heart_rate}
                  onChange={(e) => handleVitalsChange("heart_rate", e.target.value)}
                  placeholder="e.g., 72 bpm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  value={diagnosisData.vitals.temperature}
                  onChange={(e) => handleVitalsChange("temperature", e.target.value)}
                  placeholder="e.g., 98.6 °F"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood-sugar">Blood Sugar</Label>
                <Input
                  id="blood-sugar"
                  value={diagnosisData.vitals.blood_sugar}
                  onChange={(e) => handleVitalsChange("blood_sugar", e.target.value)}
                  placeholder="e.g., 90 mg/dL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  value={diagnosisData.vitals.weight}
                  onChange={(e) => handleVitalsChange("weight", e.target.value)}
                  placeholder="e.g., 70 kg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={diagnosisData.vitals.height}
                  onChange={(e) => handleVitalsChange("height", e.target.value)}
                  placeholder="e.g., 175 cm"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* History Section */}
        <AccordionItem value="history">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-lg font-semibold">History</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medical-history">Medical History</Label>
                <Textarea
                  id="medical-history"
                  value={diagnosisData.history.medical_history}
                  onChange={(e) => handleHistoryChange("medical_history", e.target.value)}
                  placeholder="Enter patient's medical history"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family-history">Family History</Label>
                <Textarea
                  id="family-history"
                  value={diagnosisData.history.family_history}
                  onChange={(e) => handleHistoryChange("family_history", e.target.value)}
                  placeholder="Enter patient's family history"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={diagnosisData.history.allergies}
                  onChange={(e) => handleHistoryChange("allergies", e.target.value)}
                  placeholder="Enter patient's allergies"
                  rows={2}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Symptoms Section */}
        <AccordionItem value="symptoms">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-lg font-semibold">Symptoms</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="symptom-input">Symptom Description</Label>
                  <Input id="symptom-input" placeholder="Enter symptom" />
                </div>
                <div>
                  <Label htmlFor="symptom-severity">Severity</Label>
                  <Select defaultValue="moderate">
                    <SelectTrigger id="symptom-severity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                type="button" 
                onClick={handleAddSymptom}
                className="w-full"
              >
                Add Symptom
              </Button>
              
              {diagnosisData.symptoms.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Added Symptoms:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnosisData.symptoms.map((symptom, index) => (
                      <li key={index}>
                        {symptom.description} - {symptom.severity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Diagnosis Section */}
        <AccordionItem value="diagnosis">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-lg font-semibold">Diagnosis</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="diagnosis-input">Condition</Label>
                  <Input id="diagnosis-input" placeholder="Enter diagnosis" />
                </div>
                <div>
                  <Label htmlFor="diagnosis-code">Code (ICD-10)</Label>
                  <Input id="diagnosis-code" placeholder="e.g., J45.9" />
                </div>
              </div>
              
              <Button 
                type="button" 
                onClick={handleAddDiagnosis}
                className="w-full"
              >
                Add Diagnosis
              </Button>
              
              {diagnosisData.diagnosis_info.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Added Diagnoses:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnosisData.diagnosis_info.map((diagnosis, index) => (
                      <li key={index}>
                        {diagnosis.condition} {diagnosis.code !== "N/A" && `(${diagnosis.code})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Treatment Plan Section */}
        <AccordionItem value="treatment">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span className="text-lg font-semibold">Treatment Plan</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medication-name">Medication</Label>
                  <Input id="medication-name" placeholder="Medication name" />
                </div>
                <div>
                  <Label htmlFor="medication-dosage">Dosage</Label>
                  <Input id="medication-dosage" placeholder="e.g., 500mg twice daily" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="medication-instructions">Instructions</Label>
                <Input id="medication-instructions" placeholder="Special instructions" />
              </div>
              
              <Button 
                type="button" 
                onClick={handleAddMedication}
                className="w-full"
              >
                Add Medication
              </Button>
              
              {diagnosisData.treatment_plan.medications.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Prescribed Medications:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {diagnosisData.treatment_plan.medications.map((med, index) => (
                      <li key={index}>
                        <strong>{med.name}</strong> - {med.dosage}
                        {med.instructions && <div className="text-sm text-gray-600">Instructions: {med.instructions}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="pt-4">
                <Label htmlFor="follow-up">Follow-up Instructions</Label>
                <Textarea
                  id="follow-up"
                  value={diagnosisData.treatment_plan.follow_up}
                  onChange={(e) => handleTreatmentChange("follow_up", e.target.value)}
                  placeholder="Enter follow-up instructions"
                  rows={3}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Lab Diagnostics Section */}
        <AccordionItem value="lab">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              <span className="text-lg font-semibold">Lab Diagnostics</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lab-test-name">Test Name</Label>
                <Input id="lab-test-name" placeholder="Enter test name" />
              </div>
              
              <Button 
                type="button" 
                onClick={handleAddLabTest}
                className="w-full"
              >
                Add Lab Test
              </Button>
              
              {diagnosisData.lab_diagnostics.tests_ordered.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Ordered Tests:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {diagnosisData.lab_diagnostics.tests_ordered.map((test, index) => (
                      <li key={index}>{test.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Notes Section */}
        <AccordionItem value="notes">
          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-lg font-semibold">Additional Notes</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4">
            <div className="space-y-4">
              <Textarea
                value={diagnosisData.notes}
                onChange={(e) => setDiagnosisData({...diagnosisData, notes: e.target.value})}
                placeholder="Enter any additional notes about the diagnosis"
                rows={5}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-4 pt-4">
        <Button 
          variant="outline" 
          onClick={() => handleSubmit("draft")}
          disabled={isLoading}
        >
          Save as Draft
        </Button>
        <Button 
          onClick={() => handleSubmit("finalized")}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Finalize Diagnosis
        </Button>
      </div>
    </div>
  );
}