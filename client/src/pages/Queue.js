import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Queue = () => {
  const { user } = useAuth();
  const [department, setDepartment] = useState('OPD');
  const [list, setList] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [counter, setCounter] = useState('Counter-1');

  const canCreate = ['admin','receptionist'].includes(user?.role);
  const canCall = ['admin','doctor','lab','nurse'].includes(user?.role);

  const load = async () => {
    try {
      const res = await axios.get('/api/queue', { params: { department } });
      setList(res.data || []);
    } catch { toast.error('Failed to load queue'); }
  };
  useEffect(() => { load(); }, [department]);

  const create = async () => {
    try {
      await axios.post('/api/queue', { department, patient: patientId || undefined });
      setPatientId('');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Create token failed'); }
  };

  const callNext = async () => {
    try {
      await axios.post('/api/queue/call-next', { department, counter });
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'No waiting tokens'); }
  };

  const mark = async (id, status) => {
    try { await axios.post(`/api/queue/${id}/status`, { status }); load(); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div className="medical-dashboard-page">
      <div className="page-header">
        <h2>Queue Management</h2>
        <div className="header-actions" style={{ gap: 8 }}>
          <select value={department} onChange={e => setDepartment(e.target.value)}>
            <option>OPD</option>
            <option>Laboratory</option>
            <option>Pharmacy</option>
            <option>Billing</option>
          </select>
          {canCall && (
            <>
              <input value={counter} onChange={e => setCounter(e.target.value)} placeholder="Counter" />
              <button className="btn-primary" onClick={callNext}>Call Next</button>
            </>
          )}
        </div>
      </div>

      {canCreate && (
        <div className="tab-content" style={{ marginBottom: 20 }}>
          <div className="form-row">
            <div className="form-group">
              <label>Patient ID (optional)</label>
              <input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="Patient ObjectId" />
            </div>
            <div className="form-group">
              <label>&nbsp;</label>
              <button className="btn-secondary" onClick={create}>New Token</button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {list.length === 0 ? (
          <div className="no-data">No tokens</div>
        ) : list.map(t => (
          <div key={t._id} className="dashboard-card">
            <div className="card-header">
              <h4>{t.department} - #{t.tokenNumber}</h4>
              <span className="status-badge">{t.status.toUpperCase()}</span>
            </div>
            <div className="card-content">
              <p><strong>Date:</strong> {t.date}</p>
              {t.patient && <p><strong>Patient:</strong> {t.patient?.user?.firstName} {t.patient?.user?.lastName}</p>}
              {t.counter && <p><strong>Counter:</strong> {t.counter}</p>}
            </div>
            {canCall && (
              <div className="card-footer" style={{ gap: 8 }}>
                <button className="btn-secondary" onClick={() => mark(t._id, 'served')}>Served</button>
                <button className="btn-secondary" onClick={() => mark(t._id, 'skipped')}>Skip</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Queue;
