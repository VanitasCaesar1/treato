import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * POST /api/doctors/schedules
 *
 * Creates a schedule for a doctor
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Get auth data from WorkOS
    const { accessToken, sessionId, organizationId } = await withAuth();
    
    // Ensure organization ID is present
    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, 
        { status: 400 });
    }
    
    // Ensure all required fields are present
    if (!data.doctorID) {
      return NextResponse.json({ error: "Doctor ID is required" }, 
        { status: 400 });
    }
    
    // Weekday is required
    if (!data.weekday) {
      return NextResponse.json({ error: "Weekday is required" }, 
        { status: 400 });
    }
    
    // Start and end times are required
    if (!data.startTime || !data.endTime) {
      return NextResponse.json({ error: "Start time and end time are required" }, 
        { status: 400 });
    }
    
    // Format the request payload to match backend expectations
    const schedulePayload = {
      doctorID: data.doctorID,
      weekday: data.weekday,
      startTime: data.startTime,
      endTime: data.endTime,
      isActive: data.isActive !== undefined ? data.isActive : true
    };
    
    // Forward the request to the GoFiber backend with auth headers
    const response = await api.post('/api/doctors/schedules', schedulePayload, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId
      }
    });
    
    // Fixed: Don't rely on response.data having specific properties
    // Use the data we already have available from the request
    const compositeId = `${data.doctorID}_${data.weekday}_${organizationId}`;
    
    // Return the schedule data with the composite ID
    return NextResponse.json({
      id: compositeId,
      doctorID: data.doctorID,
      organizationId: organizationId,
      weekday: data.weekday,
      startTime: data.startTime,
      endTime: data.endTime,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json({ code: 'AUTH_REQUIRED', error: 'Not authenticated' }, 
        { status: 401 });
    }
    
    console.error('Error creating doctor schedule:', error);
    
    // Improved error handling with detailed message
    if (error.response) {
      return NextResponse.json({
        error: error.response.data?.error || 'Failed to create doctor schedule',
        details: error.response.data
      }, { status: error.response.status || 500 });
    }
    
    return NextResponse.json({ error: 'Failed to create doctor schedule' }, 
      { status: 500 });
  }
}