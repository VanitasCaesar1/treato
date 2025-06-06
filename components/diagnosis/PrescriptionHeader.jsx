// components/diagnosis/PrescriptionHeader.js
import React from 'react';
import { Calendar, Clock, Stethoscope, User } from "lucide-react";

const PrescriptionHeader = ({ doctorData, appointmentData, form }) => {
  return (
    <div className="mb-8 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-4 border-blue-200 overflow-hidden">
      {/* Medical Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-6xl font-bold opacity-90">℞</div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Medical Prescription</h1>
              <p className="text-blue-100">Digital Health Record System</p>
            </div>
          </div>
          <div className="text-right text-sm text-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor & Patient Info */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Dr.</span> {doctorData?.name || 'Doctor Name'}</p>
              <p className="text-blue-600">{doctorData?.specialization?.primary || 'General Practice'}</p>
              <p className="text-gray-600">License: {doctorData?.license_number || 'MD-XXXX'}</p>
            </div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Name:</span> {appointmentData?.patient_name || 'Patient Name'}</p>
              <p><span className="font-semibold">ID:</span> {form.patient_id || 'N/A'}</p>
              <p><span className="font-semibold">Appointment:</span> {form.appointment_id || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionHeader;