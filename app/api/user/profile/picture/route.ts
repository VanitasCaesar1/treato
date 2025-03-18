// app/api/user/profile/picture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { Binary } from 'mongodb';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function POST(req: NextRequest) {
  try {
    // Get auth data from WorkOS
    const { user } = await withAuth();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('profilePic') as File;    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const contentType = file.type;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    
    if (!validTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPEG, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to binary data
    const buffer = await file.arrayBuffer();
    const binary = Buffer.from(buffer);

    // Connect to MongoDB
    const conn = await mongodb();
    const db = conn.connection.db;
    const collection = db.collection('users');

    // Check if user already exists in the collection
    const existingUser = await collection.findOne({ user_id: user.id });

    if (existingUser) {
      // Update existing user's profile picture
      await collection.updateOne(
        { user_id: user.id },
        { 
          $set: { 
            profile_pic: {
              data: new Binary(binary),
              contentType: contentType
            } 
          } 
        }
      );
    } else {
      // Create new user document with profile picture
      await collection.insertOne({
        user_id: user.id,
        profile_pic: {
          data: new Binary(binary),
          contentType: contentType
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully'
    });
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get auth data from WorkOS
    const { user, accessToken, sessionId, organizationId } = await withAuth();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const conn = await mongodb();
    const db = conn.connection.db;
    const collection = db.collection('users');

    // Check if user exists
    const existingUser = await collection.findOne({ user_id: user.id });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove profile picture
    await collection.updateOne(
      { user_id: user.id },
      { $unset: { profile_pic: "" } }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile picture removed successfully'
    });
  } catch (error: any) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile picture' },
      { status: 500 }
    );
  }
}