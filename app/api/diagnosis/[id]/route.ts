import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

interface DiagnosisParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/diagnosis/[id]
 * Retrieves a specific diagnosis by ID
 */
export async function GET(
  req: NextRequest,
  { params }: DiagnosisParams
) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the diagnosis ID from the URL parameter
    const diagnosisId = params.id;

    if (!diagnosisId) {
      return NextResponse.json(
        { error: "Diagnosis ID is required" },
        { status: 400 }
      );
    }

    // Forward the request to the backend with proper headers
    const response = await api.get(`/api/diagnoses/${diagnosisId}`, {
      headers: {
        'X-User-ID': user.id,
        'X-Organization-ID': organizationId,
        'X-User-Role': role,
      }
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error retrieving diagnosis:', error);

    // Handle specific error cases
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Handle backend API errors
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to retrieve diagnosis';
      
      return NextResponse.json(
        { error: errorMessage },
        { status }
      );
    }

    // Handle network or other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/diagnosis/[id]
 * Updates a specific diagnosis by ID
 */
export async function PUT(
  req: NextRequest,
  { params }: DiagnosisParams
) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the diagnosis ID from the URL parameter
    const diagnosisId = params.id;

    if (!diagnosisId) {
      return NextResponse.json(
        { error: "Diagnosis ID is required" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let data;
    try {
      data = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: "Invalid request format",
          details: "Request body must be valid JSON"
        },
        { status: 400 }
      );
    }

    // Ensure organization ID matches auth context
    if (data.org_id && data.org_id !== organizationId) {
      return NextResponse.json(
        { error: "Organization ID mismatch" },
        { status: 403 }
      );
    }

    // Add organization ID if not present
    data.org_id = organizationId;

    // Forward the request to the backend
    const response = await api.put(`/api/diagnoses/${diagnosisId}`, data, {
      headers: {
        'X-User-ID': user.id,
        'X-Organization-ID': organizationId,
        'X-User-Role': role,
      }
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error updating diagnosis:', error);

    // Handle specific error cases
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Handle backend API errors
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to update diagnosis';
      const details = error.response.data?.details;
      
      const responseBody: any = { error: errorMessage };
      if (details) {
        responseBody.details = details;
      }
      
      return NextResponse.json(responseBody, { status });
    }

    // Handle network or other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/diagnosis/[id]
 * Deletes a specific diagnosis by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: DiagnosisParams
) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the diagnosis ID from the URL parameter
    const diagnosisId = params.id;

    if (!diagnosisId) {
      return NextResponse.json(
        { error: "Diagnosis ID is required" },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const response = await api.delete(`/api/diagnoses/${diagnosisId}`, {
      headers: {
        'X-User-ID': user.id,
        'X-Organization-ID': organizationId,
        'X-User-Role': role,
      }
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error deleting diagnosis:', error);

    // Handle specific error cases
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Handle backend API errors
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error || 'Failed to delete diagnosis';
      
      return NextResponse.json(
        { error: errorMessage },
        { status }
      );
    }

    // Handle network or other errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}