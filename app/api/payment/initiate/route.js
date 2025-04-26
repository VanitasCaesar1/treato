// app/api/payment/initiate/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generatePaymentRequest } from '@/utils/phonepe';
import { plansModel, transactionsModel } from '@/lib/db';

// Hardcoded user ID for testing
const TEST_USER_ID = 123;

export async function POST(request) {
  try {
    // Parse request body
    const { planName, billingCycle = 'monthly' } = await request.json();
    
    // Validate required fields
    if (!planName) {
      return NextResponse.json(
        { error: 'Missing required field: planName' },
        { status: 400 }
      );
    }
    
    // Use hardcoded user ID for testing
    const userId = TEST_USER_ID;
    
    console.log(`Processing payment for plan: ${planName}, billing cycle: ${billingCycle}, user: ${userId}`);
    
    // Get plan details
    const plan = await plansModel.getByName(planName);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }
    
    // Determine amount based on billing cycle
    let amount;
    if (billingCycle === 'yearly') {
      amount = plan.yearly_price;
    } else {
      amount = plan.monthly_price;
    }
    
    // For Enterprise plan, redirect to contact page instead
    if (planName === 'Enterprise') {
      return NextResponse.json(
        { redirectToContact: true, message: 'Please contact sales for Enterprise plan pricing' },
        { status: 200 }
      );
    }
    
    // Generate a unique merchant transaction ID
    const merchantTransactionId = `TXN_${uuidv4().replace(/-/g, '').substring(0, 20)}`;
    console.log(`Created merchant transaction ID: ${merchantTransactionId}`);
    
    // Create a pending transaction record
    const transaction = await transactionsModel.create(
      userId,
      plan.id,
      merchantTransactionId,
      amount,
      billingCycle
    );
    console.log(`Created transaction record: ${transaction.id}`);
    
    try {
      // Generate payment request with PhonePe
      const paymentRequest = await generatePaymentRequest(
        amount,
        merchantTransactionId,
        planName,
        userId
      );
      console.log('Successfully generated PhonePe payment request');
      
      // Check if the response has the expected structure
      if (!paymentRequest.data?.instrumentResponse?.redirectInfo?.url) {
        console.error('Invalid response structure from PhonePe:', paymentRequest);
        return NextResponse.json(
          { error: 'Invalid response from payment gateway' },
          { status: 502 }
        );
      }
      
      // Return the payment URL from PhonePe
      return NextResponse.json({
        success: true,
        paymentUrl: paymentRequest.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId,
        amount,
        plan: planName
      });
    } catch (paymentError) {
      // Update transaction status to failed since payment initiation failed
      await transactionsModel.updateStatus(
        merchantTransactionId,
        'failed',
        { error: paymentError.message }
      );
      throw paymentError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}