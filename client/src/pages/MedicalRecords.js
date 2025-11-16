import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiFileText, FiUser, FiCalendar, FiDownload } from 'react-icons/fi';
import FileUpload from '../components/FileUpload';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './MedicalRecords.css';

const MedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    diagnosis: '',
    symptoms: '',
    prescriptions: [{ medicine: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const recordsRes = await axios.get('/api/medical-records');
      setRecords(recordsRes.data);
      
      // Only fetch patients if user can create records
      if (user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'lab') {
        const patientsRes = await axios.get('/api/patients');
        setPatients(patientsRes.data);
      }
    } catch (error) {
      toast.error('Error fetching medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const symptomsArray = formData.symptoms.split(',').map(s => s.trim()).filter(s => s);
      const data = {
        ...formData,
        symptoms: symptomsArray,
        prescriptions: formData.prescriptions.filter(p => p.medicine)
      };
      await axios.post('/api/medical-records', data);
      toast.success('Medical record created successfully');
      setShowModal(false);
      setFormData({
        patient: '',
        diagnosis: '',
        symptoms: '',
        prescriptions: [{ medicine: '', dosage: '', frequency: '', duration: '' }],
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating medical record');
    }
  };

  const addPrescription = () => {
    setFormData({
      ...formData,
      prescriptions: [...formData.prescriptions, { medicine: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  if (loading) {
    return <div className="loading">Loading medical records...</div>;
  }

  // Only admin, doctor, lab can create records
  const canCreateRecords = user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'lab';

  return (
    <div className="medical-records-page">
      <div className="page-header">
        <h2>Medical Records</h2>
        <div className="header-actions">
          {canCreateRecords && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> New Record
            </button>
          )}
        </div>
      </div>

      <div className="records-list">
        {records.length === 0 ? (
          <div className="no-data">No medical records found</div>
        ) : (
          records.map(record => (
            <div key={record._id} className="record-card">
              <div className="record-header">
                <div>
                  <h3>{record.patient?.user?.firstName} {record.patient?.user?.lastName}</h3>
                  <p>Patient ID: {record.patient?.patientId}</p>
                </div>
                <div className="record-date">
                  <FiCalendar />
                  {format(new Date(record.visitDate), 'MMM dd, yyyy')}
                </div>
              </div>
              <div className="record-body">
                <div className="record-section">
                  <strong>Diagnosis:</strong> {record.diagnosis}
                </div>
                {record.symptoms && record.symptoms.length > 0 && (
                  <div className="record-section">
                    <strong>Symptoms:</strong> {record.symptoms.join(', ')}
                  </div>
                )}
                {record.prescriptions && record.prescriptions.length > 0 && (
                  <div className="record-section">
                    <strong>Prescriptions:</strong>
                    <ul className="prescription-list">
                      {record.prescriptions.map((pres, idx) => (
                        <li key={idx}>
                          {pres.medicine} - {pres.dosage} ({pres.frequency}) for {pres.duration}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {record.notes && (
                  <div className="record-section">
                    <strong>Notes:</strong> {record.notes}
                  </div>
                )}
                <div className="record-doctor">
                  <FiUser />
                  Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                </div>
              </div>
              <div className="record-actions">
                <a
                  href={`/api/export/medical-records/${record._id}/pdf`}
                  className="btn-secondary"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiDownload /> Download PDF
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && canCreateRecords && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Create Medical Record</h2>
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
                <label>Diagnosis *</label>
                <input
                  type="text"
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Enter diagnosis"
                />
              </div>
              <div className="form-group">
                <label>Symptoms (comma separated)</label>
                <input
                  type="text"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Fever, Headache, etc."
                />
              </div>
              <div className="form-group">
                <label>Prescriptions</label>
                {formData.prescriptions.map((pres, idx) => (
                  <div key={idx} className="prescription-row">
                    <input
                      type="text"
                      placeholder="Medicine"
                      value={pres.medicine}
                      onChange={(e) => {
                        const newPres = [...formData.prescriptions];
                        newPres[idx].medicine = e.target.value;
                        setFormData({ ...formData, prescriptions: newPres });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={pres.dosage}
                      onChange={(e) => {
                        const newPres = [...formData.prescriptions];
                        newPres[idx].dosage = e.target.value;
                        setFormData({ ...formData, prescriptions: newPres });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={pres.frequency}
                      onChange={(e) => {
                        const newPres = [...formData.prescriptions];
                        newPres[idx].frequency = e.target.value;
                        setFormData({ ...formData, prescriptions: newPres });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={pres.duration}
                      onChange={(e) => {
                        const newPres = [...formData.prescriptions];
                        newPres[idx].duration = e.target.value;
                        setFormData({ ...formData, prescriptions: newPres });
                      }}
                    />
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={addPrescription}>
                  + Add Prescription
                </button>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;

