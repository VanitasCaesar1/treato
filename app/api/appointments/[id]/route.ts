import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/appointments/[id]
 * Retrieves a specific appointment by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the appointment ID from the URL parameter
    const appointmentId = params.id;

    // Forward the request to the backend
    const response = await api.get(`/api/appointments/${appointmentId}`);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error retrieving appointment:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to retrieve appointment' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * PUT /api/appointments/[id]
 * Updates an existing appointment with the provided data
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      // Get auth data from WorkOS
      const { user, organizationId, role } = await withAuth();
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
  
      // Get the appointment ID from the URL parameter
      const appointmentId = params.id;
      
      // Get the updated appointment data from the request body
      const appointmentData = await req.json();
  
      // Forward the request to the backend
      const response = await api.put(`/api/appointments/${appointmentId}`, appointmentData);
      return NextResponse.json(response);
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      
      // Handle authentication errors
      if (error.code === 'AUTH_REQUIRED') {
        return NextResponse.json(
          { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
          { status: 401 }
        );
      }
  
      return NextResponse.json(
        { error: error.response?.data?.error || 'Failed to update appointment' },
        { status: error.response?.status || 500 }
      );
    }
  }


/**
 * DELETE /api/appointments/[id]
 * Deletes a specific appointment by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the appointment ID from the URL parameter
    const appointmentId = params.id;

    // Forward the request to the backend
    const response = await api.delete(`/api/appointments/${appointmentId}`);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to delete appointment' },
      { status: error.response?.status || 500 }
    );
  }
}