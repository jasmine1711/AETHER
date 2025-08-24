const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Initialize Razorpay instance
const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Payments routes are working!' });
});

// Create order (amount in paise)
router.post('/razorpay/order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const order = await rzp.orders.create({
      amount: parseInt(amount),
      currency: currency,
      receipt: 'rcpt_' + Date.now(),
      notes: {
        userId: req.user.id, // Assuming your protect middleware adds user to req
        orderDetails: JSON.stringify(req.body.orderDetails || {})
      }
    });
    
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create order',
      message: error.error?.description || error.message
    });
  }
});

// Verify signature (after payment)
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    const sign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (sign === razorpay_signature) {
      return res.json({ 
        success: true, 
        verified: true, 
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    }
    
    res.status(400).json({ 
      success: false, 
      verified: false,
      error: 'Payment verification failed'
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Payment verification error',
      message: error.message
    });
  }
});

// Get payment details by ID
router.get('/razorpay/payment/:paymentId', protect, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const payment = await rzp.payments.fetch(paymentId);
    res.json({ success: true, payment });
  } catch (error) {
    console.error('Fetch payment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch payment details',
      message: error.error?.description || error.message
    });
  }
});

// Get order details by ID
router.get('/razorpay/order/:orderId', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await rzp.orders.fetch(orderId);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Fetch order error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch order details',
      message: error.error?.description || error.message
    });
  }
});

module.exports = router;