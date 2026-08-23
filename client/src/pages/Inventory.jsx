import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Search, 
  Pill, 
  Stethoscope, 
  Boxes,
  Edit2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Inventory() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Medicine',
    stockQuantity: '100',
    minStockAlert: '20',
    unitPrice: '5.00',
    supplier: 'MedPharma Corp',
    location: 'Shelf A1'
  });

  useEffect(() => {
    fetchInventory();
  }, [lowStockFilter]);

  const fetchInventory = async () => {
    try {
      const params = {};
      if (lowStockFilter) params.lowStock = 'true';
      const res = await API.get('/inventory', { params });
      setItems(res.data);
    } catch (error) {
      toast.error('Failed to load inventory items');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await API.post('/inventory', formData);
      toast.success('Inventory item added!');
      setIsAddModalOpen(false);
      fetchInventory();
    } catch (error) {
      toast.error('Error adding inventory item');
    }
  };

  const handleStockUpdate = async (id, currentQty, delta) => {
    try {
      const newQty = Math.max(0, currentQty + delta);
      await API.put(`/inventory/${id}`, { stockQuantity: newQty });
      toast.success('Stock quantity updated!');
      fetchInventory();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const isNurseOrAdmin = ['admin', 'nurse', 'receptionist'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-sm text-slate-500">Track hospital medicines, medical equipment stock levels & suppliers</p>
        </div>
        {isNurseOrAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-sky-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        )}
      </div>

      {/* Low Stock Alert Header Banner */}
      {items.some(i => i.stockQuantity <= i.minStockAlert) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Low Stock Warning Triggered!</p>
              <p className="text-xs text-amber-800">Some critical medicines or equipment supplies are running below their minimum thresholds.</p>
            </div>
          </div>
          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              lowStockFilter 
                ? 'bg-amber-600 text-white border-amber-600' 
                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {lowStockFilter ? 'Showing Low Stock Only' : 'Filter Low Stock Items'}
          </button>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {items.map((item) => {
                const isLow = item.stockQuantity <= item.minStockAlert;
                return (
                  <tr key={item.id || item._id} className={isLow ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}>
                    <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                      {item.category === 'Medicine' ? (
                        <Pill className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Stethoscope className="w-4 h-4 text-indigo-600" />
                      )}
                      <span>{item.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                          {item.stockQuantity} units
                        </span>
                        {isLow && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full border border-rose-200">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">${item.unitPrice}</td>
                    <td className="p-4 text-slate-500">{item.supplier || 'N/A'}</td>
                    <td className="p-4 text-slate-500">{item.location || 'Storage'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStockUpdate(item.id || item._id, item.stockQuantity, -10)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleStockUpdate(item.id || item._id, item.stockQuantity, +25)}
                          className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg font-bold"
                        >
                          +25
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Inventory Item"
      >
        <form onSubmit={handleAddItem} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Item Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm bg-white"
              >
                <option value="Medicine">Medicine</option>
                <option value="Equipment">Equipment</option>
                <option value="Consumables">Consumables</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Low Stock Alert Min</label>
              <input
                type="number"
                required
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Supplier Name</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white font-semibold py-2.5 rounded-xl text-sm mt-3 hover:bg-sky-700 transition-colors"
          >
            Add to Inventory
          </button>
        </form>
      </Modal>
    </div>
  );
}
