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
    
    // Extract fields directly without transforming
    const { 
      patient, doctor, org_id, date, time, feeType, paymentMethod, reason,
      patient_id, doctor_id, patient_name, doctor_name, fee_type, payment_method,
      slot_start_time, slot_end_time, appointment_date, appointment_status, is_valid, appointment_fee
    } = requestData;
    
    // IMPORTANT: Preserve the exact times provided without manipulating them
    // Use the explicitly provided slot timings directly from the request
    const startTime = slot_start_time || time;
    
    // Only calculate end time if not explicitly provided
    let endTime = slot_end_time;
    if (!endTime && startTime) {
      endTime = calculateEndTime(startTime);
    }
    
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
      
      // Date handling - preserve the original date format
      appointment_date: appointment_date || date || new Date().toISOString(),
      
      // CRITICAL: Use the original time values without manipulating format
      slot_start_time: startTime,
      slot_end_time: endTime,
      
      // Payment and status info
      fee_type: fee_type || feeType || "default",
      payment_method: payment_method || paymentMethod || "online",
      reason: reason || "",
      appointment_status: appointment_status || "not_completed",
      is_valid: is_valid !== undefined ? is_valid : true,
      appointment_fee: undefined
    };
    
    // Only include appointment_fee if explicitly provided
    if (appointment_fee !== undefined) {
      appointmentData.appointment_fee = appointment_fee;
    }

    // Fallback only if time fields are completely missing
    if (!appointmentData.slot_start_time) {
      const now = new Date();
      appointmentData.slot_start_time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      appointmentData.slot_end_time = calculateEndTime(appointmentData.slot_start_time);
    }
    
    // Log the unmodified appointment data before validation
    console.log("Pre-validation appointment data:", JSON.stringify(appointmentData, null, 2));
    
    // Validate required fields but don't modify the data
    const validationError = validateAppointmentData(appointmentData);
    if (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    console.log("Sending appointment data to backend with PRESERVED slot timings:", JSON.stringify(appointmentData, null, 2));

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

// Calculate end time only if not provided (30 minutes after start time)
function calculateEndTime(startTime: string): string {
  if (!startTime) {
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 60000);
    return `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // For time formats like HH:MM
  if (startTime.includes(':')) {
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
  
  // Default fallback if format is unexpected
  return startTime;
}

function validateAppointmentData(data: any): string | null {
  const requiredFields = [
    'patient_id', 'doctor_id', 'org_id', 'appointment_date', 
    'slot_start_time', 'slot_end_time', 'fee_type', 'payment_method',
    'patient_name', 'doctor_name'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }
  
  if (!/^[A-Z0-9]{8}$/.test(data.patient_id)) {
    return "Patient ID must be 8-digit alphanumeric format";
  }
  
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(data.doctor_id)) {
    return "Doctor ID must be in UUID format";
  }
  
  if (!/^org_[A-Z0-9]{26}$/.test(data.org_id)) {
    return "Organization ID must be in ULID format (org_[A-Z0-9]{26})";
  }
  
  // Relaxed time format validation - accept whatever was passed if it includes a colon
  if (!data.slot_start_time.includes(':')) {
    return "Slot start time must include hours and minutes separated by colon";
  }
  
  if (!data.slot_end_time.includes(':')) {
    return "Slot end time must include hours and minutes separated by colon";
  }
  
  if (!["emergency", "default", "recurring"].includes(data.fee_type)) {
    return "Fee type must be emergency, default, or recurring";
  }
  
  return null;
}