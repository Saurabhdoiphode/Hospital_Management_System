import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Roster = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ staff: '', role: 'nurse', department: '', date: '', shift: 'morning', notes: '' });
  const [range, setRange] = useState({ start: '', end: '' });

  const canEdit = ['admin','nurse'].includes(user?.role);

  const load = async () => {
    try {
      const params = {};
      if (range.start && range.end) { params.start = range.start; params.end = range.end; }
      const [uRes, rRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/roster', { params })
      ]);
      const staffUsers = (uRes.data || []).filter(u => ['doctor','nurse','lab','receptionist'].includes(u.role));
      setStaff(staffUsers);
      setItems(rRes.data || []);
    } catch { toast.error('Failed to load roster'); }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/roster', form);
      toast.success('Shift saved');
      setForm({ staff: '', role: 'nurse', department: '', date: '', shift: 'morning', notes: '' });
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
  };

  return (
    <div className="medical-dashboard-page">
      <div className="page-header">
        <h2>Duty Roster</h2>
        <div className="header-actions" style={{ gap: 8 }}>
          <input type="date" value={range.start} onChange={e => setRange({ ...range, start: e.target.value })} />
          <input type="date" value={range.end} onChange={e => setRange({ ...range, end: e.target.value })} />
          <button className="btn-secondary" onClick={load}>Filter</button>
        </div>
      </div>

      {canEdit && (
        <div className="tab-content" style={{ marginBottom: 20 }}>
          <h3>Create Shift</h3>
          <form onSubmit={create}>
            <div className="form-row">
              <div className="form-group">
                <label>Staff *</label>
                <select value={form.staff} onChange={e => setForm({ ...form, staff: e.target.value })} required>
                  <option value="">Select</option>
                  {staff.map(s => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="lab">Lab</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Shift *</label>
                <select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })}>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Department</label>
              <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g., OPD, ICU" />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea rows="2" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-primary" type="submit">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        {items.length === 0 ? (
          <div className="no-data">No shifts</div>
        ) : items.map(i => (
          <div key={i._id} className="dashboard-card">
            <div className="card-header"><h4>{i.date} - {i.shift.toUpperCase()}</h4></div>
            <div className="card-content">
              <p><strong>Staff:</strong> {i.staff?.firstName} {i.staff?.lastName}</p>
              <p><strong>Role:</strong> {i.role}</p>
              {i.department && <p><strong>Dept:</strong> {i.department}</p>}
              {i.notes && <p><strong>Notes:</strong> {i.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roster;
