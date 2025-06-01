// components/diagnosis/DiagnosisPage.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import DiagnosisHeader from "./DiagnosisHeader";
import DiagnosisForm from "./DiagnosisForm";
import PatientSidebar from "./PatientSidebar";
import ActionButtons from "./ActionButtons";
import SuccessAlert from "./SuccessAlert";
import { DEFAULT_DIAGNOSIS_FORM } from "./constants";

export default function DiagnosisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  
  const [loading, setLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Accordion state
  const [openSections, setOpenSections] = useState({
    vitals: true, 
    medicalHistory: false, 
    symptoms: true,
    diagnosis: false, 
    treatment: false, 
    notes: false
  });
  
  // Form state
  const [diagnosisForm, setDiagnosisForm] = useState(DEFAULT_DIAGNOSIS_FORM);

  // Fetch appointment data
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
        
        // Initialize form with appointment data
        setDiagnosisForm(prev => {
          const updatedForm = {
            ...DEFAULT_DIAGNOSIS_FORM,
            appointment_id: appointment.appointment_id || "",
            patient_id: appointment.patient_id || "",
            doctor_id: appointment.doctor_id || "",
            org_id: appointment.org_id || "",
          };
          
          if (appointment.symptoms && Array.isArray(appointment.symptoms) && appointment.symptoms.length > 0) {
            updatedForm.symptoms = appointment.symptoms.map(symptom => ({
              description: symptom.description || "",
              severity: symptom.severity || "moderate",
              onset: symptom.onset || new Date().toISOString().split('T')[0]
            }));
          }
          
          return updatedForm;
        });
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError(err.message || "Failed to load appointment information");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAppointmentData();
  }, [appointmentId]);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!appointmentId) {
      setError("Appointment ID is required");
      return;
    }
    
    setSubmitting(true);
    setSaveSuccess(false);
    
    try {
      const submissionData = {
        ...diagnosisForm,
        appointment_id: diagnosisForm.appointment_id || appointmentId,
      };
      
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create diagnosis');
      }
      
      const result = await response.json();
      setSaveSuccess(true);
      
      // Navigate after success message
      setTimeout(() => {
        router.push(`/dashboard/op/${result.diagnosis.diagnosis_id}`);
      }, 1500);
    } catch (err) {
      console.error("Error creating diagnosis:", err);
      setError(err.message || "Failed to create diagnosis");
      window.scrollTo(0, 0);
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <Skeleton className="h-12 w-3/4" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <SuccessAlert show={saveSuccess} />
      
      <DiagnosisHeader 
        patientName={appointmentData?.patient_name || "Patient"} 
        patientAge={appointmentData?.age || ""}
        patientGender={appointmentData?.gender || ""}
        onBackClick={() => router.back()}
      />
      
      <div className="flex max-w-screen-2xl mx-auto relative pb-20">
        <div className="flex-1 p-6">
          <DiagnosisForm
            diagnosisForm={diagnosisForm}
            setDiagnosisForm={setDiagnosisForm}
            openSections={openSections}
            setOpenSections={setOpenSections}
            onSubmit={handleSubmit}
          />
        </div>
        
        <PatientSidebar />
      </div>
      
      <ActionButtons 
        onCancel={() => router.back()} 
        isSubmitting={submitting} 
      />
    </div>
  );
}