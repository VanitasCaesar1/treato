import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import PrescriptionSection from "@/components/appointment/PrescriptionSection";

const TreatmentPlanSection = ({ treatment_plan = {}, onChange }) => {
  const updateTreatmentPlan = (field, value) => {
    onChange({ ...treatment_plan, [field]: value });
  };

  // Helper function to format date for display in input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Helper function to convert input date to ISO string
  const convertToISOString = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString();
    } catch {
      return null;
    }
  };

  // Helper function to convert array to text (for database storage)
  const arrayToText = (arr) => {
    if (!Array.isArray(arr)) return '';
    return arr.join('\n');
  };

  // Helper function to convert text to array
  const textToArray = (text) => {
    if (!text) return [];
    return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
  };

  return (
    <div className="space-y-6">
      {/* Medications Section */}
      <PrescriptionSection
        medications={treatment_plan.medications || []}
        onChange={(medications) => updateTreatmentPlan('medications', medications)}
      />
      
      {/* Follow-up Instructions */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Follow-up Notes
        </label>
        <Textarea
          placeholder="Follow-up care instructions and notes"
          value={treatment_plan.follow_up_notes || ''}
          onChange={(e) => updateTreatmentPlan('follow_up_notes', e.target.value)}
          className="rounded-xl border-gray-300"
          rows={4}
        />
      </div>

      {/* Follow-up Date */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Follow-up Date
        </label>
        <input
          type="date"
          value={formatDateForInput(treatment_plan.follow_up_date)}
          onChange={(e) => {
            const dateValue = e.target.value || null;
            updateTreatmentPlan('follow_up_date', dateValue);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Recommendations Section */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Recommendations
        </label>
        <Textarea
          placeholder="Enter treatment recommendations and lifestyle changes"
          value={treatment_plan.recommendations || ''}
          onChange={(e) => updateTreatmentPlan('recommendations', e.target.value)}
          className="rounded-xl border-gray-300"
          rows={4}
        />
      </div>

      {/* Procedures Section */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Procedures
        </label>
        <Textarea
          placeholder="Enter procedures (one per line)&#10;e.g., Blood test - CBC&#10;X-ray chest&#10;ECG"
          value={arrayToText(treatment_plan.procedures || [])}
          onChange={(e) => {
            const procedures = textToArray(e.target.value);
            updateTreatmentPlan('procedures', procedures);
          }}
          className="rounded-xl border-gray-300"
          rows={4}
        />
        {Array.isArray(treatment_plan.procedures) && treatment_plan.procedures.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {treatment_plan.procedures.length} procedure(s) added
          </div>
        )}
      </div>

      {/* Lab Orders Section */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Lab Orders
        </label>
        <Textarea
          placeholder="Enter lab orders (one per line)&#10;e.g., Complete Blood Count (CBC)&#10;Lipid Profile&#10;HbA1c"
          value={arrayToText(treatment_plan.lab_orders || [])}
          onChange={(e) => {
            const labOrders = textToArray(e.target.value);
            updateTreatmentPlan('lab_orders', labOrders);
          }}
          className="rounded-xl border-gray-300"
          rows={4}
        />
        {Array.isArray(treatment_plan.lab_orders) && treatment_plan.lab_orders.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {treatment_plan.lab_orders.length} lab order(s) added
          </div>
        )}
      </div>

      {/* Referrals Section */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Specialist Referrals
        </label>
        <Textarea
          placeholder="Enter specialist referrals (one per line)&#10;e.g., Cardiologist - for cardiac evaluation&#10;Neurologist - headache assessment&#10;Orthopedic - knee pain"
          value={arrayToText(treatment_plan.referrals || [])}
          onChange={(e) => {
            const referrals = textToArray(e.target.value);
            updateTreatmentPlan('referrals', referrals);
          }}
          className="rounded-xl border-gray-300"
          rows={4}
        />
        {Array.isArray(treatment_plan.referrals) && treatment_plan.referrals.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {treatment_plan.referrals.length} referral(s) added
          </div>
        )}
      </div>

      {/* Test Results Section */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Test Results
        </label>
        <Textarea
          placeholder="Enter test results and interpretation"
          value={treatment_plan.test_results_notes || ''}
          onChange={(e) => updateTreatmentPlan('test_results_notes', e.target.value)}
          className="rounded-xl border-gray-300"
          rows={4}
        />
        <div className="text-xs text-gray-500 mt-1">
          Note: Structured test results are stored separately in the test_results JSONB field
        </div>
      </div>

      {/* Clinical Notes Section */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Additional Clinical Notes
        </label>
        <Textarea
          placeholder="Additional clinical observations and notes"
          value={treatment_plan.clinical_notes || ''}
          onChange={(e) => updateTreatmentPlan('clinical_notes', e.target.value)}
          className="rounded-xl border-gray-300"
          rows={4}
        />
      </div>
    </div>
  );
};

export default TreatmentPlanSection;