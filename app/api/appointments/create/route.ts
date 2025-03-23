import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * POST /api/appointments/create
 * Creates a new appointment with the provided data
 */
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

    // Get the appointment data from the request body
    const requestData = await req.json();
    
    // Transform the frontend form data to match the backend expectations
    const appointmentData = {
      patient_id: requestData.patient.id,
      doctor_id: requestData.doctor.id,
      hospital_id: requestData.doctor.hospitalId || "", // Assuming this comes from the doctor object
      patient_name: requestData.patient.name,
      doctor_name: requestData.doctor.name,
      appointment_date: createDateTimeFromParts(requestData.date, requestData.time),
      fee_type: requestData.feeType || "default", // Default if not specified
      payment_method: requestData.paymentMethod || "online", // Default if not specified
      reason: requestData.reason || ""
    };

    // Make the request to the backend API directly using axios
    const response = await axios.post(`${API_BASE_URL}/api/appointments/create`, appointmentData, {
      headers: {
        // Include auth headers
        'Authorization': `Bearer ${user.id}`,
        ...(organizationId && { 'X-Organization-ID': organizationId }),
        ...(role && { 'X-Role': role })
      }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Handle validation errors from the backend
    if (error.response?.status === 400) {
      return NextResponse.json(
        { error: error.response.data.error || 'Invalid appointment data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create appointment' },
      { status: error.response?.status || 500 }
    );
  }
}

// Helper function to combine date and time strings into a single Date object
function createDateTimeFromParts(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a new date object with the combined date and time
  const combinedDate = new Date(date);
  combinedDate.setHours(hours, minutes, 0, 0);
  
  return combinedDate;
}