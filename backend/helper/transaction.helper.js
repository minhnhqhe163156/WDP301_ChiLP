/**
 * Transaction helper utility for MongoDB operations with automatic retries
 */
const mongoose = require('mongoose');
const Order = require("../models/Order");
// const Payment = require("../models/Payment");

/**
 * Execute a function within a MongoDB transaction with automatic retries
 * @param {Function} fn - Function to execute within transaction
 * @param {Object} options - Retry and transaction options
 * @returns {Promise} - Result of the operation
 */
const executeWithRetry = async (fn, options = {}) => {
  const {
    maxRetries = 3,          // Maximum number of retry attempts
    retryDelay = 100,        // Initial delay between retries (ms)
    maxRetryDelay = 5000,    // Maximum delay between retries (ms)
    transactionOptions = {}  // MongoDB transaction options
  } = options;

  let lastError = null;
  let attempt = 0;

  while (attempt < maxRetries) {
    const session = await mongoose.startSession();
    try {
      // Start transaction
      session.startTransaction(transactionOptions);
      
      // Execute function with session
      const result = await fn(session);
      
      // Commit transaction
      await session.commitTransaction();
      
      // Return result on success
      return result;
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      
      lastError = error;
      attempt++;
      
      // Check if error is transient and retryable
      const isRetryable = isRetryableError(error);
      
      if (!isRetryable || attempt >= maxRetries) {
        break;
      }
      
      // Calculate backoff delay with exponential increase
      const delay = Math.min(retryDelay * Math.pow(2, attempt - 1), maxRetryDelay);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    } finally {
      // End session
      session.endSession();
    }
  }
  
  // If we've reached here, all retries failed
  throw lastError || new Error('Transaction failed after maximum retries');
};

/**
 * Check if an error is transient and retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - True if error is retryable
 */
const isRetryableError = (error) => {
  // MongoDB error codes that indicate transient errors
  const retryableCodes = [
    6,    // HostUnreachable
    7,    // HostNotFound
    89,   // NetworkTimeout
    91,   // ShutdownInProgress
    189,  // PrimarySteppedDown
    91,   // ShutdownInProgress
    10107,// NotWritablePrimary
    13436,// NetworkInterfaceExceededTimeLimit
    13435,// NetworkInterfaceExceededTimeLimitNoAck
    11600,// InterruptedAtShutdown
    11602,// InterruptedDueToReplStateChange
    262   // ExceededTimeLimit
  ];
  
  // Check for connection errors
  if (error.name === 'MongoNetworkError' || 
      error.name === 'MongoTimeoutError' ||
      error.message.includes('connection') || 
      error.message.includes('timeout')) {
    return true;
  }
  
  // Check for retryable error codes
  if (error.code && retryableCodes.includes(error.code)) {
    return true;
  }
  
  // Check for write conflict errors
  if (error.errorLabels && 
      (error.errorLabels.includes('TransientTransactionError') || 
       error.errorLabels.includes('RetryableWriteError'))) {
    return true;
  }
  
  return false;
};

/**
 * Execute a bulk operation with automatic retries
 * @param {Object} model - Mongoose model
 * @param {string} operation - Type of operation ('insertMany', 'updateMany', 'deleteMany')
 * @param {Array|Object} data - Data for the operation
 * @param {Object} filter - Filter for update/delete operations
 * @param {Object} options - Options for retry and bulk operation
 * @returns {Promise} - Result of the bulk operation
 */
const bulkOperationWithRetry = async (model, operation, data, filter = {}, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 100,
    maxRetryDelay = 5000,
    bulkOptions = { ordered: false }
  } = options;
  
  let lastError = null;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      let result;
      
      switch (operation) {
        case 'insertMany':
          result = await model.insertMany(data, bulkOptions);
          break;
        case 'updateMany':
          result = await model.updateMany(filter, data, bulkOptions);
          break;
        case 'deleteMany':
          result = await model.deleteMany(filter, bulkOptions);
          break;
        default:
          throw new Error(`Unsupported bulk operation: ${operation}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      attempt++;
      
      // Check if error is transient
      const isRetryable = isRetryableError(error);
      
      if (!isRetryable || attempt >= maxRetries) {
        break;
      }
      
      // Calculate backoff delay
      const delay = Math.min(retryDelay * Math.pow(2, attempt - 1), maxRetryDelay);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we've reached here, all retries failed
  throw lastError || new Error(`Bulk operation ${operation} failed after maximum retries`);
};

/**
 * Sync payment information between Order and Payment models
 * @param {string} orderId - Order ID
 * @param {Object} paymentData - Payment data
 */
const syncPaymentToOrder = async (orderId, paymentData) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update order payment information
    order.payment = {
      method: paymentData.payment_method || paymentData.method,
      status: paymentData.payment_status || paymentData.status,
      transaction_id: paymentData.transaction_id,
      amount: paymentData.amount,
      paid_at: paymentData.pay_date || paymentData.paid_at,
      gateway_response: paymentData.gateway_response || paymentData.vnpay_data
    };

    // Update order status based on payment status
    if (paymentData.payment_status === 'success') {
      order.status = 'processing';
    }

    await order.save();
    return order;
  } catch (error) {
    console.error('Error syncing payment to order:', error);
    throw error;
  }
};

/**
 * Create payment record and sync to order
 * @param {Object} paymentData - Payment data
 */
const createPaymentAndSync = async (paymentData) => {
  try {
    // Create payment record
    const payment = new Payment(paymentData);
    await payment.save();

    // Sync to order
    await syncPaymentToOrder(paymentData.order_id, paymentData);

    return payment;
  } catch (error) {
    console.error('Error creating payment and sync:', error);
    throw error;
  }
};

/**
 * Update payment status and sync to order
 * @param {string} paymentId - Payment ID
 * @param {Object} updateData - Update data
 */
const updatePaymentAndSync = async (paymentId, updateData) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true }
    );

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Sync to order
    await syncPaymentToOrder(payment.order_id, payment);

    return payment;
  } catch (error) {
    console.error('Error updating payment and sync:', error);
    throw error;
  }
};

module.exports = {
  executeWithRetry,
  bulkOperationWithRetry,
  isRetryableError,
  syncPaymentToOrder,
  createPaymentAndSync,
  updatePaymentAndSync
};