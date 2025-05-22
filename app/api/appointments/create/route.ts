import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function POST(req: NextRequest) {
  try {
    // Get auth data
    const { user, organizationId } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request data
    const data = await req.json();
    console.log("Frontend request:", data);

    // Send it directly to the backend - let the backend handle validation
    const response = await axios.post(`${API_BASE_URL}/api/appointments/create`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`,
        ...(organizationId && { 'X-Organization-ID': organizationId })
      }
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('Error creating appointment:', error);
    
    if (error.response?.data) {
      return NextResponse.json(
        { error: error.response.data.error || 'Failed to create appointment' },
        { status: error.response.status || 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}