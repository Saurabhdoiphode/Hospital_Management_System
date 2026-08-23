const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const memoryStore = require('../store/memoryStore');
const Inventory = require('../models/Inventory');

const router = express.Router();
const isMongoConnected = () => require('mongoose').connection.readyState === 1;

// GET /api/inventory - Get all inventory items with low-stock filter option
router.get('/', verifyToken, async (req, res) => {
  try {
    const { category, lowStock } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (category) query.category = category;
      let items = await Inventory.find(query).sort({ name: 1 });
      if (lowStock === 'true') {
        items = items.filter(item => item.stockQuantity <= item.minStockAlert);
      }
      return res.json(items);
    } else {
      let results = [...memoryStore.inventory];
      if (category) results = results.filter(i => i.category === category);
      if (lowStock === 'true') {
        results = results.filter(i => i.stockQuantity <= i.minStockAlert);
      }
      return res.json(results);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
});

// POST /api/inventory - Add new inventory item
router.post('/', verifyToken, authorizeRoles('admin', 'nurse', 'receptionist', 'pharmacist', 'lab'), async (req, res) => {
  try {
    const { name, category, stockQuantity, minStockAlert, unitPrice, supplier, location } = req.body;

    if (!name || !category || stockQuantity === undefined || !unitPrice) {
      return res.status(400).json({ message: 'Name, category, stock quantity, and unit price are required' });
    }

    if (isMongoConnected()) {
      const item = new Inventory({
        name,
        category,
        stockQuantity: Number(stockQuantity),
        minStockAlert: Number(minStockAlert) || 10,
        unitPrice: Number(unitPrice),
        supplier: supplier || '',
        location: location || ''
      });
      await item.save();
      return res.status(201).json(item);
    } else {
      const item = {
        id: memoryStore.generateId('inv'),
        name,
        category,
        stockQuantity: Number(stockQuantity),
        minStockAlert: Number(minStockAlert) || 10,
        unitPrice: Number(unitPrice),
        supplier: supplier || '',
        location: location || ''
      };
      memoryStore.inventory.unshift(item);
      return res.status(201).json(item);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error adding inventory item', error: error.message });
  }
});

// PUT /api/inventory/:id - Update item/stock level
router.put('/:id', verifyToken, authorizeRoles('admin', 'nurse', 'receptionist', 'pharmacist', 'lab'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Item not found' });
      return res.json(updated);
    } else {
      const index = memoryStore.inventory.findIndex(i => i.id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Item not found' });
      memoryStore.inventory[index] = { ...memoryStore.inventory[index], ...req.body };
      return res.json(memoryStore.inventory[index]);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating inventory item', error: error.message });
  }
});

// DELETE /api/inventory/:id - Delete item
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    if (isMongoConnected()) {
      const deleted = await Inventory.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Item not found' });
      return res.json({ message: 'Inventory item deleted' });
    } else {
      const index = memoryStore.inventory.findIndex(i => i.id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Item not found' });
      memoryStore.inventory.splice(index, 1);
      return res.json({ message: 'Inventory item deleted' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting inventory item', error: error.message });
  }
});

module.exports = router;
