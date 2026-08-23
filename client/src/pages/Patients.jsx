import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Shield, 
  Eye, 
  UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    bloodGroup: 'O+',
    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    insuranceProvider: '',
    policyNumber: ''
  });

  useEffect(() => {
    fetchPatients();
  }, [search, genderFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (genderFilter) params.gender = genderFilter;

      const res = await API.get('/patients', { params });
      setPatients(res.data);
    } catch (error) {
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(s => s.trim()) : [],
        emergencyContact: {
          name: formData.emergencyContactName,
          relation: formData.emergencyContactRelation,
          phone: formData.emergencyContactPhone
        },
        insurance: {
          provider: formData.insuranceProvider,
          policyNumber: formData.policyNumber
        }
      };

      await API.post('/patients', payload);
      toast.success('Patient registered successfully!');
      setIsAddModalOpen(false);
      fetchPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error registering patient');
    }
  };

  const isStaff = ['admin', 'doctor', 'nurse', 'receptionist'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Directory</h1>
          <p className="text-sm text-slate-500">Manage patient profiles, medical history & emergency info</p>
        </div>
        {isStaff && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-sky-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Patients Cards/Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <div key={patient.id || patient._id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{patient.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{patient.age} yrs • {patient.gender}</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-sky-50 text-sky-700 rounded-full border border-sky-100">
                  {patient.bloodGroup || 'O+'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{patient.address}</span>
                  </div>
                )}
              </div>

              {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Medical History</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patient.medicalHistory.map((history, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[11px] font-medium rounded-md">
                        {history}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPatient(patient)}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors"
            >
              <Eye className="w-4 h-4 text-sky-600" />
              <span>View Full Profile</span>
            </button>
          </div>
        ))}
      </div>

      {/* Patient Detailed View Modal */}
      {selectedPatient && (
        <Modal
          isOpen={Boolean(selectedPatient)}
          onClose={() => setSelectedPatient(null)}
          title={`Patient Record: ${selectedPatient.name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
              <div><strong className="text-slate-500">Full Name:</strong> {selectedPatient.name}</div>
              <div><strong className="text-slate-500">Blood Group:</strong> {selectedPatient.bloodGroup}</div>
              <div><strong className="text-slate-500">Age & Gender:</strong> {selectedPatient.age} yrs / {selectedPatient.gender}</div>
              <div><strong className="text-slate-500">Phone:</strong> {selectedPatient.phone}</div>
              <div className="col-span-2"><strong className="text-slate-500">Address:</strong> {selectedPatient.address}</div>
            </div>

            <div className="border-t pt-3">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Emergency Contact</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <p><strong>Contact Name:</strong> {selectedPatient.emergencyContact?.name || 'N/A'}</p>
                <p><strong>Relation:</strong> {selectedPatient.emergencyContact?.relation || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedPatient.emergencyContact?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Insurance Information</h4>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
                <p><strong>Provider:</strong> {selectedPatient.insurance?.provider || 'None'}</p>
                <p><strong>Policy #:</strong> {selectedPatient.insurance?.policyNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Register New Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Patient"
      >
        <form onSubmit={handleCreatePatient} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Medical History (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Asthma, Diabetes, Allergy to Penicillin"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm"
            />
          </div>

          <div className="border-t pt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Emergency Contact Phone</label>
              <input
                type="text"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                className="w-full p-2 border rounded-xl text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white font-semibold py-2.5 rounded-xl text-sm mt-3 hover:bg-sky-700 transition-colors"
          >
            Save Patient Record
          </button>
        </form>
      </Modal>
    </div>
  );
}
