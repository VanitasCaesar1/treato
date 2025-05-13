// /app/api/appointments/org/route.js
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
 * Validates Organization ID format (ULID with org_ prefix)
 * @param {string} id - Org ID to validate
 * @returns {boolean} - True if valid Org ID
 */
function isValidOrgID(id) {
  const orgIDRegex = /^org_[A-Z0-9]{26}$/;
  return orgIDRegex.test(id);
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
 * Handles GET requests for organization appointments with filtering
 */
export async function GET(req) {
  try {
    // For debugging - create a request ID to trace this request
    const requestId = `req_${Math.random().toString(36).substring(2, 15)}`;
    console.log(`[Appointments:${requestId}] Starting request processing`);
    
    // Authenticate the user and get their organization context
    const { accessToken, sessionId, organizationId, user } = await withAuth();
    
    console.log(`[Appointments:${requestId}] Auth completed:`, {
      userPresent: !!user,
      orgIdPresent: !!organizationId,
      orgIdValid: organizationId ? isValidOrgID(organizationId) : false
    });
    
    // Validate authentication and organization
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    
    if (!organizationId) {
      return NextResponse.json({ 
        error: "Missing organization ID",
        details: "No organization context found. Please select an organization."
      }, { status: 400 });
    }
    
    if (!isValidOrgID(organizationId)) {
      return NextResponse.json({ 
        error: "Invalid organization ID format",
        details: "Organization ID must be in ULID format with org_ prefix"
      }, { status: 400 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const params = {
      doctorId: url.searchParams.get("doctorId") || url.searchParams.get("doctor_id") || "all",
      patientId: url.searchParams.get("patientId") || url.searchParams.get("patient_id") || "all",
      appointmentStatus: url.searchParams.get("status") || url.searchParams.get("appointment_status") || "all",
      feeType: url.searchParams.get("feeType") || url.searchParams.get("fee_type") || "all",
      startDate: url.searchParams.get("startDate") || url.searchParams.get("start_date") || "",
      endDate: url.searchParams.get("endDate") || url.searchParams.get("end_date") || "",
      limit: parseInt(url.searchParams.get("limit") || "10", 10),
      offset: parseInt(url.searchParams.get("offset") || "0", 10),
      sortBy: url.searchParams.get("sortBy") || url.searchParams.get("sort_by") || "created_at",
      sortOrder: url.searchParams.get("sortOrder") || url.searchParams.get("sort_order") || "desc"
    };

    console.log(`[Appointments:${requestId}] Parsed parameters:`, params);

    // Validate ID formats
    if (params.doctorId && params.doctorId !== "all" && !isValidUUID(params.doctorId)) {
      return NextResponse.json({ 
        error: "Invalid doctor ID format",
        details: "Doctor ID must be in UUID format"
      }, { status: 400 });
    }

    if (params.patientId && params.patientId !== "all" && !isValidPatientID(params.patientId)) {
      return NextResponse.json({ 
        error: "Invalid patient ID format",
        details: "Patient ID must be an 8-digit alphanumeric code"
      }, { status: 400 });
    }

    // Validate appointment status
    if (params.appointmentStatus && 
        params.appointmentStatus !== "all" && 
        params.appointmentStatus !== "completed" && 
        params.appointmentStatus !== "not_completed") {
      return NextResponse.json({ 
        error: "Invalid appointment status",
        details: "Status must be 'completed', 'not_completed', or 'all'"
      }, { status: 400 });
    }

    // Validate fee type
    if (params.feeType && 
        params.feeType !== "all" && 
        params.feeType !== "emergency" && 
        params.feeType !== "default" && 
        params.feeType !== "recurring") {
      return NextResponse.json({ 
        error: "Invalid fee type",
        details: "Fee type must be 'emergency', 'default', 'recurring', or 'all'"
      }, { status: 400 });
    }

    // Validate date format
    if (params.startDate && !isValidDateFormat(params.startDate)) {
      return NextResponse.json({ 
        error: "Invalid start date format",
        details: "Date must be in YYYY-MM-DD format"
      }, { status: 400 });
    }

    if (params.endDate && !isValidDateFormat(params.endDate)) {
      return NextResponse.json({ 
        error: "Invalid end date format",
        details: "Date must be in YYYY-MM-DD format"
      }, { status: 400 });
    }

    // Validate limit and offset
    if (isNaN(params.limit) || params.limit < 1 || params.limit > 100) {
      params.limit = 10; // Default to 10 if invalid
    }

    if (isNaN(params.offset) || params.offset < 0) {
      params.offset = 0; // Default to 0 if invalid
    }

    // Validate sort fields
    const validSortFields = [
      "created_at", 
      "appointment_date", 
      "appointment_fee", 
      "appointment_status", 
      "next_visit_date"
    ];
    
    if (!validSortFields.includes(params.sortBy)) {
      params.sortBy = "created_at"; // Default to created_at if invalid
    }

    // Validate sort order
    if (params.sortOrder !== "asc" && params.sortOrder !== "desc") {
      params.sortOrder = "desc"; // Default to descending if invalid
    }

    // Build query parameters - using backend field names
    const queryParams = new URLSearchParams();
    
    // Add valid parameters to query string with corrected field names
    if (params.doctorId && params.doctorId !== "all") queryParams.append("doctor_id", params.doctorId);
    if (params.patientId && params.patientId !== "all") queryParams.append("patient_id", params.patientId);
    if (params.appointmentStatus && params.appointmentStatus !== "all") queryParams.append("appointment_status", params.appointmentStatus);
    if (params.feeType && params.feeType !== "all") queryParams.append("fee_type", params.feeType);
    if (params.startDate) queryParams.append("start_date", params.startDate);
    if (params.endDate) queryParams.append("end_date", params.endDate);
    
    // Add pagination and sorting with corrected field names
    queryParams.append("limit", params.limit.toString());
    queryParams.append("offset", params.offset.toString());
    queryParams.append("sort_by", params.sortBy);
    queryParams.append("sort_order", params.sortOrder);

    // Debug - show final query string
    console.log(`[Appointments:${requestId}] API request params:`, queryParams.toString());

    // Debug - log API configuration
    console.log(`[Appointments:${requestId}] API base URL:`, API_BASE_URL);

    // Make request to backend API - VERIFY THIS ENDPOINT IS CORRECT
    const apiUrl = `/api/appointments`;
    
    // Debug - log the full request details
    console.log(`[Appointments:${requestId}] Making API request:`, {
      url: apiUrl,
      headers: {
        'Authorization': accessToken ? 'Bearer [REDACTED]' : 'None',
        'X-Session-ID': sessionId ? '[REDACTED]' : 'None',
        'X-Organization-ID': organizationId,
        'X-Request-ID': requestId
      }
    });
    
    // Use our makeApiRequest function directly instead of api.get
    const data = await makeApiRequest(apiUrl, 'GET', Object.fromEntries(queryParams), {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId,
        'X-Request-ID': requestId,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    // Debug - log response summary
    console.log(`[Appointments:${requestId}] API response received:`, {
      dataPresent: !!data,
      appointmentsCount: data?.appointments?.length || 0,
      paginationInfo: data?.pagination || 'None'
    });

    // Process and return response
    const appointments = data?.appointments || [];
    const pagination = data?.pagination || {
      total: 0,
      limit: params.limit,
      offset: params.offset
    };
    
    console.log(`[Appointments:${requestId}] Request completed: ${appointments.length} appointments retrieved`);
    
    return NextResponse.json({
      appointments,
      pagination: {
        total: pagination.total,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: appointments.length === params.limit && 
                (pagination.offset + appointments.length) < pagination.total
      }
    });
  } catch (error) {
    // Enhanced error logging
    console.error("[Appointments] Error:", error.message);
    console.error("[Appointments] Error details:", {
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
    
    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    return NextResponse.json({
      error: error.response?.data?.error || 'Failed to fetch appointments',
      details: error.message
    }, { status: error.response?.status || 500 });
  }
}