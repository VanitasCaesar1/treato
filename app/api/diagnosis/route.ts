import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/diagnosis
 * Retrieves diagnoses with optional filtering
 */
export async function GET(req) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const patientId = searchParams.get('patient_id');
    const doctorId = searchParams.get('doctor_id');
    const appointmentId = searchParams.get('appointment_id');
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Build query parameters
    const queryParams: {
      patient_id?: string;
      doctor_id?: string;
      appointment_id?: string;
      status?: string;
      page?: string;
      limit?: string;
    } = {};
    if (patientId) queryParams.patient_id = patientId;
    if (doctorId) queryParams.doctor_id = doctorId;
    if (appointmentId) queryParams.appointment_id = appointmentId;
    if (status) queryParams.status = status;
    if (page) queryParams.page = page;
    if (limit) queryParams.limit = limit;

    // Forward the request to the backend
    const response = await api.get('/api/diagnoses', queryParams);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error retrieving diagnoses:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to retrieve diagnoses' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * POST /api/diagnosis
 * Creates a new diagnosis
 */
export async function POST(req) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const data = await req.json();
    
    // Add organization ID from auth context
    data.org_id = organizationId;
    
    // Forward the request to the backend
    const response = await api.post('/api/diagnoses', data);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create diagnosis' },
      { status: error.response?.status || 500 }
    );
  }
}