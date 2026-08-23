import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  User, 
  CheckCircle, 
  XCircle, 
  Filter,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: 'Dr. Robert Ford',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    type: 'consultation',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await API.get('/appointments', { params });
      setAppointments(res.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await API.post('/appointments', formData);
      toast.success('Appointment booked successfully!');
      setIsBookModalOpen(false);
      fetchAppointments();
    } catch (error) {
      toast.error('Error booking appointment');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, { status });
      toast.success(`Appointment status updated to ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointment Scheduling</h1>
          <p className="text-sm text-slate-500">View calendar schedule, book consultation sessions & manage status</p>
        </div>
        <button
          onClick={() => setIsBookModalOpen(true)}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-sky-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Filter Status:</span>
        </div>
        <div className="flex gap-2">
          {['', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st || 'All Appointments'}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((apt) => (
          <div key={apt.id || apt._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(apt.status)}`}>
                  {apt.status}
                </span>
                <span className="text-xs font-semibold text-sky-700 capitalize bg-sky-50 px-2 py-0.5 rounded-md">
                  {apt.type}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-800">{apt.patientName}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Doctor: {apt.doctorName}</span>
              </p>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
                  <span>Date: <strong>{apt.date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Time: <strong>{apt.time}</strong></span>
                </div>
              </div>

              {apt.notes && (
                <p className="text-xs text-slate-500 mt-2 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  "{apt.notes}"
                </p>
              )}
            </div>

            {/* Quick Status Action Buttons */}
            {apt.status === 'Scheduled' && (
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleStatusUpdate(apt.id || apt._id, 'Completed')}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs rounded-xl transition-colors border border-emerald-200"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Complete</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate(apt.id || apt._id, 'Cancelled')}
                  className="flex items-center justify-center p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-xl transition-colors border border-rose-200"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Book Doctor Appointment"
      >
        <form onSubmit={handleBookAppointment} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Name</label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full p-2 border rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Attending Doctor</label>
            <select
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm bg-white"
            >
              <option value="Dr. Robert Ford">Dr. Robert Ford (Cardiology)</option>
              <option value="Dr. Sarah Connor">Dr. Sarah Connor (Administration/General)</option>
              <option value="Dr. Elizabeth Shaw">Dr. Elizabeth Shaw (Pediatrics)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="10:00 AM"
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Appointment Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm bg-white capitalize"
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-Up</option>
              <option value="checkup">Routine Checkup</option>
              <option value="emergency">Emergency</option>
              <option value="surgery">Surgery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / Symptoms</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Initial consultation notes..."
              className="w-full p-2 border rounded-xl text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white font-semibold py-2.5 rounded-xl text-sm mt-3 hover:bg-sky-700 transition-colors"
          >
            Confirm & Book Appointment
          </button>
        </form>
      </Modal>
    </div>
  );
}
