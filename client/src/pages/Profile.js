import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [me, setMe] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dateOfBirth: '',
    gender: 'other',
    bloodGroup: '',
    heightCm: '',
    weightKg: ''
  });

  const isPatient = user?.role === 'patient';

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes] = await Promise.all([
          axios.get('/api/auth/me')
        ]);
        setMe(meRes.data);
        if (isPatient) {
          const curRes = await axios.get('/api/patients/current');
          setPatient(curRes.data);
          setForm({
            dateOfBirth: curRes.data.dateOfBirth ? curRes.data.dateOfBirth.substring(0,10) : '',
            gender: curRes.data.gender || 'other',
            bloodGroup: curRes.data.bloodGroup || '',
            heightCm: curRes.data.heightCm || '',
            weightKg: curRes.data.weightKg || ''
          });
        }
      } catch (e) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isPatient]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isPatient || !patient?._id) return;
    setSaving(true);
    try {
      await axios.put(`/api/patients/${patient._id}`, {
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
        gender: form.gender,
        bloodGroup: form.bloodGroup || undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined
      });
      toast.success('Profile updated');
      const curRes = await axios.get('/api/patients/current');
      setPatient(curRes.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      <div className="profile-sections">
        <section className="card">
          <h3>Account</h3>
          <div className="grid">
            <div><label>Name</label><div>{me?.firstName} {me?.lastName}</div></div>
            <div><label>Email</label><div>{me?.email}</div></div>
            <div><label>Role</label><div>{me?.role}</div></div>
            {me?.uniqueId && <div><label>Unique ID</label><div>{me.uniqueId}</div></div>}
            {me?.phone && <div><label>Phone</label><div>{me.phone}</div></div>}
          </div>
        </section>

        {isPatient && (
          <section className="card">
            <h3>Medical Profile</h3>
            <form onSubmit={handleSave} className="form">
              <div className="grid">
                <div>
                  <label>Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={e=>setForm({...form, dateOfBirth: e.target.value})} />
                </div>
                <div>
                  <label>Gender</label>
                  <select value={form.gender} onChange={e=>setForm({...form, gender: e.target.value})}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e=>setForm({...form, bloodGroup: e.target.value})}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg=> <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label>Height (cm)</label>
                  <input type="number" min="0" value={form.heightCm} onChange={e=>setForm({...form, heightCm: e.target.value})} />
                </div>
                <div>
                  <label>Weight (kg)</label>
                  <input type="number" min="0" value={form.weightKg} onChange={e=>setForm({...form, weightKg: e.target.value})} />
                </div>
                <div>
                  <label>Age</label>
                  <div>{patient?.age ?? '-'}</div>
                </div>
              </div>
              <div className="actions">
                <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

export default Profile;
