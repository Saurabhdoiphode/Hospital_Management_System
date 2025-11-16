import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiDownload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Discharge = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', admissionDate: '', diagnosisSummary: '', treatmentSummary: '', labSummary: '', advice: '', followUpDate: '' });
  const [finalizePrice, setFinalizePrice] = useState('');

  const canCreate = ['admin','doctor','nurse','receptionist'].includes(user?.role);
  const canApprove = ['admin','doctor'].includes(user?.role);
  const canFinalize = ['admin','nurse'].includes(user?.role);

  const load = async () => {
    try {
      const [pRes, listRes] = await Promise.all([
        axios.get('/api/patients'),
        axios.get('/api/discharge')
      ]);
      setPatients(pRes.data || []);
      setItems(listRes.data || []);
    } catch {
      toast.error('Failed to load discharge summaries');
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      if (!form.patient) return toast.error('Select patient');
      await axios.post('/api/discharge', form);
      toast.success('Discharge draft created');
      setShowModal(false);
      setForm({ patient: '', admissionDate: '', diagnosisSummary: '', treatmentSummary: '', labSummary: '', advice: '', followUpDate: '' });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Create failed');
    }
  };

  const approve = async (id) => {
    try {
      await axios.post(`/api/discharge/${id}/approve-doctor`);
      toast.success('Approved');
      load();
    } catch { toast.error('Approve failed'); }
  };

  const finalize = async (id) => {
    try {
      await axios.post(`/api/discharge/${id}/finalize`, { packagePrice: finalizePrice ? Number(finalizePrice) : 0 });
      toast.success('Finalized');
      setFinalizePrice('');
      load();
    } catch { toast.error('Finalize failed'); }
  };

  const download = async (id) => {
    try {
      const res = await axios.get(`/api/discharge/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `discharge-${id}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="medical-dashboard-page">
      <div className="page-header">
        <h2>Discharge Summaries</h2>
        {canCreate && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> New Summary
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        {items.length === 0 ? (
          <div className="no-data">No discharge summaries</div>
        ) : items.map(d => (
          <div key={d._id} className="dashboard-card">
            <div className="card-header">
              <h4>{d.patient?.user?.firstName} {d.patient?.user?.lastName}</h4>
              <button className="btn-secondary" onClick={() => download(d._id)}><FiDownload /> PDF</button>
            </div>
            <div className="card-content">
              <p><strong>Status:</strong> {d.status}</p>
              <p><strong>Diagnosis:</strong> {d.diagnosisSummary || '-'}</p>
              <p><strong>Treatment:</strong> {d.treatmentSummary || '-'}</p>
              <p><strong>Advice:</strong> {d.advice || '-'}</p>
            </div>
            <div className="card-footer">
              {canApprove && d.status === 'draft' && (
                <button className="btn-primary" onClick={() => approve(d._id)}>Approve</button>
              )}
              {canFinalize && d.status !== 'finalized' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" min="0" step="0.01" placeholder="Package ₹" value={finalizePrice} onChange={e => setFinalizePrice(e.target.value)} />
                  <button className="btn-primary" onClick={() => finalize(d._id)}>Finalize</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Discharge Summary</h2>
            <form onSubmit={create}>
              <div className="form-group">
                <label>Patient *</label>
                <select value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })} required>
                  <option value="">Select</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.user?.firstName} {p.user?.lastName} ({p.patientId})</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Admission Date</label>
                  <input type="date" value={form.admissionDate} onChange={e => setForm({ ...form, admissionDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input type="date" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Diagnosis Summary</label>
                <textarea rows="3" value={form.diagnosisSummary} onChange={e => setForm({ ...form, diagnosisSummary: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Treatment Summary</label>
                <textarea rows="3" value={form.treatmentSummary} onChange={e => setForm({ ...form, treatmentSummary: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Lab Summary</label>
                <textarea rows="3" value={form.labSummary} onChange={e => setForm({ ...form, labSummary: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Advice</label>
                <textarea rows="3" value={form.advice} onChange={e => setForm({ ...form, advice: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discharge;
