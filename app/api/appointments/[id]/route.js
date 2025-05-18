import { NextResponse } from 'next/server';
import axios from 'axios';
import { withAuth } from '@workos-inc/authkit-nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Helper function to validate ID format
function isValidId(id) {
  // Validate UUID format
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
}

/**
 * GET /api/appointments/[id]
 * Gets a specific appointment by ID
 */
export async function GET(request, { params }) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Make sure to await params if needed
    const id = params.id;
    
    // Validate ID format before making request
    if (!isValidId(id)) {
      return NextResponse.json({ 
        error: "Invalid appointment ID format. Expected UUID format." 
      }, { status: 400 });
    }

    // Make request to backend API
    const response = await axios.get(`${API_BASE_URL}/api/appointments/${id}`, {
      headers: {
        'Authorization': `Bearer ${user.id}`,
        ...(organizationId && { 'X-Organization-ID': organizationId }),
        ...(role && { 'X-Role': role })
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    
    if (error.response?.data) {
      return NextResponse.json(
        { error: error.response.data.error || 'Failed to fetch appointment' },
        { status: error.response.status || 400 }
      );
    }
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}