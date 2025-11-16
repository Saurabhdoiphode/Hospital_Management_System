import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiTrendingUp, FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './MedicalDashboard.css';

const MedicalDashboard = () => {
  const { user } = useAuth();
  const [diagnoses, setDiagnoses] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [patientSearchInput, setPatientSearchInput] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnoses');
  
  const [diagnosisFormData, setDiagnosisFormData] = useState({
    patient: '',
    diagnosisCode: '',
    diagnosisName: '',
    severity: 'moderate',
    symptoms: '',
    notes: '',
    diagnosisDate: new Date().toISOString().split('T')[0]
  });

  const [treatmentFormData, setTreatmentFormData] = useState({
    patient: '',
    diagnosis: '',
    treatmentType: 'medication',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ongoing',
    notes: '',
    prescriptionName: '',
    prescriptionPrice: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [diagnosesRes, treatmentsRes, patientsRes] = await Promise.all([
        axios.get('/api/medical-dashboard/diagnoses'),
        axios.get('/api/medical-dashboard/treatments'),
        axios.get('/api/patients')
      ]);
      
      setDiagnoses(diagnosesRes.data);
      setTreatments(treatmentsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching medical dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSearch = (input) => {
    setPatientSearchInput(input);
    if (input.trim() === '') {
      setFilteredPatients([]);
    } else {
      const searchTerm = input.toLowerCase();
      const filtered = patients.filter(patient => 
        patient.user?.firstName?.toLowerCase().includes(searchTerm) ||
        patient.user?.lastName?.toLowerCase().includes(searchTerm) ||
        patient.patientId?.toLowerCase().includes(searchTerm)
      );
      setFilteredPatients(filtered);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearchInput(`${patient.user?.firstName} ${patient.user?.lastName} (${patient.patientId})`);
    setFilteredPatients([]);
    
    if (showDiagnosisModal) {
      setDiagnosisFormData(prev => ({ ...prev, patient: patient._id }));
    } else if (showTreatmentModal) {
      setTreatmentFormData(prev => ({ ...prev, patient: patient._id }));
    }
  };

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedPatient) {
        toast.error('Please select a patient');
        return;
      }

      const submitData = {
        ...diagnosisFormData,
        patient: selectedPatient._id,
        symptoms: diagnosisFormData.symptoms.split(',').map(s => s.trim()).filter(s => s)
      };

      await axios.post('/api/medical-dashboard/diagnoses', submitData);
      toast.success('Diagnosis recorded successfully');
      setShowDiagnosisModal(false);
      setDiagnosisFormData({
        patient: '',
        diagnosisCode: '',
        diagnosisName: '',
        severity: 'moderate',
        symptoms: '',
        notes: '',
        diagnosisDate: new Date().toISOString().split('T')[0]
      });
      setPatientSearchInput('');
      setSelectedPatient(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording diagnosis');
    }
  };

  const handleTreatmentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedPatient) {
        toast.error('Please select a patient');
        return;
      }

      const submitData = {
        ...treatmentFormData,
        patient: selectedPatient._id
      };

      await axios.post('/api/medical-dashboard/treatments', submitData);
      toast.success('Treatment recorded successfully');
      setShowTreatmentModal(false);
      setTreatmentFormData({
        patient: '',
        diagnosis: '',
        treatmentType: 'medication',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ongoing',
        notes: '',
        prescriptionName: '',
        prescriptionPrice: ''
      });
      setPatientSearchInput('');
      setSelectedPatient(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording treatment');
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'doctor';

  if (loading) {
    return <div className="loading">Loading medical dashboard...</div>;
  }

  return (
    <div className="medical-dashboard-page">
      <div className="page-header">
        <h2>Medical Management Dashboard</h2>
        <div className="header-actions">
          {canManage && (
            <>
              <button className="btn-secondary" onClick={() => {
                setShowDiagnosisModal(true);
                setShowTreatmentModal(false);
              }}>
                <FaStethoscope /> Record Diagnosis
              </button>
              <button className="btn-primary" onClick={() => {
                setShowTreatmentModal(true);
                setShowDiagnosisModal(false);
              }}>
                <FiPlus /> Add Treatment
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'diagnoses' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagnoses')}
        >
          <FaStethoscope /> Diagnoses ({diagnoses.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'treatments' ? 'active' : ''}`}
          onClick={() => setActiveTab('treatments')}
        >
          <FiTrendingUp /> Treatments ({treatments.length})
        </button>
      </div>

      {/* Diagnoses Tab */}
      {activeTab === 'diagnoses' && (
        <div className="tab-content">
          <h3>Patient Diagnoses</h3>
          <div className="dashboard-grid">
            {diagnoses.length === 0 ? (
              <div className="no-data">No diagnoses recorded yet</div>
            ) : (
              diagnoses.map(diagnosis => (
                <div key={diagnosis._id} className="dashboard-card diagnosis-card">
                  <div className="card-header">
                    <h4>{diagnosis.diagnosisName}</h4>
                    <span className={`severity-badge severity-${diagnosis.severity}`}>
                      {diagnosis.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="card-content">
                    <p><strong>Code:</strong> {diagnosis.diagnosisCode}</p>
                    <p><strong>Patient:</strong> {diagnosis.patient?.user?.firstName} {diagnosis.patient?.user?.lastName}</p>
                    <p><strong>Date:</strong> {format(new Date(diagnosis.diagnosisDate), 'MMM dd, yyyy')}</p>
                    {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                      <div className="symptoms-list">
                        <strong>Symptoms:</strong>
                        <ul>
                          {diagnosis.symptoms.map((symptom, idx) => (
                            <li key={idx}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {diagnosis.notes && <p><strong>Notes:</strong> {diagnosis.notes}</p>}
                  </div>
                  <div className="card-footer">
                    <span className="record-date">
                      <FiCalendar /> {format(new Date(diagnosis.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Treatments Tab */}
      {activeTab === 'treatments' && (
        <div className="tab-content">
          <h3>Treatment Plans</h3>
          <div className="dashboard-grid">
            {treatments.length === 0 ? (
              <div className="no-data">No treatments recorded yet</div>
            ) : (
              treatments.map(treatment => (
                <div key={treatment._id} className="dashboard-card treatment-card">
                  <div className="card-header">
                    <h4>{treatment.treatmentType.charAt(0).toUpperCase() + treatment.treatmentType.slice(1)}</h4>
                    <span className={`status-badge status-${treatment.status}`}>
                      {treatment.status === 'ongoing' ? <FiClock /> : <FiCheckCircle />}
                      {treatment.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="card-content">
                    <p><strong>Patient:</strong> {treatment.patient?.user?.firstName} {treatment.patient?.user?.lastName}</p>
                    <p><strong>Description:</strong> {treatment.description}</p>
                    <p><strong>Start Date:</strong> {format(new Date(treatment.startDate), 'MMM dd, yyyy')}</p>
                    {treatment.endDate && (
                      <p><strong>End Date:</strong> {format(new Date(treatment.endDate), 'MMM dd, yyyy')}</p>
                    )}
                    {treatment.notes && <p><strong>Notes:</strong> {treatment.notes}</p>}
                  </div>
                  <div className="card-footer">
                    <span className="record-date">
                      <FiCalendar /> {format(new Date(treatment.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Diagnosis Modal */}
      {showDiagnosisModal && (
        <div className="modal-overlay" onClick={() => setShowDiagnosisModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Record Diagnosis</h2>
            <form onSubmit={handleDiagnosisSubmit}>
              <div className="form-group">
                <label>Search Patient *</label>
                <div className="search-container" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search by name or patient ID..."
                    value={patientSearchInput}
                    onChange={(e) => handlePatientSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px' }}
                  />
                  {filteredPatients.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {filteredPatients.map(patient => (
                        <div
                          key={patient._id}
                          onClick={() => handleSelectPatient(patient)}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee'
                          }}
                        >
                          <strong>{patient.user?.firstName} {patient.user?.lastName}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            ID: {patient.patientId} | {patient.user?.uniqueId}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedPatient && (
                <div style={{
                  backgroundColor: '#f0f8ff',
                  padding: '15px',
                  borderRadius: '5px',
                  marginBottom: '15px',
                  border: '1px solid #4a90e2'
                }}>
                  <h4>Selected Patient</h4>
                  <p><strong>Name:</strong> {selectedPatient.user?.firstName} {selectedPatient.user?.lastName}</p>
                  <p><strong>Patient ID:</strong> {selectedPatient.patientId}</p>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Diagnosis Code *</label>
                  <input
                    type="text"
                    required
                    value={diagnosisFormData.diagnosisCode}
                    onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, diagnosisCode: e.target.value })}
                    placeholder="e.g., ICD-10 code"
                  />
                </div>
                <div className="form-group">
                  <label>Severity</label>
                  <select
                    value={diagnosisFormData.severity}
                    onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, severity: e.target.value })}
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Diagnosis Name *</label>
                <input
                  type="text"
                  required
                  value={diagnosisFormData.diagnosisName}
                  onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, diagnosisName: e.target.value })}
                  placeholder="e.g., Diabetes Mellitus Type 2"
                />
              </div>

              <div className="form-group">
                <label>Symptoms (comma separated)</label>
                <textarea
                  value={diagnosisFormData.symptoms}
                  onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, symptoms: e.target.value })}
                  rows="3"
                  placeholder="e.g., Fatigue, Increased thirst, Frequent urination"
                />
              </div>

              <div className="form-group">
                <label>Diagnosis Date</label>
                <input
                  type="date"
                  value={diagnosisFormData.diagnosisDate}
                  onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, diagnosisDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={diagnosisFormData.notes}
                  onChange={(e) => setDiagnosisFormData({ ...diagnosisFormData, notes: e.target.value })}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowDiagnosisModal(false);
                  setPatientSearchInput('');
                  setSelectedPatient(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Record Diagnosis</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Treatment Modal */}
      {showTreatmentModal && (
        <div className="modal-overlay" onClick={() => setShowTreatmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Treatment Plan</h2>
            <form onSubmit={handleTreatmentSubmit}>
              <div className="form-group">
                <label>Search Patient *</label>
                <div className="search-container" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search by name or patient ID..."
                    value={patientSearchInput}
                    onChange={(e) => handlePatientSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px' }}
                  />
                  {filteredPatients.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {filteredPatients.map(patient => (
                        <div
                          key={patient._id}
                          onClick={() => handleSelectPatient(patient)}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee'
                          }}
                        >
                          <strong>{patient.user?.firstName} {patient.user?.lastName}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            ID: {patient.patientId} | {patient.user?.uniqueId}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedPatient && (
                <div style={{
                  backgroundColor: '#f0f8ff',
                  padding: '15px',
                  borderRadius: '5px',
                  marginBottom: '15px',
                  border: '1px solid #4a90e2'
                }}>
                  <h4>Selected Patient</h4>
                  <p><strong>Name:</strong> {selectedPatient.user?.firstName} {selectedPatient.user?.lastName}</p>
                  <p><strong>Patient ID:</strong> {selectedPatient.patientId}</p>
                </div>
              )}

              <div className="form-group">
                <label>Treatment Type *</label>
                <select
                  required
                  value={treatmentFormData.treatmentType}
                  onChange={(e) => setTreatmentFormData({ ...treatmentFormData, treatmentType: e.target.value })}
                >
                  <option value="medication">Medication</option>
                  <option value="therapy">Therapy</option>
                  <option value="surgery">Surgery</option>
                  <option value="physical_therapy">Physical Therapy</option>
                  <option value="lifestyle">Lifestyle Changes</option>
                </select>
              </div>

              <div className="form-group">
                <label>Treatment Description *</label>
                <textarea
                  required
                  value={treatmentFormData.description}
                  onChange={(e) => setTreatmentFormData({ ...treatmentFormData, description: e.target.value })}
                  rows="3"
                  placeholder="Describe the treatment plan..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prescription Name (optional)</label>
                  <input
                    type="text"
                    value={treatmentFormData.prescriptionName}
                    onChange={(e) => setTreatmentFormData({ ...treatmentFormData, prescriptionName: e.target.value })}
                    placeholder="e.g., Amoxicillin 500mg"
                  />
                </div>
                <div className="form-group">
                  <label>Prescription Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={treatmentFormData.prescriptionPrice}
                    onChange={(e) => setTreatmentFormData({ ...treatmentFormData, prescriptionPrice: e.target.value })}
                    placeholder="e.g., 250"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={treatmentFormData.startDate}
                    onChange={(e) => setTreatmentFormData({ ...treatmentFormData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={treatmentFormData.endDate}
                    onChange={(e) => setTreatmentFormData({ ...treatmentFormData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={treatmentFormData.status}
                  onChange={(e) => setTreatmentFormData({ ...treatmentFormData, status: e.target.value })}
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={treatmentFormData.notes}
                  onChange={(e) => setTreatmentFormData({ ...treatmentFormData, notes: e.target.value })}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowTreatmentModal(false);
                  setPatientSearchInput('');
                  setSelectedPatient(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Add Treatment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDashboard;
