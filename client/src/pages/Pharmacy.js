import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Pharmacy.css';

const Pharmacy = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [formData, setFormData] = useState({
    medicineName: '',
    genericName: '',
    category: 'tablet',
    manufacturer: '',
    batchNumber: '',
    quantity: 0,
    unit: 'unit',
    unitPrice: 0,
    sellingPrice: 0,
    expiryDate: '',
    reorderLevel: 10,
    prescriptionRequired: true
  });
  const [saleData, setSaleData] = useState({
    patient: '',
    items: [{ medicine: '', quantity: 1 }],
    discount: 0,
    paymentMethod: 'cash'
  });
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [medicinesRes, patientsRes] = await Promise.all([
        axios.get('/api/pharmacy'),
        axios.get('/api/patients')
      ]);
      setMedicines(medicinesRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/pharmacy', formData);
      toast.success('Medicine added successfully');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding medicine');
    }
  };

  const handleSale = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/pharmacy/sale', saleData);
      toast.success('Sale recorded successfully');
      setShowSaleModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording sale');
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'receptionist';

  if (loading) {
    return <div className="loading">Loading pharmacy...</div>;
  }

  return (
    <div className="pharmacy-page">
      <div className="page-header">
        <h2>Pharmacy Management</h2>
        <div className="header-actions">
          {canManage && (
            <>
              <button className="btn-secondary" onClick={() => setShowSaleModal(true)}>
                <FiShoppingCart /> New Sale
              </button>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <FiPlus /> Add Medicine
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pharmacy-grid">
        {medicines.length === 0 ? (
          <div className="no-data">No medicines found</div>
        ) : (
          medicines.map(medicine => (
            <div key={medicine._id} className="medicine-card">
              <div className="medicine-header">
                <h3>{medicine.medicineName}</h3>
                <span className={`status-badge status-${medicine.status}`}>
                  {medicine.status}
                </span>
              </div>
              <div className="medicine-body">
                <p><strong>Generic:</strong> {medicine.genericName || 'N/A'}</p>
                <p><strong>Category:</strong> {medicine.category}</p>
                <p><strong>Quantity:</strong> {medicine.quantity} {medicine.unit}</p>
                <p><strong>Price:</strong> ${medicine.sellingPrice?.toFixed(2)}</p>
                {medicine.expiryDate && (
                  <p><strong>Expiry:</strong> {new Date(medicine.expiryDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && canManage && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Add Medicine</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.medicineName}
                    onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Generic Name</label>
                  <input
                    type="text"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="ointment">Ointment</option>
                    <option value="drops">Drops</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Unit Price *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Selling Price *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Add Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSaleModal && canManage && (
        <div className="modal-overlay" onClick={() => setShowSaleModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>New Sale</h2>
            <form onSubmit={handleSale}>
              <div className="form-group">
                <label>Patient *</label>
                <select
                  required
                  value={saleData.patient}
                  onChange={(e) => setSaleData({ ...saleData, patient: e.target.value })}
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.user?.firstName} {patient.user?.lastName} ({patient.patientId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Medicines</label>
                {saleData.items.map((item, idx) => (
                  <div key={idx} className="sale-item-row">
                    <select
                      required
                      value={item.medicine}
                      onChange={(e) => {
                        const newItems = [...saleData.items];
                        newItems[idx].medicine = e.target.value;
                        setSaleData({ ...saleData, items: newItems });
                      }}
                    >
                      <option value="">Select Medicine</option>
                      {medicines.filter(m => m.quantity > 0).map(med => (
                        <option key={med._id} value={med._id}>
                          {med.medicineName} (Stock: {med.quantity})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...saleData.items];
                        newItems[idx].quantity = parseFloat(e.target.value) || 1;
                        setSaleData({ ...saleData, items: newItems });
                      }}
                    />
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={() => {
                  setSaleData({
                    ...saleData,
                    items: [...saleData.items, { medicine: '', quantity: 1 }]
                  });
                }}>
                  + Add Medicine
                </button>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={saleData.discount}
                    onChange={(e) => setSaleData({ ...saleData, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    required
                    value={saleData.paymentMethod}
                    onChange={(e) => setSaleData({ ...saleData, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                    <option value="insurance">Insurance</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowSaleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Complete Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;

