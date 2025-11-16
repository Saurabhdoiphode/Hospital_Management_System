import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiHome, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './Wards.css';

const Wards = () => {
  const { user } = useAuth();
  const [wards, setWards] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWardModal, setShowWardModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [wardFormData, setWardFormData] = useState({
    wardName: '',
    wardNumber: '',
    floor: '',
    department: '',
    totalBeds: 10,
    bedType: 'general'
  });
  const [admitFormData, setAdmitFormData] = useState({
    patient: '',
    ward: '',
    bed: '',
    diagnosis: '',
    admissionType: 'routine'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [wardsRes, admissionsRes, patientsRes, doctorsRes, bedsRes] = await Promise.all([
        axios.get('/api/wards'),
        axios.get('/api/wards/admissions'),
        axios.get('/api/patients'),
        axios.get('/api/users/doctors'),
        axios.get('/api/wards/available')
      ]);
      setWards(wardsRes.data);
      setAdmissions(admissionsRes.data);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setAvailableBeds(bedsRes.data);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleWardSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/wards', wardFormData);
      toast.success('Ward created successfully');
      setShowWardModal(false);
      fetchData();
    } catch (error) {
      toast.error('Error creating ward');
    }
  };

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/wards/admit', {
        ...admitFormData,
        doctor: user._id
      });
      toast.success('Patient admitted successfully');
      setShowAdmitModal(false);
      fetchData();
    } catch (error) {
      toast.error('Error admitting patient');
    }
  };

  const canManage = user?.role === 'admin';

  if (loading) {
    return <div className="loading">Loading ward data...</div>;
  }

  return (
    <div className="wards-page">
      <div className="page-header">
        <h2>Ward & Bed Management</h2>
        {canManage && (
          <button className="btn-primary" onClick={() => setShowWardModal(true)}>
            <FiPlus /> Create Ward
          </button>
        )}
      </div>

      <div className="wards-grid">
        {wards.map(ward => (
          <div key={ward._id} className="ward-card">
            <div className="ward-header">
              <h3>{ward.wardName}</h3>
              <span className="ward-number">{ward.wardNumber}</span>
            </div>
            <div className="ward-stats">
              <div className="stat-item">
                <FiHome />
                <div>
                  <div className="stat-value">{ward.availableBeds}/{ward.totalBeds}</div>
                  <div className="stat-label">Beds Available</div>
                </div>
              </div>
            </div>
            <div className="ward-beds">
              {ward.beds?.slice(0, 5).map(bed => (
                <div key={bed._id} className={`bed-item status-${bed.status}`}>
                  {bed.bedNumber} - {bed.status}
                </div>
              ))}
              {ward.beds?.length > 5 && (
                <div className="bed-more">+{ward.beds.length - 5} more</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="admissions-section">
        <div className="section-header">
          <h3>Current Admissions</h3>
          {(user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'doctor') && (
            <button className="btn-secondary" onClick={() => setShowAdmitModal(true)}>
              <FiPlus /> Admit Patient
            </button>
          )}
        </div>
        <div className="admissions-list">
          {admissions.filter(a => a.status === 'admitted').map(admission => (
            <div key={admission._id} className="admission-card">
              <div className="admission-info">
                <h4>{admission.patient?.user?.firstName} {admission.patient?.user?.lastName}</h4>
                <p>Ward: {admission.ward?.wardName}</p>
                <p>Admitted: {format(new Date(admission.admissionDate), 'MMM dd, yyyy')}</p>
                <p>Diagnosis: {admission.diagnosis}</p>
              </div>
              <span className={`status-badge status-${admission.status}`}>
                {admission.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showWardModal && canManage && (
        <div className="modal-overlay" onClick={() => setShowWardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Ward</h2>
            <form onSubmit={handleWardSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Ward Name *</label>
                  <input
                    type="text"
                    required
                    value={wardFormData.wardName}
                    onChange={(e) => setWardFormData({ ...wardFormData, wardName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ward Number *</label>
                  <input
                    type="text"
                    required
                    value={wardFormData.wardNumber}
                    onChange={(e) => setWardFormData({ ...wardFormData, wardNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Floor</label>
                  <input
                    type="number"
                    value={wardFormData.floor}
                    onChange={(e) => setWardFormData({ ...wardFormData, floor: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={wardFormData.department}
                    onChange={(e) => setWardFormData({ ...wardFormData, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Beds *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={wardFormData.totalBeds}
                    onChange={(e) => setWardFormData({ ...wardFormData, totalBeds: parseFloat(e.target.value) || 10 })}
                  />
                </div>
                <div className="form-group">
                  <label>Bed Type</label>
                  <select
                    value={wardFormData.bedType}
                    onChange={(e) => setWardFormData({ ...wardFormData, bedType: e.target.value })}
                  >
                    <option value="general">General</option>
                    <option value="private">Private</option>
                    <option value="semi-private">Semi-Private</option>
                    <option value="icu">ICU</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowWardModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create Ward</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdmitModal && (user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'doctor') && (
        <div className="modal-overlay" onClick={() => setShowAdmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Admit Patient</h2>
            <form onSubmit={handleAdmitSubmit}>
              <div className="form-group">
                <label>Patient *</label>
                <select
                  required
                  value={admitFormData.patient}
                  onChange={(e) => setAdmitFormData({ ...admitFormData, patient: e.target.value })}
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
                <label>Ward *</label>
                <select
                  required
                  value={admitFormData.ward}
                  onChange={(e) => {
                    setAdmitFormData({ ...admitFormData, ward: e.target.value, bed: '' });
                    // Filter beds for selected ward
                    const wardBeds = availableBeds.filter(b => b.wardId === e.target.value);
                    // This would update available beds list
                  }}
                >
                  <option value="">Select Ward</option>
                  {wards.map(ward => (
                    <option key={ward._id} value={ward._id}>
                      {ward.wardName} ({ward.availableBeds} beds available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Bed *</label>
                <select
                  required
                  value={admitFormData.bed}
                  onChange={(e) => setAdmitFormData({ ...admitFormData, bed: e.target.value })}
                >
                  <option value="">Select Bed</option>
                  {availableBeds
                    .filter(b => b.wardId === admitFormData.ward)
                    .map(bed => (
                      <option key={bed.bedId} value={bed.bedId}>
                        {bed.bedNumber} ({bed.bedType})
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Diagnosis *</label>
                <textarea
                  required
                  rows="3"
                  value={admitFormData.diagnosis}
                  onChange={(e) => setAdmitFormData({ ...admitFormData, diagnosis: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Admission Type *</label>
                <select
                  required
                  value={admitFormData.admissionType}
                  onChange={(e) => setAdmitFormData({ ...admitFormData, admissionType: e.target.value })}
                >
                  <option value="routine">Routine</option>
                  <option value="emergency">Emergency</option>
                  <option value="surgery">Surgery</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAdmitModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Admit Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wards;

