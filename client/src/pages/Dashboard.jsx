import React, { useState, useEffect } from 'react';
import API from '../services/api';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Activity,
  Plus,
  FileText,
  Pill,
  CreditCard,
  Package,
  Stethoscope,
  Heart,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  TestTube,
  Microscope,
  ShoppingBag
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'patient';

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    lowStockAlerts: 0
  });

  const [revenueData, setRevenueData] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, revenueRes, aptRes, recentAptsRes, recordsRes, billsRes, invRes] = await Promise.all([
        API.get('/analytics/dashboard').catch(() => ({ data: {} })),
        API.get('/analytics/revenue').catch(() => ({ data: [] })),
        API.get('/analytics/appointments').catch(() => ({ data: [] })),
        API.get('/appointments').catch(() => ({ data: [] })),
        API.get('/medical-records').catch(() => ({ data: [] })),
        API.get('/billing').catch(() => ({ data: [] })),
        API.get('/inventory').catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data || {});
      setRevenueData(revenueRes.data || []);
      setAppointmentData(aptRes.data || []);
      setRecentAppointments(recentAptsRes.data || []);
      setRecentRecords(recordsRes.data || []);
      setRecentBills(billsRes.data || []);
      setInventoryItems(invRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleHeaderColor = (r) => {
    switch (r) {
      case 'admin': return 'from-purple-600 to-indigo-700';
      case 'doctor': return 'from-sky-600 to-blue-800';
      case 'nurse': return 'from-teal-600 to-emerald-800';
      case 'receptionist': return 'from-amber-600 to-orange-700';
      case 'patient': return 'from-emerald-600 to-teal-700';
      case 'lab': return 'from-indigo-600 to-violet-800';
      case 'pharmacist': return 'from-pink-600 to-rose-700';
      default: return 'from-sky-600 to-indigo-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Role-Based Top Banner */}
      <div className={`bg-gradient-to-r ${getRoleHeaderColor(role)} rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full text-white backdrop-blur-sm">
              {role === 'admin' && 'System Operations & Financials'}
              {role === 'doctor' && 'Medical & Consultation Console'}
              {role === 'nurse' && 'Clinical Nursing & Care Dashboard'}
              {role === 'receptionist' && 'Front Desk & Patient Intake Hub'}
              {role === 'patient' && 'Personal Healthcare Portal'}
              {role === 'lab' && 'Pathology & Diagnostic Laboratory Console'}
              {role === 'pharmacist' && 'Hospital Pharmacy & Medical Store Operations'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1 tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl leading-relaxed">
            {role === 'admin' && 'Complete hospital overview, department stats, financial revenue trends, and inventory alerts.'}
            {role === 'doctor' && 'Manage your scheduled patient appointments, digital prescriptions, diagnoses, and vitals.'}
            {role === 'nurse' && 'Monitor patient care status, record vital signs, and keep track of medicine stock levels.'}
            {role === 'receptionist' && 'Register new patients, schedule doctor consultations, generate invoices, and collect payments.'}
            {role === 'patient' && 'View your upcoming appointments, medical history, digital prescriptions, and invoice status.'}
            {role === 'lab' && 'Conduct pathology diagnostic tests, upload ECG/Lipid/Blood results, and maintain diagnostic history.'}
            {role === 'pharmacist' && 'Fulfill digital prescriptions, dispense medicines, monitor pharmacy stock levels, and track sales.'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px]">
          <p className="text-[11px] text-white/80 uppercase font-semibold">Active Role</p>
          <p className="text-base font-extrabold uppercase tracking-wider text-white mt-0.5">
            {role === 'lab' ? 'Lab Tech' : role === 'pharmacist' ? 'Pharmacy' : role}
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DOCTOR DASHBOARD VIEW */}
      {/* ========================================================= */}
      {role === 'doctor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Scheduled Consultations" value={recentAppointments.filter(a => a.status === 'Scheduled').length} icon={Calendar} color="sky" subtext="Pending for today" />
            <StatCard title="Completed Today" value={recentAppointments.filter(a => a.status === 'Completed').length} icon={CheckCircle} color="emerald" subtext="Consultations finished" />
            <StatCard title="Medical Records Created" value={recentRecords.length} icon={FileText} color="purple" subtext="Prescriptions & diagnoses" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/appointments')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">My Appointment Queue</h4>
                  <p className="text-xs text-slate-500">View & manage patient schedule</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/medical-records')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Create Prescription</h4>
                  <p className="text-xs text-slate-500">Log diagnosis, vitals & medicines</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/patients')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Patient Directory</h4>
                  <p className="text-xs text-slate-500">Search medical history & info</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Your Consultations Queue</h3>
              <button onClick={() => navigate('/appointments')} className="text-xs font-semibold text-sky-600 hover:underline">View All</button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentAppointments.slice(0, 4).map((apt) => (
                <div key={apt.id || apt._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{apt.patientName}</p>
                    <p className="text-slate-500">{apt.date} at {apt.time} • <span className="capitalize font-semibold text-sky-700">{apt.type}</span></p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. NURSE DASHBOARD VIEW */}
      {/* ========================================================= */}
      {role === 'nurse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Registered Patients" value={stats.totalPatients} icon={Users} color="sky" subtext="Under hospital care" />
            <StatCard title="Low Stock Alerts" value={stats.lowStockAlerts} icon={AlertTriangle} color={stats.lowStockAlerts > 0 ? "rose" : "emerald"} subtext="Medicines below min limit" />
            <StatCard title="Medical Records" value={recentRecords.length} icon={FileText} color="purple" subtext="Recorded vitals & history" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/medical-records')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Record Vitals</h4>
                  <p className="text-xs text-slate-500">Log BP, Heart Rate, SpO2 & Temp</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/inventory')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Medicine & Supplies</h4>
                  <p className="text-xs text-slate-500">Check stock level alerts</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/patients')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Patient Directory</h4>
                  <p className="text-xs text-slate-500">View emergency contacts & history</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Medicine & Supply Stock Status</h3>
              <button onClick={() => navigate('/inventory')} className="text-xs font-semibold text-sky-600 hover:underline">Manage Stock</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {inventoryItems.slice(0, 6).map((item) => {
                const isLow = item.stockQuantity <= item.minStockAlert;
                return (
                  <div key={item.id || item._id} className={`p-3 rounded-2xl border text-xs ${isLow ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-slate-500">{item.category} • {item.location || 'Storage'}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-extrabold">{item.stockQuantity} units</span>
                      {isLow && <span className="px-2 py-0.5 bg-rose-200 text-rose-800 font-bold rounded-md text-[10px]">Low Stock</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. RECEPTIONIST DASHBOARD VIEW */}
      {/* ========================================================= */}
      {role === 'receptionist' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Registered Patients" value={stats.totalPatients} icon={Users} color="sky" subtext="Patient directory" />
            <StatCard title="Scheduled Appointments" value={stats.scheduledAppointments} icon={Calendar} color="amber" subtext="Doctor appointments" />
            <StatCard title="Pending Invoice Amount" value={`$${stats.pendingRevenue.toLocaleString()}`} icon={CreditCard} color="rose" subtext="Awaiting payment" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/patients')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Register New Patient</h4>
                  <p className="text-xs text-slate-500">Add profile & emergency details</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/appointments')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Book Doctor Appointment</h4>
                  <p className="text-xs text-slate-500">Schedule consultation slot</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/billing')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Billing & Invoicing</h4>
                  <p className="text-xs text-slate-500">Generate bills & record payments</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Recent Patient Invoices</h3>
              <button onClick={() => navigate('/billing')} className="text-xs font-semibold text-sky-600 hover:underline">View All Invoices</button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentBills.slice(0, 4).map((bill) => (
                <div key={bill.id || bill._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{bill.patientName}</p>
                    <p className="text-slate-500">Date: {bill.invoiceDate} • Amount: <strong className="text-slate-900">${bill.totalAmount}</strong></p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {bill.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. LAB TECHNICIAN DASHBOARD VIEW (NEW!) */}
      {/* ========================================================= */}
      {role === 'lab' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Diagnostic Lab Tests" value={recentRecords.reduce((acc, r) => acc + (r.labResults?.length || 0), 0) || 2} icon={TestTube} color="purple" subtext="Pathology & Radiology" />
            <StatCard title="Patient Lab Records" value={recentRecords.length} icon={Microscope} color="sky" subtext="Digital test reports" />
            <StatCard title="Lab Equipment Stock" value={inventoryItems.filter(i => i.category === 'Equipment' || i.category === 'Consumables').length} icon={Package} color="emerald" subtext="Reagents & Diagnostic Kits" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/medical-records')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <TestTube className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Upload Lab Test Report</h4>
                  <p className="text-xs text-slate-500">Record Lipid, Blood, ECG & X-Ray</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/patients')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Patient Directory</h4>
                  <p className="text-xs text-slate-500">Lookup patient test history</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/inventory')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Lab Equipment & Kits</h4>
                  <p className="text-xs text-slate-500">Monitor reagent stock levels</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Diagnostic Reports Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Recent Pathology Lab Test Reports</h3>
              <button onClick={() => navigate('/medical-records')} className="text-xs font-semibold text-sky-600 hover:underline">View All Records</button>
            </div>
            <div className="space-y-3">
              {recentRecords.map((rec) => (
                rec.labResults && rec.labResults.length > 0 ? (
                  <div key={rec.id || rec._id} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-indigo-950 text-sm">{rec.patientName}</span>
                      <span className="text-slate-500">{rec.date}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {rec.labResults.map((l, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-indigo-100 flex justify-between items-center">
                          <strong className="text-slate-800">{l.testName}</strong>
                          <span className="text-emerald-700 font-bold">{l.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. PHARMACIST / MEDICAL STORE DASHBOARD VIEW (NEW!) */}
      {/* ========================================================= */}
      {role === 'pharmacist' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Prescriptions to Fulfill" value={recentRecords.length} icon={Pill} color="rose" subtext="Doctor Prescriptions" />
            <StatCard title="Low Stock Medicines" value={inventoryItems.filter(i => i.stockQuantity <= i.minStockAlert).length} icon={AlertTriangle} color="amber" subtext="Threshold warning" />
            <StatCard title="Total Medicines in Store" value={inventoryItems.filter(i => i.category === 'Medicine').length} icon={ShoppingBag} color="emerald" subtext="Active inventory catalog" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/medical-records')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-50 text-pink-600 rounded-xl group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Fulfill Prescriptions</h4>
                  <p className="text-xs text-slate-500">View doctor prescribed dosage</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/inventory')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Medicine Stock Store</h4>
                  <p className="text-xs text-slate-500">Restock & track quantity</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/billing')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Pharmacy Billing</h4>
                  <p className="text-xs text-slate-500">Medicine sales & receipt bills</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Doctor Prescriptions Queue for Pharmacists */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Prescriptions Needing Dispensing</h3>
              <button onClick={() => navigate('/medical-records')} className="text-xs font-semibold text-sky-600 hover:underline">View All Prescriptions</button>
            </div>
            <div className="space-y-3">
              {recentRecords.map((rec) => (
                rec.prescriptions && rec.prescriptions.length > 0 ? (
                  <div key={rec.id || rec._id} className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{rec.patientName}</p>
                      <p className="text-slate-500">Prescribed by {rec.doctorName} • Diagnosis: {rec.diagnosis}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rec.prescriptions.map((p, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-pink-200 text-pink-900 font-bold rounded-lg">
                            💊 {p.medicine} ({p.dosage} - {p.frequency})
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => navigate('/inventory')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-sm">
                      Dispense Medicine
                    </button>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. PATIENT DASHBOARD VIEW */}
      {/* ========================================================= */}
      {role === 'patient' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="My Upcoming Appointments" value={recentAppointments.filter(a => a.status === 'Scheduled').length} icon={Calendar} color="emerald" subtext="Scheduled visits" />
            <StatCard title="My Medical Records" value={recentRecords.length} icon={FileText} color="purple" subtext="Prescriptions & lab test results" />
            <StatCard title="My Invoices" value={recentBills.length} icon={CreditCard} color="sky" subtext="Billing & payments" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/appointments')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Book Doctor Visit</h4>
                  <p className="text-xs text-slate-500">Select date & doctor slot</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/medical-records')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">My Digital Prescriptions</h4>
                  <p className="text-xs text-slate-500">View medicines & lab results</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => navigate('/billing')} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">My Invoices & Payment</h4>
                  <p className="text-xs text-slate-500">View bills & receipt details</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base">My Scheduled Appointments</h3>
                <button onClick={() => navigate('/appointments')} className="text-xs font-semibold text-sky-600 hover:underline">View All</button>
              </div>
              <div className="divide-y divide-slate-100">
                {recentAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id || apt._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Doctor: {apt.doctorName}</p>
                      <p className="text-slate-500">{apt.date} at {apt.time} • <span className="capitalize font-semibold text-sky-700">{apt.type}</span></p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base">My Recent Prescriptions</h3>
                <button onClick={() => navigate('/medical-records')} className="text-xs font-semibold text-sky-600 hover:underline">View All Records</button>
              </div>
              <div className="divide-y divide-slate-100">
                {recentRecords.slice(0, 3).map((rec) => (
                  <div key={rec.id || rec._id} className="py-3 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-800">{rec.diagnosis}</strong>
                      <span className="text-slate-400">{rec.date}</span>
                    </div>
                    {rec.prescriptions && rec.prescriptions[0] && (
                      <p className="text-slate-600">Prescribed: <span className="font-semibold text-teal-700">{rec.prescriptions[0].medicine}</span> ({rec.prescriptions[0].dosage})</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. ADMIN DASHBOARD VIEW */}
      {/* ========================================================= */}
      {role === 'admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Patients" 
              value={stats.totalPatients} 
              icon={Users} 
              color="sky" 
              subtext="Registered in Database"
            />
            <StatCard 
              title="Scheduled Appointments" 
              value={stats.scheduledAppointments} 
              icon={Calendar} 
              color="amber" 
              subtext={`${stats.completedAppointments} Completed`}
            />
            <StatCard 
              title="Collected Revenue" 
              value={`$${stats.totalRevenue.toLocaleString()}`} 
              icon={DollarSign} 
              color="emerald" 
              subtext={`$${stats.pendingRevenue.toLocaleString()} Pending`}
            />
            <StatCard 
              title="Low Stock Alerts" 
              value={stats.lowStockAlerts} 
              icon={AlertTriangle} 
              color={stats.lowStockAlerts > 0 ? "rose" : "sky"} 
              subtext="Items below minimum threshold"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button onClick={() => navigate('/patients')} className="p-3 bg-white border rounded-2xl hover:border-sky-300 transition-all text-center space-y-1">
              <Users className="w-5 h-5 mx-auto text-sky-600" />
              <p className="text-xs font-bold text-slate-800">Patients</p>
            </button>
            <button onClick={() => navigate('/appointments')} className="p-3 bg-white border rounded-2xl hover:border-sky-300 transition-all text-center space-y-1">
              <Calendar className="w-5 h-5 mx-auto text-amber-600" />
              <p className="text-xs font-bold text-slate-800">Appointments</p>
            </button>
            <button onClick={() => navigate('/medical-records')} className="p-3 bg-white border rounded-2xl hover:border-sky-300 transition-all text-center space-y-1">
              <FileText className="w-5 h-5 mx-auto text-purple-600" />
              <p className="text-xs font-bold text-slate-800">Records</p>
            </button>
            <button onClick={() => navigate('/billing')} className="p-3 bg-white border rounded-2xl hover:border-sky-300 transition-all text-center space-y-1">
              <CreditCard className="w-5 h-5 mx-auto text-emerald-600" />
              <p className="text-xs font-bold text-slate-800">Billing</p>
            </button>
            <button onClick={() => navigate('/inventory')} className="p-3 bg-white border rounded-2xl hover:border-sky-300 transition-all text-center space-y-1">
              <Package className="w-5 h-5 mx-auto text-rose-600" />
              <p className="text-xs font-bold text-slate-800">Inventory</p>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Financial Revenue Trends</h3>
                  <p className="text-xs text-slate-500">Monthly revenue vs operation expenses ($)</p>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0' }} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={3} name="Revenue ($)" />
                    <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} name="Expenses ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Weekly Appointment Volume</h3>
                  <p className="text-xs text-slate-500">Scheduled vs Completed appointments per day</p>
                </div>
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0' }} />
                    <Legend />
                    <Bar dataKey="scheduled" fill="#0284c7" name="Scheduled" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
