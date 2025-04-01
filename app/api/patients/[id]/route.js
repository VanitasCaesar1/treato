import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/patients/:id
 * Retrieves a patient by ID
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
    
    const patientId = params.id;
    
    // Forward the request to the backend with auth headers
    const response = await api.get(`/api/patients/${patientId}`, {}, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || '' // Add the role as a header
      }
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching patient:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch patient' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * PUT /api/patients/:id
 * Updates a patient by ID
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
    
    const patientId = params.id;
    
    // Parse request body
    const updateData = await req.json();
    
    // Forward the request to the backend with auth headers
    const response = await api.put(`/api/patients/${patientId}`, updateData, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || '' // Add the role as a header
      }
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating patient:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to update patient' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * DELETE /api/patients/:id
 * Deletes a patient by ID
 */
export async function DELETE(req, { params }) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role, accessToken, sessionId } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const patientId = params.id;
    
    // Forward the request to the backend with auth headers
    const response = await api.delete(`/api/patients/${patientId}`, {}, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || '' // Add the role as a header
      }
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting patient:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to delete patient' },
      { status: error.response?.status || 500 }
    );
  }
}