// app/api/patients/search/route.js
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/patients/search
 * Searches for patients based on various criteria
 */
export async function GET(req) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role, accessToken, sessionId } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const searchQuery = searchParams.get('q');
    const searchBy = searchParams.get('by') || 'name';
    const hospitalId = searchParams.get('hospital_id');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build query parameters
    const queryParams = {};
    if (searchQuery) queryParams.q = searchQuery;
    if (searchBy) queryParams.by = searchBy;
    if (hospitalId) queryParams.hospital_id = hospitalId;
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;
    
    // Forward the request to the backend with auth headers
    const response = await api.get('/api/patients/search', queryParams, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || '' // Add the role as a header
      }
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching patients:', error);
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to search patients' },
      { status: error.response?.status || 500 }
    );
  }
}