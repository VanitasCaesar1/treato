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
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request data
    const requestData = await req.json();
    console.log("Received frontend request data:", JSON.stringify(requestData, null, 2));
    
    // Extract and validate core fields
    const { 
      patient, doctor, org_id, date, time, feeType, paymentMethod, reason,
      patient_id, doctor_id, patient_name, doctor_name, fee_type, payment_method,
      slot_start_time, slot_end_time, appointment_date
    } = requestData;
    
    // Calculate start time if not explicitly provided
    const startTime = slot_start_time || time || "";
    
    // Build appointment data with prioritized fields
    const appointmentData = {
      // Patient info - handle both object and direct field versions
      patient_id: patient?.id || patient_id,
      patient_name: patient?.name || patient_name || "",
      
      // Doctor info - handle both object and direct field versions
      doctor_id: doctor?.id || doctor_id,
      doctor_name: doctor?.name || doctor_name || "",
      
      // Organization info
      org_id: org_id || organizationId,
      
      // Date and time handling
      appointment_date: getFormattedDate(appointment_date, date, startTime),
      slot_start_time: startTime.toString().trim(), // Ensure slot_start_time is always set
      slot_end_time: slot_end_time || calculateEndTime(startTime),
      
      // Payment and status info
      fee_type: fee_type || feeType || "default",
      payment_method: payment_method || paymentMethod || "online",
      reason: reason || "",
      appointment_status: "not_completed",
      appointment_fee: 0, // Will be calculated by backend
      is_valid: true
    };

    // Ensure slot_start_time is never empty
    if (!appointmentData.slot_start_time) {
      // Default to current time if no time provided
      const now = new Date();
      appointmentData.slot_start_time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // If end time wasn't set, calculate it based on new start time
      if (!slot_end_time) {
        appointmentData.slot_end_time = calculateEndTime(appointmentData.slot_start_time);
      }
    }
    
    // Validate required fields
    const validationError = validateAppointmentData(appointmentData);
    if (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    console.log("Sending appointment data to backend:", JSON.stringify(appointmentData, null, 2));

    // Make the request to backend API
    const response = await axios.post(`${API_BASE_URL}/api/appointments/create`, appointmentData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`,
        ...(organizationId && { 'X-Organization-ID': organizationId }),
        ...(role && { 'X-Role': role })
      }
    });

    console.log("Backend response:", response.status);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    
    // Enhanced error handling
    if (error.response?.data) {
      console.error('Response error:', error.response.data);
      return NextResponse.json(
        { error: error.response.data.error || 'Failed to create appointment' },
        { status: error.response.status || 400 }
      );
    }
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Helper functions
function getFormattedDate(appointmentDate: string | Date | undefined, date: string | Date | undefined, time: string | undefined): string {
  let targetDate;
  
  // Try each date source in priority order
  if (appointmentDate) {
    targetDate = new Date(appointmentDate);
  } else if (date) {
    targetDate = new Date(date);
    
    // Add time component if available
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        targetDate.setHours(hours, minutes, 0, 0);
      }
    }
  } else {
    // Default to current date with time component if available
    targetDate = new Date();
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        targetDate.setHours(hours, minutes, 0, 0);
      }
    }
  }
  
  // Ensure date is valid
  if (isNaN(targetDate.getTime())) {
    throw new Error("Invalid date format");
  }
  
  return targetDate.toISOString();
}

function calculateEndTime(startTime: string | undefined): string {
  if (!startTime) {
    // Default to current time + 30 minutes
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 60000);
    return `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Parse and add 30 minutes
  const [hours, minutes] = startTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error("Invalid time format");
  }
  
  let endHours = hours;
  let endMinutes = minutes + 30;
  
  if (endMinutes >= 60) {
    endHours = (endHours + 1) % 24;
    endMinutes -= 60;
  }
  
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

function validateAppointmentData(data: any): string | null {
  // Required field validation
  const requiredFields = [
    'patient_id', 'doctor_id', 'org_id', 'appointment_date', 
    'slot_start_time', 'slot_end_time', 'fee_type', 'payment_method'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }
  
  // Validate patient_id format (8-digit alphanumeric)
  if (!/^[A-Z0-9]{8}$/.test(data.patient_id)) {
    return "Patient ID must be 8-digit alphanumeric format";
  }
  
  // Validate doctor_id format (UUID)
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(data.doctor_id)) {
    return "Doctor ID must be in UUID format";
  }
  
  // Validate org_id format
  if (!/^org_[A-Z0-9]{26}$/.test(data.org_id)) {
    return "Organization ID must be in ULID format (org_[A-Z0-9]{26})";
  }
  
  // Validate time formats
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(data.slot_start_time)) {
    return "Slot start time must be in HH:MM format (24-hour)";
  }
  
  if (!timeRegex.test(data.slot_end_time)) {
    return "Slot end time must be in HH:MM format (24-hour)";
  }
  
  // Validate fee_type is one of the allowed values
  if (!["emergency", "default", "recurring"].includes(data.fee_type)) {
    return "Fee type must be emergency, default, or recurring";
  }
  
  return null;
}