// File: app/api/doctors/fees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * POST /api/doctors/fees
 * Creates fees for a doctor
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Ensure organization ID is present
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }
    
  
    // Ensure required fee fields are present
    if (data.recurringFees === undefined && data.defaultFees === undefined && data.emergencyFees === undefined) {
      return NextResponse.json(
        { error: "At least one fee type (recurring, default, or emergency) is required" },
        { status: 400 }
      );
    }
    
    // Format the request payload to match backend expectations
    const feesPayload = {
      doctorID: data.doctorID,
      recurringFees: data.recurringFees,
      defaultFees: data.defaultFees,
      emergencyFees: data.emergencyFees
    };
    
    // Forward the request to the GoFiber backend with auth headers
    const createdFees = await api.post('/api/doctors/fees', feesPayload, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId
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
    // Improved error handling with detailed message
    if (error.response) {
      return NextResponse.json(
        {
          error: error.response.data?.error || 'Failed to create doctor fees',
          details: error.response.data
        },
        { status: error.response.status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create doctor fees' },
      { status: 500 }
    );
  }
}