// File: /app/api/auth/organization/route.js
import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/auth/organization
 * Retrieves the authenticated user's organization ID
 */
export async function GET() {
  try {
    // Get auth data from WorkOS
    const { organizationId, user } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "No organization associated with this user" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      organizationId,
      userId: user.id
    });
  } catch (error) {
    console.error('Error retrieving organization information:', error);
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve organization information' },
      { status: 500 }
    );
  }
}