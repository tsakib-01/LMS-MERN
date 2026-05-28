const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'dummy_key');
const { fulfillEnrollment } = require('../utils/stripe');
const Transaction = require('../models/Transaction');

// 1. Verify payment session (both Stripe and Simulation)
router.get('/verify-session', protect, async (req, res) => {
  const { session_id } = req.query;
  const userId = req.user._id;

  try {
    if (!session_id) {
      return res.status(400).json({ success: false, message: 'session_id is required' });
    }

    // A. Check if it's a simulated payment session
    if (session_id.startsWith('sim_')) {
      const tx = await Transaction.findOne({ stripeSessionId: session_id, student: userId })
        .populate('course', 'title price')
        .populate('teacher', 'name');
      
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Simulated transaction not found' });
      }
      return res.json({ success: true, message: 'Simulated payment verified', transaction: tx });
    }

    // B. Check if it's a real Stripe payment session
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
                               !process.env.STRIPE_SECRET_KEY.startsWith('your_') &&
                               process.env.STRIPE_SECRET_KEY.trim() !== '';
                               
    if (!isStripeConfigured) {
      return res.status(400).json({ success: false, message: 'Stripe is not configured on this server' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      const { courseId, studentId } = session.metadata;
      
      if (studentId !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized session verification' });
      }

      // Fulfill enrollment
      await fulfillEnrollment(courseId, studentId, session.id, 'stripe');
      
      const tx = await Transaction.findOne({ stripeSessionId: session.id })
        .populate('course', 'title price')
        .populate('teacher', 'name');
        
      return res.json({ success: true, message: 'Stripe payment verified and enrolled', transaction: tx });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('💥 Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
  }
});

// 2. Complete simulated payment directly
router.post('/complete-simulated-payment', protect, async (req, res) => {
  const { courseId, studentId, sessionId } = req.body;
  const userId = req.user._id;

  try {
    if (studentId !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized payment request' });
    }

    // Fulfill enrollment directly using simulated payment
    await fulfillEnrollment(courseId, studentId, sessionId, 'simulated');

    res.json({ success: true, message: 'Simulated payment completed successfully' });
  } catch (error) {
    console.error('💥 Complete simulated payment error:', error);
    res.status(500).json({ success: false, message: 'Payment completion failed', error: error.message });
  }
});

// 3. Admin Financial Stats (Gross Sales, Commissions, Transactions)
router.get('/admin-stats', protect, async (req, res) => {
  // Only admin can access
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }

  try {
    const transactions = await Transaction.find()
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 });

    const totalSales = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalFees = transactions.reduce((sum, tx) => sum + tx.adminFee, 0);
    const totalTeacherEarnings = transactions.reduce((sum, tx) => sum + tx.teacherEarnings, 0);

    res.json({
      success: true,
      stats: {
        totalSales,
        totalFees, // 20% Admin commission
        totalTeacherEarnings, // 80% Instructor earnings
        transactionCount: transactions.length
      },
      transactions
    });
  } catch (error) {
    console.error('💥 Admin financial stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats', error: error.message });
  }
});

// 4. Stripe Webhook (raw body endpoint)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
                               !process.env.STRIPE_SECRET_KEY.startsWith('your_') &&
                               process.env.STRIPE_SECRET_KEY.trim() !== '';

    if (!isStripeConfigured) {
      return res.status(400).send('Stripe is not configured');
    }

    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = req.body; // fallback if no signature/secret
    }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { courseId, studentId } = session.metadata;
      
      // Fulfill enrollment
      await fulfillEnrollment(courseId, studentId, session.id, 'stripe');
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error('💥 Webhook processing error:', err);
    res.status(500).send(`Webhook processing error: ${err.message}`);
  }
});

module.exports = router;