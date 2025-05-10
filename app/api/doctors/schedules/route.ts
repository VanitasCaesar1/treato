import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/doctors/schedules
 * Gets schedules for doctors
 */
export async function GET(req: NextRequest) {
  try {
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Extract query parameters if needed
    const url = new URL(req.url);
    const doctorId = url.searchParams.get('doctorId');
    const queryString = url.search; // This includes the ? and all parameters
    
    // Forward the request to the GoFiber backend with auth headers
    const schedules = await api.get(`/api/doctors/schedules${queryString}`, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    
    return NextResponse.json(schedules);
  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Error fetching doctor schedules:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch doctor schedules' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * PUT /api/doctors/schedules
 * Updates or creates a schedule for a doctor
 */
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    // Fixed: changed from 'schedule' (singular) to 'schedules' (plural)
    const updatedSchedule = await api.put('/api/doctors/schedules', data, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    
    return NextResponse.json(updatedSchedule);
  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Error updating doctor schedule:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to update doctor schedule' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * POST /api/doctors/schedules
 * Creates a schedule for a doctor
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    const createdSchedule = await api.post('/api/doctors/schedules', data, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    
    return NextResponse.json(createdSchedule);
  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Error creating doctor schedule:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create doctor schedule' },
      { status: error.response?.status || 500 }
    );
  }
}