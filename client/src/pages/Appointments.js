import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiCalendar, FiClock, FiUser, FiEdit, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './Appointments.css';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    reason: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const appointmentsRes = await axios.get('/api/appointments');
      setAppointments(appointmentsRes.data);
      
      // Fetch doctors for all users who can create appointments
      const doctorsRes = await axios.get('/api/users/doctors');
      setDoctors(doctorsRes.data);
      
      // Fetch patients list
      if (user?.role !== 'patient') {
        // Non-patients can see all patients
        const patientsRes = await axios.get('/api/patients');
        setPatients(patientsRes.data);
      } else {
        // Patients get their own patient record
        try {
          console.log('Fetching current patient record from /api/patients/current');
          const patientRes = await axios.get('/api/patients/current');
          console.log('Patient response:', patientRes.data);
          
          if (patientRes.data) {
            console.log('Current patient record:', patientRes.data);
            setPatients([patientRes.data]);
            // Auto-set patient in form data
            setFormData(prev => ({ 
              ...prev, 
              patient: patientRes.data._id 
            }));
            console.log('FormData updated with patient:', patientRes.data._id);
          }
        } catch (error) {
          console.error('Error fetching current patient record:', error);
          if (error.response?.status === 404) {
            toast.error('Patient record not found. Please contact administrator.');
          } else {
            toast.error('Error fetching patient record: ' + error.message);
          }
          setPatients([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    console.log('Opening modal. Current state:');
    console.log('User role:', user?.role);
    console.log('Patients:', patients);
    console.log('FormData:', formData);
    
    // Ensure patient is set if user is a patient
    if (user?.role === 'patient' && patients.length > 0) {
      setFormData(prev => ({
        ...prev,
        patient: patients[0]._id
      }));
      console.log('Set patient to:', patients[0]._id);
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure patient is set for patients
      let submitData = { ...formData };
      
      console.log('Current formData:', formData);
      console.log('User role:', user?.role);
      console.log('Patients array:', patients);
      
      // For patients, auto-set their patient record if not already set
      if (user?.role === 'patient') {
        if (patients.length > 0) {
          submitData.patient = patients[0]._id;
          console.log('Set patient to:', patients[0]._id);
        } else {
          console.error('No patient record found in patients array');
        }
      }
      
      console.log('Final submitData before validation:', submitData);
      
      // Validation
      if (!submitData.patient) {
        console.error('Patient validation failed:', {
          patient: submitData.patient,
          patientsLength: patients.length,
          userRole: user?.role
        });
        toast.error('Patient is required - no patient record found');
        return;
      }
      if (!submitData.doctor) {
        toast.error('Please select a doctor');
        return;
      }
      if (!submitData.appointmentDate) {
        toast.error('Please select a date');
        return;
      }
      if (!submitData.appointmentTime) {
        toast.error('Please select a time');
        return;
      }

      console.log('All validations passed, submitting:', submitData);
      await axios.post('/api/appointments', submitData);
      toast.success('Appointment created successfully');
      setShowModal(false);
      // Reset form, but keep patient if user is a patient
      const resetForm = {
        patient: user?.role === 'patient' && patients.length > 0 ? patients[0]._id : '',
        doctor: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentType: 'consultation',
        reason: ''
      };
      setFormData(resetForm);
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Error creating appointment');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}`, { status });
      toast.success('Appointment status updated');
      fetchData();
    } catch (error) {
      toast.error('Error updating appointment');
    }
  };

  // Admin, receptionist, doctor, and patients can create appointments
  const canCreateAppointments = user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'doctor' || user?.role === 'patient';
  // Only admin, receptionist, doctor can change status
  const canChangeStatus = user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'doctor';
  // Check if user is a patient
  const isPatient = user?.role === 'patient';

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h2>{user?.role === 'patient' ? 'My Appointments' : 'Appointments'}</h2>
        <div className="header-actions">
          {user?.role !== 'patient' && (
            <Link to="/appointments/calendar" className="btn-secondary">
              <FiCalendar /> Calendar View
            </Link>
          )}
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <a href="/api/export/appointments/excel" className="btn-secondary" download>
              <FiDownload /> Export Excel
            </a>
          )}
          {canCreateAppointments && (
            <button className="btn-primary" onClick={handleOpenModal}>
              <FiPlus /> New Appointment
            </button>
          )}
        </div>
      </div>

      <div className="appointments-grid">
        {appointments.length === 0 ? (
          <div className="no-data">No appointments found</div>
        ) : (
          appointments.map(appointment => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <div className="appointment-date-time">
                  <FiCalendar />
                  <span>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</span>
                </div>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="appointment-body">
                <div className="appointment-info">
                  <FiUser />
                  <div>
                    <strong>{appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}</strong>
                    <p>Patient ID: {appointment.patient?.patientId}</p>
                  </div>
                </div>
                <div className="appointment-info">
                  <FiUser />
                  <div>
                    <strong>Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</strong>
                    <p>{appointment.doctor?.specialization}</p>
                  </div>
                </div>
                <div className="appointment-info">
                  <FiClock />
                  <span>{appointment.appointmentTime}</span>
                </div>
                {appointment.reason && (
                  <div className="appointment-reason">
                    <strong>Reason:</strong> {appointment.reason}
                  </div>
                )}
              </div>
              {canChangeStatus && (
                <div className="appointment-actions">
                  <select
                    value={appointment.status}
                    onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && canCreateAppointments && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Book Appointment</h2>
            <form onSubmit={handleSubmit}>
              {!isPatient && (
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
              )}
              {isPatient && patients.length > 0 && (
                <div className="form-group">
                  <label>Patient</label>
                  <input
                    type="text"
                    value={`${patients[0].user?.firstName} ${patients[0].user?.lastName} (${patients[0].patientId})`}
                    disabled
                    className="disabled-input"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Doctor</label>
                <select
                  required
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    required
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Appointment Type</label>
                <select
                  value={formData.appointmentType}
                  onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="checkup">Checkup</option>
                  <option value="emergency">Emergency</option>
                  <option value="surgery">Surgery</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

