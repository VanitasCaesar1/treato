// app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET() {
  try {
    const { user, role, organizationId, accessToken, sessionId } = await withAuth();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return the session data with proper role information
    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      role, 
      organizationId,
      authenticated: true
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ 
      error: "Failed to get session",
      authenticated: false 
    }, { status: 500 });
  }
}