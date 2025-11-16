import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiDollarSign, FiFileText, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './Billing.css';

const Billing = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({
    patient: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    tax: 0,
    discount: 0
  });
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash',
    transactionId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user?.role === 'patient') {
        // Patient can only see their own bills
        const billsRes = await axios.get('/api/billing');
        setBills(billsRes.data);
      } else {
        // Admin/Receptionist can see all bills and patients
        const [billsRes, patientsRes] = await Promise.all([
          axios.get('/api/billing'),
          axios.get('/api/patients')
        ]);
        setBills(billsRes.data);
        setPatients(patientsRes.data);
      }
    } catch (error) {
      toast.error('Error fetching billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/billing', formData);
      toast.success('Bill created successfully');
      setShowModal(false);
      setFormData({
        patient: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        tax: 0,
        discount: 0
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating bill');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/billing/${selectedBill._id}/payment`, paymentData);
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedBill(null);
      fetchData();
    } catch (error) {
      toast.error('Error recording payment');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    return subtotal + parseFloat(formData.tax || 0) - parseFloat(formData.discount || 0);
  };

  const getTotalPaid = (bill) => {
    return bill.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  };

  if (loading) {
    return <div className="loading">Loading billing data...</div>;
  }

  // Check if user can add bills (only admin and receptionist)
  const canAddBills = user?.role === 'admin' || user?.role === 'receptionist';
  // Only admin and receptionist can record payments (for discharged patients only)
  const canRecordPayments = user?.role === 'admin' || user?.role === 'receptionist';

  // If doctor, show grouped by patient for easier review
  const isDoctor = user?.role === 'doctor';
  let grouped = {};
  if (isDoctor) {
    grouped = bills.reduce((acc, b) => {
      const pid = b.patient?._id || 'unknown';
      if (!acc[pid]) acc[pid] = { patient: b.patient, bills: [] };
      acc[pid].bills.push(b);
      return acc;
    }, {});
  }

  // helpers to render
  const renderBillCard = (bill) => {
    const totalPaid = getTotalPaid(bill);
    const remaining = bill.total - totalPaid;
    return (
      <div key={bill._id} className="bill-card">
        <div className="bill-header">
          <div>
            <h3>Invoice #{bill.invoiceNumber}</h3>
            <p>{bill.patient?.user?.firstName} {bill.patient?.user?.lastName}</p>
          </div>
          <span className={`status-badge status-${bill.status}`}>
            {bill.status}
          </span>
        </div>
        <div className="bill-body">
          <div className="bill-info">
            <div>
              <strong>Date:</strong> {format(new Date(bill.invoiceDate), 'MMM dd, yyyy')}
            </div>
            <div>
              <strong>Due Date:</strong> {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
            </div>
          </div>
          <div className="bill-items">
            {bill.items?.map((item, idx) => (
              <div key={idx} className="bill-item">
                <span>{item.description}</span>
                <span>${item.total?.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="bill-totals">
            <div className="bill-total-row">
              <span>Subtotal:</span>
              <span>${bill.subtotal?.toFixed(2)}</span>
            </div>
            {bill.tax > 0 && (
              <div className="bill-total-row">
                <span>Tax:</span>
                <span>${bill.tax?.toFixed(2)}</span>
              </div>
            )}
            {bill.discount > 0 && (
              <div className="bill-total-row">
                <span>Discount:</span>
                <span>-${bill.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className="bill-total-row total">
              <span>Total:</span>
              <span>${bill.total?.toFixed(2)}</span>
            </div>
            {totalPaid > 0 && (
              <>
                <div className="bill-total-row">
                  <span>Paid:</span>
                  <span>${totalPaid.toFixed(2)}</span>
                </div>
                <div className="bill-total-row">
                  <span>Remaining:</span>
                  <span>${remaining.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        {remaining > 0 && canRecordPayments && bill.patient?.status === 'discharged' && (
          <div className="bill-actions">
            <button
              className="btn-payment"
              onClick={() => {
                setSelectedBill(bill);
                setPaymentData({ amount: remaining, paymentMethod: 'cash', transactionId: '' });
                setShowPaymentModal(true);
              }}
            >
              <FiDollarSign /> Record Payment
            </button>
          </div>
        )}
        {remaining > 0 && bill.patient?.status !== 'discharged' && (
          <div className="bill-actions">
            <span className="payment-info">Payment available after discharge</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="billing-page">
      <div className="page-header">
        <h2>{user?.role === 'patient' ? 'My Bills' : 'Billing'}</h2>
    <div className="header-actions">
      {(user?.role === 'admin' || user?.role === 'receptionist') && (
        <a href="/api/export/billing/excel" className="btn-secondary" download>
          <FiDownload /> Export Excel
        </a>
      )}
      {canAddBills && (
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Bill
        </button>
      )}
    </div>
      </div>

      <div className="bills-list">
        {(() => {
          const list = isDoctor ? Object.values(grouped) : bills;
          if (!list || list.length === 0) return <div className="no-data">No bills found</div>;
          if (!isDoctor) return bills.map(renderBillCard);
          return Object.values(grouped).map(group => (
            <div key={group.patient?._id || Math.random()} className="patient-group">
              <h3>{group.patient?.user?.firstName} {group.patient?.user?.lastName} {group.patient?.patientId ? `(${group.patient.patientId})` : ''}</h3>
              {group.bills.map(renderBillCard)}
            </div>
          ));
        })()}
      </div>

      {showModal && canAddBills && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Bill</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Patient</label>
                <select
                  required
                  value={formData.patient}
                  onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
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
                <label>Items</label>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="bill-item-row">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].description = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].quantity = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, items: newItems });
                      }}
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, items: newItems });
                      }}
                      min="0"
                      step="0.01"
                      required
                    />
                    <span className="item-total">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={addItem}>
                  + Add Item
                </button>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tax ($)</label>
                  <input
                    type="number"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Discount ($)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="bill-total-preview">
                <strong>Total: ${calculateTotal().toFixed(2)}</strong>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Record Payment</h2>
            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  min="0.01"
                  step="0.01"
                  max={selectedBill.total - getTotalPaid(selectedBill)}
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  required
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

