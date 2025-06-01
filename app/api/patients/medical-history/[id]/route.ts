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
    
    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '50';
    const includeActive = searchParams.get('include_active') || 'true';

    // Build query parameters for medical history
    const queryParams = {
      limit,
      include_active: includeActive,
      cross_org: 'true'
    };

    // Forward the request to the backend with auth headers
    // Route matches: /api/patients/medical-history/:id
    const response = await api.get(`/api/patients/medical-history/${patientId}`, queryParams, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || '',
        'X-User-ID': user.id
      }
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error retrieving medical history:', error);
    
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