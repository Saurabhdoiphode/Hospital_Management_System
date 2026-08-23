import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Plus, 
  Activity, 
  Pill, 
  TestTube, 
  User, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    patientName: 'John Doe',
    diagnosis: '',
    symptoms: '',
    bloodPressure: '120/80',
    heartRate: '72 bpm',
    temperature: '98.6 °F',
    weight: '70 kg',
    oxygen: '99%',
    medicine: '',
    dosage: '',
    frequency: '',
    duration: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await API.get('/medical-records');
      setRecords(res.data);
    } catch (error) {
      toast.error('Failed to load medical records');
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patientName: formData.patientName,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : [],
        vitals: {
          bloodPressure: formData.bloodPressure,
          heartRate: formData.heartRate,
          temperature: formData.temperature,
          weight: formData.weight,
          oxygen: formData.oxygen
        },
        prescriptions: formData.medicine ? [{
          medicine: formData.medicine,
          dosage: formData.dosage || '1 tablet',
          frequency: formData.frequency || 'Twice daily',
          duration: formData.duration || '7 days'
        }] : []
      };

      await API.post('/medical-records', payload);
      toast.success('Medical record created successfully!');
      setIsAddModalOpen(false);
      fetchRecords();
    } catch (error) {
      toast.error('Error creating medical record');
    }
  };

  const canCreate = ['admin', 'doctor', 'nurse'].includes(user?.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Digital Medical Records</h1>
          <p className="text-sm text-slate-500">Track diagnoses, prescriptions, lab results, and patient vital signs</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-sky-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Medical Record</span>
          </button>
        )}
      </div>

      {/* Records Cards */}
      <div className="space-y-4">
        {records.map((rec) => (
          <div key={rec.id || rec._id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{rec.patientName}</h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-sky-50 text-sky-700 rounded-full border border-sky-100">
                    Record #{rec.id || rec._id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Doctor: <strong>{rec.doctorName}</strong></span>
                  <span>•</span>
                  <span>Date: <strong>{rec.date}</strong></span>
                </p>
              </div>
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-xl text-xs font-bold self-start md:self-auto">
                Diagnosis: {rec.diagnosis}
              </div>
            </div>

            {/* Vitals Ribbon */}
            {rec.vitals && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4 bg-slate-50 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">BP</span>
                  <span className="font-semibold text-slate-700">{rec.vitals.bloodPressure}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Heart Rate</span>
                  <span className="font-semibold text-slate-700">{rec.vitals.heartRate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Temp</span>
                  <span className="font-semibold text-slate-700">{rec.vitals.temperature}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Weight</span>
                  <span className="font-semibold text-slate-700">{rec.vitals.weight}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">SpO2</span>
                  <span className="font-semibold text-slate-700">{rec.vitals.oxygen}</span>
                </div>
              </div>
            )}

            {/* Prescriptions & Lab Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {rec.prescriptions && rec.prescriptions.length > 0 && (
                <div className="bg-teal-50/50 border border-teal-100 p-3 rounded-xl space-y-2">
                  <p className="font-bold text-teal-800 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span>Prescriptions</span>
                  </p>
                  <ul className="space-y-1 text-slate-700">
                    {rec.prescriptions.map((p, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-teal-100">
                        <strong className="text-teal-900">{p.medicine}</strong>
                        <span>{p.dosage} - {p.frequency} ({p.duration})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rec.labResults && rec.labResults.length > 0 && (
                <div className="bg-purple-50/50 border border-purple-100 p-3 rounded-xl space-y-2">
                  <p className="font-bold text-purple-800 flex items-center gap-1.5">
                    <TestTube className="w-4 h-4 text-purple-600" />
                    <span>Lab Test Results</span>
                  </p>
                  <ul className="space-y-1 text-slate-700">
                    {rec.labResults.map((l, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-purple-100">
                        <strong className="text-purple-900">{l.testName}</strong>
                        <span className="text-emerald-700 font-semibold">{l.result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Digital Medical Record"
      >
        <form onSubmit={handleCreateRecord} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Name</label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Clinical Diagnosis</label>
            <input
              type="text"
              required
              placeholder="e.g. Acute Bronchitis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Observed Symptoms (comma separated)</label>
            <input
              type="text"
              placeholder="Cough, Fever, Shortness of breath"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full p-2 border rounded-xl text-sm"
            />
          </div>

          <div className="border-t pt-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Record Vitals</h4>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="BP (120/80)"
                value={formData.bloodPressure}
                onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                className="p-2 border rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Heart Rate (75 bpm)"
                value={formData.heartRate}
                onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                className="p-2 border rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Temp (98.6 °F)"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                className="p-2 border rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="border-t pt-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Add Prescription Medicine</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Medicine Name (e.g. Azithromycin)"
                value={formData.medicine}
                onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                className="p-2 border rounded-xl text-xs col-span-2"
              />
              <input
                type="text"
                placeholder="Dosage (500mg)"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="p-2 border rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Frequency (Once daily)"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="p-2 border rounded-xl text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 text-white font-semibold py-2.5 rounded-xl text-sm mt-3 hover:bg-sky-700 transition-colors"
          >
            Save Medical Record
          </button>
        </form>
      </Modal>
    </div>
  );
}
