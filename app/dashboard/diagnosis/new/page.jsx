"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, UserPlus, Save, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewDiagnosisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  
  const [loading, setLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [diagnosisForm, setDiagnosisForm] = useState({
    appointment_id: "",
    patient_id: "",
    doctor_id: "",
    org_id: "",
    vitals: {
      temperature: "",
      heart_rate: "",
      blood_pressure: "",
      respiratory_rate: "",
      oxygen_saturation: "",
      timestamp: new Date().toISOString()
    },
    symptoms: [{ description: "", severity: "moderate", onset: new Date().toISOString() }],
    diagnosis_info: [{ condition: "", code: "", notes: "" }],
    status: "draft",
    notes: "",
    treatment_plan: {
      medications: [],
      procedures: [],
      follow_up: ""
    }
  });

  // Fetch appointment data when component mounts
  useEffect(() => {
    async function fetchAppointmentData() {
      if (!appointmentId) {
        setError("No appointment ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/appointments/${appointmentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch appointment: ${response.status}`);
        }
        
        const data = await response.json();
        const appointment = data.appointment || data;
        
        setAppointmentData(appointment);
        
        // Initialize diagnosis form with appointment data
        setDiagnosisForm(prev => ({
          ...prev,
          appointment_id: appointment.appointment_id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          org_id: appointment.org_id || "org_000000000000000000000000000"
        }));
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError(err.message || "Failed to load appointment information");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAppointmentData();
  }, [appointmentId]);

  // Update form field handler
  const updateFormField = (section, field, value, index = null) => {
    setDiagnosisForm(prev => {
      // Handle nested fields like vitals
      if (section && !index && section !== "root") {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      // Handle array fields like symptoms
      else if (section && index !== null) {
        const updatedArray = [...prev[section]];
        updatedArray[index] = {
          ...updatedArray[index],
          [field]: value
        };
        
        return {
          ...prev,
          [section]: updatedArray
        };
      }
      // Handle root level fields
      else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  // Add new item to array fields
  const addItemToArray = (section) => {
    setDiagnosisForm(prev => {
      if (section === "symptoms") {
        return {
          ...prev,
          symptoms: [
            ...prev.symptoms,
            { description: "", severity: "moderate", onset: new Date().toISOString() }
          ]
        };
      }
      else if (section === "diagnosis_info") {
        return {
          ...prev,
          diagnosis_info: [
            ...prev.diagnosis_info,
            { condition: "", code: "", notes: "" }
          ]
        };
      }
      return prev;
    });
  };

  // Remove item from array fields
  const removeItemFromArray = (section, index) => {
    setDiagnosisForm(prev => {
      const updatedArray = [...prev[section]];
      updatedArray.splice(index, 1);
      
      // Don't allow empty arrays
      if (updatedArray.length === 0) {
        if (section === "symptoms") {
          updatedArray.push({ description: "", severity: "moderate", onset: new Date().toISOString() });
        }
        else if (section === "diagnosis_info") {
          updatedArray.push({ condition: "", code: "", notes: "" });
        }
      }
      
      return {
        ...prev,
        [section]: updatedArray
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosisForm),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create diagnosis');
      }
      
      const result = await response.json();
      // Navigate to the newly created diagnosis
      router.push(`/dashboard/op/${result.diagnosis.diagnosis_id}`);
    } catch (err) {
      console.error("Error creating diagnosis:", err);
      setError(err.message || "Failed to create diagnosis");
      setSubmitting(false);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <Skeleton className="h-12 w-3/4" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/appointments")}
              >
                Return to Appointments
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Button>
          <h1 className="text-xl font-bold text-gray-900">New Diagnosis</h1>
          <div className="w-[140px]">
            {/* Space for symmetry */}
          </div>
        </div>

        {appointmentData && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Appointment for {appointmentData.patient_name}
                </h2>
                <p className="text-sm text-gray-500">
                  Doctor: {appointmentData.doctor_name} • 
                  Date: {new Date(appointmentData.appointment_date).toLocaleDateString()}
                </p>
              </div>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                View Patient Profile
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="vitals" className="mb-6">
            <TabsList className="mb-6 bg-gray-100">
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
              <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
              <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vitals">
              <Card>
                <CardHeader>
                  <CardTitle>Vital Signs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Temperature (°C)</label>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="e.g. 37.0"
                        value={diagnosisForm.vitals.temperature}
                        onChange={(e) => updateFormField("vitals", "temperature", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Heart Rate (BPM)</label>
                      <Input 
                        type="number"
                        placeholder="e.g. 80"
                        value={diagnosisForm.vitals.heart_rate}
                        onChange={(e) => updateFormField("vitals", "heart_rate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Blood Pressure (mmHg)</label>
                      <Input 
                        placeholder="e.g. 120/80"
                        value={diagnosisForm.vitals.blood_pressure}
                        onChange={(e) => updateFormField("vitals", "blood_pressure", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Respiratory Rate (breaths/min)</label>
                      <Input 
                        type="number"
                        placeholder="e.g. 16"
                        value={diagnosisForm.vitals.respiratory_rate}
                        onChange={(e) => updateFormField("vitals", "respiratory_rate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Oxygen Saturation (%)</label>
                      <Input 
                        type="number"
                        placeholder="e.g. 98"
                        value={diagnosisForm.vitals.oxygen_saturation}
                        onChange={(e) => updateFormField("vitals", "oxygen_saturation", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="symptoms">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Symptoms</CardTitle>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => addItemToArray("symptoms")}
                  >
                    Add Symptom
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {diagnosisForm.symptoms.map((symptom, index) => (
                    <div key={index} className="flex flex-col gap-4 p-4 border border-gray-200 rounded-md relative">
                      {diagnosisForm.symptoms.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-red-500"
                          onClick={() => removeItemFromArray("symptoms", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                          placeholder="Describe the symptom"
                          value={symptom.description}
                          onChange={(e) => updateFormField("symptoms", "description", e.target.value, index)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Severity</label>
                          <select 
                            className="w-full rounded-md border border-gray-300 p-2"
                            value={symptom.severity}
                            onChange={(e) => updateFormField("symptoms", "severity", e.target.value, index)}
                          >
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Onset Date</label>
                          <Input 
                            type="date"
                            value={symptom.onset.split('T')[0]}
                            onChange={(e) => updateFormField(
                              "symptoms", 
                              "onset", 
                              `${e.target.value}T00:00:00.000Z`, 
                              index
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="diagnosis">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Diagnosis Information</CardTitle>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => addItemToArray("diagnosis_info")}
                  >
                    Add Diagnosis
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {diagnosisForm.diagnosis_info.map((diagnosis, index) => (
                    <div key={index} className="flex flex-col gap-4 p-4 border border-gray-200 rounded-md relative">
                      {diagnosisForm.diagnosis_info.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-red-500"
                          onClick={() => removeItemFromArray("diagnosis_info", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Condition</label>
                          <Input 
                            placeholder="e.g. Hypertension"
                            value={diagnosis.condition}
                            onChange={(e) => updateFormField("diagnosis_info", "condition", e.target.value, index)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Diagnostic Code</label>
                          <Input 
                            placeholder="e.g. I10"
                            value={diagnosis.code}
                            onChange={(e) => updateFormField("diagnosis_info", "code", e.target.value, index)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Additional Notes</label>
                        <Textarea 
                          placeholder="Additional diagnostic notes"
                          value={diagnosis.notes}
                          onChange={(e) => updateFormField("diagnosis_info", "notes", e.target.value, index)}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="mt-4">
                    <label className="text-sm font-medium block mb-2">Diagnosis Status</label>
                    <select 
                      className="w-full md:w-1/3 rounded-md border border-gray-300 p-2"
                      value={diagnosisForm.status}
                      onChange={(e) => updateFormField("root", "status", e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="finalized">Finalized</option>
                      <option value="amended">Amended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="treatment">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Follow-up Instructions</label>
                      <Textarea 
                        placeholder="Follow-up instructions for the patient"
                        value={diagnosisForm.treatment_plan.follow_up}
                        onChange={(e) => updateFormField("treatment_plan", "follow_up", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Any additional notes for this diagnosis"
                    className="min-h-[200px]"
                    value={diagnosisForm.notes}
                    onChange={(e) => updateFormField("root", "notes", e.target.value)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4 mt-6">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Skeleton className="h-4 w-4 rounded-full mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Diagnosis
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}