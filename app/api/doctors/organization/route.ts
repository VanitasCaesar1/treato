// app/api/doctors/organization/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/doctors
 * Fetches all doctors in the same organization
 */
export async function GET(req: NextRequest) {
  try {
    // Get auth data from WorkOS
    const { user, accessToken, sessionId, organizationId } = await withAuth();
        if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID not found' },
        { status: 400 }
      );
    }
    
    // Forward the request to the GoFiber backend with auth headers
    const doctors = await api.get('/api/doctors/organization', null, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    return NextResponse.json(doctors);
  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch doctors' },
      { status: error.response?.status || 500 }
    );
  }
}