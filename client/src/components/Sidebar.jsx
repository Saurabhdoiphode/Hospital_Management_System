import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Package, 
  ShieldAlert
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'patient';

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'lab', 'pharmacist']
    },
    {
      name: 'Patients',
      path: '/patients',
      icon: Users,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'lab']
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: Calendar,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient', 'lab']
    },
    {
      name: 'Medical Records',
      path: '/medical-records',
      icon: FileText,
      roles: ['admin', 'doctor', 'nurse', 'patient', 'lab', 'pharmacist']
    },
    {
      name: 'Billing & Invoices',
      path: '/billing',
      icon: CreditCard,
      roles: ['admin', 'receptionist', 'patient', 'pharmacist']
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: Package,
      roles: ['admin', 'nurse', 'receptionist', 'pharmacist', 'lab']
    }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-61px)] flex flex-col justify-between p-4">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-sm border border-sky-100 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sky-700 font-semibold text-xs mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Role Restricted View</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Logged in as <strong className="capitalize text-slate-800">{role}</strong>. Features are filtered according to your assigned healthcare role.
        </p>
      </div>
    </aside>
  );
}
