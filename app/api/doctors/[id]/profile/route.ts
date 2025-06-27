import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

interface DoctorProfileUpdate {
  username?: string; name?: string; mobile?: string; bloodGroup?: string; blood_group?: string;
  location?: string; address?: string; age?: string | number; isActive?: boolean; is_active?: boolean;
  qualification?: string; slotDuration?: string | number; slot_duration?: string | number;
  yearsOfExperience?: string | number; years_of_experience?: string | number; bio?: string;
  languagesSpoken?: string[]; languages_spoken?: string[]; imrNumber?: string; imr_number?: string;
  specialization?: { primary?: string; secondary?: string[]; [key: string]: any; };
}

interface TransformedDoctorData {
  username?: string; name?: string; mobile?: string; blood_group?: string; location?: string;
  address?: string; age?: number; is_active?: boolean; qualification?: string; slot_duration?: number;
  years_of_experience?: number; bio?: string; languages_spoken?: string[]; imr_number?: string;
  specialization?: { primary?: string; secondary?: string[]; [key: string]: any; };
}

function transformDoctorData(updateData: DoctorProfileUpdate): TransformedDoctorData {
  const transformed: TransformedDoctorData = {};
  
  // Simple string fields
  ([
    ['username', 'username'],
    ['name', 'name'],
    ['mobile', 'mobile'],
    ['location', 'location'],
    ['address', 'address'],
    ['qualification', 'qualification'],
    ['bio', 'bio']
  ] as const).forEach(([field, key]) => {
    if (updateData[field as keyof DoctorProfileUpdate] !== undefined) {
      (transformed as any)[key] = String(updateData[field as keyof DoctorProfileUpdate] || '').trim();
    }
  });

  // Blood group (handle both camelCase and snake_case)
  if (updateData.bloodGroup !== undefined || updateData.blood_group !== undefined) {
    transformed.blood_group = String(updateData.bloodGroup || updateData.blood_group || '').trim();
  }

  // Age
  if (updateData.age !== undefined) {
    const ageValue = updateData.age;
    let parsedAge = 0;
    if (typeof ageValue === 'string') {
      const trimmed = ageValue.trim();
      if (trimmed) {
        parsedAge = parseInt(trimmed, 10);
        if (isNaN(parsedAge)) parsedAge = 0;
      }
    } else if (typeof ageValue === 'number') {
      parsedAge = Math.floor(Math.max(0, ageValue));
    }
    transformed.age = parsedAge;
  }

  // Specialization - FIXED: More conservative approach
  if (updateData.specialization !== undefined) {
    const spec = updateData.specialization;
    if (spec && typeof spec === 'object') {
      // Preserve the original structure but ensure required fields
      const normalizedSpec = { ...spec };
      
      // Ensure primary is a string (but allow empty string)
      if (typeof normalizedSpec.primary !== 'string') {
        normalizedSpec.primary = '';
      }
      
      // Ensure secondary is an array
      if (!Array.isArray(normalizedSpec.secondary)) {
        normalizedSpec.secondary = [];
      }
      
      transformed.specialization = normalizedSpec;
    } else {
      // Only set default if explicitly null/undefined
      transformed.specialization = { primary: '', secondary: [] };
    }
  }

  // Active status
  if (updateData.isActive !== undefined || updateData.is_active !== undefined) {
    transformed.is_active = updateData.isActive ?? updateData.is_active ?? true;
  }

  // Slot duration
  if (updateData.slotDuration !== undefined || updateData.slot_duration !== undefined) {
    const slotValue = updateData.slotDuration ?? updateData.slot_duration;
    let parsedSlotDuration = 30;
    if (typeof slotValue === 'string') {
      const trimmed = slotValue.trim();
      if (trimmed) {
        const parsed = parseInt(trimmed, 10);
        if (!isNaN(parsed) && parsed > 0) parsedSlotDuration = parsed;
      }
    } else if (typeof slotValue === 'number' && slotValue > 0) {
      parsedSlotDuration = Math.floor(slotValue);
    }
    transformed.slot_duration = parsedSlotDuration;
  }

  // Years of experience
  if (updateData.yearsOfExperience !== undefined || updateData.years_of_experience !== undefined) {
    const yearsValue = updateData.yearsOfExperience ?? updateData.years_of_experience;
    let parsedYears = 0;
    if (typeof yearsValue === 'string') {
      const trimmed = yearsValue.trim();
      if (trimmed) {
        const parsed = parseInt(trimmed, 10);
        if (!isNaN(parsed) && parsed >= 0) parsedYears = parsed;
      }
    } else if (typeof yearsValue === 'number' && yearsValue >= 0) {
      parsedYears = Math.floor(yearsValue);
    }
    transformed.years_of_experience = parsedYears;
  }

  // Languages spoken
  if (updateData.languagesSpoken !== undefined || updateData.languages_spoken !== undefined) {
    const languages = updateData.languagesSpoken ?? updateData.languages_spoken;
    transformed.languages_spoken = Array.isArray(languages) 
      ? languages.filter(lang => typeof lang === 'string' && lang.trim().length > 0).map(lang => lang.trim())
      : [];
  }

  // IMR number
  const imrValue = updateData.imrNumber ?? updateData.imr_number;
  if (imrValue !== undefined && imrValue !== null) {
    const trimmedImr = String(imrValue).trim();
    if (trimmedImr.length > 0) transformed.imr_number = trimmedImr;
  }

  return transformed;
}

function validateDoctorData(data: TransformedDoctorData): string | null {
  const validations = [
    [data.name !== undefined && (!data.name || data.name.length === 0), 'Name cannot be empty'],
    [data.qualification !== undefined && (!data.qualification || data.qualification.length === 0), 'Qualification cannot be empty'],
    [data.age !== undefined && (isNaN(data.age) || data.age <= 0 || data.age > 150), 'Age must be a valid number between 1 and 150'],
    [data.slot_duration !== undefined && (isNaN(data.slot_duration) || data.slot_duration <= 0 || data.slot_duration > 480), 'Slot duration must be between 1 and 480 minutes'],
    [data.years_of_experience !== undefined && (isNaN(data.years_of_experience) || data.years_of_experience < 0 || data.years_of_experience > 70), 'Years of experience must be between 0 and 70'],
    [data.specialization !== undefined && (!data.specialization || typeof data.specialization !== 'object'), 'Specialization must be a valid object'],
    [data.specialization !== undefined && (!data.specialization.primary || data.specialization.primary.trim().length === 0), 'Primary specialization is required'],
    [data.imr_number !== undefined && data.imr_number.length < 3, 'IMR number must be at least 3 characters long'],
    [data.mobile !== undefined && data.mobile.length > 0 && !/^\+?[\d\s\-\(\)]+$/.test(data.mobile), 'Mobile number format is invalid'],
    [data.username !== undefined && data.username.length > 0 && !/^[a-zA-Z0-9_.-]+$/.test(data.username), 'Username can only contain letters, numbers, dots, hyphens, and underscores']
  ];

  for (const [condition, message] of validations) {
    if (condition) return message as string;
  }
  return null;
}

async function getAuthData() {
  try {
    const authData = await withAuth();
    if (!authData.user) return { error: 'Unauthorized', status: 401 };
    return { 
      authData,
      headers: {
        'Authorization': authData.accessToken ? `Bearer ${authData.accessToken}` : '',
        'X-Session-ID': authData.sessionId || '',
        'X-Organization-ID': authData.organizationId || '',
        'X-User-Role': authData.role || '',
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 401 };
  }
}

function validateDoctorId(doctorId: string) {
  if (!doctorId) return { error: "Doctor ID is required", status: 400 };
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(doctorId)) return { error: "Invalid doctor ID format", status: 400 };
  return null;
}

function handleError(error: any) {
  console.error('❌ API Error:', { message: error.message, status: error.response?.status, data: error.response?.data });
  
  if (error.code === 'AUTH_REQUIRED') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  
  const status = error.response?.status;
  const errorData = error.response?.data;
  
  const errorMap: { [key: number]: any } = {
    400: { error: errorData?.error || 'Invalid request data', details: errorData?.details || errorData },
    401: { error: 'Authentication required' },
    403: { error: 'Access denied' },
    404: { error: 'Doctor profile not found' },
    409: { error: errorData?.error || 'Conflict - data already exists' },
    422: { error: errorData?.error || 'Validation failed', details: errorData }
  };

  return NextResponse.json(
    errorMap[status] || { error: errorData?.error || 'Operation failed' },
    { status: status || 500 }
  );
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthData();
    if ('error' in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { headers } = authResult;
    const doctorId = (await params).id;
    
    const idValidation = validateDoctorId(doctorId);
    if (idValidation) return NextResponse.json({ error: idValidation.error }, { status: idValidation.status });

    let updateData: DoctorProfileUpdate;
    try {
      const body = await req.text();
      if (!body || body.trim() === '') return NextResponse.json({ error: "Request body cannot be empty" }, { status: 400 });
      updateData = JSON.parse(body);
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
      return NextResponse.json({ error: "Request body must be a valid object" }, { status: 400 });
    }

    const hasData = Object.keys(updateData).some(key => {
      const value = updateData[key as keyof DoctorProfileUpdate];
      return value !== undefined && value !== null && value !== '';
    });

    if (!hasData) return NextResponse.json({ error: "At least one field must be provided for update" }, { status: 400 });

    const transformedData = transformDoctorData(updateData);
    const validationError = validateDoctorData(transformedData);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    console.log(`🔄 Updating doctor profile: ${doctorId}`);
    const response = await api.put(`/api/doctors/${doctorId}/profile`, transformedData, { headers });
    console.log(`✅ Doctor profile updated successfully: ${doctorId}`);
    return NextResponse.json(response);
    
  } catch (error: any) {
    return handleError(error);
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await getAuthData();
    if ('error' in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { headers } = authResult;
    const doctorId = (await params).id;
    
    const idValidation = validateDoctorId(doctorId);
    if (idValidation) return NextResponse.json({ error: idValidation.error }, { status: idValidation.status });

    console.log(`📋 Fetching doctor profile: ${doctorId}`);
    const response = await api.get(`/api/doctors/${doctorId}/profile`, { headers });

    // FIXED: Only normalize specialization if it's actually problematic
    if (response && response.specialization !== undefined) {
      const spec = response.specialization;
      console.log('Raw specialization from backend:', JSON.stringify(spec));
      
      // Only intervene if the data is actually problematic
      if (spec === null || spec === undefined) {
        console.log('Specialization is null/undefined, setting default');
        response.specialization = { primary: '', secondary: [] };
      } else if (typeof spec === 'string') {
        console.log('Specialization is string, converting to object');
        response.specialization = { 
          primary: spec.trim(), 
          secondary: [] 
        };
      } else if (typeof spec === 'object' && spec !== null) {
        // It's already an object, just ensure it has the right structure
        if (!spec.hasOwnProperty('primary') || !spec.hasOwnProperty('secondary')) {
          console.log('Specialization object missing required fields, normalizing');
          response.specialization = {
            primary: spec.primary || '',
            secondary: Array.isArray(spec.secondary) ? spec.secondary : [],
            ...spec // Preserve any additional fields
          };
        }
        // Otherwise, leave it as-is - don't over-normalize
      } else {
        console.log('Specialization has unexpected type, setting default');
        response.specialization = { primary: '', secondary: [] };
      }
    }

    console.log(`✅ Doctor profile fetched successfully: ${doctorId}`);
    console.log('Final specialization:', JSON.stringify(response?.specialization));
    return NextResponse.json(response);
    
  } catch (error: any) {
    return handleError(error);
  }
}