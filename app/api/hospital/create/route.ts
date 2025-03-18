import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * POST /api/hospital/create
 * Creates a new hospital with the provided data
 */
export async function POST(req: NextRequest) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get the hospital data from the request body
    const hospitalData = await req.json();
    
    // Forward the request to the backend
    const response = await api.post('/api/hospital/create', hospitalData);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error creating hospital:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create hospital' },
      { status: error.response?.status || 500 }
    );
  }
}