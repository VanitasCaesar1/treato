import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define validation schema using Zod
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  mobile_no: z.string().regex(/^\+?[0-9]{10}$/, "Invalid mobile number format"),
  location: z.string().min(1, "Location is required"),
  aadhaar_id: z.string().regex(/^[0-9]{12}$/, "Aadhaar ID must be 12 digits"),
  age: z.number().min(18, "Age must be at least 18").max(120, "Age must be less than 120"),
  blood_group: z.string().min(1, "Blood group is required"),
  address: z.string().min(1, "Address is required")
});

// Registration handler
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input data
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }
    
    const userData = validationResult.data;
    
    // Format data for backend API
    const doctorData = {
      email: userData.email,
      password: userData.password,
      name: `${userData.first_name} ${userData.last_name}`,
      username: userData.username,
      mobile: userData.mobile_no,
      bloodGroup: userData.blood_group,
      location: userData.location,
      address: userData.address,
      aadhaarID: userData.aadhaar_id,
      age: userData.age,
      profilePic: "", // Default empty
      imrNumber: "", // Default empty
      specialization: "", // Default empty
      qualification: "", // Default empty
      slotDuration: 30 // Default value
    };
    
    // Get API base URL from environment variable
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
    
    // Make request to backend
    const response = await fetch(`${API_BASE_URL}/api/auth/doctor/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doctorData),
      // Add this for better error handling with cross-origin requests
      credentials: 'include'
    });
    
    // Handle response format issues
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      return NextResponse.json(
        { error: `Server returned non-JSON response: ${text.substring(0, 100)}...` },
        { status: 500 }
      );
    }
    
    // Handle response
    if (!response.ok) {
      // Forward error from backend
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
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}