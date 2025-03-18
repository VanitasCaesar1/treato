// app/api/doctors/fees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * PUT /api/doctors/fees
 * Updates or creates fees for a doctor
 */
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    const updatedFees = await api.put('/api/doctor/fees', data, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    return NextResponse.json(updatedFees);
  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Error updating doctor fees:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to update doctor fees' },
      { status: error.response?.status || 500 }
    );
  }
}