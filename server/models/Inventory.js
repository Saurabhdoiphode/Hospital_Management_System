const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  stockQuantity: { type: Number, required: true },
  minStockAlert: { type: Number, required: true, default: 10 },
  unitPrice: { type: Number, required: true },
  supplier: { type: String },
  location: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
