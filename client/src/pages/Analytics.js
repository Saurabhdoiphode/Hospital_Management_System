import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [patientStats, setPatientStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [dashboard, appointments, revenue, patients] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/analytics/appointments'),
        axios.get('/api/analytics/revenue'),
        axios.get('/api/analytics/patients')
      ]);
      setDashboardData(dashboard.data);
      setAppointmentStats(appointments.data);
      setRevenueStats(revenue.data);
      setPatientStats(patients.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  const COLORS = ['#4299e1', '#48bb78', '#ed8936', '#f56565', '#9f7aea', '#38b2ac'];

  const appointmentStatusData = appointmentStats?.statusStats?.map(stat => ({
    name: stat._id,
    value: stat.count
  })) || [];

  const revenueData = revenueStats?.revenue?.map(stat => ({
    month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
    revenue: stat.total,
    paid: stat.paid
  })) || [];

  const genderData = patientStats?.genderStats?.map(stat => ({
    name: stat._id,
    value: stat.count
  })) || [];

  return (
    <div className="analytics-page">
      <h2>Analytics Dashboard</h2>
      
      <div className="charts-grid">
        {appointmentStatusData.length > 0 && (
          <div className="chart-card">
            <h3>Appointment Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {revenueData.length > 0 && (
          <div className="chart-card">
            <h3>Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4299e1" name="Total Revenue" />
                <Line type="monotone" dataKey="paid" stroke="#48bb78" name="Paid" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {genderData.length > 0 && (
          <div className="chart-card">
            <h3>Patient Gender Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#9f7aea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {dashboardData && (
          <div className="chart-card">
            <h3>Key Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Total Patients</div>
                <div className="metric-value">{dashboardData.totalPatients}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Today's Appointments</div>
                <div className="metric-value">{dashboardData.todayAppointments}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Monthly Revenue</div>
                <div className="metric-value">${dashboardData.monthlyRevenue?.paid?.toLocaleString() || 0}</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Low Stock Items</div>
                <div className="metric-value">{dashboardData.lowStockItems}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

