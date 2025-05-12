import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * GET /api/doctors/[id]/availability
 * Fetches available time slots for a specific doctor on a given date
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    const date = url.searchParams.get('date');
    const orgId = url.searchParams.get('org_id') || organizationId;
    
    // Validate required parameters
    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }
    
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }
    
    // Get the doctor ID from route params
    const doctorId = params.id;
    
    // Validate doctor ID format (UUID)
    if (!doctorId || 
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(doctorId)) {
      return NextResponse.json(
        { error: "Invalid doctor ID format" },
        { status: 400 }
      );
    }
    
    // Make the request to the backend API
    const response = await axios.get(
      `${API_BASE_URL}/api/doctors/${doctorId}/availability?date=${date}&org_id=${orgId}`,
      {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          ...(organizationId && { 'X-Organization-ID': organizationId })
        }
      }
    );
    
    return NextResponse.json(response.data);
    
  } catch (error: any) {
    console.error('Error fetching doctor availability:', error);
    
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
        { error: error.response.data.error || 'Failed to fetch availability' },
        { status: error.response.status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch doctor availability' },
      { status: 500 }
    );
  }
}