// app/api/doctors/schedules/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * DELETE /api/doctors/schedules/[id]
 * Deletes a specific schedule
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Forward the request to the GoFiber backend with auth headers
    const response = await api.delete(`/api/doctor/schedule/${id}`, null, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || ''
      }
    });
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error deleting doctor schedule:', error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to delete doctor schedule' },
      { status: error.response?.status || 500 }
    );
  }
}