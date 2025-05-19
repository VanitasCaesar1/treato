import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withAuth } from "@workos-inc/authkit-nextjs";

export async function GET(req) {
  try {
    // Authenticate the user
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");
    const status = url.searchParams.get("status");
    const doctorId = url.searchParams.get("doctorId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const feeType = url.searchParams.get("feeType");
    const isValid = url.searchParams.get("isValid");
    const search = url.searchParams.get("search"); // Add search parameter
    const limit = url.searchParams.get("limit") || 20;
    const offset = url.searchParams.get("offset") || 0;

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);
    if (doctorId) queryParams.append("doctorId", doctorId);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (feeType) queryParams.append("feeType", feeType);
    if (isValid !== null) queryParams.append("isValid", isValid);
    if (search) queryParams.append("search", search); // Add search to the query params
    queryParams.append("limit", limit.toString());
    queryParams.append("offset", offset.toString());

    // Make API call to backend
    const apiUrl = orgId
      ? `/api/appointments/organization/${orgId}?${queryParams.toString()}`
      : `/api/appointments?${queryParams.toString()}`;
    const response = await api.get(apiUrl);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Authenticate the user
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Get the appointment data from the request body
    const appointmentData = await req.json();
    // Forward the request to the backend
    const response = await api.post("/api/appointments", appointmentData);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating appointment:", error);
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}