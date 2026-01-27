const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../utils/stripe');

// Stripe webhook route
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = handleWebhook(req.body);
    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;