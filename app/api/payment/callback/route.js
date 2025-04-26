// app/api/payment/callback/route.js
import { NextResponse } from 'next/server';
import { verifyPaymentCallback } from '@/utils/phonepe';
import { transactionsModel, subscriptionsModel } from '@/lib/db';

export async function GET(request) {
  try {
    // Extract the merchantTransactionId from URL parameters
    const { searchParams } = new URL(request.url);
    const merchantTransactionId = searchParams.get('merchantTransactionId');
    
    if (!merchantTransactionId) {
      return NextResponse.redirect(new URL('/payment-failed', request.url));
    }
    
    // Verify payment status with PhonePe
    const paymentStatus = await verifyPaymentCallback(merchantTransactionId);
    
    // Get transaction details from database
    const transaction = await transactionsModel.getByMerchantTransactionId(merchantTransactionId);
    
    if (!transaction) {
      return NextResponse.redirect(new URL('/payment-failed?reason=transaction-not-found', request.url));
    }
    
    // Check payment status
    if (paymentStatus.success && 
        paymentStatus.data.responseCode === 'SUCCESS' &&
        paymentStatus.data.state === 'COMPLETED') {
      
      // Update transaction status to success
      await transactionsModel.updateStatus(
        merchantTransactionId,
        'success',
        paymentStatus.data
      );
      
      // Create subscription for the user
      await subscriptionsModel.create(
        transaction.user_id,
        transaction.plan_id,
        transaction.id,
        transaction.billing_cycle
      );
      
      // Redirect to success page
      return NextResponse.redirect(new URL(`/payment-success?txnId=${merchantTransactionId}`, request.url));
    } else {
      // Update transaction status to failed
      await transactionsModel.updateStatus(
        merchantTransactionId,
        'failed',
        paymentStatus.data
      );
      
      // Redirect to failure page
      return NextResponse.redirect(new URL(`/payment-failed?reason=${paymentStatus.data.responseCode}`, request.url));
    }
    
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(new URL('/payment-failed?reason=server-error', request.url));
  }
}