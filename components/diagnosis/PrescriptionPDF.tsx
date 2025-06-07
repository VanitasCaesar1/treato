import React from 'react';

// Types for the prescription data
export interface PrescriptionData {
  appointmentId?: string;
  doctorData?: {
    name?: string;
    specialization?: {
      primary?: string;
    };
    hospital_name?: string;
    registration_number?: string;
    phone?: string;
  };
  patientData?: {
    name?: string;
    age?: number;
    gender?: string;
    phone?: string;
  };
  vitals?: {
    temperature?: string;
    heart_rate?: string;
    blood_pressure?: string;
    respiratory_rate?: string;
    oxygen_saturation?: string;
    weight?: string;
    timestamp?: string;
  };
  symptoms?: Array<{
    description?: string;
    severity?: string;
    onset?: string;
  }>;
  diagnosis_info?: Array<{
    condition?: string;
    code?: string;
    notes?: string;
  }>;
  treatment_plan?: {
    medications?: Array<{
      name?: string;
      dosage?: string;
      frequency?: string;
      instructions?: string;
    }>;
    follow_up?: {
      date?: string;
      duration?: string;
      notes?: string;
    };
  };
  notes?: string;
}

export interface PrescriptionPDFProps {
  data: PrescriptionData;
  onPrint?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// Main PrescriptionPDF component
export const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({ 
  data, 
  onPrint,
  className = "",
  children 
}) => {
  const generatePrescriptionHTML = (): string => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Medical Prescription</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
          color: #2c3e50;
          background: white;
          font-size: 12px;
        }
        
        .prescription-container {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          padding: 12mm;
          background: white;
          position: relative;
          border: 2px solid #1e3a8a;
        }
        
        .header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 12px;
        }
        
        .hospital-name {
          font-size: 20px;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 3px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .doctor-info {
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 2px;
        }
        
        .specialization {
          font-size: 12px;
          color: #64748b;
          font-style: italic;
          margin-bottom: 3px;
        }
        
        .registration-info {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .rx-symbol {
          font-size: 24px;
          font-weight: bold;
          color: #1e3a8a;
          margin-top: 8px;
          font-family: serif;
        }
        
        .patient-consultation-row {
          display: flex;
          justify-content: space-between;
          margin: 12px 0;
          gap: 20px;
        }
        
        .patient-info, .consultation-info {
          flex: 1;
          border: 1px solid #cbd5e1;
          padding: 10px;
          background: #f8fafc;
        }
        
        .section-title {
          font-size: 11px;
          font-weight: bold;
          color: #1e3a8a;
          text-transform: uppercase;
          margin-bottom: 6px;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 2px;
        }
        
        .info-line {
          margin-bottom: 3px;
          font-size: 11px;
        }
        
        .label {
          font-weight: bold;
          color: #374151;
          display: inline-block;
          width: 60px;
        }
        
        .value {
          color: #2c3e50;
        }
        
        .clinical-section {
          margin: 10px 0;
          border: 1px solid #cbd5e1;
          background: white;
        }
        
        .clinical-header {
          background: #f1f5f9;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: bold;
          color: #1e3a8a;
          text-transform: uppercase;
          border-bottom: 1px solid #cbd5e1;
        }
        
        .clinical-content {
          padding: 8px 10px;
        }
        
        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          font-size: 10px;
        }
        
        .vital-item {
          display: flex;
          justify-content: space-between;
          padding: 3px 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        
        .vital-label {
          font-weight: 500;
          color: #64748b;
        }
        
        .vital-value {
          font-weight: bold;
          color: #2c3e50;
        }
        
        .diagnosis-list {
          list-style: none;
          padding: 0;
        }
        
        .diagnosis-item {
          margin-bottom: 6px;
          padding: 6px;
          background: #f8fafc;
          border-left: 3px solid #1e3a8a;
        }
        
        .diagnosis-name {
          font-weight: bold;
          color: #2c3e50;
          font-size: 12px;
        }
        
        .diagnosis-code {
          color: #64748b;
          font-size: 10px;
          font-style: italic;
        }
        
        .diagnosis-notes {
          color: #374151;
          font-size: 10px;
          margin-top: 2px;
        }
        
        .rx-section {
          background: white;
          border: 2px solid #1e3a8a;
          margin: 12px 0;
        }
        
        .rx-header {
          background: #1e3a8a;
          color: white;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          display: flex;
          align-items: center;
        }
        
        .rx-symbol-header {
          font-size: 18px;
          margin-right: 8px;
          font-family: serif;
        }
        
        .medication-list {
          padding: 10px;
        }
        
        .medication-item {
          border-bottom: 1px solid #e2e8f0;
          padding: 8px 0;
          position: relative;
        }
        
        .medication-item:last-child {
          border-bottom: none;
        }
        
        .med-number {
          position: absolute;
          left: -5px;
          top: 8px;
          background: #1e3a8a;
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }
        
        .med-name {
          font-size: 13px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 4px;
          margin-left: 20px;
          text-decoration: underline;
        }
        
        .med-details {
          margin-left: 20px;
          font-size: 11px;
          color: #374151;
          margin-bottom: 2px;
        }
        
        .med-label {
          font-weight: bold;
          color: #64748b;
          display: inline-block;
          width: 70px;
        }
        
        .symptoms-section .symptom-item {
          background: #f8fafc;
          padding: 4px 8px;
          margin-bottom: 3px;
          border-left: 2px solid #64748b;
          font-size: 11px;
        }
        
        .symptom-desc {
          font-weight: 500;
          color: #2c3e50;
        }
        
        .symptom-severity {
          color: #64748b;
          font-size: 10px;
          margin-left: 6px;
        }
        
        .notes-text {
          background: #f8fafc;
          padding: 8px;
          border: 1px solid #e2e8f0;
          color: #374151;
          font-size: 11px;
          line-height: 1.4;
        }
        
        .follow-up-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .followup-item {
          background: #f8fafc;
          padding: 6px;
          border: 1px solid #e2e8f0;
        }
        
        .followup-label {
          font-weight: bold;
          color: #1e3a8a;
          font-size: 10px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        
        .followup-value {
          color: #2c3e50;
          font-size: 11px;
        }
        
        .signature-section {
          position: absolute;
          bottom: 20mm;
          right: 15mm;
          text-align: center;
          width: 120px;
        }
        
        .signature-line {
          border-top: 1px solid #2c3e50;
          margin: 15px 0 8px 0;
        }
        
        .doctor-signature {
          font-weight: bold;
          color: #2c3e50;
          font-size: 12px;
          margin-bottom: 2px;
        }
        
        .doctor-specialization {
          color: #64748b;
          font-size: 10px;
          margin-bottom: 2px;
        }
        
        .doctor-reg {
          color: #64748b;
          font-size: 9px;
        }
        
        .footer {
          position: absolute;
          bottom: 8mm;
          left: 12mm;
          right: 12mm;
          text-align: center;
          border-top: 1px solid #cbd5e1;
          padding-top: 5px;
        }
        
        .footer-text {
          font-size: 9px;
          color: #64748b;
          line-height: 1.3;
        }
        
        .prescription-id {
          position: absolute;
          top: 12mm;
          right: 12mm;
          font-size: 10px;
          color: #64748b;
          background: #f1f5f9;
          padding: 4px 8px;
          border: 1px solid #cbd5e1;
        }
        
        @media print {
          body { margin: 0; }
          .prescription-container { 
            margin: 0; 
            box-shadow: none;
          }
          .footer, .signature-section, .prescription-id {
            position: fixed;
          }
        }
      </style>
    </head>
    <body>
      <div class="prescription-container">
        <div class="prescription-id">Rx ID: ${data.appointmentId || 'N/A'}</div>
        
        <div class="header">
          <div class="hospital-name">${data.doctorData?.hospital_name || 'Medical Center'}</div>
          <div class="doctor-info">Dr. ${data.doctorData?.name || 'Doctor Name'}</div>
          <div class="specialization">${data.doctorData?.specialization?.primary || 'General Medicine'}</div>
          <div class="registration-info">
            Registration No: ${data.doctorData?.registration_number || 'XXXXX'} | 
            Phone: ${data.doctorData?.phone || '+1-XXX-XXX-XXXX'}
          </div>
          <div class="rx-symbol">℞</div>
        </div>

        <div class="patient-consultation-row">
          <div class="patient-info">
            <div class="section-title">Patient Details</div>
            <div class="info-line">
              <span class="label">Name:</span>
              <span class="value">${data.patientData?.name || 'Patient Name'}</span>
            </div>
            <div class="info-line">
              <span class="label">Age:</span>
              <span class="value">${data.patientData?.age || 'N/A'} years</span>
            </div>
            <div class="info-line">
              <span class="label">Gender:</span>
              <span class="value">${data.patientData?.gender || 'N/A'}</span>
            </div>
            <div class="info-line">
              <span class="label">Phone:</span>
              <span class="value">${data.patientData?.phone || 'N/A'}</span>
            </div>
          </div>
          <div class="consultation-info">
            <div class="section-title">Consultation Info</div>
            <div class="info-line">
              <span class="label">Date:</span>
              <span class="value">${currentDate}</span>
            </div>
            <div class="info-line">
              <span class="label">Time:</span>
              <span class="value">${currentTime}</span>
            </div>
          </div>
        </div>

        ${generateVitalsSection(data.vitals)}
        ${generateDiagnosisSection(data.diagnosis_info)}
        ${generateMedicationsSection(data.treatment_plan?.medications)}
        ${generateSymptomsAndNotesSection(data.symptoms, data.notes)}
        ${generateFollowUpSection(data.treatment_plan?.follow_up)}

        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="doctor-signature">Dr. ${data.doctorData?.name || 'Doctor Name'}</div>
          <div class="doctor-specialization">${data.doctorData?.specialization?.primary || 'General Medicine'}</div>
          <div class="doctor-reg">Reg. ${data.doctorData?.registration_number || 'XXXXX'}</div>
        </div>

        <div class="footer">
          <div class="footer-text">
            This prescription is computer generated and valid for medical use.
            <br>For queries contact: ${data.doctorData?.phone || '+1-XXX-XXX-XXXX'}
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check popup blocker settings.');
      }

      const prescriptionHTML = generatePrescriptionHTML();
      
      printWindow.document.write(prescriptionHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();

      onPrint?.();
    } catch (error) {
      console.error('Error printing prescription:', error);
      alert('Failed to open print dialog. Please try again.');
    }
  };

  if (children) {
    return (
      <div className={className} onClick={handlePrint}>
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={handlePrint}
      className={`inline-flex items-center px-4 py-2 border-2 border-blue-800 text-sm font-medium text-blue-800 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${className}`}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      Print Prescription
    </button>
  );
};

// Helper functions for generating different sections
const generateVitalsSection = (vitals?: PrescriptionData['vitals']): string => {
  if (!vitals || !Object.keys(vitals).some(key => key !== 'timestamp' && vitals[key as keyof typeof vitals])) {
    return '';
  }

  const vitalItems = [
    { key: 'temperature', label: 'Temp', unit: '°F' },
    { key: 'heart_rate', label: 'HR', unit: ' bpm' },
    { key: 'blood_pressure', label: 'BP', unit: '' },
    { key: 'respiratory_rate', label: 'RR', unit: '/min' },
    { key: 'oxygen_saturation', label: 'SpO2', unit: '%' },
    { key: 'weight', label: 'Weight', unit: ' lbs' }
  ];

  const vitalElements = vitalItems
    .filter(item => vitals[item.key as keyof typeof vitals])
    .map(item => 
      `<div class="vital-item">
        <span class="vital-label">${item.label}</span>
        <span class="vital-value">${vitals[item.key as keyof typeof vitals]}${item.unit}</span>
      </div>`
    );

  if (vitalElements.length === 0) return '';

  return `
    <div class="clinical-section">
      <div class="clinical-header">Vital Signs</div>
      <div class="clinical-content">
        <div class="vitals-grid">
          ${vitalElements.join('')}
        </div>
      </div>
    </div>
  `;
};

const generateDiagnosisSection = (diagnosisInfo?: PrescriptionData['diagnosis_info']): string => {
  if (!diagnosisInfo || !diagnosisInfo.some(d => d.condition)) {
    return '';
  }

  const diagnosisItems = diagnosisInfo
    .filter(diagnosis => diagnosis.condition)
    .map(diagnosis => `
      <div class="diagnosis-item">
        <div class="diagnosis-name">${diagnosis.condition}</div>
        ${diagnosis.code ? `<div class="diagnosis-code">${diagnosis.code}</div>` : ''}
        ${diagnosis.notes ? `<div class="diagnosis-notes">${diagnosis.notes}</div>` : ''}
      </div>
    `);

  return `
    <div class="clinical-section">
      <div class="clinical-header">Clinical Diagnosis</div>
      <div class="clinical-content">
        <div class="diagnosis-list">
          ${diagnosisItems.join('')}
        </div>
      </div>
    </div>
  `;
};

const generateMedicationsSection = (medications?: PrescriptionData['treatment_plan']['medications']): string => {
  const medicationItems = medications && medications.length > 0
    ? medications
        .filter(med => med.name)
        .map((med, index) => `
          <div class="medication-item">
            <div class="med-number">${index + 1}</div>
            <div class="med-name">${med.name}</div>
            ${med.dosage ? `<div class="med-details"><span class="med-label">Dosage:</span> ${med.dosage}</div>` : ''}
            ${med.frequency ? `<div class="med-details"><span class="med-label">Frequency:</span> ${med.frequency}</div>` : ''}
            ${med.instructions ? `<div class="med-details"><span class="med-label">Directions:</span> ${med.instructions}</div>` : ''}
          </div>
        `).join('')
    : '<div style="text-align: center; color: #64748b; font-style: italic; padding: 15px;">No medications prescribed</div>';

  return `
    <div class="rx-section">
      <div class="rx-header">
        <span class="rx-symbol-header">℞</span>
        Prescription
      </div>
      <div class="medication-list">
        ${medicationItems}
      </div>
    </div>
  `;
};

const generateSymptomsAndNotesSection = (symptoms?: PrescriptionData['symptoms'], notes?: string): string => {
  const hasSymptoms = symptoms && symptoms.some(s => s.description);
  const hasNotes = notes?.trim();

  if (!hasSymptoms && !hasNotes) return '';

  let content = '';

  if (hasSymptoms) {
    const symptomsList = symptoms!
      .filter(symptom => symptom.description)
      .map(symptom => 
        `<div class="symptom-item">
          <span class="symptom-desc">${symptom.description}</span>
          <span class="symptom-severity">[${symptom.severity || 'moderate'}]</span>
        </div>`
      ).join('');

    content += `
      <div class="symptoms-section" style="margin-bottom: ${hasNotes ? '10px' : '0'};">
        <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px; color: #1e3a8a;">Symptoms:</div>
        ${symptomsList}
      </div>
    `;
  }

  if (hasNotes) {
    content += `
      <div>
        <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px; color: #1e3a8a;">Clinical Notes:</div>
        <div class="notes-text">${notes}</div>
      </div>
    `;
  }

  return `
    <div class="clinical-section">
      <div class="clinical-header">Clinical Notes</div>
      <div class="clinical-content">
        ${content}
      </div>
    </div>
  `;
};

const generateFollowUpSection = (followUp?: PrescriptionData['treatment_plan']['follow_up']): string => {
  if (!followUp || (!followUp.date && !followUp.duration && !followUp.notes)) {
    return '';
  }

  let items = '';
  
  if (followUp.date) {
    items += `
      <div class="followup-item">
        <div class="followup-label">Next Visit</div>
        <div class="followup-value">${new Date(followUp.date).toLocaleDateString()}</div>
      </div>
    `;
  }
  
  if (followUp.duration) {
    items += `
      <div class="followup-item">
        <div class="followup-label">Review After</div>
        <div class="followup-value">${followUp.duration}</div>
      </div>
    `;
  }
  
  if (followUp.notes) {
    items += `
      <div class="followup-item" style="grid-column: 1 / -1;">
        <div class="followup-label">Instructions</div>
        <div class="followup-value">${followUp.notes}</div>
      </div>
    `;
  }

  return `
    <div class="clinical-section">
      <div class="clinical-header">Follow-up Instructions</div>
      <div class="clinical-content">
        <div class="follow-up-grid">
          ${items}
        </div>
      </div>
    </div>
  `;
};

// Utility function to create prescription data from form
export const createPrescriptionData = (
  appointmentId: string,
  appointmentData: any,
  doctorData: any,
  patientData: any,
  form: any
): PrescriptionData => {
  return {
    appointmentId,
    doctorData: {
      name: doctorData?.name,
      specialization: doctorData?.specialization,
      hospital_name: doctorData?.hospital_name,
      registration_number: doctorData?.registration_number,
      phone: doctorData?.phone
    },
    patientData: {
      name: patientData?.name,
      age: patientData?.age,
      gender: patientData?.gender,
      phone: patientData?.phone
    },
    vitals: form?.vitals,
    symptoms: form?.symptoms,
    diagnosis_info: form?.diagnosis_info,
    treatment_plan: form?.treatment_plan,
    notes: form?.notes
  };
};

export default PrescriptionPDF;