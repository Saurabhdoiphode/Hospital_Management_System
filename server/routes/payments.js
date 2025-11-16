const express = require('express');
const { body, validationResult } = require('express-validator');
const Billing = require('../models/Billing');
const { auth, authorize } = require('../middleware/auth');
const paymentGateway = require('../utils/paymentGateway');

const router = express.Router();

// Create payment intent (Razorpay/Stripe)
router.post('/create-intent', auth, [
  body('amount').isNumeric(),
  body('billId').notEmpty(),
  body('gateway').isIn(['razorpay', 'stripe'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, billId, gateway } = req.body;
    const bill = await Billing.findById(billId);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    let result;
    if (gateway === 'razorpay') {
      result = await paymentGateway.createRazorpayOrder(amount, 'INR', bill.invoiceNumber);
    } else {
      result = await paymentGateway.createStripePayment(amount, 'usd', `Payment for ${bill.invoiceNumber}`);
    }

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify payment
router.post('/verify', auth, [
  body('paymentId').notEmpty(),
  body('amount').isNumeric(),
  body('billId').notEmpty(),
  body('gateway').isIn(['razorpay', 'stripe'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentId, amount, billId, gateway } = req.body;
    const verification = await paymentGateway.verifyPayment(paymentId, amount, gateway);

    if (verification.success && verification.verified) {
      // Record payment
      const bill = await Billing.findById(billId);
      bill.payments.push({
        amount,
        paymentDate: new Date(),
        paymentMethod: gateway === 'razorpay' ? 'online' : 'card',
        transactionId: paymentId
      });

      const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= bill.total) {
        bill.status = 'paid';
      } else {
        bill.status = 'partial';
      }

      await bill.save();
      res.json({ success: true, message: 'Payment verified and recorded' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

