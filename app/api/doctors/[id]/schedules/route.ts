import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/doctors/[id]/schedules
 * Fetches schedules for a specific doctor
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fix: Await params to resolve the Next.js warning
    const { id } = await params;
    console.log("Fetching schedules for doctor ID:", id);

    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    console.log("Organization ID from auth:", organizationId);

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Debug headers being sent
    const headers = {
      'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      'X-Session-ID': sessionId || '',
      'X-Organization-ID': organizationId
    };
    console.log("Sending headers:", headers);

    // Forward the request to the GoFiber backend with auth headers
    console.log(`Sending request to: /api/doctors/${id}/schedules`);
    const response = await api.get(`/api/doctors/${id}/schedules`, {
      headers: headers
    });

    // Log the raw response for debugging
    console.log('Raw response:', response);
    
    // Extract schedules correctly based on your API client's response structure
    // If using Axios, the parsed JSON is in response.data
    const schedules = response.data;
    
    // Add additional safety check to ensure we never return null
    if (schedules === null || schedules === undefined) {
      console.warn('Schedules is null or undefined, returning empty array');
      return NextResponse.json([]);
    }
    
    // Log received data for debugging
    console.log('Processed schedules from backend:', schedules);
    console.log('Type of schedules:', typeof schedules);
    console.log('Is Array:', Array.isArray(schedules));
    
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
    console.error('Error details:', error.response?.data);
    
    return NextResponse.json(
      {
        error: error.response?.data?.error || 'Failed to fetch doctor schedules',
        details: error.message,
        stack: error.stack
      },
      { status: error.response?.status || 500 }
    );
  }
}