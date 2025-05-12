// /app/api/appointments/org/route.js
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withAuth } from "@workos-inc/authkit-nextjs";

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
 * Validates Patient ID format (8-digit alphanumeric)
 * @param {string} id - Patient ID to validate
 * @returns {boolean} - True if valid Patient ID
 */
function isValidPatientID(id) {
  const patientIDRegex = /^[A-Z0-9]{8}$/;
  return patientIDRegex.test(id);
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
 * Handles GET requests for organization appointments with filtering
 * @param {Request} req - The incoming request object
 * @returns {Promise<NextResponse>} The API response
 */
export async function GET(req) {
  try {
    // Authenticate the user and get their organization context
    const { accessToken, sessionId, organizationId, user } = await withAuth();
    
    // Validate authentication
    if (!user) {
      console.error("Authentication failed: No user found");
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    
    // Validate organization context
    if (!organizationId) {
      console.warn("Missing organization context for user:", user.id);
      return NextResponse.json({ error: "Organization context required" }, { status: 400 });
    }

    // Validate organization ID format
    if (!isValidOrgID(organizationId)) {
      console.warn("Invalid organization ID format:", organizationId);
      return NextResponse.json({ 
        error: "Invalid organization ID format",
        details: "Organization ID must be in ULID format with org_ prefix"
      }, { status: 400 });
    }

    // Get query parameters from request URL
    const url = new URL(req.url);
    
    // Extract and prepare filter parameters
    const params = {
      appointmentId: url.searchParams.get("appointmentId"),
      status: url.searchParams.get("status"),
      doctorId: url.searchParams.get("doctorId"),
      startDate: url.searchParams.get("startDate"),
      endDate: url.searchParams.get("endDate"),
      feeType: url.searchParams.get("feeType"),
      isValid: url.searchParams.get("isValid"),
      limit: parseInt(url.searchParams.get("limit") || "20", 10),
      offset: parseInt(url.searchParams.get("offset") || "0", 10),
      patientId: url.searchParams.get("patientId"),
      sortBy: url.searchParams.get("sortBy") || "appointment_date",
      sortOrder: url.searchParams.get("sortOrder") || "desc"
    };

    // Validate appointmentId format if provided
    if (params.appointmentId && !isValidUUID(params.appointmentId)) {
      return NextResponse.json({ 
        error: "Invalid appointment ID format",
        details: "Appointment ID must be in UUID format"
      }, { status: 400 });
    }

    // Validate doctorId format if provided
    if (params.doctorId && params.doctorId !== "all" && !isValidUUID(params.doctorId)) {
      return NextResponse.json({ 
        error: "Invalid doctor ID format",
        details: "Doctor ID must be in UUID format"
      }, { status: 400 });
    }

    // Validate patientId format if provided
    if (params.patientId && params.patientId !== "all" && !isValidPatientID(params.patientId)) {
      return NextResponse.json({ 
        error: "Invalid patient ID format",
        details: "Patient ID must be an 8-character alphanumeric string"
      }, { status: 400 });
    }

    const queryParams = new URLSearchParams();

// Only add parameters that have valid values and aren't 'all'
if (params.appointmentId) 
  queryParams.append("appointmentID", params.appointmentId);  // CHANGE: should match backend parameter name

if (params.status && params.status !== "all") 
  queryParams.append("status", params.status);

if (params.doctorId && params.doctorId !== "all") 
  queryParams.append("doctorID", params.doctorId);  // CHANGE: should match backend parameter name

if (params.patientId && params.patientId !== "all")
  queryParams.append("patientID", params.patientId);  // CHANGE: should match backend parameter name

if (params.startDate) 
  queryParams.append("startDate", params.startDate);

if (params.endDate) 
  queryParams.append("endDate", params.endDate);

if (params.feeType && params.feeType !== "all") 
  queryParams.append("feeType", params.feeType);

if (params.isValid !== null && params.isValid !== undefined && params.isValid !== "all") {
  queryParams.append("isValid", params.isValid);
}
    // Add pagination and sorting parameters
    queryParams.append("limit", params.limit.toString());
    queryParams.append("offset", params.offset.toString());
    queryParams.append("sortBy", params.sortBy);
    queryParams.append("sortOrder", params.sortOrder);

    // Log the request for debugging
    console.log(`[Appointments] Fetching org appointments with filters:`, {
      organizationId,
      user: user.id,
      queryParams: Object.fromEntries(queryParams.entries())
    });

    // Make request to backend API
    const apiUrl = `/api/appointments/org?${queryParams.toString()}`;
    const response = await api.get(apiUrl, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 second timeout
    });

    // Process response data if needed
    const appointments = response.data?.appointments || response.data;
    const total = response.data?.total || 0;
    
    console.log(`[Appointments] Successfully fetched ${Array.isArray(appointments) ? appointments.length : 0} appointments`);
    
    // Return formatted response
    return NextResponse.json({
      appointments,
      total,
      page: {
        limit: params.limit,
        offset: params.offset,
        hasMore: Array.isArray(appointments) && appointments.length === params.limit
      }
    });
  } catch (error) {
    // Enhanced error handling with detailed logging
    console.error("[Appointments] Error fetching organization appointments:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || null,
      status: error.response?.status || null
    });

    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED' || error.response?.status === 401) {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Handle organization related errors
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Access denied', details: 'You do not have permission to access appointments for this organization' },
        { status: 403 }
      );
    }

    // Handle backend service unavailable
    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      return NextResponse.json(
        { error: 'Service unavailable', details: 'The appointment service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Return appropriate error response
    return NextResponse.json(
      {
        error: error.response?.data?.error || 'Failed to fetch organization appointments',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: error.response?.status || 500 }
    );
  }                                                                         
}