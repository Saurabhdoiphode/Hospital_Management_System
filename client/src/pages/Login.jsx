import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Login() {
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(`Logged in successfully!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-sky-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-sky-600/30">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Hospital Portal Login</h2>
          <p className="text-xs text-slate-500 mt-1">Select your access role to sign in</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Role Selection Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select User Role</label>
            <div className="relative">
              <ShieldCheck className="w-5 h-5 text-sky-600 absolute left-3 top-2.5" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="patient">👤 Patient</option>
                <option value="doctor">👨‍⚕️ Doctor</option>
                <option value="nurse">👩‍⚕️ Nurse</option>
                <option value="receptionist">📋 Receptionist</option>
                <option value="lab">🧪 Lab Technician</option>
                <option value="pharmacist">💊 Pharmacist (Medical Store)</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need a new patient account?{' '}
          <Link to="/register" className="text-sky-600 font-semibold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
