import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Billing from './pages/Billing';
import Pharmacy from './pages/Pharmacy';
import Laboratory from './pages/Laboratory';
import Wards from './pages/Wards';
import Staff from './pages/Staff';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import AdminAlerts from './pages/AdminAlerts';
import CalendarView from './pages/CalendarView';
import BulkOperations from './pages/BulkOperations';
import ActivityLogs from './pages/ActivityLogs';
import Layout from './components/Layout';
import MedicalDashboard from './pages/MedicalDashboard';
import Prescriptions from './pages/Prescriptions';
import Discharge from './pages/Discharge';
import Queue from './pages/Queue';
import Roster from './pages/Roster';
import PatientDetails from './pages/PatientDetails';
import Profile from './pages/Profile';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <Router basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientDetails />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/calendar" element={<CalendarView />} />
            <Route path="profile" element={<Profile />} />
            <Route path="medical-records" element={<MedicalRecords />} />
            <Route path="medical-dashboard" element={<MedicalDashboard />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="discharge" element={<Discharge />} />
            <Route path="queue" element={<Queue />} />
            <Route path="roster" element={<Roster />} />
            <Route path="billing" element={<Billing />} />
            <Route path="pharmacy" element={<Pharmacy />} />
            <Route path="laboratory" element={<Laboratory />} />
            <Route path="wards" element={<Wards />} />
            <Route path="staff" element={<Staff />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="admin-alerts" element={<AdminAlerts />} />
            <Route path="bulk-operations" element={<BulkOperations />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;

