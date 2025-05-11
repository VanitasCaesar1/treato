import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * PUT /api/doctors/schedules/[id]
 * Updates a schedule for a doctor
 */
export async function PUT(req, { params }) {
  try {
    const { id } = params;
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
    const { id } = params;
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    const result = await api.delete(`/api/doctors/schedules/${id}`, null, {
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
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to delete doctor schedule' },
      { status: error.response?.status || 500 }
    );
  }
}