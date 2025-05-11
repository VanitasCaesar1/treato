// File: app/api/doctors/fees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/doctors/fees
 * Gets fees for doctors
 */
export async function GET(req: NextRequest) {
  try {
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Extract query parameters if needed
    const url = new URL(req.url);
    const queryString = url.search;
    
    // Forward the request to the GoFiber backend with auth headers
    // NOTE: Changed the endpoint to match what the backend expects
    const fees = await api.get(`/api/doctors/fees${queryString}`, null, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    
    return NextResponse.json(fees);
  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Error fetching doctor fees:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch doctor fees' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * PUT /api/doctors/fees
 * Updates fees for a doctor
 */
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    // NOTE: Changed the endpoint to match what the backend expects
    const updatedFees = await api.put('/api/doctors/fees', data, {
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

/**
 * POST /api/doctors/fees
 * Creates fees for a doctor
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    // NOTE: Changed the endpoint to match what the backend expects
    const createdFees = await api.post('/api/doctors/fees', data, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    
    return NextResponse.json(createdFees);
  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Error creating doctor fees:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create doctor fees' },
      { status: error.response?.status || 500 }
    );
  }
}
