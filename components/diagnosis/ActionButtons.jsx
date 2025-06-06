// components/diagnosis/ActionButtons.js
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Save, Download, Printer, FileText 
} from "lucide-react";

const ActionButtons = ({ 
  onBack, 
  onSave, 
  onDownloadPDF, 
  onPrint, 
  onCreatePrintablePage,
  submitting,
  form
}) => {
  const validateRequiredData = () => {
    if (!form.diagnosis_info[0]?.condition) {
      alert('Please add at least one diagnosis before generating prescription.');
      return false;
    }
    return true;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-gray-100 p-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="rounded-xl border-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-3">
          {/* Download PDF Button */}
          <Button
            onClick={() => {
              if (validateRequiredData()) {
                onDownloadPDF();
              }
            }}
            variant="outline"
            className="rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50"
            disabled={submitting}
            title="Download prescription as HTML file"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          {/* Print Button */}
          <Button
            onClick={() => {
              if (validateRequiredData()) {
                onPrint();
              }
            }}
            variant="outline"
            className="rounded-xl border-purple-300 text-purple-600 hover:bg-purple-50"
            disabled={submitting}
            title="Print prescription"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          {/* Alternative Print Button */}
          <Button
            onClick={() => {
              if (validateRequiredData()) {
                onCreatePrintablePage();
              }
            }}
            variant="outline"
            className="rounded-xl border-green-300 text-green-600 hover:bg-green-50"
            disabled={submitting}
            title="Alternative print method"
          >
            <FileText className="h-4 w-4 mr-2" />
            Print Alt
          </Button>
          
          {/* Save Button */}
          <Button
            onClick={onSave}
            disabled={submitting}
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-8"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
      </div>
    </div>
  );
};

export default ActionButtons;