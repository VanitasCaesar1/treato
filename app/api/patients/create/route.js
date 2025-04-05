// app/api/patients/create/route.js
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import axios from 'axios';

// Define your API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function POST(req) {
  try {
    // Get auth data from WorkOS - this runs server-side only
    const { user, organizationId, role } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get the request body data
    const patientData = await req.json();
    
    // Format the patient data according to the backend API expectations
    const formattedData = {
      patient_name: patientData.patient_name,
      date_of_birth: patientData.date_of_birth,
      gender: patientData.gender,
      phone: patientData.phone,
      address: patientData.address || "",
      blood_type: patientData.blood_type || "",
      allergies: patientData.allergies || "",
      email: patientData.email
    };
    
    // Make the request to your backend API
    const response = await axios.post(
      `${API_BASE_URL}/api/patients/create`,
      formattedData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
          ...(organizationId && { 'X-Organization-ID': organizationId }),
          ...(role && { 'X-Role': role })
        }
      }
    );
    
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Handle API response errors
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to create patient' },
      { status: error.response?.status || 500 }
    );
  }
}