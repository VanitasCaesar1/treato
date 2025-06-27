///api/user/profile/picture/[userId]/route.js
// This route handles fetching a user's profile picture from MongoDB
// and returns it as a response. If the user does not have a profile picture,
import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(request, context) {
  try {
    // Get auth data from WorkOS
    const { user: authUser } = await withAuth();
    if (!authUser || !authUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Use the authenticated user's ID
    const userId = authUser.id;
    // Connect to MongoDB
    const conn = await mongodb();
    const db = conn.connection.db;
    const collection = db.collection('users');
    // Find the user
    const user = await collection.findOne({ user_id: userId });
    if (!user || !user.profile_pic) {
      // Return a default profile picture
      return NextResponse.redirect(new URL('/images/default-profile.png', request.url));
    }
    // Return the image with the proper content type
    return new NextResponse(user.profile_pic.data.buffer, {
      headers: {
        'Content-Type': user.profile_pic.contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      }
    });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch profile picture" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}