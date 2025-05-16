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
    
    console.log("Received frontend request data:", JSON.stringify(requestData, null, 2));
    
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

    // Validate fee_type is one of the allowed values
    const feeType = requestData.feeType || requestData.fee_type || "default";
    if (!["emergency", "default", "recurring"].includes(feeType)) {
      return NextResponse.json(
        { error: "Fee type must be emergency, default, or recurring" },
        { status: 400 }
      );
    }
    
    // Ensure org_id is in the correct format
    if (!orgId || !/^org_[A-Z0-9]{26}$/.test(orgId)) {
      return NextResponse.json(
        { error: "Organization ID must be in ULID format (org_[A-Z0-9]{26})" },
        { status: 400 }
      );
    }

    // Handle the appointment date more intelligently
    let appointmentDate;
    
    // Check if a complete appointment_date is provided
    if (requestData.appointment_date) {
      appointmentDate = new Date(requestData.appointment_date);
    } 
    // Otherwise try to combine date and time fields
    else if (requestData.date) {
      appointmentDate = createDateTimeFromParts(requestData.date, requestData.time);
    } 
    // Fallback - current date is not ideal but prevents errors
    else {
      console.warn("No appointment date information provided");
      appointmentDate = new Date();
    }
    
    // Validate the resulting date
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid appointment date provided" },
        { status: 400 }
      );
    }
    
    // Format date as YYYY-MM-DD for the availability API
    const formattedDateOnly = appointmentDate.toISOString().split('T')[0];
    
    // Check doctor availability before proceeding
    console.log(`Checking doctor ${doctorId} availability for ${formattedDateOnly}`);
    let availableSlots;
    try {
      // Fetch available slots from the backend
      const availabilityResponse = await axios.get(
        `${API_BASE_URL}/api/doctors/${doctorId}/availability`, 
        {
          params: { 
            date: formattedDateOnly,
            org_id: organizationId  // Use organizationId from withAuth
          },
          headers: {
            'Authorization': `Bearer ${user.id}`,
            ...(organizationId && { 'X-Organization-ID': organizationId }),
            ...(role && { 'X-Role': role })
          }
        }
      );
 // Log the entire availability response for debugging
 console.log("Availability response:", JSON.stringify(availabilityResponse.data, null, 2));
  
 // Check both available_slots and raw_slots from response
 availableSlots = availabilityResponse.data.available_slots || [];
 const rawSlots = availabilityResponse.data.raw_slots || [];
 
 console.log("Available slots:", JSON.stringify(availableSlots, null, 2));
 console.log("Raw slots:", rawSlots);
 
 if (availableSlots.length === 0 && rawSlots.length === 0) {
   return NextResponse.json(
     { error: "No available appointment slots for this doctor on the selected date" },
     { status: 400 }
   );
 }
} catch (error: any) {
 console.error("Error fetching doctor availability:", error);
 // If we can't get availability, we'll try to use the times from the request
 // Backend will validate and reject if needed
 availableSlots = null;
}    // Use slot times from request first, then from available slots, then generate default
    let slotStartTime, slotEndTime;
    
    if (requestData.slot_start_time && requestData.slot_end_time) {
      // Use provided slot times if available
      slotStartTime = requestData.slot_start_time;
      slotEndTime = requestData.slot_end_time;
    } else if (availableSlots && availableSlots.length > 0) {
      // Use first available slot if we have them
      const firstSlot = availableSlots[0];
      slotStartTime = firstSlot.start_time;
      slotEndTime = firstSlot.end_time;
    } else {
      // Generate from appointment date as fallback
      slotStartTime = createTimeString(appointmentDate);
      slotEndTime = createEndTimeString(appointmentDate);
    }
    
    // Ensure patient_name and doctor_name are strings
    const patientName = String(requestData.patient?.name || requestData.patient_name || "");
    const doctorName = String(requestData.doctor?.name || requestData.doctor_name || "");
    
    // Create a properly formatted ISO datetime string for the backend
    // This combines the date with the slot start time
    const [hours, minutes] = slotStartTime.split(':').map(Number);
    const fullAppointmentDate = new Date(appointmentDate);
    fullAppointmentDate.setHours(hours, minutes, 0, 0);
    const formattedFullDate = fullAppointmentDate.toISOString();
    
    // Transform the frontend form data to match the backend expectations
    const appointmentData = {
      patient_id: patientId,
      doctor_id: doctorId,
      org_id: orgId,
      patient_name: patientName,
      doctor_name: doctorName,
      appointment_date: formattedFullDate, // Use full ISO format with time
      fee_type: feeType,
      payment_method: requestData.paymentMethod || requestData.payment_method || "online",
      reason: requestData.reason || "",
      
      // Add required fields with default values
      appointment_status: "not_completed",
      appointment_fee: 0, // Will be calculated by backend
      is_valid: true,
      
      // Add slot start and end times
      slot_start_time: slotStartTime,
      slot_end_time: slotEndTime,
      
      // created_at and next_visit_date will be set by backend
    };

    console.log("Prepared appointment data:", JSON.stringify(appointmentData, null, 2));

    // Check for required fields
    const requiredFields = [
      'patient_id', 'doctor_id', 'org_id', 'patient_name', 
      'doctor_name', 'appointment_date', 'fee_type', 'payment_method',
      'appointment_status', 'appointment_fee', 'is_valid',
      'slot_start_time', 'slot_end_time'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = appointmentData[field];
      // Check for undefined, null, empty string, or invalid date
      const isEmpty = value === undefined || value === null || 
                     (typeof value === 'string' && value.trim() === '') ||
                     (value instanceof Date && isNaN(value.getTime()));
      
      if (isEmpty) {
        console.log(`Missing field: ${field}, value: ${value}`);
      }
      return isEmpty;
    });
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Make the request to the backend API directly using axios
    console.log("Sending request to backend:", `${API_BASE_URL}/api/appointments/create`);
    
    const response = await axios.post(`${API_BASE_URL}/api/appointments/create`, appointmentData, {
      headers: {
        'Content-Type': 'application/json',
        // Include auth headers
        'Authorization': `Bearer ${user.id}`,
        ...(organizationId && { 'X-Organization-ID': organizationId }),
        ...(role && { 'X-Role': role })
      }
    });

    console.log("Backend response:", response.status, response.data);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    
    // Enhanced error logging for debugging
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request was made but no response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
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
function createDateTimeFromParts(date: string | Date, timeString: string | undefined): Date {
  if (!date) {
    console.error("No date provided for appointment");
    throw new Error("Date is required for creating an appointment");
  }
  
  const combinedDate = new Date(date);
  
  // Validate the date is valid
  if (isNaN(combinedDate.getTime())) {
    console.error("Invalid date provided:", date);
    throw new Error("Invalid date format provided");
  }
  
  // Check if timeString is defined before trying to split it
  if (timeString) {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      
      // Validate hours and minutes
      if (isNaN(hours) || hours < 0 || hours > 23) {
        console.warn("Invalid hours in time string:", timeString);
        // Default to noon as a safe fallback
        combinedDate.setHours(12, 0, 0, 0);
      } else if (isNaN(minutes) || minutes < 0 || minutes > 59) {
        console.warn("Invalid minutes in time string:", timeString);
        // Default to start of specified hour
        combinedDate.setHours(hours, 0, 0, 0);
      } else {
        // Set the hours and minutes on the combined date
        combinedDate.setHours(hours, minutes, 0, 0);
      }
    } catch (error) {
      console.error("Error parsing time string:", timeString, error);
      // Default to noon if time parsing fails
      combinedDate.setHours(12, 0, 0, 0);
    }
  } else {
    // If no time is provided, set to noon by default
    combinedDate.setHours(12, 0, 0, 0);
  }
  
  return combinedDate;
}

// Helper functions for creating time strings
function createTimeString(date: Date): string {
  // Format: HH:MM (24-hour format)
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function createEndTimeString(date: Date): string {
  // Default appointment duration: 30 minutes
  const endDate = new Date(date);
  endDate.setMinutes(date.getMinutes() + 30);
  
  // Format: HH:MM (24-hour format)
  const hours = endDate.getHours().toString().padStart(2, '0');
  const minutes = endDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}