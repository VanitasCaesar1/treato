// app/api/payment/test-credentials/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get credentials from environment
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const merchantId = process.env.PHONEPE_MERCHANT_ID || 'MERCHANTUAT';
    
    // Check if credentials are set
    const missingCredentials = [];
    if (!clientId) missingCredentials.push('PHONEPE_CLIENT_ID');
    if (!clientSecret) missingCredentials.push('PHONEPE_CLIENT_SECRET');
    if (!merchantId) missingCredentials.push('PHONEPE_MERCHANT_ID (using default)');
    
    if (missingCredentials.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Missing PhonePe credentials',
        missingCredentials
      });
    }
    
    // Mask credentials for security
    const maskedClientId = clientId ? `${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)}` : null;
    const maskedClientSecret = clientSecret ? `${clientSecret.substring(0, 4)}...${clientSecret.substring(clientSecret.length - 4)}` : null;
    
    return NextResponse.json({
      success: true,
      message: 'PhonePe credentials are configured',
      clientId: maskedClientId,
      merchantId,
      secretConfigured: !!clientSecret
    });
  } catch (error) {
    console.error('Error checking PhonePe credentials:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking PhonePe credentials',
      error: error.message
    });
  }
}