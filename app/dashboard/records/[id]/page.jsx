"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  AlertTriangle, 
  ArrowLeft, 
  Download, 
  Share, 
  User, 
  Calendar, 
  Clock,
  Activity,
  FileText,
  Stethoscope,
  Pill,
  TestTube,
  Heart,
  Thermometer,
  Eye,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal
} from "lucide-react";
import jsPDF from "jspdf";

const statusConfig = {
  verified: { 
    color: "bg-green-500", 
    textColor: "text-green-700", 
    bgColor: "bg-green-50", 
    icon: CheckCircle,
    label: "Verified"
  },
  pending: { 
    color: "bg-amber-500", 
    textColor: "text-amber-700", 
    bgColor: "bg-amber-50", 
    icon: AlertCircle,
    label: "Pending"
  },
  completed: { 
    color: "bg-blue-500", 
    textColor: "text-blue-700", 
    bgColor: "bg-blue-50", 
    icon: CheckCircle,
    label: "Completed"
  },
  active: { 
    color: "bg-blue-500", 
    textColor: "text-blue-700", 
    bgColor: "bg-blue-50", 
    icon: CheckCircle,
    label: "Active"
  },
};

const recordTypeConfig = {
  confidential: { 
    color: "bg-red-500", 
    textColor: "text-red-700", 
    bgColor: "bg-red-50",
    label: "Confidential"
  },
  financial: { 
    color: "bg-purple-500", 
    textColor: "text-purple-700", 
    bgColor: "bg-purple-50",
    label: "Financial"
  },
  restricted: { 
    color: "bg-orange-500", 
    textColor: "text-orange-700", 
    bgColor: "bg-orange-50",
    label: "Restricted"
  },
  medical: { 
    color: "bg-blue-500", 
    textColor: "text-blue-700", 
    bgColor: "bg-blue-50",
    label: "Medical"
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = config.icon;
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgColor}`}>
      <IconComponent className={`h-3.5 w-3.5 ${config.textColor}`} />
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}

function RecordTypeBadge({ type }) {
  const config = recordTypeConfig[type] || recordTypeConfig.medical;
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgColor}`}>
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, unit }) {
  if (!value) return null;
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-[#4CC9FE]/20 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-[#4CC9FE]/10 to-[#37AFE1]/10 rounded-xl">
            <Icon className="h-4 w-4 text-[#37AFE1]" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">{label}</p>
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-[#4CC9FE]/20 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-[#4CC9FE]/10 bg-gradient-to-r from-[#4CC9FE]/5 to-[#37AFE1]/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#4CC9FE] to-[#37AFE1] rounded-xl">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

function ListItem({ children, onClick, showChevron = false }) {
  return (
    <div 
      className={`flex items-center justify-between py-3 ${onClick ? 'cursor-pointer hover:bg-[#4CC9FE]/5 active:bg-[#4CC9FE]/10 rounded-lg px-2 -mx-2 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex-1">
        {children}
      </div>
      {showChevron && <ChevronRight className="h-4 w-4 text-gray-400" />}
    </div>
  );
}

export default function RecordDetailPage({ params }) {
  const router = useRouter();
  // Unwrap params if it's a Promise (Next.js migration warning)
  const { id } = typeof params.then === 'function' ? React.use(params) : params;
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // PDF download handler
  const handleDownloadPDF = () => {
    if (!record) return;
    
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    
    // Color palette matching your design
    const colors = {
      primary: [76, 201, 254], // #4CC9FE
      secondary: [55, 175, 225], // #37AFE1
      dark: [31, 41, 55], // Dark gray
      medium: [107, 114, 128], // Medium gray
      light: [243, 244, 246], // Light gray
      success: [16, 185, 129], // Green
      warning: [245, 158, 11], // Amber
      error: [239, 68, 68] // Red
    };
    
    let currentY = margin;
    
    // Helper functions
    const addGradientHeader = (y, height = 80) => {
      // Create gradient effect with rectangles
      const steps = 20;
      const stepHeight = height / steps;
      for (let i = 0; i < steps; i++) {
        const r = colors.primary[0] + (colors.secondary[0] - colors.primary[0]) * (i / steps);
        const g = colors.primary[1] + (colors.secondary[1] - colors.primary[1]) * (i / steps);
        const b = colors.primary[2] + (colors.secondary[2] - colors.primary[2]) * (i / steps);
        doc.setFillColor(r, g, b);
        doc.rect(0, y + (i * stepHeight), pageWidth, stepHeight, 'F');
      }
    };
    
    const addSection = (title, icon = null) => {
      // Check if we need a new page
      if (currentY + 60 > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      
      // Section header with background
      doc.setFillColor(...colors.light);
      doc.roundedRect(margin, currentY, contentWidth, 35, 5, 5, 'F');
      
      // Section title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...colors.dark);
      doc.text(title, margin + 15, currentY + 22);
      
      // Add accent line
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(3);
      doc.line(margin, currentY + 35, margin + 60, currentY + 35);
      
      currentY += 50;
      return currentY;
    };
    
    const addInfoRow = (label, value, indent = 0) => {
      if (currentY + 25 > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...colors.medium);
      doc.text(label + ':', margin + indent, currentY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      const lines = doc.splitTextToSize(value, contentWidth - 120 - indent);
      doc.text(lines, margin + 120 + indent, currentY);
      
      currentY += Math.max(15, lines.length * 12);
    };
    
    const addBulletPoint = (text, color = colors.primary) => {
      if (currentY + 20 > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      
      // Bullet point
      doc.setFillColor(...color);
      doc.circle(margin + 20, currentY - 3, 2, 'F');
      
      // Text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      const lines = doc.splitTextToSize(text, contentWidth - 40);
      doc.text(lines, margin + 30, currentY);
      
      currentY += Math.max(15, lines.length * 12);
    };
    
    const addStatusBadge = (status, x, y) => {
      const statusColors = {
        verified: colors.success,
        pending: colors.warning,
        completed: colors.primary,
        active: colors.primary
      };
      const color = statusColors[status] || colors.medium;
      
      // Light background for badge
      doc.setFillColor(color[0] + 20, color[1] + 20, color[2] + 20);
      doc.roundedRect(x, y - 8, 60, 16, 8, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...color);
      doc.text(status.toUpperCase(), x + 8, y + 2);
    };
    
    // Header with gradient background
    addGradientHeader(0);
    
    // Logo/Title area
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('MEDICAL RECORD', margin, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Record #${record.id}`, margin, 70);
    
    // Status badge in header - using lighter approach
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 120, 35, 80, 20, 10, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.text(record.status.toUpperCase(), pageWidth - 110, 48);
    
    currentY = 120;
    
    // Patient Information Section
    addSection('PATIENT INFORMATION');
    addInfoRow('Patient Name', record.patientName);
    addInfoRow('Doctor', record.doctor);
    addInfoRow('Date', record.date);
    addInfoRow('Specialty', record.details.specialty || 'General Medicine');
    addInfoRow('Record Type', record.recordType.toUpperCase());
    
    currentY += 10;
    
    // Primary Diagnosis Section
    addSection('PRIMARY DIAGNOSIS');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colors.dark);
    const diagnosisLines = doc.splitTextToSize(record.details.primary_diagnosis, contentWidth - 20);
    doc.text(diagnosisLines, margin + 10, currentY);
    currentY += diagnosisLines.length * 14 + 10;
    
    // Secondary Diagnoses
    if (record.details.secondary_diagnoses && record.details.secondary_diagnoses.length > 0) {
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.medium);
      doc.text('Secondary Diagnoses:', margin + 10, currentY);
      currentY += 15;
      
      record.details.secondary_diagnoses.forEach(diagnosis => {
        addBulletPoint(diagnosis, colors.secondary);
      });
    }
    
    // ICD Codes
    if (record.details.icd_codes && record.details.icd_codes.length > 0) {
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...colors.medium);
      doc.text('ICD Codes:', margin + 10, currentY);
      currentY += 15;
      
      // Display ICD codes as badges
      let xPos = margin + 10;
      record.details.icd_codes.forEach((code, index) => {
        if (xPos + 60 > pageWidth - margin) {
          xPos = margin + 10;
          currentY += 25;
        }
        
        // Light background for ICD codes
        doc.setFillColor(colors.primary[0] + 40, colors.primary[1] + 40, colors.primary[2] + 40);
        doc.roundedRect(xPos, currentY - 8, 50, 16, 8, 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...colors.primary);
        doc.text(code, xPos + 8, currentY + 2);
        
        xPos += 60;
      });
      currentY += 20;
    }
    
    // Chief Complaint
    if (record.details.chief_complaint) {
      addSection('CHIEF COMPLAINT');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      const complaintLines = doc.splitTextToSize(record.details.chief_complaint, contentWidth - 20);
      doc.text(complaintLines, margin + 10, currentY);
      currentY += complaintLines.length * 12 + 15;
    }
    
    // Symptoms
    if (record.details.symptoms && record.details.symptoms.length > 0) {
      addSection('SYMPTOMS');
      record.details.symptoms.forEach(symptom => {
        const symptomText = typeof symptom === 'string' ? symptom : symptom.name || 'Unknown symptom';
        addBulletPoint(symptomText, colors.error);
        
        if (typeof symptom === 'object') {
          if (symptom.severity) {
            addInfoRow('  Severity', symptom.severity, 20);
          }
          if (symptom.duration) {
            addInfoRow('  Duration', symptom.duration, 20);
          }
        }
      });
    }
    
    // Vitals
    if (record.details.vitals && Object.keys(record.details.vitals).length > 0) {
      addSection('VITAL SIGNS');
      
      // Create a table-like layout for vitals
      const vitalsData = Object.entries(record.details.vitals).filter(([key, value]) => value);
      
      vitalsData.forEach(([key, value], index) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        addInfoRow(label, value.toString());
      });
    }
    
    // Medications
    if (record.details.medications && record.details.medications.length > 0) {
      addSection('MEDICATIONS');
      record.details.medications.forEach(med => {
        const medName = typeof med === 'string' ? med : med.name || med.medication_name || 'Unknown Medication';
        addBulletPoint(medName, colors.success);
        
        if (typeof med === 'object') {
          if (med.dosage || med.frequency) {
            const details = [med.dosage, med.frequency].filter(Boolean).join(' • ');
            addInfoRow('  Instructions', details, 20);
          }
        }
      });
    }
    
    // Lab Orders
    if (record.details.lab_orders && record.details.lab_orders.length > 0) {
      addSection('LABORATORY ORDERS');
      record.details.lab_orders.forEach(lab => {
        const labName = typeof lab === 'string' ? lab : lab.name || 'Unknown lab order';
        addBulletPoint(labName, [147, 51, 234]); // Purple color
      });
    }
    
    // Recommendations
    if (record.details.recommendations && record.details.recommendations.length > 0) {
      addSection('RECOMMENDATIONS');
      record.details.recommendations.forEach(rec => {
        const recText = typeof rec === 'string' ? rec : rec.recommendation || 'Unknown recommendation';
        addBulletPoint(recText, colors.success);
      });
    }
    
    // Clinical Notes
    if (record.details.clinical_notes) {
      addSection('CLINICAL NOTES');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      const notesLines = doc.splitTextToSize(record.details.clinical_notes, contentWidth - 20);
      doc.text(notesLines, margin + 10, currentY);
      currentY += notesLines.length * 12 + 15;
    }
    
    // Physical Examination
    if (record.details.physical_exam && record.details.physical_exam !== "No physical examination notes") {
      addSection('PHYSICAL EXAMINATION');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      const examLines = doc.splitTextToSize(record.details.physical_exam, contentWidth - 20);
      doc.text(examLines, margin + 10, currentY);
      currentY += examLines.length * 12 + 15;
    }
    
    // Follow-up Information
    if (record.details.follow_up_date || record.details.follow_up_notes) {
      addSection('FOLLOW-UP INFORMATION');
      if (record.details.follow_up_date) {
        addInfoRow('Next Appointment', new Date(record.details.follow_up_date).toLocaleDateString());
      }
      if (record.details.follow_up_notes && record.details.follow_up_notes !== "No follow-up notes") {
        addInfoRow('Instructions', record.details.follow_up_notes);
      }
    }

    const addFooter = () => {
      const footerY = pageHeight - 30;
      doc.setDrawColor(...colors.light);
      doc.setLineWidth(1);
      doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.medium);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, footerY);
      doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 30, footerY);
    };
    
    // Add footer to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter();
    }
    
    // Save the PDF
  doc.save(`medical-record-${record.id}.pdf`);
};

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/diagnosis/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.diagnosis) {
          // Transform the API response to match component expectations
          const transformedRecord = {
            id: data.diagnosis.id,
            appointment_id: data.diagnosis.appointment_id,
            type: "diagnosis",
            date: data.diagnosis.created_at ? new Date(data.diagnosis.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            patientName: data.diagnosis.patient_name || "Unknown Patient",
            category: "Diagnosis",
            doctor: data.diagnosis.doctor_name || "Unknown Doctor",
            status: data.diagnosis.status || "active",
            recordType: "medical",
            description: data.diagnosis.primary_diagnosis || "No diagnosis available",
            details: {
              vitals: data.diagnosis.vitals || {},
              symptoms: Array.isArray(data.diagnosis.symptoms) ? data.diagnosis.symptoms : [],
              medications: Array.isArray(data.diagnosis.medications) ? data.diagnosis.medications : [],
              lab_orders: Array.isArray(data.diagnosis.lab_orders) ? data.diagnosis.lab_orders : [],
              recommendations: Array.isArray(data.diagnosis.recommendations) ? data.diagnosis.recommendations : [],
              primary_diagnosis: data.diagnosis.primary_diagnosis || "No diagnosis",
              secondary_diagnoses: Array.isArray(data.diagnosis.secondary_diagnoses) ? data.diagnosis.secondary_diagnoses : [],
              icd_codes: Array.isArray(data.diagnosis.icd_codes) ? data.diagnosis.icd_codes : [],
              chief_complaint: data.diagnosis.chief_complaint || "No chief complaint recorded",
              physical_exam: data.diagnosis.physical_exam || "No physical examination notes",
              clinical_notes: data.diagnosis.clinical_notes || "No clinical notes available",
              follow_up_date: data.diagnosis.follow_up_date || null,
              follow_up_notes: data.diagnosis.follow_up_notes || "No follow-up notes",
              procedures: Array.isArray(data.diagnosis.procedures) ? data.diagnosis.procedures : [],
              referrals: Array.isArray(data.diagnosis.referrals) ? data.diagnosis.referrals : [],
              test_results: Array.isArray(data.diagnosis.test_results) ? data.diagnosis.test_results : [],
              specialty: data.diagnosis.specialty || data.diagnosis.doctor_specialty || "General Medicine",
              specialty_data: data.diagnosis.specialty_data || {}
            }
          };
          
          setRecord(transformedRecord);
        } else {
          throw new Error("No diagnosis data found in response");
        }
      } catch (err) {
        console.error('Error fetching record:', err);
        setError(err.message || "Failed to load record");
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchRecord();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4CC9FE]/10 via-white to-[#37AFE1]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#4CC9FE]/20">
            <div className="p-3 bg-gradient-to-br from-[#4CC9FE] to-[#37AFE1] rounded-2xl w-fit mx-auto mb-4">
              <Loader2 className="animate-spin h-8 w-8 text-white" />
            </div>
            <p className="text-gray-700 font-medium">Loading medical record...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4CC9FE]/10 via-white to-[#37AFE1]/10 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-200">
            <div className="p-3 bg-red-50 rounded-2xl w-fit mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Record</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => router.back()}
              className="w-full bg-gradient-to-r from-[#4CC9FE] to-[#37AFE1] text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4 mr-2 inline" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!record) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'treatment', label: 'Treatment', icon: Pill },
    { id: 'notes', label: 'Notes', icon: Stethoscope }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4CC9FE]/10 via-white to-[#37AFE1]/10">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#4CC9FE]/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-[#4CC9FE]/10 rounded-xl transition-colors active:bg-[#4CC9FE]/20"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Medical Record</h1>
                <p className="text-sm text-gray-500">Record #{record.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-[#4CC9FE]/10 rounded-xl transition-colors">
                <Share className="h-5 w-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-[#4CC9FE]/10 rounded-xl transition-colors">
                <MoreHorizontal className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Patient Info Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#4CC9FE]/20 shadow-sm hover:shadow-md transition-shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#4CC9FE] to-[#37AFE1] rounded-2xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{record.patientName}</h2>
                <p className="text-gray-600">{record.category} Record</p>
                {record.details.specialty && (
                  <p className="text-sm text-[#37AFE1] font-medium">{record.details.specialty}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={record.status} />
              <RecordTypeBadge type={record.recordType} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Date</p>
                <p className="text-sm font-semibold text-gray-900">{record.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Stethoscope className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Doctor</p>
                <p className="text-sm font-semibold text-gray-900">{record.doctor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#4CC9FE]/20 shadow-sm p-2">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#4CC9FE] to-[#37AFE1] text-white shadow-lg'
                      : 'text-gray-600 hover:bg-[#4CC9FE]/10'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SectionCard title="Primary Diagnosis" icon={FileText}>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{record.details.primary_diagnosis}</h4>
                  <p className="text-gray-600 text-sm">{record.description}</p>
                </div>
                {record.details.secondary_diagnoses && record.details.secondary_diagnoses.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Secondary Diagnoses</p>
                    {record.details.secondary_diagnoses.map((diagnosis, index) => (
                      <div key={index} className="flex items-center gap-2 py-1">
                        <div className="w-1.5 h-1.5 bg-[#37AFE1] rounded-full" />
                        <span className="text-sm text-gray-700">{diagnosis}</span>
                      </div>
                    ))}
                  </div>
                )}
                {record.details.icd_codes && record.details.icd_codes.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">ICD Codes</p>
                    <div className="flex flex-wrap gap-2">
                      {record.details.icd_codes.map((code, index) => (
                        <span key={index} className="px-2 py-1 bg-[#4CC9FE]/10 text-[#37AFE1] text-xs font-medium rounded-full">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Chief Complaint" icon={AlertTriangle}>
              <p className="text-gray-700">{record.details.chief_complaint}</p>
            </SectionCard>

            {record.details.symptoms && record.details.symptoms.length > 0 && (
              <SectionCard title="Symptoms" icon={Activity}>
                <div className="space-y-3">
                  {record.details.symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-start gap-3 py-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {typeof symptom === 'string' ? symptom : symptom.name || 'Unknown symptom'}
                        </h4>
                        {typeof symptom === 'object' && (
                          <div className="mt-1 space-y-1">
                            {symptom.severity && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Severity:</span> {symptom.severity}
                              </p>
                            )}
                            {symptom.duration && (
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">Duration:</span> {symptom.duration}
                              </p>
                            )}
                            {symptom.description && (
                              <p className="text-sm text-gray-700">{symptom.description}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-6">
            {record.details.vitals && Object.keys(record.details.vitals).length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <VitalCard icon={Thermometer} label="Temperature" value={record.details.vitals.temperature} />
                  <VitalCard icon={Heart} label="Heart Rate" value={record.details.vitals.heart_rate} />
                  <VitalCard icon={Activity} label="Blood Pressure" value={record.details.vitals.blood_pressure} />
                  <VitalCard icon={Activity} label="Oxygen Sat" value={record.details.vitals.oxygen_saturation} />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <VitalCard icon={Activity} label="Weight" value={record.details.vitals.weight} />
                  <VitalCard icon={Activity} label="Height" value={record.details.vitals.height} />
                  <VitalCard icon={Activity} label="BMI" value={record.details.vitals.bmi} />
                </div>
                
                {record.details.vitals.respiratory_rate && (
                  <div className="grid grid-cols-1 gap-4">
                    <VitalCard icon={Activity} label="Respiratory Rate" value={record.details.vitals.respiratory_rate} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="p-3 bg-gray-100 rounded-2xl w-fit mx-auto mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No vital signs recorded</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="space-y-6">
            {record.details.medications && record.details.medications.length > 0 && (
              <SectionCard title="Medications" icon={Pill}>
                <div className="space-y-3">
                  {record.details.medications.map((med, index) => (
                    <ListItem key={index}>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {typeof med === 'string' ? med : med.name || med.medication_name || 'Unknown Medication'}
                        </h4>
                        {typeof med === 'object' && (
                          <p className="text-sm text-gray-600">
                            {med.dosage && `${med.dosage} • `}
                            {med.frequency || med.instructions || 'No instructions'}
                          </p>
                        )}
                        {typeof med === 'object' && med.duration && (
                          <p className="text-xs text-gray-500">Duration: {med.duration}</p>
                        )}
                      </div>
                    </ListItem>
                  ))}
                </div>
              </SectionCard>
            )}

            {record.details.procedures && record.details.procedures.length > 0 && (
              <SectionCard title="Procedures" icon={Stethoscope}>
                <div className="space-y-2">
                  {record.details.procedures.map((procedure, index) => (
                    <ListItem key={index}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#37AFE1] rounded-full" />
                        <span className="text-gray-700">
                          {typeof procedure === 'string' ? procedure : procedure.name || 'Unknown procedure'}
                        </span>
                      </div>
                    </ListItem>
                  ))}
                </div>
              </SectionCard>
            )}

            {record.details.lab_orders && record.details.lab_orders.length > 0 && (
              <SectionCard title="Lab Orders" icon={TestTube}>
                <div className="space-y-2">
                  {record.details.lab_orders.map((lab, index) => (
                    <ListItem key={index}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        <span className="text-gray-700">
                          {typeof lab === 'string' ? lab : lab.name || 'Unknown lab order'}
                        </span>
                      </div>
                    </ListItem>
                  ))}
                </div>
              </SectionCard>
            )}

            {record.details.recommendations && record.details.recommendations.length > 0 && (
              <SectionCard title="Recommendations" icon={CheckCircle}>
                <div className="space-y-2">
                  {record.details.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">
                          {typeof rec === 'string' ? rec : rec.recommendation || 'Unknown recommendation'}
                        </span>
                      </div>
                    </ListItem>
                  ))}
                </div>
              </SectionCard>
            )}

            {record.details.referrals && record.details.referrals.length > 0 && (
              <SectionCard title="Referrals" icon={User}>
                <div className="space-y-2">
                  {record.details.referrals.map((referral, index) => (
                    <ListItem key={index}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#4CC9FE] rounded-full" />
                        <span className="text-gray-700">
                          {typeof referral === 'string' ? referral : referral.specialist || referral.name || 'Unknown referral'}
                        </span>
                      </div>
                    </ListItem>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <SectionCard title="Physical Examination" icon={Eye}>
              <p className="text-gray-700 leading-relaxed">{record.details.physical_exam}</p>
            </SectionCard>

            <SectionCard title="Clinical Notes" icon={FileText}>
              <p className="text-gray-700 leading-relaxed">{record.details.clinical_notes}</p>
            </SectionCard>

            {record.details.test_results && record.details.test_results.length > 0 && (
              <SectionCard title="Test Results" icon={TestTube}>
                <div className="space-y-3">
                  {record.details.test_results.map((result, index) => (
                    <div key={index} className="border-l-4 border-[#4CC9FE] pl-4">
                      <h4 className="font-semibold text-gray-900">
                        {typeof result === 'string' ? `Test ${index + 1}` : result.test_name || `Test ${index + 1}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {typeof result === 'string' ? result : result.result || 'No result available'}
                      </p>
                      {typeof result === 'object' && result.date && (
                        <p className="text-xs text-gray-500">{new Date(result.date).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {(record.details.follow_up_date || record.details.follow_up_notes) && (
              <SectionCard title="Follow-up" icon={Calendar}>
                <div className="space-y-3">
                  {record.details.follow_up_date && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Next Appointment</p>
                      <p className="text-gray-900 font-semibold">{new Date(record.details.follow_up_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {record.details.follow_up_notes && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Instructions</p>
                      <p className="text-gray-700">{record.details.follow_up_notes}</p>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pb-8">
          <button onClick={handleDownloadPDF} className="flex-1 bg-gradient-to-r from-[#4CC9FE] to-[#37AFE1] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all active:scale-95">
            <Download className="h-5 w-5 mr-2 inline" />
            Download Report
          </button>
          <button className="flex-1 bg-white/90 backdrop-blur-sm text-gray-700 py-4 px-6 rounded-2xl font-semibold hover:bg-white transition-colors border border-[#4CC9FE]/20 shadow-sm hover:shadow-md">
            <Share className="h-5 w-5 mr-2 inline" />
            Share Record
          </button>
        </div>
      </div>
    </div>
  );
}