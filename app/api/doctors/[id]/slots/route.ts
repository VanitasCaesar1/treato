import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { withAuth } from '@workos-inc/authkit-nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface Params {
  id: string;
}

interface AuthData {
  user: {
    id: string;
    [key: string]: any;
  } | null;
  organizationId?: string;
  role?: string;
}

/**
 * Helper function to validate ID format (UUID)
 */
function isValidId(id: string): boolean {
  // Validate UUID format
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(id);
}

/**
 * Helper function to validate date format (YYYY-MM-DD)
 */
function isValidDateFormat(date: string): boolean {
  // Check for YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Check if it's a valid date
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * GET /api/doctors/[id]/slots
 * 
 * Gets available appointment slots for a specific doctor on a given date
 * 
 * Query parameters:
 * - date: Required, format YYYY-MM-DD
 * - org_id: Required, organization ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }  // Changed: params is now Promise<Params>
): Promise<NextResponse> {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role } = await withAuth() as AuthData;
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract doctor ID from route params - now properly awaited
    const { id: doctorId } = await params;  // Changed: await params before accessing properties
    
    // Validate doctor ID format
    if (!isValidId(doctorId)) {
      return NextResponse.json({
        error: "Invalid doctor ID format. Expected UUID format."
      }, { status: 400 });
    }

    // Extract and validate query parameters
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const orgId = url.searchParams.get('org_id') || organizationId;

    // Check required parameters
    if (!date) {
      return NextResponse.json({
        error: "Date parameter is required (format: YYYY-MM-DD)"
      }, { status: 400 });
    }

    if (!orgId) {
      return NextResponse.json({
        error: "Organization ID is required"
      }, { status: 400 });
    }

    // Validate date format
    if (!isValidDateFormat(date)) {
      return NextResponse.json({
        error: "Invalid date format. Use YYYY-MM-DD"
      }, { status: 400 });
    }

    // Make request to backend API
    const response = await axios.get(
      `${API_BASE_URL}/api/doctors/${doctorId}/slots`,
      {
        params: {
          date: date,
          org_id: orgId
        },
        headers: {
          'Authorization': `Bearer ${user.id}`,
          ...(organizationId && { 'X-Organization-ID': organizationId }),
          ...(role && { 'X-Role': role })
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching doctor slots:', error);
    
    if (error.response?.data) {
      return NextResponse.json(
        { error: error.response.data.error || 'Failed to fetch available slots' },
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