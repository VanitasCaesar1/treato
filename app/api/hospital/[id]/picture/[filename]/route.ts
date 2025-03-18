// app/api/hospital/[id]/picture/[filename]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { api } from '@/lib/api';
import { withAuth } from "@workos-inc/authkit-nextjs";

// Handler for GET request to fetch a specific hospital image or redirect to it
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string, filename: string } }
) {
  try {
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id, filename } = params;
    
    // Redirect to the actual image URL from your backend
    const imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hospital/${id}/picture/${filename}`;
    return NextResponse.redirect(imageUrl);
  } catch (error) {
    console.error(`Error fetching hospital image ${params.filename}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital image' },
      { status: 500 }
    );
  }
}

// Handler for DELETE request to remove a hospital image
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string, filename: string } }
) {
  try {
    const { user, organizationId } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id, filename } = params;
    
    // Forward the delete request to the backend
    const response = await api.delete(`/api/hospital/${id}/picture/${filename}`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error deleting hospital image ${params.filename}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete hospital image' },
      { status: 500 }
    );
  }
}