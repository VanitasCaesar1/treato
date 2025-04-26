// app/api/payment/webhook/route.js
import { NextResponse } from 'next/server';
import { transactionsModel, subscriptionsModel } from '@/lib/db';

export async function POST(request) {
  try {
    const payload = await request.json();
    
    // Validate webhook payload
    if (!payload?.data?.merchantTransactionId) {
      return NextResponse.json({ status: 'INVALID_PAYLOAD' }, { status: 400 });
    }
    
    const { merchantTransactionId } = payload.data;
    const transaction = await transactionsModel.getByMerchantTransactionId(merchantTransactionId);
    
    if (!transaction) {
      return NextResponse.json({ status: 'TRANSACTION_NOT_FOUND' }, { status: 404 });
    }
    
    // Process the webhook based on the payment status
    if (payload.data.responseCode === 'SUCCESS' && payload.data.state === 'COMPLETED') {
      // Update transaction status
      await transactionsModel.updateStatus(
        merchantTransactionId,
        'success',
        payload.data
      );
      
      // Create subscription if it doesn't exist
      // This is a safety measure in case the callback route failed
      const subscriptionExists = await subscriptionsModel.getByTransactionId(transaction.id);
      if (!subscriptionExists) {
        await subscriptionsModel.create(
          transaction.user_id,
          transaction.plan_id,
          transaction.id,
          transaction.billing_cycle
        );
      }
      
      return NextResponse.json({ status: 'SUCCESS' });
    } else {
      // Update transaction status to failed
      await transactionsModel.updateStatus(
        merchantTransactionId,
        'failed',
        payload.data
      );
      
      return NextResponse.json({ status: 'PAYMENT_FAILED' });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ status: 'ERROR', message: error.message }, { status: 500 });
  }
}