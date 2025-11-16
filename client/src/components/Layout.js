import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '../context/I18nContext';
import DarkModeToggle from './DarkModeToggle';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiPackage,
  FiBarChart2,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiActivity
} from 'react-icons/fi';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FiHome, label: t('menu.dashboard'), roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'lab'] },
    { path: '/patients', icon: FiUsers, label: t('menu.patients'), roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { path: '/appointments', icon: FiCalendar, label: t('menu.appointments'), roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
    { path: '/appointments/calendar', icon: FiCalendar, label: t('menu.calendar'), roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { path: '/medical-records', icon: FiFileText, label: t('menu.medicalRecords'), roles: ['admin', 'doctor', 'nurse', 'lab'] },
    { path: '/medical-dashboard', icon: FiFileText, label: t('menu.medicalDashboard'), roles: ['admin', 'doctor'] },
    { path: '/prescriptions', icon: FiFileText, label: t('menu.prescriptions'), roles: ['admin', 'doctor', 'patient'] },
    { path: '/billing', icon: FiDollarSign, label: t('menu.billing'), roles: ['admin', 'receptionist', 'patient', 'doctor'] },
    { path: '/pharmacy', icon: FiPackage, label: t('menu.pharmacy'), roles: ['admin', 'receptionist'] },
    { path: '/laboratory', icon: FiFileText, label: t('menu.laboratory'), roles: ['admin', 'doctor', 'lab'] },
    { path: '/queue', icon: FiActivity, label: t('menu.queue'), roles: ['admin', 'receptionist', 'doctor', 'lab', 'nurse'] },
    { path: '/roster', icon: FiUsers, label: t('menu.roster'), roles: ['admin', 'nurse'] },
    { path: '/discharge', icon: FiFileText, label: t('menu.discharge'), roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
    { path: '/wards', icon: FiActivity, label: t('menu.wards'), roles: ['admin', 'doctor', 'receptionist'] },
    { path: '/staff', icon: FiUsers, label: t('menu.staff'), roles: ['admin'] },
    { path: '/inventory', icon: FiPackage, label: t('menu.inventory'), roles: ['admin', 'receptionist'] },
    { path: '/analytics', icon: FiBarChart2, label: t('menu.analytics'), roles: ['admin'] },
    { path: '/admin-alerts', icon: FiActivity, label: t('menu.alerts'), roles: ['admin'] },
    { path: '/bulk-operations', icon: FiUsers, label: t('menu.bulk'), roles: ['admin'] },
    { path: '/activity-logs', icon: FiActivity, label: t('menu.logs'), roles: ['admin'] }
  ];
  // Add profile entry at the bottom for all roles
  const profileItem = { path: '/profile', icon: FiUser, label: t('menu.profile'), roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'lab'] };

  const filteredMenuItems = [...menuItems, profileItem].filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>🏥 HMS</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>
        <nav className="sidebar-nav">
          {filteredMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <FiUser />
            <div>
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <h1 className="page-title">
              {filteredMenuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <LanguageSwitcher />
            <DarkModeToggle />
            <NotificationPanel />
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

