import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/medicines/search
 * Search for medicines with specific criteria
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
    const term = url.searchParams.get('term') || '';
    const limit = url.searchParams.get('limit') || '50';
    const company = url.searchParams.get('company') || '';
    const unit = url.searchParams.get('unit') || '';

    // Build query string
    let queryString = `?term=${encodeURIComponent(term)}&limit=${limit}`;
    if (company) queryString += `&company=${encodeURIComponent(company)}`;
    if (unit) queryString += `&unit=${encodeURIComponent(unit)}`;

    // Forward the request to the backend with auth headers
    const response = await api.get(`/api/medicines/search${queryString}`, {}, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || ''
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching medicines:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to search medicines' },
      { status: error.response?.status || 500 }
    );
  }
}