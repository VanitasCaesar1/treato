// app/api/check-organization/route.js
import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET() {
  try {
    // Use withAuth to get user data including organization info
    const { user, organization } = await withAuth();
    
    // Return the organization info
    return NextResponse.json({
      success: true,
      hasOrganization: !!organization,
      organizationId: organization?.id || null,
      user: user || null
    });
  } catch (error) {
    console.error('Error in check-organization API route:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { success: false, code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to check organization' },
      { status: 500 }
    );
  }
}