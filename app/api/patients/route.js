import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/patients
 * Retrieves all patients with pagination, filtering, and search capabilities
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
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const search = url.searchParams.get('search') || '';
    const bloodGroup = url.searchParams.get('bloodGroup') || '';
    
    // Build query string
    let queryString = `?page=${page}&limit=${limit}`;
    if (search) queryString += `&search=${encodeURIComponent(search)}`;
    if (bloodGroup) queryString += `&bloodGroup=${encodeURIComponent(bloodGroup)}`;
    
    // Forward the request to the backend with auth headers
    const response = await api.get(`/api/patients${queryString}`, {}, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || ''
      }
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching patients:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch patients' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * POST /api/patients
 * Creates a new patient
 */
export async function POST(req) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role, accessToken, sessionId } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const patientData = await req.json();
    
    // Forward the request to the backend with auth headers
    const response = await api.post('/api/patients/create', patientData, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || ''
      }
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating patient:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create patient' },
      { status: error.response?.status || 500 }
    );
  }
}