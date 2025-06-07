import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/diagnosis
 * Retrieves diagnoses by appointment_id as path parameter
 */
export async function GET(req: NextRequest, { params }: { params: { appointment_id: string } }) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get appointment_id from path parameters
    const appointmentId = params.appointment_id;
    
    // Get additional query parameters from URL if needed
    const searchParams = req.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // DEBUG: Log all received parameters
    console.log('=== DIAGNOSIS GET REQUEST DEBUG ===');
    console.log('Full URL:', req.nextUrl.toString());
    console.log('Path parameter appointmentId:', appointmentId);
    console.log('Query parameters:');
    for (const [key, value] of searchParams.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // Check if appointment_id is provided
    if (!appointmentId) {
      console.error('❌ Missing required appointment_id parameter!');
      return NextResponse.json(
        { 
          error: 'appointment_id parameter is required',
          details: 'appointment_id must be provided in the URL path'
        },
        { status: 400 }
      );
    }

    // Build query parameters object for additional filters
    const queryParams: Record<string, string> = {
      page,
      limit,
      org_id: organizationId
    };

    console.log('Final queryParams object:', queryParams);
    console.log('✅ Proceeding with backend request...');

    // Forward the request to the backend using path parameter
    const response = await api.get(`/api/diagnosis/${appointmentId}`, {
      params: queryParams,
      headers: {
        'X-User-ID': user.id,
        'X-Organization-ID': organizationId,
        'X-User-Role': role,
      }
    });

    console.log('Backend response for diagnosis fetch:', response.data);

    // Transform the response to ensure proper medication structure
    const transformedData = {
      ...response.data,
      diagnoses: response.data.diagnoses?.map(transformDiagnosisFromAPI) || []
    };

    const safeData = safeJsonSerialize(transformedData);
    return NextResponse.json(safeData);

  } catch (error: any) {
    console.error('Error retrieving diagnoses:', error);
    
    // Rest of your existing error handling...
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to retrieve diagnoses';
      
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
 * POST /api/diagnosis
 * Creates a new diagnosis
 */
export async function POST(req: NextRequest) {
  let user, organizationId, role;
  
  try {
    // Step 1: Handle authentication with better error handling
    try {
      const authResult = await withAuth();
      user = authResult.user;
      organizationId = authResult.organizationId;
      role = authResult.role;
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Step 2: Parse request body with better error handling
    let data;
    try {
      data = await req.json();
      console.log('Received diagnosis data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { 
          error: "Invalid request format",
          details: "Request body must be valid JSON"
        },
        { status: 400 }
      );
    }

    // Step 3: Validate required fields
    const requiredFields = ['appointment_id', 'patient_id', 'doctor_id'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Step 4: Convert vitals data
    if (data.vitals) {
      console.log('Original vitals:', data.vitals);
      data.vitals = convertVitalsForAPI(data.vitals);
      console.log('Converted vitals:', data.vitals);
    }

    // Step 5: Process treatment plan and medications - THIS IS THE KEY FIX
    if (data.treatment_plan) {
      console.log('Original treatment_plan:', JSON.stringify(data.treatment_plan, null, 2));
      
      // Ensure medications is properly structured
      if (data.treatment_plan.medications && Array.isArray(data.treatment_plan.medications)) {
        // Process each medication to ensure proper structure
        data.treatment_plan.medications = data.treatment_plan.medications.map((med: any) => {
          const processedMed: Record<string, any> = {
            name: med.name || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            instructions: med.instructions || ''
          };
          
          // Include medicine_id if present
          if (med.medicine_id) {
            processedMed.medicine_id = med.medicine_id;
          }
          
          return processedMed;
        });
        
        console.log('Processed medications:', JSON.stringify(data.treatment_plan.medications, null, 2));
      } else {
        // Initialize empty medications array if not present
        data.treatment_plan.medications = [];
      }

      // Ensure follow_up is properly structured
      if (!data.treatment_plan.follow_up) {
        data.treatment_plan.follow_up = {
          date: '',
          duration: '',
          notes: ''
        };
      }

      // Extract procedures and recommendations for backend compatibility
      if (data.treatment_plan.procedures && Array.isArray(data.treatment_plan.procedures)) {
        data.procedures = data.treatment_plan.procedures;
      }
      
      if (data.treatment_plan.recommendations) {
        data.recommendations = data.treatment_plan.recommendations;
      }

      // Set follow-up fields for backend
      if (data.treatment_plan.follow_up) {
        data.follow_up_date = data.treatment_plan.follow_up.date;
        data.follow_up_notes = data.treatment_plan.follow_up.notes;
      }

      console.log('Final processed treatment_plan:', JSON.stringify(data.treatment_plan, null, 2));
    }

    // Step 6: Ensure organization ID matches
    data.org_id = organizationId;

    // Step 7: Set default status if not provided
    if (!data.status) {
      data.status = 'finalized';
    }

    // Step 8: Final data validation for medications
    console.log('=== MEDICATION DEBUG ===');
    console.log('Data has treatment_plan:', !!data.treatment_plan);
    if (data.treatment_plan) {
      console.log('Treatment plan has medications:', !!data.treatment_plan.medications);
      console.log('Medications is array:', Array.isArray(data.treatment_plan.medications));
      console.log('Medications length:', data.treatment_plan.medications?.length || 0);
      console.log('Medications content:', JSON.stringify(data.treatment_plan.medications, null, 2));
    }

    console.log('Final data being sent to backend:', JSON.stringify(data, null, 2));

    // Step 9: Call the backend endpoint
    let response;
    try {
      response = await api.post('/api/diagnosis/create', data, {
        headers: {
          'X-User-ID': user.id,
          'X-Organization-ID': organizationId,
          'X-User-Role': role,
        }
      });
      
      console.log('Backend response status:', response.status);
      console.log('Backend response data:', response.data);
      
    } catch (apiError) {
      console.error('Backend API call failed:', apiError);
      console.error('API Error details:', {
        status: apiError?.response?.status,
        data: apiError?.response?.data,
        message: apiError?.message
      });
      throw apiError;
    }

    // Step 10: Return successful response with safe JSON serialization
    try {
      // First, try to identify what might be causing the serialization issue
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', response.data ? Object.keys(response.data) : 'No data');
      
      // Test if the data can be serialized
      const testSerialization = JSON.stringify(response.data);
      console.log('JSON serialization test passed');
      
      // If test passes, return the data normally
      return NextResponse.json(response.data, { status: 201 });
      
    } catch (serializationError) {
      console.error('JSON serialization failed:', serializationError);
      console.error('Problematic response data:', response.data);
      
      // Use safe serialization as fallback
      try {
        const safeData = safeJsonSerialize(response.data);
        return NextResponse.json(safeData, { status: 201 });
      } catch (safeSerializationError) {
        console.error('Even safe serialization failed:', safeSerializationError);
        
        // Return minimal safe response
        return NextResponse.json({
          message: 'Diagnosis created successfully',
          diagnosis_id: response.data?.diagnosis_id || 'unknown',
          status: response.data?.status || 'created',
          created_at: response.data?.created_at || new Date().toISOString(),
          note: 'Full response data could not be serialized'
        }, { status: 201 });
      }
    }

  } catch (error: any) {
    console.error('Error creating diagnosis:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    
    // Handle backend API errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      // Log detailed error information
      console.error('Backend error details:', {
        status,
        data: errorData,
        headers: error.response.headers
      });
      
      // Extract error message
      let errorMessage = 'Failed to create diagnosis';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      return NextResponse.json(
        {
          error: errorMessage,
          details: errorData?.details || null
        },
        { status }
      );
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { 
          error: 'Backend service unavailable',
          details: 'Could not connect to the backend service'
        },
        { status: 503 }
      );
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { 
          error: 'Request timeout',
          details: 'The request took too long to complete'
        },
        { status: 408 }
      );
    }

    // Handle any other unknown errors
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Transform diagnosis data from API format to frontend format
 */
function transformDiagnosisFromAPI(diagnosis: any) {
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
    
    // Vitals - transform from flattened structure to nested object
    vitals: {
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
    
    // Treatment - FIXED: Properly handle medications
    medications: Array.isArray(diagnosis.medications) ? diagnosis.medications : [],
    procedures: diagnosis.procedures || [],
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
    
    // Meta
    status: diagnosis.status,
    created_at: diagnosis.created_at,
    updated_at: diagnosis.updated_at,
    
    // Additional fields
    test_results: diagnosis.test_results || [],
    attachments: diagnosis.attachments || []
  };
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

export const convertVitalsForAPI = (vitals) => {
  const converted = { ...vitals };
  
  // Convert numeric fields
  if (converted.temperature && converted.temperature !== '') {
    try {
      converted.temperature = parseFloat(converted.temperature);
    } catch (e) {
      console.warn('Invalid temperature value:', converted.temperature);
      delete converted.temperature;
    }
  } else {
    delete converted.temperature;
  }
  
  if (converted.heart_rate && converted.heart_rate !== '') {
    try {
      converted.heart_rate = parseInt(converted.heart_rate, 10);
    } catch (e) {
      console.warn('Invalid heart rate value:', converted.heart_rate);
      delete converted.heart_rate;
    }
  } else {
    delete converted.heart_rate;
  }
  
  if (converted.respiratory_rate && converted.respiratory_rate !== '') {
    try {
      converted.respiratory_rate = parseInt(converted.respiratory_rate, 10);
    } catch (e) {
      console.warn('Invalid respiratory rate value:', converted.respiratory_rate);
      delete converted.respiratory_rate;
    }
  } else {
    delete converted.respiratory_rate;
  }
  
  if (converted.oxygen_saturation && converted.oxygen_saturation !== '') {
    try {
      converted.oxygen_saturation = parseInt(converted.oxygen_saturation, 10);
    } catch (e) {
      console.warn('Invalid oxygen saturation value:', converted.oxygen_saturation);
      delete converted.oxygen_saturation;
    }
  } else {
    delete converted.oxygen_saturation;
  }
  
  if (converted.weight && converted.weight !== '') {
    try {
      converted.weight = parseFloat(converted.weight);
    } catch (e) {
      console.warn('Invalid weight value:', converted.weight);
      delete converted.weight;
    }
  } else {
    delete converted.weight;
  }
  
  // Handle blood pressure (keep as string since it's in "120/80" format)
  if (converted.blood_pressure && converted.blood_pressure !== '') {
    // Validate format before sending
    const bpPattern = /^\d{2,3}\/\d{2,3}$/;
    if (!bpPattern.test(converted.blood_pressure)) {
      console.warn('Invalid blood pressure format:', converted.blood_pressure);
      delete converted.blood_pressure;
    }
  } else {
    delete converted.blood_pressure;
  }
  
  return converted;
};