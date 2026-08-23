const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  invoiceDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  items: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Paid', 'Pending', 'Partial', 'Overdue'], default: 'Pending' },
  paymentMethod: { type: String, default: 'Cash' },
  insuranceClaim: {
    claimed: { type: Boolean, default: false },
    claimStatus: { type: String, default: 'N/A' },
    coveredAmount: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.models.Billing || mongoose.model('Billing', BillingSchema);
