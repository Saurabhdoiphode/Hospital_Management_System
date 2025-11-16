import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiCalendar, FiDollarSign, FiPackage, FiActivity, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'receptionist') {
        const response = await axios.get('/api/analytics/dashboard');
        setStats(response.data);
      } else if (user?.role === 'patient') {
        // Patient-specific dashboard
        const [appointmentsRes, billsRes, labRes] = await Promise.all([
          axios.get('/api/appointments'),
          axios.get('/api/billing'),
          axios.get('/api/laboratory/requests')
        ]);
        setStats({
          myAppointments: appointmentsRes.data.length,
          myBills: billsRes.data.length,
          pendingBills: billsRes.data.filter(b => b.status !== 'paid').length,
          labReports: labRes.data.filter(r => r.status === 'completed').length,
          pendingLabTests: labRes.data.filter(r => r.status !== 'completed').length
        });
      } else if (user?.role === 'doctor') {
        // Doctor-specific dashboard
        const [appointmentsRes, recordsRes] = await Promise.all([
          axios.get('/api/appointments'),
          axios.get('/api/medical-records')
        ]);
        setStats({
          myAppointments: appointmentsRes.data.length,
          todayAppointments: appointmentsRes.data.filter(apt => {
            const today = new Date();
            const aptDate = new Date(apt.appointmentDate);
            return aptDate.toDateString() === today.toDateString();
          }).length,
          myRecords: recordsRes.data.length
        });
      } else if (user?.role === 'lab') {
        // Lab technician dashboard
        const recordsRes = await axios.get('/api/medical-records');
        setStats({
          totalRecords: recordsRes.data.length,
          pendingTests: recordsRes.data.filter(r => 
            r.labTests?.some(test => test.status === 'pending')
          ).length
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Role-based stat cards
  const getStatCards = () => {
    if (user?.role === 'admin' || user?.role === 'receptionist') {
      return [
        {
          title: 'Total Patients',
          value: stats?.totalPatients || 0,
          icon: FiUsers,
          color: '#4299e1',
          link: '/patients'
        },
        {
          title: "Today's Appointments",
          value: stats?.todayAppointments || 0,
          icon: FiCalendar,
          color: '#48bb78',
          link: '/appointments'
        },
        {
          title: 'Monthly Revenue',
          value: `$${stats?.monthlyRevenue?.paid?.toLocaleString() || 0}`,
          icon: FiDollarSign,
          color: '#ed8936',
          link: '/billing'
        },
        {
          title: 'Low Stock Items',
          value: stats?.lowStockItems || 0,
          icon: FiPackage,
          color: '#f56565',
          link: '/inventory'
        },
        {
          title: 'Pending Appointments',
          value: stats?.pendingAppointments || 0,
          icon: FiActivity,
          color: '#9f7aea',
          link: '/appointments'
        },
        {
          title: 'Active Doctors',
          value: stats?.totalDoctors || 0,
          icon: FiUsers,
          color: '#38b2ac',
          link: '/analytics'
        }
      ];
    } else if (user?.role === 'patient') {
      return [
        {
          title: 'My Appointments',
          value: stats?.myAppointments || 0,
          icon: FiCalendar,
          color: '#4299e1',
          link: '/appointments'
        },
        {
          title: 'Lab Reports',
          value: stats?.labReports || 0,
          icon: FiFileText,
          color: '#48bb78',
          link: '/laboratory'
        },
        {
          title: 'My Bills',
          value: stats?.myBills || 0,
          icon: FiDollarSign,
          color: '#ed8936',
          link: '/billing'
        },
        {
          title: 'Pending Payments',
          value: stats?.pendingBills || 0,
          icon: FiActivity,
          color: '#f56565',
          link: '/billing'
        },
        {
          title: 'Pending Lab Tests',
          value: stats?.pendingLabTests || 0,
          icon: FiActivity,
          color: '#9f7aea',
          link: '/laboratory'
        }
      ];
    } else if (user?.role === 'doctor') {
      return [
        {
          title: 'My Appointments',
          value: stats?.myAppointments || 0,
          icon: FiCalendar,
          color: '#4299e1',
          link: '/appointments'
        },
        {
          title: "Today's Appointments",
          value: stats?.todayAppointments || 0,
          icon: FiCalendar,
          color: '#48bb78',
          link: '/appointments'
        },
        {
          title: 'Medical Records',
          value: stats?.myRecords || 0,
          icon: FiFileText,
          color: '#9f7aea',
          link: '/medical-records'
        }
      ];
    } else if (user?.role === 'lab') {
      return [
        {
          title: 'Total Records',
          value: stats?.totalRecords || 0,
          icon: FiFileText,
          color: '#4299e1',
          link: '/medical-records'
        },
        {
          title: 'Pending Tests',
          value: stats?.pendingTests || 0,
          icon: FiActivity,
          color: '#f56565',
          link: '/medical-records'
        }
      ];
    }
    return [];
  };

  const statCards = getStatCards();

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <Icon />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {((user?.role === 'admin' || user?.role === 'receptionist') && stats?.recentAppointments && stats.recentAppointments.length > 0) && (
        <div className="recent-section">
          <h2>Recent Appointments</h2>
          <div className="recent-appointments">
            {stats.recentAppointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card">
                <div className="appointment-info">
                  <h3>
                    {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
                  </h3>
                  <p>Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
                  <p className="appointment-date">
                    {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                  </p>
                </div>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

