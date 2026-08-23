import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Activity, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'doctor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'nurse': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'receptionist': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'patient': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lab': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'pharmacist': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-sky-600 text-white p-2 rounded-xl shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Medicare Plus</h1>
            <span className="text-xs text-slate-500 font-medium">Hospital Management System</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full"></span>
          </button>

          <div className="h-6 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm border border-sky-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-all ml-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
