import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/diagnosis/[id]
 * Retrieves a specific diagnosis by ID
 */
export async function GET(req, { params }) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the diagnosis ID from the URL parameter
    const diagnosisId = params.id;
    
    // Forward the request to the backend
    const response = await api.get(`/api/diagnoses/${diagnosisId}`);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error retrieving diagnosis:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
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
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the diagnosis ID from the URL parameter
    const diagnosisId = params.id;
    
    // Parse request body
    const data = await req.json();
    
    // Forward the request to the backend
    const response = await api.put(`/api/diagnoses/${diagnosisId}`, data);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating diagnosis:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to update diagnosis' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * DELETE /api/diagnosis/[id]
 * Deletes a specific diagnosis by ID
 */
export async function DELETE(req, { params }) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the diagnosis ID from the URL parameter
    const diagnosisId = params.id;
    
    // Forward the request to the backend
    const response = await api.delete(`/api/diagnoses/${diagnosisId}`);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting diagnosis:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to delete diagnosis' },
      { status: error.response?.status || 500 }
    );
  }
}