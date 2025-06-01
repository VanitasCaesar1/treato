import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/diagnosis
 * Retrieves diagnoses with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters from URL
    const searchParams = req.nextUrl.searchParams;
    const patientId = searchParams.get('patient_id');
    const doctorId = searchParams.get('doctor_id');
    const appointmentId = searchParams.get('appointment_id');
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Build query parameters object
    const queryParams: Record<string, string> = {
      page,
      limit,
    };

    // Add optional filters
    if (patientId) queryParams.patient_id = patientId;
    if (doctorId) queryParams.doctor_id = doctorId;
    if (appointmentId) queryParams.appointment_id = appointmentId;
    if (status) queryParams.status = status;

    // Always filter by organization
    queryParams.org_id = organizationId;

    // Forward the request to the backend
    const response = await api.get('/api/diagnoses', {
      params: queryParams,
      headers: {
        'X-User-ID': user.id,
        'X-Organization-ID': organizationId,
        'X-User-Role': role,
      }
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error retrieving diagnoses:', error);

    // Handle specific error cases
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Handle backend API errors
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to retrieve diagnoses';
      
      return NextResponse.json(
        { error: errorMessage },
        { status }
      );
    }

    // Handle network or other errors
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
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let data;
    try {
      data = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: "Invalid request format",
          details: "Request body must be valid JSON"
        },
        { status: 400 }
      );
    }

    // Validate required fields match backend expectations
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

    // Ensure organization ID matches auth context and add it
    if (data.org_id && data.org_id !== organizationId) {
      return NextResponse.json(
        { error: "Organization ID mismatch" },
        { status: 403 }
      );
    }
    
    // Always set org_id from auth context
    data.org_id = organizationId;

    // Set default status if not provided
    if (!data.status) {
      data.status = 'draft'; // Match backend default
    }

    // Forward the request to the backend
    const response = await api.post('/api/diagnoses', data, {
      headers: {
        'X-User-ID': user.id,
        'X-Organization-ID': organizationId,
        'X-User-Role': role,
      }
    });

    return NextResponse.json(response.data, { status: 201 });

  } catch (error: any) {
    console.error('Error creating diagnosis:', error);

    // Handle specific error cases
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Handle backend API errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      const errorMessage = errorData?.error || 'Failed to create diagnosis';
      
      // Handle validation errors with details
      if (status === 400 && errorData?.details) {
        return NextResponse.json(
          {
            error: errorMessage,
            details: errorData.details
          },
          { status }
        );
      }

      // Handle conflict errors (diagnosis already exists)
      if (status === 409) {
        return NextResponse.json(
          { error: errorMessage },
          { status }
        );
      }

      return NextResponse.json(
        { error: errorMessage },
        { status }
      );
    }

    // Handle network or other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}