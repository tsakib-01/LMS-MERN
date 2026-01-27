const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (courseId, userId) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    customer_email: userId,
    metadata: {
      courseId: courseId
    },
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Course Enrollment'
        },
        unit_amount: 1000 // $10.00
      },
      quantity: 1
    }]
  });
  
  return session;
};

const handleWebhook = async (event) => {
  // Handle Stripe webhook events
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Handle successful payment
      break;
    // Add other event types as needed
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook
};