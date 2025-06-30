import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

// Helper function to validate ID format
function isValidId(id: string): boolean {
  // Validate UUID format
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
}

/**
 * GET /api/diagnosis/[id]/dermatology
 * Retrieves dermatology diagnosis by appointment_id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 GET dermatology diagnosis for appointment:', id);
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Ensure organization ID is present
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    console.log('✅ User authenticated with organization:', organizationId);

    // Validate ID format before making request
    if (!isValidId(id)) {
      return NextResponse.json({ 
        error: "Invalid appointment ID format. Expected UUID format." 
      }, { status: 400 });
    }

    const requestOptions = {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId
      }
    };

    // Forward request to backend dermatology endpoint
    const response = await api.get(
      `/api/diagnosis/${id}/dermatology`,
      {},
      requestOptions
    );

    console.log('✅ Backend response received:', response);
    
    if (!response) {
      console.error('❌ No response received from backend');
      return NextResponse.json(
        { error: 'No response received from backend' },
        { status: 500 }
      );
    }

    // Return the response directly or transform if needed
    return NextResponse.json(response);

  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('❌ Error fetching dermatology diagnosis:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to fetch dermatology diagnosis';
      console.error(`Backend error ${status}:`, errorMessage);
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.response.data
        },
        { status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch dermatology diagnosis: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/diagnosis/[id]/dermatology
 * Creates new dermatology diagnosis
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🆕 POST dermatology diagnosis for appointment:', id);
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Ensure organization ID is present
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    console.log('✅ User authenticated with organization:', organizationId);

    // Validate ID format before making request
    if (!isValidId(id)) {
      return NextResponse.json({ 
        error: "Invalid appointment ID format. Expected UUID format." 
      }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') || '';
    console.log('📄 Content-Type:', contentType);

    let requestData;
    let isFormData = false;

    if (contentType.includes('multipart/form-data')) {
      // Handle form data with files
      console.log('📎 Processing multipart/form-data');
      requestData = await req.formData();
      isFormData = true;
    } else {
      // Handle JSON data
      console.log('📄 Processing JSON data');
      requestData = await req.json();
      
      // Validate and sanitize JSON data
      requestData = sanitizeDermatologyData(requestData);
    }

    const requestOptions = {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId,
        // Don't set Content-Type for FormData, let the api utility handle it
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      }
    };

    console.log('📤 Sending request to backend:', {
      url: `/api/diagnosis/${id}/dermatology`,
      isFormData,
      dataKeys: isFormData ? Array.from((requestData as FormData).keys()) : Object.keys(requestData)
    });

    // Forward request to backend dermatology endpoint
    const response = await api.post(
      `/api/diagnosis/${id}/dermatology`,
      requestData,
      requestOptions
    );

    console.log('✅ Backend response received:', response);
    
    if (!response) {
      console.error('❌ No response received from backend');
      return NextResponse.json(
        { error: 'No response received from backend' },
        { status: 500 }
      );
    }

    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('❌ Error creating dermatology diagnosis:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to create dermatology diagnosis';
      console.error(`Backend error ${status}:`, errorMessage, error.response.data);
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.response.data
        },
        { status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create dermatology diagnosis: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/diagnosis/[id]/dermatology
 * Updates existing dermatology diagnosis
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔄 PUT dermatology diagnosis for appointment:', id);
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Ensure organization ID is present
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    console.log('✅ User authenticated with organization:', organizationId);

    // Validate ID format before making request
    if (!isValidId(id)) {
      return NextResponse.json({ 
        error: "Invalid appointment ID format. Expected UUID format." 
      }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') || '';
    console.log('📄 Content-Type:', contentType);

    let requestData;
    let isFormData = false;

    if (contentType.includes('multipart/form-data')) {
      // Handle form data with files
      console.log('📎 Processing multipart/form-data');
      requestData = await req.formData();
      isFormData = true;
    } else {
      // Handle JSON data
      console.log('📄 Processing JSON data');
      requestData = await req.json();
      
      // Validate and sanitize JSON data
      requestData = sanitizeDermatologyData(requestData);
    }

    const requestOptions = {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId,
        // Don't set Content-Type for FormData, let the api utility handle it
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      }
    };

    console.log('📤 Sending UPDATE request to backend:', {
      url: `/api/diagnosis/${id}/dermatology`,
      isFormData,
      dataKeys: isFormData ? Array.from((requestData as FormData).keys()) : Object.keys(requestData)
    });

    // Forward request to backend dermatology endpoint
    const response = await api.put(
      `/api/diagnosis/${id}/dermatology`,
      requestData,
      requestOptions
    );

    console.log('✅ Backend UPDATE response received:', response);
    
    if (!response) {
      console.error('❌ No response received from backend');
      return NextResponse.json(
        { error: 'No response received from backend' },
        { status: 500 }
      );
    }

    return NextResponse.json(response);

  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('❌ Error updating dermatology diagnosis:', error);
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to update dermatology diagnosis';
      console.error(`Backend error ${status}:`, errorMessage, error.response.data);
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.response.data,
          backend_status: status
        },
        { status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update dermatology diagnosis: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/diagnosis/[id]/dermatology
 * Deletes dermatology diagnosis
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ DELETE dermatology diagnosis for appointment:', id);
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Ensure organization ID is present
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    console.log('✅ User authenticated with organization:', organizationId);

    // Validate ID format before making request
    if (!isValidId(id)) {
      return NextResponse.json({ 
        error: "Invalid appointment ID format. Expected UUID format." 
      }, { status: 400 });
    }

    const requestOptions = {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId
      }
    };

    // Forward request to backend dermatology endpoint
    const response = await api.delete(
      `/api/diagnosis/${id}/dermatology`,
      requestOptions
    );

    console.log('✅ Backend response received:', response);
    
    if (!response) {
      console.error('❌ No response received from backend');
      return NextResponse.json(
        { error: 'No response received from backend' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dermatology diagnosis deleted successfully'
    });

  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('❌ Error deleting dermatology diagnosis:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to delete dermatology diagnosis';
      console.error(`Backend error ${status}:`, errorMessage);
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.response.data
        },
        { status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete dermatology diagnosis: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * Sanitize and validate dermatology data before sending to backend
 */
function sanitizeDermatologyData(data: any) {
  // Ensure required field is present
  if (!data.appointment_id) {
    throw new Error("appointment_id is required");
  }

  // Sanitize the data to match MongoDB schema expectations
  const sanitized = {
    appointment_id: data.appointment_id,
    patient_id: data.patient_id || null,
    doctor_id: data.doctor_id || null,
    org_id: data.org_id || null,
    
    // String fields - convert empty strings to null
    lesion_description: data.lesion_description || null,
    distribution: data.distribution || null,
    skin_color_changes: data.skin_color_changes || null,
    custom_affected_area: data.custom_affected_area || null,
    descriptive_findings: data.descriptive_findings || null,
    physical_exam_notes: data.physical_exam_notes || null,
    imaging_notes: data.imaging_notes || null,
    clinical_photography: data.clinical_photography || null,
    dermoscopy_findings: data.dermoscopy_findings || null,
    follow_up_recommendations: data.follow_up_recommendations || null,
    referral_specialty: data.referral_specialty || null,
    referral_reason: data.referral_reason || null,
    working_diagnosis: data.working_diagnosis || null,
    assessment_notes: data.assessment_notes || null,
    severity_assessment: data.severity_assessment || null,
    prognosis: data.prognosis || null,
    patient_education: data.patient_education || null,
    status: data.status || null,
    visit_type: data.visit_type || null,
    
    // Array fields - ensure they are arrays or null
    affected_areas: Array.isArray(data.affected_areas) ? data.affected_areas.filter(item => item && item.trim()) : null,
    diagnostic_procedures: Array.isArray(data.diagnostic_procedures) ? data.diagnostic_procedures.filter(item => item && item.trim()) : null,
    medications: Array.isArray(data.medications) ? data.medications : null,
    differential_diagnosis: Array.isArray(data.differential_diagnosis) ? data.differential_diagnosis.filter(item => item && item.trim()) : null,
    attachments: Array.isArray(data.attachments) ? data.attachments : null,
    
    // Boolean fields
    referral_needed: data.referral_needed === true || data.referral_needed === 'true' ? true : (data.referral_needed === false || data.referral_needed === 'false' ? false : null),
    
    // Object fields - ensure they are objects or null
    lesion_characteristics: (data.lesion_characteristics && typeof data.lesion_characteristics === 'object') ? data.lesion_characteristics : null,
    skincare_recommendations: (data.skincare_recommendations && typeof data.skincare_recommendations === 'object') ? data.skincare_recommendations : null,
  };

  // Remove undefined values
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  console.log('🧹 Sanitized data:', sanitized);
  return sanitized;
}