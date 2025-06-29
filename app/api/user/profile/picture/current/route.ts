// app/api/user/profile/picture/current/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(req: NextRequest) {
  try {
    console.log('Profile picture fetch request received');
    
    // Get auth data from WorkOS
    const { user } = await withAuth();
    if (!user || !user.id) {
      console.log('Unauthorized - no user or user.id');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated for picture fetch:', user.id);

    // Connect to MongoDB
    const conn = await mongodb();
    const db = conn.connection.db;
    const collection = db.collection('users');

    // Find user with profile picture
    const user_data = await collection.findOne(
      { user_id: user.id },
      { projection: { profile_pic: 1 } }
    );

    if (!user_data || !user_data.profile_pic) {
      console.log('No profile picture found for user');
      return NextResponse.json(
        { error: 'Profile picture not found' },
        { status: 404 }
      );
    }

    console.log('Profile picture found, content type:', user_data.profile_pic.contentType);

    // Extract binary data and content type
    const imageData = user_data.profile_pic.data.buffer;
    const contentType = user_data.profile_pic.contentType || 'image/jpeg';

    // Return the image as a response
    return new NextResponse(imageData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });

  } catch (error: any) {
    console.error('Error fetching profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile picture: ' + error.message },
      { status: 500 }
    );
  }
}