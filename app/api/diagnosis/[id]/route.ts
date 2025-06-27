import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/diagnosis/[id]
 * Retrieves diagnosis by appointment_id from URL path parameter
 */
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ✅ FIX: Await the params promise and use 'id' to match [id] folder name
    const resolvedParams = await params;
    const appointmentId = resolvedParams.id;
    
    // Get other query parameters from URL (for pagination, etc.)
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // DEBUG: Log all received parameters
    console.log('=== DIAGNOSIS GET REQUEST DEBUG ===');
    console.log('Full URL:', req.nextUrl.toString());
    console.log('Path parameter appointmentId:', appointmentId);
    console.log('Query parameters:');
    for (const [key, value] of searchParams.entries()) {
      console.log(` ${key}: ${value}`);
    }

    // Check if appointment_id is provided
    if (!appointmentId) {
      console.error('❌ Missing required appointmentId path parameter!');
      return NextResponse.json(
        {
          error: 'appointmentId parameter is required',
          details: 'appointmentId must be provided as a path parameter'
        },
        { status: 400 }
      );
    }

    console.log('✅ Proceeding with backend request...');

    const requestOptions = {
      headers: {
        'X-User-ID': user.id,
        'X-Organization-ID': organizationId,
        'X-User-Role': role,
      }
    };

    // Forward the request to the backend using path parameter
    // Backend expects: GET /api/diagnosis/:id
    const response = await api.get(
      `/api/diagnosis/${appointmentId}`, 
      {}, // No query params needed for the main request
      requestOptions
    );

    console.log('Backend response status:', response?.status);
    console.log('Backend response data:', response);

    // Check if response exists and has data
    if (!response) {
      console.error('❌ No response received from backend');
      return NextResponse.json(
        { error: 'No response received from backend' },
        { status: 500 }
      );
    }

    // Handle both 'diagnosis' and 'diagnoses' properties
    let transformedData;

    if (response.diagnosis) {
      // Backend returns single diagnosis object in .diagnosis property
      const diag = transformDiagnosisFromAPI(response.diagnosis);
      // --- Ensure specializations is always an object ---
      let specializations = diag.specializations;
      if (!specializations || typeof specializations !== 'object') {
        specializations = {};
        if (diag.specialty && diag.specialty_data) {
          try {
            specializations[diag.specialty] = typeof diag.specialty_data === 'string' ? JSON.parse(diag.specialty_data) : diag.specialty_data;
          } catch {
            specializations[diag.specialty] = {};
          }
        }
      }
      // --- Always set specialty/specialty_data for compatibility ---
      let specialty = diag.specialty || Object.keys(specializations)[0] || 'general';
      let specialty_data = specializations[specialty] || {};
      transformedData = {
        message: response.message,
        diagnosis: {
          ...diag,
          specializations,
          specialty,
          specialty_data
        },
        count: response.count
      };
    } else if (response.diagnoses) {
      // Backend returns diagnosis data in .diagnoses property (plural)
      const diagnosisData = Array.isArray(response.diagnoses) 
        ? response.diagnoses[0] // Take first diagnosis if array
        : response.diagnoses;   // Use directly if single object
      
      transformedData = {
        message: response.message,
        diagnosis: transformDiagnosisFromAPI(diagnosisData),
        count: response.count
      };
    } else if (Array.isArray(response)) {
      // If response is an array of diagnosis (fallback)
      transformedData = {
        diagnosis: response.map(transformDiagnosisFromAPI)[0] // Take first one
      };
    } else if (response.id && response.appointment_id) {
      // If response is a single diagnosis object directly (fallback)
      transformedData = {
        diagnosis: transformDiagnosisFromAPI(response)
      };
    } else {
      console.error('❌ Unexpected response format:', response);
      console.log('Available properties:', Object.keys(response || {}));
      return NextResponse.json(
        { error: 'Unexpected response format from backend' },
        { status: 500 }
      );
    }

    const safeData = safeJsonSerialize(transformedData);
    console.log('✅ Returning transformed data:', safeData);
    return NextResponse.json(safeData);

  } catch (error: any) {
    console.error('Error retrieving diagnosis:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to retrieve diagnosis';
      console.error(`Backend error ${status}:`, errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Safe JSON serialization function to handle circular references and non-serializable values
 */
function safeJsonSerialize(obj: any): any {
  const seen = new WeakSet();
  
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    
    // Handle functions
    if (typeof value === 'function') {
      return '[Function]';
    }
    
    // Handle undefined (JSON.stringify normally omits these)
    if (value === undefined) {
      return null;
    }
    
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    // Handle RegExp
    if (value instanceof RegExp) {
      return value.toString();
    }
    
    // Handle BigInt
    if (typeof value === 'bigint') {
      return value.toString();
    }
    
    // Handle Symbol
    if (typeof value === 'symbol') {
      return value.toString();
    }
    
    return value;
  }));
}

/**
 * Transform diagnosis data from API format to frontend format
 */
function transformDiagnosisFromAPI(diagnosis: any) {
  if (!diagnosis) {
    return null;
  }

  return {
    id: diagnosis.id,
    appointment_id: diagnosis.appointment_id,
    patient_id: diagnosis.patient_id,
    doctor_id: diagnosis.doctor_id,
    org_id: diagnosis.org_id,
    
    // Patient info
    patient_name: diagnosis.patient_name,
    patient_age: diagnosis.patient_age,
    patient_gender: diagnosis.patient_gender,
    
    // Doctor info
    doctor_name: diagnosis.doctor_name,
    doctor_specialty: diagnosis.doctor_specialty,
    
    // Vitals - handle both nested and flattened structure
    vitals: diagnosis.vitals || {
      temperature: diagnosis.temperature,
      blood_pressure: diagnosis.blood_pressure,
      heart_rate: diagnosis.heart_rate,
      weight: diagnosis.weight,
      height: diagnosis.height,
      bmi: diagnosis.bmi,
      respiratory_rate: diagnosis.respiratory_rate,
      oxygen_saturation: diagnosis.oxygen_saturation,
      timestamp: diagnosis.created_at || new Date().toISOString()
    },
    
    // Symptoms
    symptoms: diagnosis.symptoms || [],
    chief_complaint: diagnosis.chief_complaint,
    
    // Diagnosis info
    primary_diagnosis: diagnosis.primary_diagnosis,
    secondary_diagnoses: diagnosis.secondary_diagnoses || [],
    icd_codes: diagnosis.icd_codes || [],
    
    // Treatment - handle nested treatment_plan structure
    medications: diagnosis.medications || diagnosis.treatment_plan?.medications || [],
    procedures: diagnosis.procedures || diagnosis.treatment_plan?.procedures || [],
    recommendations: diagnosis.recommendations,
    lab_orders: diagnosis.lab_orders || [],
    referrals: diagnosis.referrals || [],
    
    // Follow-up
    follow_up_date: diagnosis.follow_up_date,
    follow_up_notes: diagnosis.follow_up_notes,
    
    // Clinical notes
    physical_exam: diagnosis.physical_exam,
    clinical_notes: diagnosis.clinical_notes,
    
    // Specialization
    specialty: diagnosis.specialty,
    specialty_data: diagnosis.specialty_data,
    // Multi-specialization support
    specializations: diagnosis.specializations || null,
    // Meta
    status: diagnosis.status,
    created_at: diagnosis.created_at,
    updated_at: diagnosis.updated_at,
    
    // Additional fields
    test_results: diagnosis.test_results || [],
    attachments: diagnosis.attachments || []
  };
}