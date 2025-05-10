import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/doctors/[id]/schedules
 * Fetches schedules for a specific doctor
 */
export async function GET(
  req,
  { params }
) {
  try {
    const { id } = params;
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    const schedulesData = await api.get(`/api/doctors/schedules?doctorId=${id}`, null, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    
    return NextResponse.json(schedulesData);
  } catch (error) {
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