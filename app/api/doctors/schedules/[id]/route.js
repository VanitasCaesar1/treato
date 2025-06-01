import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * PUT /api/doctors/schedules/[id]
 * Updates a schedule for a doctor
 */
export async function PUT(req, { params }) {
  try {
    // Await params before accessing properties (Next.js 15+ requirement)
    const { id } = await params;
    const data = await req.json();

    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();

    // Forward the request to the GoFiber backend with auth headers
    const updatedSchedule = await api.put(`/api/doctors/schedules/${id}`, data, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
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
 * DELETE /api/doctors/schedules/[id]
 * Deletes a schedule for a doctor
 */
export async function DELETE(req, { params }) {
  try {
    // Await params before accessing properties (Next.js 15+ requirement)
    const { id } = await params;

    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();

    // Parse the incoming composite ID to ensure it has the correct format
    // Frontend sends: doctor_id_weekday_organizationId
    // Backend expects: doctor_id_weekday_org_organizationId
    let compositeId = id;

    // Check if the ID already has the "org_" prefix
    const parts = id.split('_');
    if (parts.length >= 3) {
      const doctorId = parts[0];
      const weekday = parts[1];
      const orgId = parts.slice(2).join('_'); // Join remaining parts in case org ID has underscores

      // If the orgId doesn't start with "org_", add the prefix
      if (!orgId.startsWith('org_')) {
        compositeId = `${doctorId}_${weekday}_org_${orgId}`;
      }
    }

    console.log('Original ID:', id);
    console.log('Formatted ID for backend:', compositeId);
    console.log('Organization ID from auth:', organizationId);

    // Forward the request to the GoFiber backend with auth headers
    const result = await api.delete(`/api/doctors/schedules/${compositeId}`, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Error deleting doctor schedule:', error);
    
    // Get the awaited params for error logging
    const awaitedParams = await params;
    
    // Return more detailed error information for debugging
    const errorMessage = error.response?.data?.error || error.message || 'Failed to delete doctor schedule';
    const statusCode = error.response?.status || 500;
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: error.response?.data || {},
        compositeId: awaitedParams.id,
        requestUrl: error.config?.url || 'Unknown URL'
      },
      { status: statusCode }
    );
  }
}