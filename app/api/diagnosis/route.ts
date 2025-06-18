import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

// Helper function to sanitize data for JSON serialization
function sanitizeForJSON(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Buffer.isBuffer(obj)) {
    return obj.toString('utf8');
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForJSON(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      try {
        // Handle specific problematic fields
        if (key === 'created_at' || key === 'updated_at') {
          sanitized[key] = typeof value === 'string' ? value : new Date(value as any).toISOString();
        } else if (typeof value === 'bigint') {
          sanitized[key] = value.toString();
        } else if (typeof value === 'function') {
          // Skip functions
          continue;
        } else {
          sanitized[key] = sanitizeForJSON(value);
        }
      } catch (error) {
        console.warn(`Failed to sanitize key ${key}:`, error);
        sanitized[key] = null;
      }
    }
    return sanitized;
  }
  
  // For primitive types, return as-is
  return obj;
}

// POST /api/diagnosis
export async function POST(req: NextRequest) {
  try {
    const { user, organizationId, role } = await withAuth();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['appointment_id', 'patient_id', 'doctor_id'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json({
        error: "Validation failed",
        details: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // ✅ MAIN FIX: Properly process symptoms array
    if (data.symptoms && Array.isArray(data.symptoms)) {
      // If symptoms are strings, convert to proper Symptom objects
      if (data.symptoms.length > 0 && typeof data.symptoms[0] === 'string') {
        data.symptoms = data.symptoms.map((symptom: string, index: number) => ({
          symptom_id: index + 1,
          name: symptom,
          category: "General",
          severity: "moderate",
          onset_date: null,
          duration: null,
          location: null,
          description: symptom,
          progression: null,
          frequency: null,
          radiation: null,
          scale_rating: null
        }));
      }
      // If symptoms are already objects, ensure they have required fields
      else if (data.symptoms.length > 0 && typeof data.symptoms[0] === 'object') {
        data.symptoms = data.symptoms.map((symptom: any, index: number) => ({
          symptom_id: symptom.symptom_id || symptom.id || index + 1,
          name: symptom.name || symptom.description || "",
          category: symptom.category || "General",
          severity: symptom.severity || "moderate",
          onset_date: symptom.onset_date || symptom.onset || null,
          duration: symptom.duration || null,
          location: symptom.location || null,
          description: symptom.description || symptom.notes || symptom.name || "",
          progression: symptom.progression || null,
          frequency: symptom.frequency || null,
          radiation: symptom.radiation || null,
          scale_rating: symptom.scale_rating ? parseInt(symptom.scale_rating) : null
        }));
      }
    } else {
      data.symptoms = [];
    }

    // ✅ CRITICAL: Ensure symptoms array is not empty if we have symptom data
    if (data.symptoms.length === 0 && data.primary_symptoms) {
      try {
        const primarySymptoms = typeof data.primary_symptoms === 'string' 
          ? JSON.parse(data.primary_symptoms) 
          : data.primary_symptoms;
        
        if (Array.isArray(primarySymptoms) && primarySymptoms.length > 0) {
          data.symptoms = primarySymptoms.map((symptom: any, index: number) => ({
            symptom_id: symptom.symptom_id || index + 1,
            name: symptom.name || "",
            category: symptom.category || "General",
            severity: symptom.severity || "moderate",
            onset_date: symptom.onset_date || null,
            duration: symptom.duration || null,
            location: symptom.location || null,
            description: symptom.description || symptom.name || "",
            progression: symptom.progression || null,
            frequency: symptom.frequency || null,
            radiation: symptom.radiation || null,
            scale_rating: symptom.scale_rating || null
          }));
        }
      } catch (error) {
        console.warn('Failed to parse primary_symptoms:', error);
      }
    }

    console.log('🔍 Processed symptoms for backend:', {
      count: data.symptoms.length,
      symptoms: data.symptoms.map(s => ({ name: s.name, category: s.category, severity: s.severity }))
    });

    // Process vitals - convert to strings for Go backend
    const vitalFields = ['temperature', 'heart_rate', 'weight', 'height', 'bmi', 'respiratory_rate', 'oxygen_saturation', 'blood_pressure'];
    vitalFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        data[field] = String(data[field]);
      } else {
        data[field] = '';
      }
    });

    // ✅ FIX: Ensure clinical notes are properly handled
    // Handle multiple possible sources for clinical notes
    const clinicalNotes = data.clinical_notes || data.notes || data.physical_exam || '';
    data.clinical_notes = String(clinicalNotes).trim();
    data.physical_exam = data.physical_exam || data.clinical_notes || '';
    
    console.log('📝 Clinical notes processing:', {
      original_clinical_notes: data.clinical_notes,
      original_notes: data.notes,
      original_physical_exam: data.physical_exam,
      final_clinical_notes: data.clinical_notes,
      final_physical_exam: data.physical_exam
    });

    // Process treatment plan
    if (data.treatment_plan) {
      data.medications = Array.isArray(data.treatment_plan.medications) 
        ? data.treatment_plan.medications.map((med: any) => ({
            name: med.name || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || '',
            instructions: med.instructions || '',
            route: med.route || 'oral',
            ...(med.medicine_id && { medicine_id: med.medicine_id })
          }))
        : [];
      data.procedures = Array.isArray(data.treatment_plan.procedures) ? data.treatment_plan.procedures : [];
      data.recommendations = data.treatment_plan.recommendations || '';
      data.follow_up_date = data.treatment_plan.follow_up?.date || null;
      data.follow_up_notes = data.treatment_plan.follow_up?.notes || '';
    } else {
      data.medications = data.medications || [];
      data.procedures = data.procedures || [];
      data.recommendations = data.recommendations || '';
      data.follow_up_date = data.follow_up_date || null;
      data.follow_up_notes = data.follow_up_notes || '';
    }

    // Process JSON fields - ensure they're strings
    const jsonFields = ['symptom_timeline', 'symptom_summary', 'primary_symptoms', 'specialty_data', 'symptom_triggers', 'symptom_relieving_factors', 'symptom_quality_details', 'symptom_progression', 'symptom_radiation_patterns'];
    jsonFields.forEach(field => {
      if (data[field]) {
        try {
          if (typeof data[field] !== 'string') {
            data[field] = JSON.stringify(data[field]);
          }
          // Validate JSON by parsing
          JSON.parse(data[field]);
        } catch (error) {
          console.warn(`Invalid JSON for ${field}:`, error);
          data[field] = field === 'specialty_data' ? '{}' : '[]';
        }
      }
    });

    // Set defaults
    data.org_id = organizationId;
    data.status = data.status || 'finalized';
    data.symptom_categories = Array.isArray(data.symptom_categories) ? data.symptom_categories : [];
    data.lab_orders = Array.isArray(data.lab_orders) ? data.lab_orders : [];
    data.referrals = Array.isArray(data.referrals) ? data.referrals : [];
    data.secondary_diagnoses = Array.isArray(data.secondary_diagnoses) ? data.secondary_diagnoses : [];
    data.icd_codes = Array.isArray(data.icd_codes) ? data.icd_codes : [];

    // Ensure we have a primary diagnosis
    if (!data.primary_diagnosis) {
      data.primary_diagnosis = "Pending diagnosis";
    }

    console.log('📤 Final payload to backend:', {
      appointment_id: data.appointment_id,
      symptoms_count: data.symptoms.length,
      first_symptom: data.symptoms[0] ? {
        name: data.symptoms[0].name,
        category: data.symptoms[0].category,
        severity: data.symptoms[0].severity
      } : null,
      clinical_notes: data.clinical_notes,
      physical_exam: data.physical_exam,
      has_medications: data.medications.length > 0,
      has_procedures: data.procedures.length > 0
    });

    const response = await api.post('/api/diagnosis/create', data, {
      headers: {
        'X-User-ID': user.id,
        'X-Organization-ID': organizationId,
        'X-User-Role': role,
      }
    });

    console.log('✅ Backend response received:', {
      status: response.status,
      message: response.data?.message
    });

    const sanitizedData = sanitizeForJSON(response.data);
    
    if (sanitizedData === undefined || sanitizedData === null) {
      console.error('❌ Sanitized data is undefined/null, creating fallback response');
      
      const fallbackResponse = {
        message: response.data?.message || 'Diagnosis operation completed',
        status: response.data?.status || 'finalized',
        diagnosis_id: response.data?.diagnosis_id || null,
        created_at: response.data?.created_at || new Date().toISOString(),
        updated_at: response.data?.updated_at || new Date().toISOString()
      };
      
      return NextResponse.json(fallbackResponse, { status: 201 });
    }
    
    return NextResponse.json(sanitizedData, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating diagnosis:', error);
    
    if (error.response) {
      console.error('Backend error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      return NextResponse.json({
        error: error.response.data?.error || 'Failed to create diagnosis',
        details: error.response.data?.details || null 
      }, { status: error.response.status });
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}