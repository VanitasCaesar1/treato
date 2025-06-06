import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/patients/medical-history/[id]
 * Retrieves comprehensive medical history for a patient across all organizations
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role, accessToken, sessionId } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Await the params promise
    const { id: patientId } = await params;
    
    console.log("Patient ID from params:", patientId); // Debug log
    
    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    const status = searchParams.get('status') || 'finalized';
    const includeActive = searchParams.get('include_active') || 'true';

    // Build query parameters for medical history
    const queryParams = new URLSearchParams({
      limit,
      offset,
      status,
      include_active: includeActive,
      ...(organizationId && { org_id: organizationId })
    });

    console.log("Making request to backend:", `/api/patients/medical-history/${patientId}?${queryParams}`); // Debug log

    // Forward the request to the backend with auth headers
    // This should match your Go route: /api/patients/medical-history/:patientId
    const backendUrl = `/api/patients/medical-history/${patientId}`;
    const fullUrl = queryParams.toString() ? `${backendUrl}?${queryParams}` : backendUrl;
    
    console.log("Full backend URL:", fullUrl); // Debug log
    
    const response = await api.get(backendUrl, Object.fromEntries(queryParams), {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || '',
        'X-User-ID': user.id
      }
    });

    console.log("Backend response received:", response); // Debug log

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error retrieving medical history:', error);
    
    // Log more details about the error
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to retrieve medical history' },
      { status: error.response?.status || 500 }
    );
  }
}