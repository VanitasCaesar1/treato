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
    
    // Handle nested patient object structure from the frontend
    const patientId = requestData.patient?.id || requestData.patient_id;
    
    // Validate patient_id format (8-digit alphanumeric)
    if (!patientId || !/^[A-Z0-9]{8}$/.test(patientId)) {
      return NextResponse.json(
        { error: "Patient ID must be 8-digit alphanumeric format" },
        { status: 400 }
      );
    }
    
    // Handle nested doctor object structure from the frontend
    const doctorId = requestData.doctor?.id || requestData.doctor_id;
    
    // Validate doctor_id format (UUID)
    if (!doctorId || 
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(doctorId)) {
      return NextResponse.json(
        { error: "Doctor ID must be in UUID format" },
        { status: 400 }
      );
    }

    // Get org_id from request or fall back to auth context
    const orgId = requestData.org_id || organizationId;

    // Transform the frontend form data to match the backend expectations
    const appointmentData = {
      patient_id: patientId,
      doctor_id: doctorId,
      org_id: orgId,
      patient_name: requestData.patient?.name || requestData.patient_name,
      doctor_name: requestData.doctor?.name || requestData.doctor_name,
      appointment_status: requestData.status || "pending",
      created_at: new Date(),
      appointment_date: createDateTimeFromParts(requestData.date, requestData.time),
      fee_type: requestData.feeType || requestData.fee_type || "default", // Handle both naming conventions
      payment_method: requestData.paymentMethod || requestData.payment_method || "online", // Handle both naming conventions
      reason: requestData.reason || ""
    };
    
    // Validate fee_type is one of the allowed values
    if (!["emergency", "default", "recurring"].includes(appointmentData.fee_type)) {
      return NextResponse.json(
        { error: "Fee type must be emergency, default, or recurring" },
        { status: 400 }
      );
    }
    
    // Ensure org_id is in the correct format
    if (!appointmentData.org_id || !/^org_[A-Z0-9]{26}$/.test(appointmentData.org_id)) {
      return NextResponse.json(
        { error: "Organization ID must be in ULID format (org_[A-Z0-9]{26})" },
        { status: 400 }
      );
    }

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