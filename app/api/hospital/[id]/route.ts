// app/api/hospital/[id]/route.js
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withAuth } from "@workos-inc/authkit-nextjs";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
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
      
      // Call backend API
      const response = await api.get(`/api/hospital/${id}`);
      
      return NextResponse.json(response);
    } catch (error) {
      console.error(`Error fetching hospital ${params.id}:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch hospital details' }, 
        { status: 500 }
      );
    }
  }
  