import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/doctors/[id]/appointments
 * Retrieves all appointments for a specific doctor
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

    // Get the doctor ID from the URL parameter
    const doctorId = params.id;
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    // Build query parameters
    const queryParams: Record<string, string> = {};
    if (status) queryParams.status = status;
    if (startDate) queryParams.start_date = startDate;
    if (endDate) queryParams.end_date = endDate;
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;

    // Forward the request to the backend
    const response = await api.get(`/api/appointments/doctor/${doctorId}`, queryParams);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error retrieving doctor appointments:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to retrieve doctor appointments' },
      { status: error.response?.status || 500 }
    );
  }
}