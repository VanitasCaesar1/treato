import { NextResponse, NextRequest } from 'next/server';
import { api } from '@/lib/api';
import { withAuth } from '@workos-inc/authkit-nextjs';

/**
 * Handler for GET request to fetch all hospital images
 */
export async function GET(request, context) {
  try {
    // Get authorization data
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = context.params;
    // Forward the request to the backend to get all hospital images
    const response = await api.get(`/api/hospital/${id}/pictures`);
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error fetching hospital images for ${context.params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital images' },
      { status: 500 }
    );
  }
}

/**
 * Handler for POST request to upload hospital images
 */
export async function POST(request, context) {
  try {
    // Get authorization data
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = context.params;
    // For file uploads, we need to handle FormData
    const formData = await request.formData();
    // Log the number of files being uploaded for debugging
    const files = formData.getAll('hospitalPics');
    console.log(`Uploading ${files.length} hospital images for hospital ID: ${id}`);
    // Forward the formData to the backend
    const response = await api.upload(`/api/hospital/${id}/picture`, formData,
      (progressEvent) => {
        console.log(`Upload progress: ${Math.round((progressEvent.loaded / (progressEvent.total || 1)) * 100)}%`);
      }
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error uploading hospital images for ${context.params.id}:`, error);
    return NextResponse.json(
      { error: error.response?.data?.error || 'Failed to upload hospital images' },
      { status: 500 }
    );
  }
}