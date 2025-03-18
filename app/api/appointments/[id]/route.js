import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withAuth } from "@workos-inc/authkit-nextjs";

export async function GET(
  req,
  { params }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = params;
    // Forward the request to the backend
    const response = await api.get(`/api/appointments/${id}`);
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching appointment ${params.id}:`, error);
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to fetch appointment details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req,
  { params }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = params;
    // Get the updated appointment data from the request body
    const appointmentData = await req.json();
    // Forward the request to the backend
    const response = await api.put(`/api/appointments/${id}`, appointmentData);
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error updating appointment ${params.id}:`, error);
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to update appointment details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req,
  { params }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = params;
    // Forward the request to the backend
    const response = await api.delete(`/api/appointments/${id}`);
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error deleting appointment ${params.id}:`, error);
    // Handle authentication errors
    if (error.code === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { code: 'AUTH_REQUIRED', error: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to delete appointment details' },
      { status: 500 }
    );
  }
}