// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';  // Changed from default import to named import
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(req: NextRequest) {
  try {
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    const profileData = await api.get('/api/user/profile', null, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    
    return NextResponse.json(profileData);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch user profile' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    const updatedProfile = await api.put('/api/user/profile', data, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    
    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to update user profile' },
      { status: error.response?.status || 500 }
    );
  }
}