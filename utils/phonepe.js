// app/utils/phonepe.js
import crypto from 'crypto';
import axios from 'axios';

// Environment variables
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'MERCHANTUAT';
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.phonepe.com/apis/hermes'
  : 'https://api-preprod.phonepe.com/apis/hermes';

const REDIRECT_URL = process.env.NODE_ENV === 'production'
  ? 'https://yourwebsite.com/api/payment/callback'
  : 'http://localhost:3000/api/payment/callback';

const CALLBACK_URL = process.env.NODE_ENV === 'production'
  ? 'https://yourwebsite.com/api/payment/webhook'
  : 'http://localhost:3000/api/payment/webhook';

// Generate SHA256 hash
const generateSHA256 = (input) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

// Generate payment request for PhonePe
export const generatePaymentRequest = async (amount, merchantTransactionId, planName, userId) => {
  try {
    console.log('Generating payment request with the following parameters:');
    console.log('Amount:', amount);
    console.log('Merchant Transaction ID:', merchantTransactionId);
    console.log('Plan Name:', planName);
    console.log('User ID:', userId);
    console.log('Merchant ID:', MERCHANT_ID);
    
    // Create payload
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: `USER_${userId}`,
      amount: amount * 100, // PhonePe expects amount in paise
      redirectUrl: `${REDIRECT_URL}?merchantTransactionId=${merchantTransactionId}`,
      redirectMode: 'REDIRECT',
      callbackUrl: CALLBACK_URL,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    console.log('PhonePe payload:', JSON.stringify(payload));

    // Convert payload to base64
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    
    // Generate checksum (SHA256 hash of payload + "/pg/v1/pay" + salt)
    // The format is base64 payload + API endpoint + salt key
    const dataToHash = payloadBase64 + "/pg/v1/pay" + CLIENT_SECRET;
    const checksum = generateSHA256(dataToHash);
    
    console.log('Generated checksum:', checksum);
    console.log('X-VERIFY header:', `${checksum}###${CLIENT_ID}`);
    
    // Make API request to PhonePe
    const response = await axios.post(
      `${BASE_URL}/pg/v1/pay`,
      {
        request: payloadBase64
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': `${checksum}###${CLIENT_ID}`
        }
      }
    );

    console.log('PhonePe API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('PhonePe API Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('PhonePe Error Details:', JSON.stringify(error.response.data));
    }
    if (error.response?.status) {
      console.error('PhonePe Error Status:', error.response.status);
    }
    throw new Error(`Failed to initiate payment: ${error.message}`);
  }
};

// Verify payment callback from PhonePe
export const verifyPaymentCallback = async (merchantTransactionId) => {
  try {
    // Generate checksum for verification
    const dataToHash = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + CLIENT_SECRET;
    const checksum = generateSHA256(dataToHash);

    // Make API request to check status
    const response = await axios.get(
      `${BASE_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': `${checksum}###${CLIENT_ID}`,
          'X-MERCHANT-ID': MERCHANT_ID
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('PhonePe Status Check Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('PhonePe Error Details:', JSON.stringify(error.response.data));
    }
    throw new Error(`Failed to verify payment status: ${error.message}`);
  }
};