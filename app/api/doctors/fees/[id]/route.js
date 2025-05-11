// app/api/doctors/fees/[id]/route.js
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * DELETE /api/doctors/[id]/fees
 * Deletes fees for a specific doctor
 */
export async function DELETE(
  req,
  { params }
) {
  try {
    const { id } = params;
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    const response = await api.delete(`/api/doctors/${id}/fees`, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    
    // Return the data from the response, not the entire response object
    return NextResponse.json(response.data);
  } catch (error) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.error('Error deleting doctor fees:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to delete doctor fees' },
      { status: error.response?.status || 500 }
    );
  }
}