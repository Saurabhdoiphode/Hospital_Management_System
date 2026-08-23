import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Printer,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Billing() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const [formData, setFormData] = useState({
    patientName: 'John Doe',
    itemDescription: 'Cardiology Consultation',
    itemAmount: '150',
    paymentMethod: 'Credit Card',
    insuranceClaimed: false
  });

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethodSelect, setPaymentMethodSelect] = useState('Credit Card');

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const fetchBills = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await API.get('/billing', { params });
      setBills(res.data);
    } catch (error) {
      toast.error('Failed to load billing invoices');
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patientName: formData.patientName,
        items: [{
          description: formData.itemDescription,
          amount: parseFloat(formData.itemAmount) || 0
        }],
        paymentMethod: formData.paymentMethod,
        insuranceClaim: {
          claimed: formData.insuranceClaimed,
          claimStatus: formData.insuranceClaimed ? 'Pending' : 'N/A',
          coveredAmount: 0
        }
      };

      await API.post('/billing', payload);
      toast.success('Invoice generated successfully!');
      setIsGenerateModalOpen(false);
      fetchBills();
    } catch (error) {
      toast.error('Error generating invoice');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      await API.post(`/billing/${selectedBill.id || selectedBill._id}/payment`, {
        amount: parseFloat(paymentAmount),
        paymentMethod: paymentMethodSelect
      });

      toast.success('Payment recorded successfully!');
      setIsPaymentModalOpen(false);
      setSelectedBill(null);
      fetchBills();
    } catch (error) {
      toast.error('Error recording payment');
    }
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setPaymentAmount((bill.totalAmount - bill.paidAmount).toString());
    setIsPaymentModalOpen(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Partial': return 'bg-sky-100 text-sky-800 border-sky-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const canGenerate = ['admin', 'receptionist'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing & Invoicing</h1>
          <p className="text-sm text-slate-500">Generate medical invoices, track payments & process insurance claims</p>
        </div>
        {canGenerate && (
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-sky-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Invoice</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">Filter Invoices:</span>
        <div className="flex gap-2">
          {['', 'Paid', 'Pending', 'Partial'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st || 'All Invoices'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bills.map((bill) => (
          <div key={bill.id || bill._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">
                  #{bill.id || bill._id}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusStyle(bill.status)}`}>
                  {bill.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-800">{bill.patientName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Invoice Date: {bill.invoiceDate}</p>

              {/* Line Items */}
              <div className="my-3 space-y-1.5 bg-slate-50 p-3 rounded-xl">
                {bill.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">{item.description}</span>
                    <span className="font-bold text-slate-800">${item.amount}</span>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Total Amount:</span>
                <span className="text-base font-extrabold text-slate-900">${bill.totalAmount}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                <span>Amount Paid:</span>
                <span className="font-semibold text-emerald-600">${bill.paidAmount}</span>
              </div>

              {/* Insurance Status */}
              {bill.insuranceClaim?.claimed && (
                <div className="mt-3 p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Insurance Claim
                  </span>
                  <span className="font-bold">{bill.insuranceClaim.claimStatus}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {bill.status !== 'Paid' && (
              <button
                onClick={() => openPaymentModal(bill)}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
              >
                <DollarSign className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Patient Invoice"
      >
        <form onSubmit={handleGenerateInvoice} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Name</label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Item / Service Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Cardiology Consultation & Test"
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount ($)</label>
              <input
                type="number"
                required
                value={formData.itemAmount}
                onChange={(e) => setFormData({ ...formData, itemAmount: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method Preference</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm bg-white"
            >
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Insurance">Insurance Claim</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="insCheck"
              checked={formData.insuranceClaimed}
              onChange={(e) => setFormData({ ...formData, insuranceClaimed: e.target.checked })}
              className="rounded text-sky-600"
            />
            <label htmlFor="insCheck" className="text-xs font-medium text-slate-700">File Insurance Claim for this bill</label>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white font-semibold py-2.5 rounded-xl text-sm mt-3 hover:bg-sky-700 transition-colors"
          >
            Create Invoice
          </button>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment for Invoice #${selectedBill?.id || selectedBill?._id}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Amount ($)</label>
            <input
              type="number"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full p-2 border rounded-xl text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
            <select
              value={paymentMethodSelect}
              onChange={(e) => setPaymentMethodSelect(e.target.value)}
              className="w-full p-2 border rounded-xl text-sm bg-white"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Insurance">Insurance Claim</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-sm mt-3 hover:bg-emerald-700 transition-colors"
          >
            Confirm & Save Payment
          </button>
        </form>
      </Modal>
    </div>
  );
}
