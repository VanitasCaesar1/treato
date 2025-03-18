import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import axios from 'axios';

// Define your API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function POST(req: NextRequest) {
  try {
    // Get auth data from WorkOS - this runs server-side only
    const { user, organizationId, role } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get the form data
    const formData = await req.formData();
    
    // Make the request to your backend API directly using axios
    const response = await axios.post(`${API_BASE_URL}/api/hospital/create`, formData, {
      headers: {
        // Include auth headers
        'Authorization': `Bearer ${user.id}`,
        ...(organizationId && { 'X-Organization-ID': organizationId }),
        ...(role && { 'X-Role': role })
      }
    });
    
    return NextResponse.json(response.data);
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