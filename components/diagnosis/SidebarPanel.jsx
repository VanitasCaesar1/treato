// components/diagnosis/SidebarPanel.js
import React from 'react';
import { FileText, Wrench } from "lucide-react";
import MedicalHistory from "@/components/diagnosis/MedicalHistory";

const SidebarPanel = ({ patientId }) => {
  return (
    <div className="space-y-6">
      {/* Medical History Section */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border-2 border-gray-100">
        <div className="p-5 bg-gray-50 rounded-t-2xl border-b-2 border-gray-100">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/80 shadow-sm">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            Medical History
          </h3>
        </div>
        <div className="p-6">
          <MedicalHistory patientId={patientId} />
        </div>
      </div>

      {/* Action Buttons Panel */}
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border-2 border-gray-100 p-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/80 shadow-sm">
            <Wrench className="h-5 w-5 text-gray-600" />
          </div>
          Quick Actions
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Quick actions and tools will be available here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SidebarPanel;