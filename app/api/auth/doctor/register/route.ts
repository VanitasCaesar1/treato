import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define validation schema using Zod with additional doctor fields
const registerSchema = z.object({
  // Basic user fields
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  mobile_no: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  location: z.string().min(1, "Location is required"),
  aadhaar_id: z.string().regex(/^\d{12}$/, "Aadhaar ID must be exactly 12 digits"),
  age: z.number().min(18, "Age must be at least 18").max(120, "Age must be less than 120"),
  blood_group: z.string().min(1, "Blood group is required"),
  address: z.string().min(1, "Address is required"),
  
  // Doctor-specific fields
  imr_number: z.string().min(1, "IMR number is required"),
  specialization: z.string().min(1, "Specialization is required"),
  qualification: z.string().min(1, "Qualification is required"),
  slot_duration: z.number().min(15, "Slot duration must be at least 15 minutes").max(120, "Slot duration cannot exceed 120 minutes").default(30),
  profile_pic: z.string().url("Invalid profile picture URL").optional().or(z.literal("")),
  
  // Optional additional fields you might want to add
  years_of_experience: z.number().min(0, "Years of experience cannot be negative").optional(),
  consultation_fee: z.number().min(0, "Consultation fee cannot be negative").optional(),
  medical_license_number: z.string().optional(),
  hospital_affiliation: z.string().optional(),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional(),
  languages_spoken: z.array(z.string()).optional(),
  available_days: z.array(z.string()).optional(), // e.g., ["Monday", "Tuesday", "Wednesday"]
  consultation_type: z.enum(["online", "offline", "both"]).default("both"),
});

// Registration handler
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Log received data for debugging
    console.log("Received registration data:", body);
    
    // Validate input data
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.format());
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }
    
    const userData = validationResult.data;
    
    // Format data for backend API - matching the Go backend's expected format
    const doctorData = {
      // User fields
      email: userData.email,
      password: userData.password,
      name: `${userData.first_name} ${userData.last_name}`,
      username: userData.username,
      mobile: userData.mobile_no,
      bloodGroup: userData.blood_group,
      location: userData.location,
      address: userData.address,
      aadhaarID: userData.aadhaar_id, // Note: Match Go struct field name
      age: userData.age,
      profilePic: userData.profile_pic || "",
      
      // Doctor-specific fields
      imrNumber: userData.imr_number,
      specialization: userData.specialization,
      qualification: userData.qualification,
      slotDuration: userData.slot_duration,
      
      // Additional fields (if you want to include them)
      yearsOfExperience: userData.years_of_experience || 0,
      consultationFee: userData.consultation_fee || 0,
      medicalLicenseNumber: userData.medical_license_number || "",
      hospitalAffiliation: userData.hospital_affiliation || "",
      bio: userData.bio || "",
      languagesSpoken: userData.languages_spoken || [],
      availableDays: userData.available_days || [],
      consultationType: userData.consultation_type || "both",
    };
    
    // Get API base URL from environment variable
    const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    
    // For debugging - log the actual payload being sent
    console.log("Sending doctor registration data:", JSON.stringify(doctorData, null, 2));
    
    // Make request to backend
    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/auth/doctor/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doctorData),
    });
    
    // Handle response
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      console.error("Non-JSON response:", text);
      return NextResponse.json(
        { error: "Server returned an invalid response" },
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      console.error("Backend error:", data);
      
      // Check specifically for Aadhaar validation errors
      if (data.error && data.error.includes("Aadhaar")) {
        return NextResponse.json(
          { error: "Aadhaar ID must be exactly 12 digits with no spaces or special characters" },
          { status: response.status }
        );
      }
      
      // Check for IMR number errors
      if (data.error && data.error.includes("IMR")) {
        return NextResponse.json(
          { error: "Invalid IMR number format" },
          { status: response.status }
        );
      }
      
      return NextResponse.json(
        { error: data.error || "Registration failed" },
        { status: response.status }
      );
    }
    
    // Return success response
    return NextResponse.json(
      {
        message: "Registration successful",
        user_id: data.user_id,
        doctor_id: data.doctor_id
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration API error:", error);
    
    // Return appropriate error message
    const errorMessage = error.message || "An unexpected error occurred";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}