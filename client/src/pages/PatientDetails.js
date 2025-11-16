import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiCalendar, FiFileText, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';
import './PatientDetails.css';

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const [patientRes, appointmentsRes, recordsRes, billsRes] = await Promise.all([
        axios.get(`/api/patients/${id}`),
        axios.get(`/api/appointments?patient=${id}`),
        axios.get(`/api/medical-records?patient=${id}`),
        axios.get(`/api/billing?patient=${id}`)
      ]);
      setPatient(patientRes.data);
      setAppointments(appointmentsRes.data);
      setRecords(recordsRes.data);
      setBills(billsRes.data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading patient details...</div>;
  }

  if (!patient) {
    return <div className="no-data">Patient not found</div>;
  }

  return (
    <div className="patient-details">
      <div className="patient-header">
        <div className="patient-info-card">
          <div className="patient-avatar">
            <FiUser />
          </div>
          <div className="patient-info">
            <h1>{patient.user?.firstName} {patient.user?.lastName}</h1>
            <p>Patient ID: {patient.patientId}</p>
            <p>{patient.user?.email}</p>
            <p>{patient.user?.phone}</p>
          </div>
        </div>
        <div className="patient-details-grid">
          <div className="detail-item">
            <strong>Date of Birth:</strong>
            <span>{format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}</span>
          </div>
          <div className="detail-item">
            <strong>Gender:</strong>
            <span className="capitalize">{patient.gender}</span>
          </div>
          <div className="detail-item">
            <strong>Blood Group:</strong>
            <span>{patient.bloodGroup || 'N/A'}</span>
          </div>
          {patient.emergencyContact && (
            <div className="detail-item">
              <strong>Emergency Contact:</strong>
              <span>{patient.emergencyContact.name} ({patient.emergencyContact.relationship}) - {patient.emergencyContact.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="patient-sections">
        <div className="section">
          <h2><FiCalendar /> Appointments ({appointments.length})</h2>
          <div className="section-content">
            {appointments.length === 0 ? (
              <p className="no-data">No appointments found</p>
            ) : (
              appointments.map(appointment => (
                <div key={appointment._id} className="item-card">
                  <div>
                    <strong>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')} at {appointment.appointmentTime}</strong>
                    <p>Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
                    <p>{appointment.reason}</p>
                  </div>
                  <span className={`status-badge status-${appointment.status}`}>
                    {appointment.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h2><FiFileText /> Medical Records ({records.length})</h2>
          <div className="section-content">
            {records.length === 0 ? (
              <p className="no-data">No medical records found</p>
            ) : (
              records.map(record => (
                <div key={record._id} className="item-card">
                  <div>
                    <strong>{format(new Date(record.visitDate), 'MMM dd, yyyy')}</strong>
                    <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                    {record.symptoms && record.symptoms.length > 0 && (
                      <p><strong>Symptoms:</strong> {record.symptoms.join(', ')}</p>
                    )}
                    <p>Dr. {record.doctor?.firstName} {record.doctor?.lastName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h2><FiDollarSign /> Billing ({bills.length})</h2>
          <div className="section-content">
            {bills.length === 0 ? (
              <p className="no-data">No bills found</p>
            ) : (
              bills.map(bill => {
                const totalPaid = bill.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                return (
                  <div key={bill._id} className="item-card">
                    <div>
                      <strong>Invoice #{bill.invoiceNumber}</strong>
                      <p>{format(new Date(bill.invoiceDate), 'MMM dd, yyyy')}</p>
                      <p>Total: ${bill.total?.toFixed(2)} | Paid: ${totalPaid.toFixed(2)}</p>
                    </div>
                    <span className={`status-badge status-${bill.status}`}>
                      {bill.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;

