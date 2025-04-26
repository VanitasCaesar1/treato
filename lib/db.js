// lib/db.js
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Create a new pool instance with connection handling
const createPool = () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    return null;
  }
  
  try {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  } catch (error) {
    console.error('Failed to create database pool:', error);
    return null;
  }
};

const pool = createPool();

// Helper function to safely execute queries
const safeQuery = async (query, params = []) => {
  if (!pool) {
    throw new Error('Database connection not available');
  }
  
  try {
    return await pool.query(query, params);
  } catch (error) {
    console.error('Database query error:', error);
    
    // Check if the error is about a missing table
    if (error.code === '42P01') { // undefined_table
      console.error('The required table does not exist. Please run the database migrations.');
    }
    
    throw error;
  }
};

// Plans model
export const plansModel = {
  async getAll() {
    const { rows } = await safeQuery('SELECT * FROM plans');
    return rows;
  },
  
  async getById(id) {
    const { rows } = await safeQuery('SELECT * FROM plans WHERE id = $1', [id]);
    return rows[0] || null;
  },
  
  async getByName(name) {
    const { rows } = await safeQuery('SELECT * FROM plans WHERE name = $1', [name]);
    return rows[0] || null;
  }
};

// Transactions model
export const transactionsModel = {
  async create(userId, planId, merchantTransactionId, amount, billingCycle) {
    const { rows } = await safeQuery(
      `INSERT INTO transactions 
      (user_id, plan_id, transaction_id, merchant_transaction_id, amount, billing_cycle, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [userId, planId, uuidv4(), merchantTransactionId, amount, billingCycle, 'pending']
    );
    return rows[0];
  },
  
  async updateStatus(merchantTransactionId, status, paymentDetails) {
    // Convert paymentDetails to JSONB compatible format
    const jsonPaymentDetails = typeof paymentDetails === 'string' 
      ? paymentDetails
      : JSON.stringify(paymentDetails || {});
    
    const { rows } = await safeQuery(
      `UPDATE transactions 
      SET status = $1, payment_details = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE merchant_transaction_id = $3 
      RETURNING *`,
      [status, jsonPaymentDetails, merchantTransactionId]
    );
    return rows[0];
  },
  
  async getByMerchantTransactionId(merchantTransactionId) {
    const { rows } = await safeQuery(
      'SELECT * FROM transactions WHERE merchant_transaction_id = $1',
      [merchantTransactionId]
    );
    return rows[0] || null;
  }
};

// Subscriptions model
export const subscriptionsModel = {
  async create(userId, planId, transactionId, billingCycle) {
    // Calculate end date based on billing cycle
    const startDate = new Date();
    const endDate = new Date();
    
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    
    const { rows } = await safeQuery(
      `INSERT INTO subscriptions 
      (user_id, plan_id, transaction_id, start_date, end_date, billing_cycle, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *`,
      [userId, planId, transactionId, startDate, endDate, billingCycle, 'active']
    );
    return rows[0];
  },
  
  async getByTransactionId(transactionId) {
    const { rows } = await safeQuery(
      'SELECT * FROM subscriptions WHERE transaction_id = $1',
      [transactionId]
    );
    return rows[0] || null;
  }
};