// File: app/api/doctors/[id]/fees/route.js
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/doctors/[id]/fees
 * Fetches fees for a specific doctor
 */
export async function GET(
  req,
  { params }
) {
  try {
    const { id } = params;
    // Get auth data from WorkOS
    const { user, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend
    const feesData = await api.get(`/api/doctors/${id}/fees`);
    
    return NextResponse.json(feesData);
  } catch (error) {
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
 * DELETE /api/doctors/[id]/fees
 * Deletes fees for a specific doctor
 */
export async function DELETE(
  req,
  { params }
) {
  try {
    const { id } = params;
    
    console.log(`Starting DELETE request for doctor fees with ID: ${id}`);
    
    // Delete the doctor fees - the api.delete method will automatically
    // include auth headers from withAuth() inside the makeApiRequest implementation
    const response = await api.delete(`/api/doctors/${id}/fees`);
    
    console.log('Delete successful, response:', response);
    
    // Return the response data
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting doctor fees:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to delete doctor fees' },
      { status: error.response?.status || 500 }
    );
  }
}