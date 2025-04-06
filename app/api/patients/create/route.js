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
    
    // Format the patient data according to the MongoDB schema
    const formattedData = {
      name: patientData.name,
      email: patientData.email,
      mobile: patientData.mobile,
      age: patientData.age ? parseInt(patientData.age) : undefined,
      blood_group: patientData.blood_group || undefined,
      address: patientData.address || undefined,
      aadhaar_id: patientData.aadhaar_id || undefined,
      medical_history: patientData.medical_history?.map(item => ({
        condition: item.condition,
        diagnosed_date: new Date(item.diagnosed_date),
        notes: item.notes || undefined
      })) || [],
      allergies: patientData.allergies || [],
      emergency_contact: patientData.emergency_contact?.name ? {
        name: patientData.emergency_contact.name,
        relationship: patientData.emergency_contact.relationship || undefined,
        phone: patientData.emergency_contact.phone || undefined
      } : undefined,
      insurance: patientData.insurance?.provider ? {
        provider: patientData.insurance.provider,
        policy_number: patientData.insurance.policy_number || undefined,
        expiry_date: patientData.insurance.expiry_date ? new Date(patientData.insurance.expiry_date) : undefined,
        coverage_details: patientData.insurance.coverage_details || undefined
      } : undefined,
      hospital_visits: patientData.hospital_visits?.map(visit => ({
        hospital_id: visit.hospital_id,
        hospital_name: visit.hospital_name,
        visit_date: new Date(visit.visit_date),
        reason: visit.reason || undefined
      })) || [],
      created_by: user.id, // Store who created the record
      created_at: new Date(), // Required field
      updated_at: new Date() // Add updated_at for tracking modifications
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
      { 
        error: error.response?.data?.error || 'Failed to create patient',
        details: error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}