import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/patients/search
 * Search for patients with specific criteria
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
    
    // Extract query parameters
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const limit = url.searchParams.get('limit') || '10';
    const bloodGroup = url.searchParams.get('bloodGroup') || '';
    const age = url.searchParams.get('age') || '';
    
    // Build query string
    let queryString = `?query=${encodeURIComponent(query)}&limit=${limit}`;
    if (bloodGroup) queryString += `&bloodGroup=${encodeURIComponent(bloodGroup)}`;
    if (age) queryString += `&age=${encodeURIComponent(age)}`;
    
    // Forward the request to the backend with auth headers
    const response = await api.get(`/api/patients/search${queryString}`, {}, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || ''
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