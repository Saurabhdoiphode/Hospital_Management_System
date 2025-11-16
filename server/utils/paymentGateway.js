// Payment Gateway Integration
// Supports Razorpay and Stripe

// Razorpay Integration
exports.createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return { success: false, message: 'Razorpay not configured' };
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    return { success: true, orderId: order.id, order };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Stripe Integration
exports.createStripePayment = async (amount, currency = 'usd', description) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { success: false, message: 'Stripe not configured' };
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency,
      description
    });

    return { success: true, clientSecret: paymentIntent.client_secret, paymentIntent };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verify payment
exports.verifyPayment = async (paymentId, amount, gateway = 'razorpay') => {
  try {
    if (gateway === 'razorpay') {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      const payment = await razorpay.payments.fetch(paymentId);
      if (payment.amount === amount * 100 && payment.status === 'captured') {
        return { success: true, verified: true };
      }
      return { success: false, verified: false };
    } else if (gateway === 'stripe') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
      if (paymentIntent.amount === amount * 100 && paymentIntent.status === 'succeeded') {
        return { success: true, verified: true };
      }
      return { success: false, verified: false };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

