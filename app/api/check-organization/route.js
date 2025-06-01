// app/api/check-organization/route.js
import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET() {
  try {
    const { user, organizationId } = await withAuth();
    
    console.log('Auth check result:', {
      userId: user?.id,
      organizationId: organizationId,
      organizationExists: !!organizationId
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', organizationId: null },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id, 'Organization:', organizationId);

    // Return the organization ID (can be null if user isn't in an organization)
    return NextResponse.json({
      success: true,
      organizationId: organizationId || null,
      userId: user.id
    });
  } catch (error) {
    console.error('Error in check-organization API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        organizationId: null,
        success: false
      },
      { status: 500 }
    );
  }
}