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
      month: 'long',
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
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&family=SF+Pro+Text:wght@300;400;500;600&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.5;
          color: #1d1d1f;
          background: white;
          font-size: 14px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .prescription-container {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          padding: 15mm;
          background: white;
          position: relative;
          overflow: hidden;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          position: relative;
        }
        
        .header::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, #007AFF, #34C759);
          border-radius: 1px;
        }
        
        .hospital-name {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #1d1d1f;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }
        
        .doctor-info {
          font-size: 16px;
          font-weight: 500;
          color: #424245;
          margin-bottom: 2px;
          letter-spacing: -0.2px;
        }
        
        .registration-info {
          font-size: 13px;
          color: #8e8e93;
          margin-bottom: 8px;
          font-weight: 400;
        }
        
        .prescription-title {
          font-size: 18px;
          font-weight: 600;
          color: #007AFF;
          margin-top: 12px;
          letter-spacing: 0.5px;
        }
        
        .patient-doctor-section {
          display: flex;
          justify-content: space-between;
          margin: 24px 0 20px 0;
          gap: 30px;
        }
        
        .patient-info, .consultation-info {
          flex: 1;
          background: #f2f2f7;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #e5e5e7;
        }
        
        .section-header {
          font-size: 13px;
          font-weight: 600;
          color: #8e8e93;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }
        
        .info-row {
          margin-bottom: 6px;
          display: flex;
          align-items: center;
        }
        
        .label {
          font-weight: 500;
          color: #424245;
          width: 70px;
          font-size: 13px;
        }
        
        .value {
          color: #1d1d1f;
          font-weight: 400;
          font-size: 14px;
        }
        
        .vitals-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid #bae6fd;
        }
        
        .vitals-title {
          font-weight: 600;
          margin-bottom: 12px;
          color: #0369a1;
          font-size: 15px;
          display: flex;
          align-items: center;
        }
        
        .vitals-title::before {
          content: '❤️';
          margin-right: 8px;
          font-size: 14px;
        }
        
        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          font-size: 13px;
        }
        
        .vital-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(186, 230, 253, 0.5);
        }
        
        .vital-label {
          color: #374151;
          font-weight: 500;
        }
        
        .vital-value {
          color: #0369a1;
          font-weight: 600;
        }
        
        .diagnosis-section {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid #f59e0b;
        }
        
        .section-title {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 12px;
          color: #92400e;
          display: flex;
          align-items: center;
        }
        
        .section-title.diagnosis::before {
          content: '🔍';
          margin-right: 8px;
          font-size: 14px;
        }
        
        .section-title.medication::before {
          content: '💊';
          margin-right: 8px;
          font-size: 14px;
        }
        
        .section-title.notes::before {
          content: '📝';
          margin-right: 8px;
          font-size: 14px;
        }
        
        .section-title.followup::before {
          content: '📅';
          margin-right: 8px;
          font-size: 14px;
        }
        
        .diagnosis-item {
          background: rgba(255, 255, 255, 0.8);
          padding: 10px 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .diagnosis-item:last-child {
          margin-bottom: 0;
        }
        
        .diagnosis-name {
          font-weight: 600;
          color: #92400e;
          font-size: 14px;
        }
        
        .diagnosis-code {
          color: #a16207;
          font-size: 12px;
          font-weight: 500;
        }
        
        .diagnosis-notes {
          color: #78716c;
          font-size: 13px;
          margin-top: 4px;
          font-style: italic;
        }
        
        .rx-section {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid #22c55e;
        }
        
        .medication-item {
          background: rgba(255, 255, 255, 0.8);
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 10px;
          border: 1px solid rgba(34, 197, 94, 0.3);
          position: relative;
        }
        
        .medication-item:last-child {
          margin-bottom: 0;
        }
        
        .med-number {
          position: absolute;
          top: 8px;
          right: 10px;
          background: #22c55e;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
        }
        
        .med-name {
          font-size: 15px;
          font-weight: 600;
          color: #166534;
          margin-bottom: 6px;
          padding-right: 30px;
        }
        
        .med-details {
          font-size: 13px;
          color: #374151;
          margin-bottom: 3px;
        }
        
        .med-label {
          font-weight: 500;
          color: #059669;
          display: inline-block;
          width: 80px;
        }
        
        .advice-section {
          background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid #a855f7;
        }
        
        .symptom-item {
          background: rgba(255, 255, 255, 0.8);
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 6px;
          border: 1px solid rgba(168, 85, 247, 0.3);
          font-size: 13px;
        }
        
        .symptom-desc {
          color: #7c2d92;
          font-weight: 500;
        }
        
        .symptom-severity {
          color: #a855f7;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }
        
        .notes-text {
          background: rgba(255, 255, 255, 0.8);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #374151;
          font-size: 13px;
          line-height: 1.6;
          margin-top: 8px;
        }
        
        .follow-up-section {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid #3b82f6;
        }
        
        .followup-item {
          background: rgba(255, 255, 255, 0.8);
          padding: 10px 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
        }
        
        .followup-item:last-child {
          margin-bottom: 0;
        }
        
        .followup-label {
          font-weight: 500;
          color: #1e40af;
          width: 100px;
          font-size: 13px;
        }
        
        .followup-value {
          color: #374151;
          font-size: 14px;
        }
        
        .signature-section {
          position: absolute;
          bottom: 25mm;
          right: 15mm;
          text-align: center;
        }
        
        .signature-line {
          width: 150px;
          height: 1px;
          background: #d1d5db;
          margin: 20px auto 12px;
        }
        
        .doctor-signature {
          font-weight: 600;
          color: #1d1d1f;
          font-size: 14px;
          margin-bottom: 2px;
        }
        
        .doctor-specialization {
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 4px;
        }
        
        .doctor-reg {
          color: #9ca3af;
          font-size: 11px;
        }
        
        .footer {
          position: absolute;
          bottom: 10mm;
          left: 15mm;
          right: 15mm;
          text-align: center;
        }
        
        .footer-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin-bottom: 8px;
        }
        
        .footer-text {
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.4;
        }
        
        @media print {
          body { margin: 0; }
          .prescription-container { 
            margin: 0; 
            padding: 15mm;
            box-shadow: none;
          }
          .footer {
            position: fixed;
            bottom: 10mm;
          }
          .signature-section {
            position: fixed;
            bottom: 25mm;
            right: 15mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="prescription-container">
        <div class="header">
          <div class="hospital-name">${data.doctorData?.hospital_name || 'Medical Center'}</div>
          <div class="doctor-info">Dr. ${data.doctorData?.name || 'Doctor Name'}</div>
          <div class="doctor-info">${data.doctorData?.specialization?.primary || 'General Medicine'}</div>
          <div class="registration-info">
            Reg. No: ${data.doctorData?.registration_number || 'XXXXX'} • 
            ${data.doctorData?.phone || '+1-XXX-XXX-XXXX'}
          </div>
          <div class="prescription-title">PRESCRIPTION</div>
        </div>

        <div class="patient-doctor-section">
          <div class="patient-info">
            <div class="section-header">Patient Information</div>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${data.patientData?.name || 'Patient Name'}</span>
            </div>
            <div class="info-row">
              <span class="label">Age:</span>
              <span class="value">${data.patientData?.age || 'N/A'} years</span>
            </div>
            <div class="info-row">
              <span class="label">Gender:</span>
              <span class="value">${data.patientData?.gender || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${data.patientData?.phone || 'N/A'}</span>
            </div>
          </div>
          <div class="consultation-info">
            <div class="section-header">Consultation Details</div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${currentDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">${currentTime}</span>
            </div>
            <div class="info-row">
              <span class="label">ID:</span>
              <span class="value">${data.appointmentId || 'N/A'}</span>
            </div>
          </div>
        </div>

        ${generateVitalsSection(data.vitals)}
        ${generateDiagnosisSection(data.diagnosis_info)}
        ${generateMedicationsSection(data.treatment_plan?.medications)}
        ${generateAdviceSection(data.notes, data.symptoms)}
        ${generateFollowUpSection(data.treatment_plan?.follow_up)}

        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="doctor-signature">Dr. ${data.doctorData?.name || 'Doctor Name'}</div>
          <div class="doctor-specialization">${data.doctorData?.specialization?.primary || 'General Medicine'}</div>
          <div class="doctor-reg">Reg. No: ${data.doctorData?.registration_number || 'XXXXX'}</div>
        </div>

        <div class="footer">
          <div class="footer-line"></div>
          <div class="footer-text">
            This prescription is digitally generated and valid • For queries: ${data.doctorData?.phone || '+1-XXX-XXX-XXXX'}
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
      className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition-all duration-200 ${className}`}
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
    { key: 'temperature', label: 'Temperature', unit: '°F' },
    { key: 'heart_rate', label: 'Heart Rate', unit: ' bpm' },
    { key: 'blood_pressure', label: 'Blood Pressure', unit: '' },
    { key: 'respiratory_rate', label: 'Respiratory Rate', unit: '/min' },
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
    <div class="vitals-section">
      <div class="vitals-title">Vital Signs</div>
      <div class="vitals-grid">
        ${vitalElements.join('')}
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
    <div class="diagnosis-section">
      <div class="section-title diagnosis">Clinical Diagnosis</div>
      ${diagnosisItems.join('')}
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
            ${med.instructions ? `<div class="med-details"><span class="med-label">Instructions:</span> ${med.instructions}</div>` : ''}
          </div>
        `).join('')
    : '<div style="text-align: center; color: #6b7280; font-style: italic; padding: 20px;">No medications prescribed</div>';

  return `
    <div class="rx-section">
      <div class="section-title medication">Medications</div>
      ${medicationItems}
    </div>
  `;
};

const generateAdviceSection = (notes?: string, symptoms?: PrescriptionData['symptoms']): string => {
  const hasNotes = notes?.trim();
  const hasSymptoms = symptoms && symptoms.some(s => s.description);

  if (!hasNotes && !hasSymptoms) return '';

  let symptomsHtml = '';
  if (hasSymptoms) {
    const symptomsList = symptoms!
      .filter(symptom => symptom.description)
      .map(symptom => 
        `<div class="symptom-item">
          <span class="symptom-desc">${symptom.description}</span>
          <span class="symptom-severity">${symptom.severity || 'moderate'}</span>
        </div>`
      ).join('');

    symptomsHtml = `
      <div style="margin-bottom: 12px;">
        <div style="font-weight: 600; color: #7c2d92; margin-bottom: 8px; font-size: 14px;">Reported Symptoms:</div>
        ${symptomsList}
      </div>
    `;
  }

  const notesHtml = hasNotes ? `
    <div>
      <div style="font-weight: 600; color: #7c2d92; margin-bottom: 8px; font-size: 14px;">Additional Notes:</div>
      <div class="notes-text">${notes}</div>
    </div>
  ` : '';

  return `
    <div class="advice-section">
      <div class="section-title notes">Clinical Notes & Advice</div>
      ${symptomsHtml}
      ${notesHtml}
    </div>
  `;
};

const generateFollowUpSection = (followUp?: PrescriptionData['treatment_plan']['follow_up']): string => {
  if (!followUp || (!followUp.date && !followUp.duration && !followUp.notes)) {
    return '';
  }

  const items = [];
  
  if (followUp.date) {
    items.push(`
      <div class="followup-item">
        <span class="followup-label">Next Visit:</span>
        <span class="followup-value">${new Date(followUp.date).toLocaleDateString()}</span>
      </div>
    `);
  }
  
  if (followUp.duration) {
    items.push(`
      <div class="followup-item">
        <span class="followup-label">Review After:</span>
        <span class="followup-value">${followUp.duration}</span>
      </div>
    `);
  }
  
  if (followUp.notes) {
    items.push(`
      <div class="followup-item">
        <span class="followup-label">Notes:</span>
        <span class="followup-value">${followUp.notes}</span>
      </div>
    `);
  }

  return `
    <div class="follow-up-section">
      <div class="section-title followup">Follow-up Instructions</div>
      ${items.join('')}
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