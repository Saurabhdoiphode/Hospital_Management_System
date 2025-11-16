import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Inventory.css';

const Inventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'medicine',
    description: '',
    quantity: 0,
    unit: 'unit',
    unitPrice: 0,
    reorderLevel: 10
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/inventory');
      setItems(response.data);
    } catch (error) {
      toast.error('Error fetching inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/inventory', formData);
      toast.success('Inventory item created successfully');
      setShowModal(false);
      setFormData({
        itemName: '',
        category: 'medicine',
        description: '',
        quantity: 0,
        unit: 'unit',
        unitPrice: 0,
        reorderLevel: 10
      });
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating inventory item');
    }
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  // Only admin and receptionist can manage inventory
  const canManageInventory = user?.role === 'admin' || user?.role === 'receptionist';
  const lowStockItems = items.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock');

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h2>Inventory</h2>
          {lowStockItems.length > 0 && (
            <div className="alert-low-stock">
              <FiAlertTriangle />
              {lowStockItems.length} item(s) need restocking
            </div>
          )}
        </div>
        {canManageInventory && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Add Item
          </button>
        )}
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No inventory items found</td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item._id} className={item.status === 'low-stock' || item.status === 'out-of-stock' ? 'low-stock-row' : ''}>
                  <td>{item.itemCode}</td>
                  <td>
                    <strong>{item.itemName}</strong>
                    {item.description && <div className="item-description">{item.description}</div>}
                  </td>
                  <td className="capitalize">{item.category}</td>
                  <td>
                    {item.quantity} {item.unit}
                    {item.quantity <= item.reorderLevel && (
                      <div className="reorder-warning">Reorder at {item.reorderLevel}</div>
                    )}
                  </td>
                  <td>${item.unitPrice?.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => {
                      // Edit functionality can be added here
                      toast.info('Edit functionality coming soon');
                    }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && canManageInventory && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Inventory Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="medicine">Medicine</option>
                    <option value="equipment">Equipment</option>
                    <option value="supplies">Supplies</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., box, piece, ml"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price *</label>
                  <input
                    type="number"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reorder Level</label>
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

