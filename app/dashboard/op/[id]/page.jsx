"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DiagnosisPage from "@/components/appointment/DiagnosisPage";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DiagnosisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const diagnosisId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState(null);

  useEffect(() => {
    async function fetchDiagnosis() {
      if (!diagnosisId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/diagnosis/${diagnosisId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch diagnosis: ${response.status}`);
        }
        
        const data = await response.json();
        setDiagnosisData(data.diagnosis || data);
      } catch (err) {
        console.error("Error fetching diagnosis:", err);
        setError(err.message || "Failed to load diagnosis information");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDiagnosis();
  }, [diagnosisId]);

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

  // If data is loaded successfully, render the DiagnosisPage component with props
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
          <h1 className="text-xl font-bold text-gray-900">Diagnosis Details</h1>
          <div className="w-[140px]">
            {/* Space for symmetry */}
          </div>
        </div>

        {diagnosisData && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <DiagnosisPage
              diagnosisId={diagnosisId}
              appointmentId={diagnosisData.appointment_id}
              patientId={diagnosisData.patient_id}
              doctorId={diagnosisData.doctor_id}
              initialData={diagnosisData}
            />
          </div>
        )}
      </div>
    </main>
  );
}