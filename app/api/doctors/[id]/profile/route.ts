import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * PUT /api/doctors/[id]/profile
 * Update doctor profile with enhanced debugging and null handling
 */
export async function PUT(req, { params }) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role, accessToken, sessionId } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: doctorId } = params;
    
    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // Get request body
    const updateData = await req.json();
    
    // DEBUG: Log the incoming data
    console.log('🔍 DEBUG - Incoming request data:', {
      doctorId,
      updateData: JSON.stringify(updateData, null, 2),
      dataKeys: Object.keys(updateData),
      dataTypes: Object.keys(updateData).reduce((acc, key) => {
        acc[key] = typeof updateData[key];
        return acc;
      }, {})
    });

    // Validate and transform the data to match Go backend expectations
    type TransformedData = {
      username: any;
      name: any;
      mobile: any;
      blood_group: any;
      location: any;
      address: any;
      age: number;
      specialization: any;
      is_active: boolean;
      qualification: any;
      slot_duration: number;
      years_of_experience: number;
      bio: any;
      languages_spoken: any;
      imr_number?: any;
    };

    const transformedData: TransformedData = {
      username: updateData.username || '',
      name: updateData.name || '',
      mobile: updateData.mobile || '',
      blood_group: updateData.bloodGroup || updateData.blood_group || '',
      location: updateData.location || '',
      address: updateData.address || '',
      age: parseInt(updateData.age) || 0,
      specialization: updateData.specialization || {},
      is_active: Boolean(updateData.isActive ?? updateData.is_active ?? true),
      qualification: updateData.qualification || '',
      slot_duration: parseInt(updateData.slotDuration || updateData.slot_duration) || 30,
      years_of_experience: parseInt(updateData.yearsOfExperience || updateData.years_of_experience) || 0,
      bio: updateData.bio || '',
      languages_spoken: Array.isArray(updateData.languagesSpoken) ? updateData.languagesSpoken : 
                       Array.isArray(updateData.languages_spoken) ? updateData.languages_spoken : []
    };

    // Handle IMR number with proper null handling
    const imrValue = updateData.imrNumber || updateData.imr_number;
    if (imrValue !== undefined) {
      // IMR number is provided (could be empty string or actual value)
      transformedData.imr_number = imrValue;
    }
    // If imrValue is undefined, we don't include imr_number in transformedData
    // This way, the Go backend will know it wasn't provided and won't update it

    // DEBUG: Log the transformed data
    console.log('🔄 DEBUG - Transformed data:', {
      transformedData: JSON.stringify(transformedData, null, 2),
      specialization: transformedData.specialization,
      specializationType: typeof transformedData.specialization,
      hasImrNumber: 'imr_number' in transformedData,
      imrNumberValue: transformedData.imr_number
    });

    // Validate required fields
    const requiredFields = ['name', 'age', 'qualification'];
    const missingFields = requiredFields.filter(field => !transformedData[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate data types
    if (isNaN(transformedData.age) || transformedData.age <= 0) {
      console.error('❌ Invalid age:', transformedData.age);
      return NextResponse.json(
        { error: 'Age must be a positive number' },
        { status: 400 }
      );
    }

    if (isNaN(transformedData.slot_duration) || transformedData.slot_duration <= 0) {
      console.error('❌ Invalid slot_duration:', transformedData.slot_duration);
      return NextResponse.json(
        { error: 'Slot duration must be a positive number' },
        { status: 400 }
      );
    }

    // Ensure specialization is an object
    if (typeof transformedData.specialization !== 'object' || transformedData.specialization === null) {
      console.error('❌ Invalid specialization type:', typeof transformedData.specialization);
      return NextResponse.json(
        { error: 'Specialization must be an object' },
        { status: 400 }
      );
    }

    // Validate IMR number if provided
    if (
      'imr_number' in transformedData &&
      typeof transformedData.imr_number === 'string' &&
      transformedData.imr_number.trim().length > 0
    ) {
      const imr = transformedData.imr_number.trim();
      if (imr.length < 3) {
        console.error('❌ Invalid IMR number length:', imr.length);
        return NextResponse.json(
          { error: 'IMR number must be at least 3 characters long' },
          { status: 400 }
        );
      }
    }

    console.log('📤 DEBUG - Sending to Go backend:', {
      url: `/api/doctors/${doctorId}/profile`,
      data: transformedData,
      headers: {
        'Authorization': accessToken ? 'Bearer [REDACTED]' : 'None',
        'X-Session-ID': sessionId ? '[PRESENT]' : 'None',
        'X-Organization-ID': organizationId || 'None',
        'X-User-Role': role || 'None'
      }
    });

    // Forward the request to the backend with auth headers
    const response = await api.put(`/api/doctors/${doctorId}/profile`, transformedData, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || '',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ DEBUG - Go backend response:', response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Error updating doctor profile:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    if (error.response?.status === 400) {
      return NextResponse.json(
        { 
          error: error.response?.data?.error || 'Bad request - validation failed',
          details: error.response?.data
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to update doctor profile' },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * GET /api/doctors/[id]/profile
 * Fetch doctor profile by ID
 */
export async function GET(req, { params }) {
  try {
    // Get auth data from WorkOS
    const { user, organizationId, role, accessToken, sessionId } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id: doctorId } = params;
    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }
    // Forward the request to the backend with auth headers
    const response = await api.get(`/api/doctors/${doctorId}/profile`, {}, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'X-Session-ID': sessionId || '',
        'X-Organization-ID': organizationId || '',
        'X-User-Role': role || ''
      }
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch doctor profile' },
      { status: error.response?.status || 500 }
    );
  }
}