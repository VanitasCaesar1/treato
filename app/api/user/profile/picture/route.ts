// app/api/user/profile/picture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { Binary } from 'mongodb';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function POST(req: NextRequest) {
  try {
    console.log('Profile picture upload request received');
    
    // Get auth data from WorkOS
    const { user } = await withAuth();
    if (!user || !user.id) {
      console.log('Unauthorized - no user or user.id');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', user.id);

    const formData = await req.formData();
    const file = formData.get('profilePic') as File;
    
    if (!file) {
      console.log('No file found in form data');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const contentType = file.type;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(contentType)) {
      console.log('Invalid file type:', contentType);
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPEG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to binary data
    const buffer = await file.arrayBuffer();
    const binary = Buffer.from(buffer);
    
    console.log('File converted to binary, size:', binary.length);

    // Connect to MongoDB
    const conn = await mongodb();
    const db = conn.connection.db;
    const collection = db.collection('users');

    // Check if user already exists in the collection
    const existingUser = await collection.findOne({ user_id: user.id });
    console.log('Existing user found:', !!existingUser);

    const profilePicData = {
      data: new Binary(binary),
      contentType: contentType,
      uploadedAt: new Date()
    };

    if (existingUser) {
      // Update existing user's profile picture
      const result = await collection.updateOne(
        { user_id: user.id },
        {
          $set: {
            profile_pic: profilePicData,
            updated_at: new Date()
          }
        }
      );
      console.log('Update result:', result);
    } else {
      // Create new user document with profile picture
      const result = await collection.insertOne({
        user_id: user.id,
        profile_pic: profilePicData,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('Insert result:', result);
    }

    console.log('Profile picture uploaded successfully');
    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully'
    });

  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('Profile picture delete request received');
    
    // Get auth data from WorkOS
    const { user } = await withAuth();
    if (!user || !user.id) {
      console.log('Unauthorized - no user or user.id');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated for delete:', user.id);

    // Connect to MongoDB
    const conn = await mongodb();
    const db = conn.connection.db;
    const collection = db.collection('users');

    // Check if user exists
    const existingUser = await collection.findOne({ user_id: user.id });
    if (!existingUser) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove profile picture
    const result = await collection.updateOne(
      { user_id: user.id },
      { 
        $unset: { profile_pic: "" },
        $set: { updated_at: new Date() }
      }
    );
    
    console.log('Delete result:', result);

    return NextResponse.json({
      success: true,
      message: 'Profile picture removed successfully'
    });

  } catch (error: any) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile picture: ' + error.message },
      { status: 500 }
    );
  }
}