import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/diagnosis/[id]
 * Retrieves a specific diagnosis by ID
 */
export async function GET(req, { params }) {
  try {
    // Await params before accessing properties (Next.js 15+ requirement)
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Diagnosis ID is required" },
        { status: 400 }
      );
    }

    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();

    // Forward the request to the backend with auth headers
    const response = await api.get(`/api/diagnoses/${id}`, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });

    return NextResponse.json(response.data);

  } catch (error) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Error retrieving diagnosis:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to retrieve diagnosis' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * PUT /api/diagnosis/[id]
 * Updates a specific diagnosis by ID
 */
export async function PUT(req, { params }) {
  try {
    // Await params before accessing properties (Next.js 15+ requirement)
    const { id } = await params;
    const data = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Diagnosis ID is required" },
        { status: 400 }
      );
    }

    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();

    // Ensure organization ID matches auth context
    if (data.org_id && data.org_id !== organizationId) {
      return NextResponse.json(
        { error: "Organization ID mismatch" },
        { status: 403 }
      );
    }

    // Add organization ID if not present
    if (organizationId) {
      data.org_id = organizationId;
    }

    // Forward the request to the backend with auth headers
    const response = await api.put(`/api/diagnoses/${id}`, data, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });

    return NextResponse.json(response.data);

  } catch (error) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Error updating diagnosis:', error);
    
    // Handle JSON parsing errors
    if (error.name === 'SyntaxError') {
      return NextResponse.json(
        { 
          error: "Invalid request format",
          details: "Request body must be valid JSON"
        },
        { status: 400 }
      );
    }

    // Return detailed error information
    const errorMessage = error.response?.data?.error || error.message || 'Failed to update diagnosis';
    const statusCode = error.response?.status || 500;
    
    const responseBody = {
      error: errorMessage,
      details: error.response?.data || {}
    };
    
    return NextResponse.json(responseBody, { status: statusCode });
  }
}

/**
 * DELETE /api/diagnosis/[id]
 * Deletes a specific diagnosis by ID
 */
export async function DELETE(req, { params }) {
  try {
    // Await params before accessing properties (Next.js 15+ requirement)
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Diagnosis ID is required" },
        { status: 400 }
      );
    }

    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();

    console.log('Deleting diagnosis with ID:', id);
    console.log('Organization ID from auth:', organizationId);

    // Forward the request to the backend with auth headers
    const response = await api.delete(`/api/diagnoses/${id}`, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });

    return NextResponse.json(response.data);

  } catch (error) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.error('Error deleting diagnosis:', error);
    
    // Get the awaited params for error logging
    const awaitedParams = await params;
    
    // Return detailed error information for debugging
    const errorMessage = error.response?.data?.error || error.message || 'Failed to delete diagnosis';
    const statusCode = error.response?.status || 500;
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: error.response?.data || {},
        diagnosisId: awaitedParams.id,
        requestUrl: error.config?.url || 'Unknown URL'
      },
      { status: statusCode }
    );
  }
}