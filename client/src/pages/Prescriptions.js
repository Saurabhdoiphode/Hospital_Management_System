import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiDownload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [med, setMed] = useState({ name: '', dosage: '', frequency: '', duration: '', instructions: '', price: '' });
  const [selectedPatient, setSelectedPatient] = useState('');

  const canCreate = user?.role === 'doctor' || user?.role === 'admin';

  const load = async () => {
    try {
      const [pRes, listRes] = await Promise.all([
        axios.get('/api/patients'),
        axios.get('/api/prescriptions')
      ]);
      setPatients(pRes.data || []);
      setPrescriptions(listRes.data || []);
    } catch (e) {
      toast.error('Failed to load prescriptions');
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      if (!selectedPatient) return toast.error('Select patient');
      if (!med.name || !med.dosage || !med.frequency || !med.duration) return toast.error('Fill all medicine fields');
      const payload = {
        patient: selectedPatient,
        medications: [{
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
          price: med.price ? Number(med.price) : 0
        }]
      };
      await axios.post('/api/prescriptions', payload);
      toast.success('Prescription created');
      setShowModal(false);
      setMed({ name: '', dosage: '', frequency: '', duration: '', instructions: '', price: '' });
      setSelectedPatient('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create prescription');
    }
  };

  const downloadPdf = async (id) => {
    try {
      const res = await axios.get(`/api/prescriptions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="medical-dashboard-page">
      <div className="page-header">
        <h2>Prescriptions</h2>
        {canCreate && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> New Prescription
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        {prescriptions.length === 0 ? (
          <div className="no-data">No prescriptions yet</div>
        ) : prescriptions.map(p => (
          <div key={p._id} className="dashboard-card">
            <div className="card-header">
              <h4>Rx for {p.patient?.user?.firstName} {p.patient?.user?.lastName}</h4>
              <button className="btn-secondary" onClick={() => downloadPdf(p._id)}>
                <FiDownload /> PDF
              </button>
            </div>
            <div className="card-content">
              <p><strong>Doctor:</strong> {p.doctor?.firstName} {p.doctor?.lastName}</p>
              <p><strong>Total Price:</strong> ₹{(p.totalPrice || 0).toFixed(2)}</p>
              <ul>
                {p.medications?.map((m, idx) => (
                  <li key={idx}>{m.name} — {m.dosage}, {m.frequency}, {m.duration} {m.price ? `(₹${Number(m.price).toFixed(2)})` : ''}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Prescription</h2>
            <form onSubmit={create}>
              <div className="form-group">
                <label>Patient *</label>
                <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required>
                  <option value="">Select patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.user?.firstName} {p.user?.lastName} ({p.patientId})</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input value={med.name} onChange={e => setMed({ ...med, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Dosage *</label>
                  <input value={med.dosage} onChange={e => setMed({ ...med, dosage: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Frequency *</label>
                  <input value={med.frequency} onChange={e => setMed({ ...med, frequency: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Duration *</label>
                  <input value={med.duration} onChange={e => setMed({ ...med, duration: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Instructions</label>
                  <input value={med.instructions} onChange={e => setMed({ ...med, instructions: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={med.price} onChange={e => setMed({ ...med, price: e.target.value })} />
                </div>
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

export default Prescriptions;
