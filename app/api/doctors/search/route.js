import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * GET /api/doctors/search
 * Searches for doctors based on various criteria within user's organization
 */
export async function GET(req) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role, accessToken, sessionId, } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const searchQuery = searchParams.get('q');
    const searchBy = searchParams.get('by') || 'name';
    const speciality = searchParams.get('speciality');
    // Change hospital_id to organization_id
    const organizationId_param = searchParams.get('organization_id') || organizationId;
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    // Build query parameters
    const queryParams = {};
    if (searchQuery) queryParams.q = searchQuery;
    if (searchBy) queryParams.by = searchBy;
    if (speciality) queryParams.speciality = speciality;
    if (organizationId_param) queryParams.organization_id = organizationId_param;
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;

    // Forward the request to the backend with auth headers
    const response = await api.get('/api/doctors/search', queryParams, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || '' 
      }
    });

    // Format the response to ensure consistency
    const formattedDoctors = response?.doctors?.map(doctor => ({
      DoctorID: doctor.doctor_id || doctor.DoctorID,
      Name: doctor.name || doctor.Name,
      Speciality: formatSpecialization(doctor.specialization || doctor.Speciality),
      Qualification: doctor.qualification || doctor.Qualification,
      Age: doctor.age || doctor.Age,
      OrganizationID: doctor.organization_id || doctor.OrganizationID || organizationId,
      SlotDuration: doctor.slot_duration || doctor.SlotDuration || 30
    })) || [];

    // Ensure pagination is properly formatted
    const pagination = response?.pagination || {
      total: formattedDoctors.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    return NextResponse.json({
      doctors: formattedDoctors,
      pagination: pagination
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    
    // Get limit and offset from request for error response
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';
    
    // Return a meaningful error response with proper structure
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Always return a doctors array even when error occurs to prevent null reference
    return NextResponse.json(
      {
        error: error.response?.data?.error || 'Failed to search doctors',
        doctors: [], // Empty array instead of null
        pagination: { total: 0, limit: parseInt(limit), offset: parseInt(offset) }
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Helper function to format specialization field
function formatSpecialization(specialization) {
  if (!specialization) return "";
  
  try {
    // If it's already a string, return it
    if (typeof specialization === 'string') return specialization;
    
    // If it's a JSON string, parse it first
    const specObj = typeof specialization === 'string' ? JSON.parse(specialization) : specialization;
    
    // If it's an array format of specializations
    if (Array.isArray(specObj)) {
      return specObj.join(", ");
    }
    
    // If it has primary/secondary format
    if (specObj.primary) {
      const specs = [specObj.primary];
      if (specObj.secondary) {
        specs.push(specObj.secondary);
      }
      return specs.join(", ");
    }
    
    // If it's an object with "name" property (from your data example)
    if (specObj.name) {
      return specObj.name;
    }
    
    // Fallback - just stringify the object
    return JSON.stringify(specObj);
    
  } catch (error) {
    console.error("Error formatting specialization:", error);
    return String(specialization);
  }
}