import { NextRequest, NextResponse } from 'next/server';
import mongodb from '@/lib/mongodb';
import { Binary } from 'mongodb';
import { withAuth } from '@workos-inc/authkit-nextjs';

// GET - Fetch diagnosis data by appointment_id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 GET request for appointment:', id);
    
    // Get auth data from WorkOS
    const { user } = await withAuth();
    if (!user || !user.id) {
      console.log('❌ Unauthorized - no user or user.id');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Connect to MongoDB
    const conn = await mongodb();
    const db = conn.connection.db;
    const collection = db.collection('dermatology_assessments');

    // Find diagnosis by appointment_id
    const diagnosis = await collection.findOne({ 
      appointment_id: id 
    });

    if (!diagnosis) {
      console.log('❌ Dermatology diagnosis not found for appointment:', id);
      return NextResponse.json(
        { error: 'Dermatology diagnosis not found' },
        { status: 404 }
      );
    }

    console.log('✅ Dermatology diagnosis found for appointment:', id);
    return NextResponse.json({
      success: true,
      data: diagnosis
    });

  } catch (error: any) {
    console.error('❌ Error fetching dermatology diagnosis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dermatology diagnosis: ' + error.message },
      { status: 500 }
    );
  }
}

// POST - Create new diagnosis data with file uploads
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🆕 POST request for appointment:', id);
    
    // Get auth data from WorkOS
    const { user } = await withAuth();
    if (!user || !user.id) {
      console.log('❌ Unauthorized - no user or user.id');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Connect to MongoDB with proper error handling
    let conn, db, collection;
    try {
      conn = await mongodb();
      db = conn.connection.db;
      collection = db.collection('dermatology_assessments');
      console.log('✅ MongoDB connection established');
      
      // ============ CRITICAL DEBUG SECTION ============
      console.log('🔍 DATABASE DEBUG INFO:');
      console.log('- Database name:', db.databaseName);
      console.log('- Collection name:', collection.collectionName);
      console.log('- Connection state:', conn.connection.readyState);
      
      // Verify we can access the users collection (known working)
      const usersCount = await db.collection('users').estimatedDocumentCount();
      console.log('- Users collection count (verification):', usersCount);
      
      // Check current dermatology collection count
      const currentCount = await collection.estimatedDocumentCount();
      console.log('- Current dermatology assessments count:', currentCount);
      
      // List all collections to verify we're in the right database
      const collections = await db.listCollections().toArray();
      console.log('- Available collections:', collections.map(c => c.name));
      // ===============================================
      
    } catch (dbError) {
      console.error('❌ MongoDB connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed: ' + dbError.message },
        { status: 500 }
      );
    }

    // Check if diagnosis already exists for this appointment
    const existingDiagnosis = await collection.findOne({ 
      appointment_id: id 
    });

    if (existingDiagnosis) {
      console.log('⚠️ Dermatology diagnosis already exists for appointment:', id);
      return NextResponse.json(
        { error: 'Dermatology diagnosis already exists for this appointment. Use PUT to update.' },
        { status: 409 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    console.log('📄 Content-Type:', contentType);
    
    let body: any = {};
    let attachments: any[] = [];

    if (contentType.includes('multipart/form-data')) {
      console.log('📎 Processing multipart/form-data');
      
      // Handle form data with files
      const formData = await req.formData();
      console.log('📋 FormData entries:', Array.from(formData.keys()));
      
      // Extract text fields
      const textFields = [
        'patient_id', 'doctor_id', 'org_id', 'lesion_description', 'distribution',
        'skin_color_changes', 'custom_affected_area', 'descriptive_findings',
        'physical_exam_notes', 'imaging_notes', 'clinical_photography',
        'dermoscopy_findings', 'follow_up_recommendations', 'referral_specialty',
        'referral_reason', 'working_diagnosis', 'assessment_notes',
        'severity_assessment', 'prognosis', 'patient_education', 'status', 'visit_type'
      ];

      textFields.forEach(field => {
        const value = formData.get(field);
        if (value && value.toString().trim() !== '') {
          body[field] = value.toString().trim();
          console.log(`📝 ${field}: ${body[field].substring(0, 50)}${body[field].length > 50 ? '...' : ''}`);
        }
      });

      // Handle boolean fields
      const booleanValue = formData.get('referral_needed');
      if (booleanValue !== null) {
        body.referral_needed = booleanValue.toString().toLowerCase() === 'true';
        console.log('☑️ referral_needed:', body.referral_needed);
      }

      // Handle array fields (JSON strings)
      const arrayFields = ['affected_areas', 'diagnostic_procedures', 'medications', 'differential_diagnosis'];
      arrayFields.forEach(field => {
        const value = formData.get(field);
        if (value && value.toString().trim() !== '') {
          try {
            const parsed = JSON.parse(value.toString());
            if (Array.isArray(parsed)) {
              body[field] = parsed;
              console.log(`📊 ${field}:`, parsed.length, 'items');
            } else {
              console.log(`❌ ${field} is not an array:`, typeof parsed);
            }
          } catch (e) {
            console.log(`❌ Invalid JSON for ${field}:`, value.toString().substring(0, 100));
          }
        }
      });

      // Handle object fields (JSON strings)
      const objectFields = ['lesion_characteristics', 'skincare_recommendations'];
      objectFields.forEach(field => {
        const value = formData.get(field);
        if (value && value.toString().trim() !== '') {
          try {
            const parsed = JSON.parse(value.toString());
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              body[field] = parsed;
              console.log(`🏷️ ${field}:`, Object.keys(parsed).length, 'properties');
            } else {
              console.log(`❌ ${field} is not an object:`, typeof parsed);
            }
          } catch (e) {
            console.log(`❌ Invalid JSON for ${field}:`, value.toString().substring(0, 100));
          }
        }
      });

      // Process file attachments
      const files = formData.getAll('attachments') as File[];
      console.log(`📁 Processing ${files.length} attachment files`);

      for (const file of files) {
        if (file.size > 0) {
          console.log('📄 Processing file:', {
            name: file.name,
            size: file.size,
            type: file.type
          });

          // Validate file size (10MB limit for medical files)
          if (file.size > 10 * 1024 * 1024) {
            console.log('❌ File too large:', file.name, file.size);
            return NextResponse.json(
              { error: `File ${file.name} is too large. Maximum size is 10MB.` },
              { status: 400 }
            );
          }

          // Validate file type
          const validTypes = [
            'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ];
          
          if (!validTypes.includes(file.type)) {
            console.log('❌ Invalid file type:', file.name, file.type);
            return NextResponse.json(
              { error: `Invalid file type for ${file.name}. Allowed types: images, PDF, Word documents, and text files.` },
              { status: 400 }
            );
          }

          // Convert file to binary data
          const buffer = await file.arrayBuffer();
          const binary = Buffer.from(buffer);

          attachments.push({
            filename: file.name,
            contentType: file.type,
            size: file.size,
            data: new Binary(binary),
            uploadedAt: new Date(),
            uploadedBy: user.id
          });

          console.log('✅ File processed successfully:', file.name);
        }
      }
    } else {
      // Handle JSON data (no files)
      console.log('📄 Processing JSON data');
      try {
        body = await req.json();
        console.log('📋 JSON request body keys:', Object.keys(body));
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON:', jsonError);
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
    }

    console.log('📦 Final body keys:', Object.keys(body));
    console.log('📎 Attachments count:', attachments.length);

    // Validate that we have some data to save
    if (Object.keys(body).length === 0 && attachments.length === 0) {
      console.log('❌ No data provided');
      return NextResponse.json(
        { error: 'No data provided for diagnosis creation' },
        { status: 400 }
      );
    }

    // Prepare diagnosis document with explicit field mapping
    const diagnosisDocument = {
      appointment_id: id,
      patient_id: body.patient_id || null,
      doctor_id: body.doctor_id || null,
      org_id: body.org_id || null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: user.id,
      
      // Clinical data
      lesion_description: body.lesion_description || null,
      distribution: body.distribution || null,
      skin_color_changes: body.skin_color_changes || null,
      affected_areas: body.affected_areas || null,
      custom_affected_area: body.custom_affected_area || null,
      descriptive_findings: body.descriptive_findings || null,
      physical_exam_notes: body.physical_exam_notes || null,
      diagnostic_procedures: body.diagnostic_procedures || null,
      lesion_characteristics: body.lesion_characteristics || null,
      skincare_recommendations: body.skincare_recommendations || null,
      medications: body.medications || null,
      imaging_notes: body.imaging_notes || null,
      clinical_photography: body.clinical_photography || null,
      dermoscopy_findings: body.dermoscopy_findings || null,
      follow_up_recommendations: body.follow_up_recommendations || null,
      referral_needed: body.referral_needed !== undefined ? body.referral_needed : null,
      referral_specialty: body.referral_specialty || null,
      referral_reason: body.referral_reason || null,
      differential_diagnosis: body.differential_diagnosis || null,
      working_diagnosis: body.working_diagnosis || null,
      assessment_notes: body.assessment_notes || null,
      severity_assessment: body.severity_assessment || null,
      prognosis: body.prognosis || null,
      patient_education: body.patient_education || null,
      status: body.status || 'draft',
      visit_type: body.visit_type || null,
      
      // Attachments
      attachments: attachments.length > 0 ? attachments : []
    };

    // ============ ENHANCED DEBUG BEFORE INSERT ============
    console.log('💾 BEFORE INSERT DEBUG:');
    console.log('- Document appointment_id:', diagnosisDocument.appointment_id);
    console.log('- Document has clinical data:', Object.keys(diagnosisDocument).length > 10);
    console.log('- Document status:', diagnosisDocument.status);
    console.log('- Attachments count:', diagnosisDocument.attachments.length);
    console.log('- Collection count before insert:', await collection.estimatedDocumentCount());
    // =====================================================

    // Insert new diagnosis with enhanced error handling and validation
    let result;
    try {
      // Use explicit write concern for guaranteed write
      result = await collection.insertOne(diagnosisDocument, {
        writeConcern: { w: 'majority', j: true }
      });
      
      console.log('✅ MongoDB insert result:', {
        acknowledged: result.acknowledged,
        insertedId: result.insertedId,
        insertedIdType: typeof result.insertedId
      });
    } catch (insertError) {
      console.error('❌ MongoDB insert failed:', insertError);
      return NextResponse.json(
        { error: 'Failed to save diagnosis to database: ' + insertError.message },
        { status: 500 }
      );
    }

    // Verify the document was actually inserted
    if (!result.acknowledged || !result.insertedId) {
      console.error('❌ Insert operation not acknowledged or no insertedId');
      return NextResponse.json(
        { error: 'Database insert operation failed - not acknowledged' },
        { status: 500 }
      );
    }

    // ============ ENHANCED DEBUG AFTER INSERT ============
    console.log('🔍 AFTER INSERT VERIFICATION:');
    console.log('- Collection count after insert:', await collection.estimatedDocumentCount());
    
    // Multiple verification attempts
    const verifications = {
      byId: await collection.findOne({ _id: result.insertedId }),
      byAppointmentId: await collection.findOne({ appointment_id: id }),
      countByAppointmentId: await collection.countDocuments({ appointment_id: id })
    };
    
    console.log('- Verification by _id:', verifications.byId ? 'FOUND' : 'NOT FOUND');
    console.log('- Verification by appointment_id:', verifications.byAppointmentId ? 'FOUND' : 'NOT FOUND');
    console.log('- Count by appointment_id:', verifications.countByAppointmentId);
    
    // If none of the verifications work, there's a serious issue
    if (!verifications.byId && !verifications.byAppointmentId) {
      console.error('❌ CRITICAL: Document not found after insert - possible database issue');
      
      // Last resort: check if we're inserting into a different collection
      const allCollectionsAfter = await db.listCollections().toArray();
      console.log('- All collections after insert:', allCollectionsAfter.map(c => c.name));
      
      return NextResponse.json(
        { error: 'Document insertion failed verification - database connectivity issue' },
        { status: 500 }
      );
    }
    // =====================================================

    console.log('✅ Document successfully inserted and verified:', result.insertedId);

    return NextResponse.json({
      success: true,
      message: 'Dermatology diagnosis created successfully',
      data: { 
        id: result.insertedId,
        appointment_id: id,
        attachments_count: attachments.length,
        status: diagnosisDocument.status,
        created_at: diagnosisDocument.created_at,
        // Include verification status
        verified: {
          byId: !!verifications.byId,
          byAppointmentId: !!verifications.byAppointmentId,
          count: verifications.countByAppointmentId
        }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating dermatology diagnosis:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create dermatology diagnosis: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update existing diagnosis data with optional file uploads
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔄 PUT request for appointment:', id);
    
    // Get auth data from WorkOS
    const { user } = await withAuth();
    if (!user || !user.id) {
      console.log('❌ Unauthorized - no user or user.id');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Connect to MongoDB
    const conn = await mongodb();
    const db = conn.connection.db;
    const collection = db.collection('dermatology_assessments');
    console.log('✅ MongoDB connection established');

    // Check if diagnosis exists
    const existingDiagnosis = await collection.findOne({ 
      appointment_id: id 
    });

    if (!existingDiagnosis) {
      console.log('❌ Dermatology diagnosis not found for appointment:', id);
      return NextResponse.json(
        { error: 'Dermatology diagnosis not found. Use POST to create new diagnosis.' },
        { status: 404 }
      );
    }

    console.log('✅ Existing diagnosis found:', existingDiagnosis._id);

    const contentType = req.headers.get('content-type') || '';
    console.log('📄 Content-Type:', contentType);
    let body: any = {};
    let newAttachments: any[] = [];

    if (contentType.includes('multipart/form-data')) {
      console.log('📎 Processing multipart/form-data');
      const formData = await req.formData();
      console.log('📋 FormData entries:', Array.from(formData.keys()));
      
      // Extract text fields with proper validation
      const textFields = [
        'patient_id', 'doctor_id', 'org_id', 'lesion_description', 'distribution',
        'skin_color_changes', 'custom_affected_area', 'descriptive_findings',
        'physical_exam_notes', 'imaging_notes', 'clinical_photography',
        'dermoscopy_findings', 'follow_up_recommendations', 'referral_specialty',
        'referral_reason', 'working_diagnosis', 'assessment_notes',
        'severity_assessment', 'prognosis', 'patient_education', 'status', 'visit_type'
      ];

      textFields.forEach(field => {
        const value = formData.get(field);
        if (value !== null && value !== undefined) {
          const trimmedValue = value.toString().trim();
          if (trimmedValue !== '') {
            body[field] = trimmedValue;
            console.log(`📝 ${field}: ${trimmedValue.substring(0, 50)}${trimmedValue.length > 50 ? '...' : ''}`);
          }
        }
      });

      // Handle boolean fields properly
      const booleanValue = formData.get('referral_needed');
      if (booleanValue !== null && booleanValue !== undefined) {
        body.referral_needed = booleanValue.toString().toLowerCase() === 'true';
        console.log('☑️ referral_needed:', body.referral_needed);
      }

      // Handle array fields with validation
      const arrayFields = ['affected_areas', 'diagnostic_procedures', 'medications', 'differential_diagnosis'];
      arrayFields.forEach(field => {
        const value = formData.get(field);
        if (value !== null && value !== undefined) {
          try {
            const parsed = JSON.parse(value.toString());
            if (Array.isArray(parsed)) {
              body[field] = parsed;
              console.log(`📊 ${field}:`, parsed.length, 'items');
            }
          } catch (e) {
            console.log(`❌ Invalid JSON for ${field}:`, value.toString().substring(0, 100));
          }
        }
      });

      // Handle object fields with validation
      const objectFields = ['lesion_characteristics', 'skincare_recommendations'];
      objectFields.forEach(field => {
        const value = formData.get(field);
        if (value !== null && value !== undefined) {
          try {
            const parsed = JSON.parse(value.toString());
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              body[field] = parsed;
              console.log(`🏷️ ${field}:`, Object.keys(parsed).length, 'properties');
            }
          } catch (e) {
            console.log(`❌ Invalid JSON for ${field}:`, value.toString().substring(0, 100));
          }
        }
      });

      // Process new file attachments
      const files = formData.getAll('attachments') as File[];
      console.log(`📁 Processing ${files.length} new attachment files`);

      for (const file of files) {
        if (file.size > 0) {
          console.log('📄 Processing file:', file.name);
          
          if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
              { error: `File ${file.name} is too large. Maximum size is 10MB.` },
              { status: 400 }
            );
          }

          const validTypes = [
            'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ];
          
          if (!validTypes.includes(file.type)) {
            return NextResponse.json(
              { error: `Invalid file type for ${file.name}. Allowed types: images, PDF, Word documents, and text files.` },
              { status: 400 }
            );
          }

          const buffer = await file.arrayBuffer();
          const binary = Buffer.from(buffer);

          newAttachments.push({
            filename: file.name,
            contentType: file.type,
            size: file.size,
            data: new Binary(binary),
            uploadedAt: new Date(),
            uploadedBy: user.id
          });
        }
      }
    } else {
      // Handle JSON data
      console.log('📄 Processing JSON data');
      body = await req.json();
      console.log('📋 JSON request body keys:', Object.keys(body));
    }

    // Prepare update document
    const updateFields: any = {
      updated_at: new Date(),
      updated_by: user.id
    };

    // Only update fields that are provided
    const fieldsToUpdate = [
      'patient_id', 'doctor_id', 'org_id', 'lesion_description', 'distribution',
      'skin_color_changes', 'affected_areas', 'custom_affected_area', 
      'descriptive_findings', 'physical_exam_notes', 'diagnostic_procedures',
      'lesion_characteristics', 'skincare_recommendations', 'medications',
      'imaging_notes', 'clinical_photography', 'dermoscopy_findings',
      'follow_up_recommendations', 'referral_needed', 'referral_specialty',
      'referral_reason', 'differential_diagnosis', 'working_diagnosis',
      'assessment_notes', 'severity_assessment', 'prognosis', 'patient_education',
      'status', 'visit_type'
    ];

    let fieldsBeingUpdated = 0;
    fieldsToUpdate.forEach(field => {
      if (body.hasOwnProperty(field)) {
        updateFields[field] = body[field];
        fieldsBeingUpdated++;
        console.log(`🔄 Updating ${field}`);
      }
    });

    console.log(`🔢 Fields being updated: ${fieldsBeingUpdated}`);

    // Handle attachments - append new ones to existing
    if (newAttachments.length > 0) {
      const existingAttachments = existingDiagnosis.attachments || [];
      updateFields.attachments = [...existingAttachments, ...newAttachments];
      console.log(`📎 Adding ${newAttachments.length} new attachments`);
    }

    // Check if there's anything to update
    if (fieldsBeingUpdated === 0 && newAttachments.length === 0) {
      console.log('⚠️ No data to update');
      return NextResponse.json({
        success: false,
        message: 'No valid data provided for update'
      }, { status: 400 });
    }

    console.log('💾 Executing MongoDB update with write concern...');
    
    // Execute the update with write concern
    const result = await collection.updateOne(
      { appointment_id: id },
      { $set: updateFields },
      { writeConcern: { w: 'majority', j: true } }
    );

    console.log('✅ MongoDB update result:', {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });

    // Verify the update
    const updatedDocument = await collection.findOne({ appointment_id: id });
    console.log('🔍 Update verification:', !!updatedDocument);

    return NextResponse.json({
      success: result.acknowledged && result.matchedCount > 0,
      message: result.modifiedCount > 0 
        ? 'Dermatology diagnosis updated successfully'
        : 'Document found but no changes were made',
      modifiedCount: result.modifiedCount,
      attachments_added: newAttachments.length
    });

  } catch (error: any) {
    console.error('❌ Error updating dermatology diagnosis:', error);
    return NextResponse.json({
      error: 'Failed to update dermatology diagnosis: ' + error.message
    }, { status: 500 });
  }
}

// DELETE - Delete diagnosis data
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await params;
    console.log('🗑️ DELETE request for appointment:', appointmentId);
    
    // Validate appointment_id
    if (typeof appointmentId !== 'string' || appointmentId.trim() === '') {
      console.log('❌ Invalid appointment_id:', appointmentId);
      return NextResponse.json(
        { error: 'Invalid appointment_id parameter.' },
        { status: 400 }
      );
    }
    
    // Get auth data from WorkOS
    const { user } = await withAuth();
    if (!user || !user.id) {
      console.log('❌ Unauthorized - no user or user.id');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Connect to MongoDB
    const conn = await mongodb();
    const db = conn.connection.db;
    const collection = db.collection('dermatology_assessments');

    // Check if diagnosis exists
    const existingDiagnosis = await collection.findOne({ 
      appointment_id: appointmentId 
    });

    if (!existingDiagnosis) {
      console.log('❌ Dermatology diagnosis not found for appointment:', appointmentId);
      return NextResponse.json(
        { error: 'Dermatology diagnosis not found' },
        { status: 404 }
      );
    }

    // Delete diagnosis with write concern
    const result = await collection.deleteOne(
      { appointment_id: appointmentId },
      { writeConcern: { w: 'majority', j: true } }
    );

    console.log('✅ Delete result:', result.deletedCount);

    return NextResponse.json({
      success: true,
      message: 'Dermatology diagnosis deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (error: any) {
    console.error('❌ Error deleting dermatology diagnosis:', error);
    return NextResponse.json(
      { error: 'Failed to delete dermatology diagnosis: ' + error.message },
      { status: 500 }
    );
  }
}