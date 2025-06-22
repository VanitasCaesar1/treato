// /app/api/appointments/doctor/[id]/route.js

import { NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { makeApiRequest, API_BASE_URL } from "@/lib/api";

/**
 * Validates UUID format
 * @param {string} id - UUID string to validate
 * @returns {boolean} - True if valid UUID
 */
function isValidUUID(id) {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
}

/**
 * Validates patient ID format (8-digit alphanumeric ID)
 * @param {string} id - Patient ID to validate
 * @returns {boolean} - True if valid Patient ID
 */
function isValidPatientID(id) {
  const patientIDRegex = /^[A-Z0-9]{8}$/;
  return patientIDRegex.test(id);
}

/**
 * Validates date format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {boolean} - True if valid date format
 */
function isValidDateFormat(date) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}

/**
 * Handles GET requests for doctor appointments with filtering
 * @param {Request} req - The request object
 * @param {Object} context - The context object containing params
 */
export async function GET(req, { params }) {
  try {
    // Create a request ID for tracing
    const requestId = `req_${Math.random().toString(36).substring(2, 15)}`;
    console.log(`[DoctorAppointments:${requestId}] Starting request processing`);
    
    // Authenticate the user
    const { accessToken, sessionId, organizationId, user } = await withAuth();
    
    console.log(`[DoctorAppointments:${requestId}] Auth completed:`, {
      userPresent: !!user,
      orgIdPresent: !!organizationId,
      userExternalId: user?.externalId
    });
    
    // Validate authentication
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    
    // Get doctor ID from user's external_id instead of params
    const doctorId = user.externalId;
    if (!doctorId) {
      return NextResponse.json({ 
        error: "No doctor ID found",
        details: "Doctor ID not found in user profile"
      }, { status: 400 });
    }
    
    if (!isValidUUID(doctorId)) {
      return NextResponse.json({ 
        error: "Invalid doctor ID format",
        details: "Doctor ID must be in UUID format"
      }, { status: 400 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const queryParams = {
      patientId: url.searchParams.get("patientId") || url.searchParams.get("patient_id") || "",
      appointmentStatus: url.searchParams.get("status") || url.searchParams.get("appointment_status") || "",
      feeType: url.searchParams.get("feeType") || url.searchParams.get("fee_type") || "",
      startDate: url.searchParams.get("startDate") || url.searchParams.get("start_date") || "",
      endDate: url.searchParams.get("endDate") || url.searchParams.get("end_date") || "",
      limit: parseInt(url.searchParams.get("limit") || "20", 10),
      offset: parseInt(url.searchParams.get("offset") || "0", 10),
      sortBy: url.searchParams.get("sortBy") || url.searchParams.get("sort_by") || "appointment_date",
      sortOrder: url.searchParams.get("sortOrder") || url.searchParams.get("sort_order") || "desc",
      search: url.searchParams.get("search") || ""
    };

    console.log(`[DoctorAppointments:${requestId}] Parsed parameters:`, queryParams);

    // Validate patient ID format if provided
    if (queryParams.patientId && queryParams.patientId !== "all" && !isValidPatientID(queryParams.patientId)) {
      return NextResponse.json({ 
        error: "Invalid patient ID format",
        details: "Patient ID must be an 8-digit alphanumeric code"
      }, { status: 400 });
    }

    // Validate appointment status
    const validStatuses = ["completed", "not_completed", "scheduled", "cancelled"];
    if (queryParams.appointmentStatus && 
        queryParams.appointmentStatus !== "all" && 
        !validStatuses.includes(queryParams.appointmentStatus)) {
      return NextResponse.json({ 
        error: "Invalid appointment status",
        details: `Status must be one of: ${validStatuses.join(", ")}, or 'all'`
      }, { status: 400 });
    }

    // Validate fee type
    const validFeeTypes = ["emergency", "default", "recurring"];
    if (queryParams.feeType && 
        queryParams.feeType !== "all" && 
        !validFeeTypes.includes(queryParams.feeType)) {
      return NextResponse.json({ 
        error: "Invalid fee type",
        details: `Fee type must be one of: ${validFeeTypes.join(", ")}, or 'all'`
      }, { status: 400 });
    }

    // Validate date formats
    if (queryParams.startDate && !isValidDateFormat(queryParams.startDate)) {
      return NextResponse.json({ 
        error: "Invalid start date format",
        details: "Date must be in YYYY-MM-DD format"
      }, { status: 400 });
    }

    if (queryParams.endDate && !isValidDateFormat(queryParams.endDate)) {
      return NextResponse.json({ 
        error: "Invalid end date format",
        details: "Date must be in YYYY-MM-DD format"
      }, { status: 400 });
    }

    // Validate limit and offset
    if (isNaN(queryParams.limit) || queryParams.limit < 1 || queryParams.limit > 100) {
      queryParams.limit = 20; // Default to 20 if invalid
    }

    if (isNaN(queryParams.offset) || queryParams.offset < 0) {
      queryParams.offset = 0; // Default to 0 if invalid
    }

    // Validate sort fields
    const validSortFields = [
      "appointment_date", 
      "created_at", 
      "appointment_fee", 
      "appointment_status",
      "patient_name"
    ];
    
    if (!validSortFields.includes(queryParams.sortBy)) {
      queryParams.sortBy = "appointment_date"; // Default if invalid
    }

    // Validate sort order
    if (queryParams.sortOrder !== "asc" && queryParams.sortOrder !== "desc") {
      queryParams.sortOrder = "desc"; // Default to descending if invalid
    }

    // Build query parameters for backend API
    const backendParams = new URLSearchParams();
    
    // Add valid parameters with backend field names
    if (queryParams.patientId && queryParams.patientId !== "all") {
      backendParams.append("patient_id", queryParams.patientId);
    }
    if (queryParams.appointmentStatus && queryParams.appointmentStatus !== "all") {
      backendParams.append("appointment_status", queryParams.appointmentStatus);
    }
    if (queryParams.feeType && queryParams.feeType !== "all") {
      backendParams.append("fee_type", queryParams.feeType);
    }
    if (queryParams.startDate) {
      backendParams.append("start_date", queryParams.startDate);
    }
    if (queryParams.endDate) {
      backendParams.append("end_date", queryParams.endDate);
    }
    if (queryParams.search) {
      backendParams.append("search", queryParams.search);
    }
    
    // Add pagination and sorting
    backendParams.append("limit", queryParams.limit.toString());
    backendParams.append("offset", queryParams.offset.toString());
    backendParams.append("sort_by", queryParams.sortBy);
    backendParams.append("sort_order", queryParams.sortOrder);

    // Debug - show final query string
    console.log(`[DoctorAppointments:${requestId}] Backend API params:`, backendParams.toString());

    // Make request to backend API
    const apiUrl = `/api/appointments/doctor/${doctorId}`;
    const fullUrl = backendParams.toString() ? `${apiUrl}?${backendParams.toString()}` : apiUrl;
    
    console.log(`[DoctorAppointments:${requestId}] Making API request to:`, fullUrl);
    
    const data = await makeApiRequest(fullUrl, 'GET', null, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-Request-ID': requestId,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    // Debug - log response summary
    console.log(`[DoctorAppointments:${requestId}] API response received:`, {
      dataPresent: !!data,
      appointmentsCount: data?.appointments?.length || 0,
      paginationInfo: data?.pagination || 'None'
    });

    // Process and return response
    const appointments = data?.appointments || [];
    const pagination = data?.pagination || {
      total: 0,
      limit: queryParams.limit,
      offset: queryParams.offset
    };
    
    console.log(`[DoctorAppointments:${requestId}] Request completed: ${appointments.length} appointments retrieved`);
    
    return NextResponse.json({
      appointments,
      pagination: {
        total: pagination.total,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: appointments.length === queryParams.limit && 
                (pagination.offset + appointments.length) < pagination.total
      },
      doctor: {
        id: doctorId
      }
    });

  } catch (error) {
    // Enhanced error logging
    console.error("[DoctorAppointments] Error:", error.message);
    console.error("[DoctorAppointments] Error details:", {
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle specific error cases
    if (error.code === 'AUTH_REQUIRED' || error.response?.status === 401) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }
    
    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    return NextResponse.json({
      error: error.response?.data?.error || 'Failed to fetch doctor appointments',
      details: error.message
    }, { status: error.response?.status || 500 });
  }
}