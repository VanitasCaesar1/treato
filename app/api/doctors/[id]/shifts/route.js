import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * GET /api/doctors/[id]/shifts
 * 
 * Fetches shifts for a specific doctor
 */
export async function GET(
  req,
  { params }
) {
  try {
    // Get auth data from WorkOS - this runs server-side only
    const { user, organizationId } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const orgId = url.searchParams.get('org_id') || organizationId;

    // Validate required parameters
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Get the doctor ID from route params
    const doctorId = params.id;

    // Validate doctor ID format (UUID)
    if (!doctorId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(doctorId)) {
      return NextResponse.json(
        { error: "Invalid doctor ID format" },
        { status: 400 }
      );
    }

    try {
      // Make the request to the backend API
      const response = await axios.get(
        `${API_BASE_URL}/api/doctors/${doctorId}/shifts?org_id=${orgId}`,
        {
          headers: {
            'Authorization': `Bearer ${user.id}`,
            ...(organizationId && { 'X-Organization-ID': organizationId })
          }
        }
      );

      // Return the data from the backend API
      return NextResponse.json(response.data);
    } catch (apiError) {
      console.warn('Backend API unavailable, returning mock data:', apiError);
      
      // Return mock data if the backend API is not available
      // For development purposes only
      return NextResponse.json({
        shifts: [
          { weekday: "Monday", starttime: "09:00", endtime: "17:00", isactive: true },
          { weekday: "Tuesday", starttime: "09:00", endtime: "17:00", isactive: true },
          { weekday: "Wednesday", starttime: "09:00", endtime: "17:00", isactive: true },
          { weekday: "Thursday", starttime: "09:00", endtime: "17:00", isactive: true },
          { weekday: "Friday", starttime: "09:00", endtime: "17:00", isactive: true }
        ]
      });
    }
  } catch (error) {
    console.error('Error fetching doctor shifts:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Handle API errors
    if (error.response) {
      return NextResponse.json(
        { error: error.response.data.error || 'Failed to fetch shifts' },
        { status: error.response.status || 500 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to fetch doctor shifts' },
      { status: 500 }
    );
  }
}