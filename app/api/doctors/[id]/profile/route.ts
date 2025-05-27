import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/doctors/[id]/profile
 * Fetch doctor profile by ID
 */
export async function GET(req, { params }) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role, accessToken, sessionId } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: doctorId } = params;
    
    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // Forward the request to the backend with auth headers
    // Note: Your Go backend expects /:id/profile, so we use doctorId directly
    const response = await api.get(`/api/doctors/${doctorId}/profile`, {}, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || ''
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch doctor profile' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * PUT /api/doctors/[id]/profile
 * Update doctor profile
 */
export async function PUT(req, { params }) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role, accessToken, sessionId } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: doctorId } = params;
    
    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // Get request body
    const updateData = await req.json();

    // Forward the request to the backend with auth headers
    const response = await api.put(`/api/doctors/${doctorId}/profile`, updateData, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || '',
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
      );
    }

    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to update doctor profile' },
      { status: error.response?.status || 500 }
    );
  }
}