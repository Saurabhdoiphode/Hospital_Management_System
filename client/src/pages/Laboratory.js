import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './Laboratory.css';

const Laboratory = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [patientSearchInput, setPatientSearchInput] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [testFormData, setTestFormData] = useState({
    testName: '',
    testCode: '',
    category: 'blood',
    price: 0,
    duration: 24,
    sampleType: '',
    normalRange: ''
  });
  const [requestFormData, setRequestFormData] = useState({
    patient: '',
    tests: [],
    priority: 'routine'
  });
  const [resultData, setResultData] = useState({
    testId: '',
    values: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, requestsRes, patientsRes] = await Promise.all([
        axios.get('/api/laboratory/tests'),
        axios.get('/api/laboratory/requests'),
        axios.get('/api/patients')
      ]);
      setTests(testsRes.data);
      setRequests(requestsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/laboratory/tests', testFormData);
      toast.success('Test added successfully');
      setShowTestModal(false);
      fetchData();
    } catch (error) {
      toast.error('Error adding test');
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
    setRequestFormData({ ...requestFormData, patient: patient._id });
    setPatientSearchInput(`${patient.user?.firstName} ${patient.user?.lastName} (${patient.patientId})`);
    setFilteredPatients([]);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!requestFormData.patient) {
        toast.error('Please select a patient');
        return;
      }
      if (requestFormData.tests.length === 0) {
        toast.error('Please select at least one test');
        return;
      }
      
      await axios.post('/api/laboratory/requests', requestFormData);
      toast.success('Lab request created successfully');
      setShowRequestModal(false);
      setRequestFormData({ patient: '', tests: [], priority: 'routine' });
      setPatientSearchInput('');
      setSelectedPatient(null);
      fetchData();
    } catch (error) {
      toast.error('Error creating request');
    }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/laboratory/requests/${selectedRequest._id}/results`, {
        testId: resultData.testId,
        results: {
          values: resultData.values,
          notes: resultData.notes
        }
      });
      toast.success('Results updated successfully');
      setShowResultModal(false);
      fetchData();
    } catch (error) {
      toast.error('Error updating results');
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'lab';
  const canCreateRequests = user?.role === 'admin' || user?.role === 'doctor';

  if (loading) {
    return <div className="loading">Loading laboratory data...</div>;
  }

  return (
    <div className="laboratory-page">
      <div className="page-header">
        <h2>Laboratory Management</h2>
        <div className="header-actions">
          {canCreateRequests && (
            <button className="btn-secondary" onClick={() => setShowRequestModal(true)}>
              <FiPlus /> New Request
            </button>
          )}
          {canManage && (
            <button className="btn-primary" onClick={() => setShowTestModal(true)}>
              <FiPlus /> Add Test
            </button>
          )}
        </div>
      </div>

      <div className="lab-tabs">
        <div className="tab-content">
          <h3>{user?.role === 'patient' ? 'My Lab Reports' : 'Lab Requests'}</h3>
          <div className="requests-list">
            {requests.length === 0 ? (
              <div className="no-data">No lab requests found</div>
            ) : (
              requests.map(request => (
                <div key={request._id} className="request-card">
                  <div className="request-header">
                    <div>
                      {user?.role !== 'patient' && (
                        <>
                          <h4>{request.patient?.user?.firstName} {request.patient?.user?.lastName}</h4>
                          <p>Patient ID: {request.patient?.patientId}</p>
                        </>
                      )}
                      <p>Dr. {request.doctor?.firstName} {request.doctor?.lastName}</p>
                      <p className="request-date">
                        Requested: {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <span className={`status-badge status-${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="request-tests">
                    {request.tests?.map((test, idx) => (
                      <div key={idx} className={`test-item ${test.status === 'completed' ? 'completed' : ''}`}>
                        <div className="test-info">
                          <span className="test-name">{test.test?.testName || 'Test'}</span>
                          {test.status === 'completed' && test.results && (
                            <div className="test-results">
                              <div className="result-values">
                                <strong>Results:</strong>
                                <pre>{typeof test.results.values === 'string' ? test.results.values : JSON.stringify(test.results.values, null, 2)}</pre>
                              </div>
                              {test.results.notes && (
                                <div className="result-notes">
                                  <strong>Notes:</strong> {test.results.notes}
                                </div>
                              )}
                              {test.completedAt && (
                                <div className="result-date">
                                  Completed: {format(new Date(test.completedAt), 'MMM dd, yyyy HH:mm')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="test-actions">
                          <span className={`test-status status-${test.status}`}>
                            {test.status}
                          </span>
                          {canManage && test.status !== 'completed' && (
                            <button
                              className="btn-small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setResultData({ testId: test._id, values: '', notes: '' });
                                setShowResultModal(true);
                              }}
                            >
                              Add Results
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showTestModal && canManage && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Lab Test</h2>
            <form onSubmit={handleTestSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Test Name *</label>
                  <input
                    type="text"
                    required
                    value={testFormData.testName}
                    onChange={(e) => setTestFormData({ ...testFormData, testName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Test Code *</label>
                  <input
                    type="text"
                    required
                    value={testFormData.testCode}
                    onChange={(e) => setTestFormData({ ...testFormData, testCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    required
                    value={testFormData.category}
                    onChange={(e) => setTestFormData({ ...testFormData, category: e.target.value })}
                  >
                    <option value="blood">Blood</option>
                    <option value="urine">Urine</option>
                    <option value="imaging">Imaging</option>
                    <option value="pathology">Pathology</option>
                    <option value="radiology">Radiology</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={testFormData.price}
                    onChange={(e) => setTestFormData({ ...testFormData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sample Type</label>
                  <input
                    type="text"
                    value={testFormData.sampleType}
                    onChange={(e) => setTestFormData({ ...testFormData, sampleType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Duration (hours)</label>
                  <input
                    type="number"
                    value={testFormData.duration}
                    onChange={(e) => setTestFormData({ ...testFormData, duration: parseFloat(e.target.value) || 24 })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Normal Range</label>
                <input
                  type="text"
                  value={testFormData.normalRange}
                  onChange={(e) => setTestFormData({ ...testFormData, normalRange: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowTestModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Add Test</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRequestModal && canCreateRequests && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Lab Request</h2>
            <form onSubmit={handleRequestSubmit}>
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
                            borderBottom: '1px solid #eee',
                            hover: { backgroundColor: '#f5f5f5' }
                          }}
                        >
                          <strong>{patient.user?.firstName} {patient.user?.lastName}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            ID: {patient.patientId}
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
                <label>Tests * (Hold Ctrl/Cmd to select multiple)</label>
                <select
                  multiple
                  required
                  value={requestFormData.tests}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setRequestFormData({ ...requestFormData, tests: selected });
                  }}
                  style={{ minHeight: '120px', width: '100%' }}
                >
                  {tests.map(test => (
                    <option key={test._id} value={test._id}>
                      {test.testName} - ${test.price}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={requestFormData.priority}
                  onChange={(e) => setRequestFormData({ ...requestFormData, priority: e.target.value })}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowRequestModal(false);
                  setPatientSearchInput('');
                  setSelectedPatient(null);
                  setFilteredPatients([]);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResultModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowResultModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Test Results</h2>
            <form onSubmit={handleResultSubmit}>
              <div className="form-group">
                <label>Test Values</label>
                <textarea
                  rows="4"
                  value={resultData.values}
                  onChange={(e) => setResultData({ ...resultData, values: e.target.value })}
                  placeholder="Enter test results..."
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="3"
                  value={resultData.notes}
                  onChange={(e) => setResultData({ ...resultData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowResultModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save Results</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laboratory;

