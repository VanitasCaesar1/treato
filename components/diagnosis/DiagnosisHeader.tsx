// components/diagnosis/DiagnosisHeader.js
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DiagnosisHeader({ 
  patientName, 
  patientAge, 
  patientGender, 
  onBackClick 
}) {
  return (
    <header className="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 shadow-sm backdrop-blur-lg bg-white/90">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="mr-4 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" /> {patientName}
          </h1>
          <p className="text-sm text-gray-500">
            {patientAge && `${patientAge}y`} {patientGender && `| ${patientGender.charAt(0).toUpperCase()}`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          variant="outline" 
          className="rounded-full px-5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 hover:bg-blue-100 transition-all shadow-sm"
        >
          Patient overview
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full px-5 py-2 border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 hover:bg-emerald-100 transition-all shadow-sm"
        >
          Prescription Pad
        </Button>
      </div>
    </header>
  );
}