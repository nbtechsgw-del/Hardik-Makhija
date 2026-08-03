import React, { useState, useEffect } from 'react';
import { createAdmission, dischargePatient, getCurrentAdmissions, getDashboardStats } from '../api';
import { UserPlus, UserMinus, Users, Calendar, Stethoscope, MapPin, Clock, XCircle, Search } from 'lucide-react';

const Admission = () => {
  const [currentAdmissions, setCurrentAdmissions] = useState([]);
  const [admissionStats, setAdmissionStats] = useState({
    currentlyAdmitted: 0,
    admittedToday: 0,
    dischargedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [showDischargeForm, setShowDischargeForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('All');

  const [admissionForm, setAdmissionForm] = useState({
    patientId: '',
    admittingDoctor: '',
    admissionReason: '',
    ward: 'General',
    bedNumber: '',
    roomNumber: '',
    diagnosis: '',
    admissionNotes: ''
  });

  const [dischargeForm, setDischargeForm] = useState({
    patientId: '',
    dischargeReason: '',
    dischargeNotes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [admissionsResponse, statsResponse] = await Promise.all([
        getCurrentAdmissions(),
        getDashboardStats()
      ]);
      setCurrentAdmissions(admissionsResponse.data.data || []);
      const stats = statsResponse.data;
      setAdmissionStats({
        currentlyAdmitted: stats.currentlyAdmitted || 0,
        admittedToday: stats.admittedToday || 0,
        dischargedToday: stats.dischargedToday || 0
      });
    } catch (err) {
      console.error('Failed to load admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetAdmissionForm = () => {
    setAdmissionForm({
      patientId: '',
      admittingDoctor: '',
      admissionReason: '',
      ward: 'General',
      bedNumber: '',
      roomNumber: '',
      diagnosis: '',
      admissionNotes: ''
    });
  };

  const resetDischargeForm = () => {
    setDischargeForm({
      patientId: '',
      dischargeReason: '',
      dischargeNotes: ''
    });
    setSelectedPatient(null);
  };

  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAdmission(admissionForm);
      setShowAdmissionForm(false);
      resetAdmissionForm();
      loadData();
    } catch (err) {
      alert('Admission failed: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    try {
      await dischargePatient(dischargeForm);
      setShowDischargeForm(false);
      resetDischargeForm();
      loadData();
    } catch (err) {
      alert('Discharge failed: ' + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const openDischargeForm = (admission) => {
    setSelectedPatient(admission);
    setDischargeForm({
      patientId: admission.patientId?.patientId || '',
      dischargeReason: '',
      dischargeNotes: ''
    });
    setShowDischargeForm(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredAdmissions = currentAdmissions.filter((admission) => {
    const patientName = `${admission.patientId?.personalDetails?.firstName || ''} ${admission.patientId?.personalDetails?.lastName || ''}`.trim();
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch === '' ||
      admission.patientId?.patientId?.toLowerCase().includes(normalizedSearch) ||
      patientName.toLowerCase().includes(normalizedSearch);

    const matchesWard = filterWard === 'All' || admission.ward === filterWard;
    return matchesSearch && matchesWard;
  });

  const wardOptions = ['All', ...new Set(currentAdmissions.map((admission) => admission.ward).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Admission Management</p>
              <h1 className="mt-3 text-4xl font-extrabold text-slate-900">Hospital Admissions</h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Track real-time admissions and discharges with patient details, filters, and quick actions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAdmissionForm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                Admit Patient
              </button>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm border border-slate-200">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-slate-900">{admissionStats.currentlyAdmitted}</span>
                  <span className="text-slate-600">Currently Admitted</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Currently Admitted</p>
                <p className="mt-4 text-3xl font-extrabold text-slate-900">{admissionStats.currentlyAdmitted}</p>
                <p className="mt-2 text-sm text-slate-500">Patients currently in care</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700">
                <Users className="h-7 w-7" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Admitted Today</p>
                <p className="mt-4 text-3xl font-extrabold text-slate-900">{admissionStats.admittedToday}</p>
                <p className="mt-2 text-sm text-slate-500">New admissions today</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                <UserPlus className="h-7 w-7" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Discharged Today</p>
                <p className="mt-4 text-3xl font-extrabold text-slate-900">{admissionStats.dischargedToday}</p>
                <p className="mt-2 text-sm text-slate-500">Patients discharged today</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-100 text-rose-700">
                <UserMinus className="h-7 w-7" />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Current Admissions</h2>
                <p className="mt-1 text-sm text-slate-500">Live patient admission records with search and ward filters.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by patient name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
                <select
                  value={filterWard}
                  onChange={(e) => setFilterWard(e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  {wardOptions.map((ward) => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-500">Loading admissions...</span>
              </div>
            ) : filteredAdmissions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAdmissions.map((admission, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {admission.patientId?.personalDetails?.firstName || 'Unknown'} {admission.patientId?.personalDetails?.lastName || ''}
                        </h3>
                        <p className="text-sm text-slate-500">{admission.patientId?.patientId || 'N/A'}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        admission.ward === 'ICU' ? 'bg-red-100 text-red-700' :
                        admission.ward === 'Emergency' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {admission.ward || 'General'}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-slate-600 mb-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Admitted {formatDate(admission.admissionDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-slate-400" />
                        <span>{admission.admittingDoctor ? `Dr. ${admission.admittingDoctor}` : 'Doctor not assigned'}</span>
                      </div>
                      {admission.roomNumber && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>Room {admission.roomNumber}, Bed {admission.bedNumber || '—'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{Math.max(0, Math.floor((new Date() - new Date(admission.admissionDate)) / (1000 * 60 * 60 * 24)))} days admitted</span>
                      </div>
                    </div>

                    <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                      <p className="text-sm text-slate-700"><span className="font-semibold">Reason:</span> {admission.admissionReason || 'Not specified'}</p>
                      <button
                        onClick={() => openDischargeForm(admission)}
                        className="mt-5 w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                      >
                        Discharge Patient
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-500">No current admissions match the search criteria.</p>
              </div>
            )}
          </div>
        </section>

        {showAdmissionForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Admit New Patient</h3>
                  <p className="mt-1 text-sm text-slate-500">Add a new admission record to the system.</p>
                </div>
                <button
                  onClick={() => setShowAdmissionForm(false)}
                  className="text-slate-400 transition hover:text-slate-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAdmissionSubmit} className="space-y-5 px-6 py-6 max-h-[70vh] overflow-y-auto">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Patient ID *</span>
                    <input
                      type="text"
                      required
                      value={admissionForm.patientId}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, patientId: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="PAT-12345"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Admitting Doctor *</span>
                    <input
                      type="text"
                      required
                      value={admissionForm.admittingDoctor}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, admittingDoctor: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="Dr. Singh"
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Admission Reason *</span>
                  <textarea
                    required
                    rows={3}
                    value={admissionForm.admissionReason}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, admissionReason: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Patient admitted for observation..."
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Ward</span>
                    <select
                      value={admissionForm.ward}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, ward: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    >
                      <option value="General">General</option>
                      <option value="ICU">ICU</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Maternity">Maternity</option>
                      <option value="Pediatric">Pediatric</option>
                      <option value="Surgical">Surgical</option>
                      <option value="Medical">Medical</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Room Number</span>
                    <input
                      type="text"
                      value={admissionForm.roomNumber}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, roomNumber: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="101"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Bed Number</span>
                    <input
                      type="text"
                      value={admissionForm.bedNumber}
                      onChange={(e) => setAdmissionForm({ ...admissionForm, bedNumber: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="A1"
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Initial Diagnosis</span>
                  <input
                    type="text"
                    value={admissionForm.diagnosis}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, diagnosis: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Initial diagnosis"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Admission Notes</span>
                  <textarea
                    rows={3}
                    value={admissionForm.admissionNotes}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, admissionNotes: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Additional notes about the admission"
                  />
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowAdmissionForm(false)}
                    className="flex-1 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Confirm Admission
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDischargeForm && selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Discharge Patient</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedPatient.patientId?.personalDetails?.firstName || ''} {selectedPatient.patientId?.personalDetails?.lastName || ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowDischargeForm(false)}
                  className="text-slate-400 transition hover:text-slate-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleDischargeSubmit} className="space-y-5 px-6 py-6">
                <div className="space-y-2 text-sm">
                  <label className="block font-medium text-slate-700">Patient ID</label>
                  <input
                    type="text"
                    value={dischargeForm.patientId}
                    disabled
                    className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-3 py-3 text-slate-500 outline-none"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <label className="block font-medium text-slate-700">Discharge Reason *</label>
                  <select
                    required
                    value={dischargeForm.dischargeReason}
                    onChange={(e) => setDischargeForm({ ...dischargeForm, dischargeReason: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="">Select reason</option>
                    <option value="Recovered">Recovered</option>
                    <option value="Transferred">Transferred to another facility</option>
                    <option value="Against Medical Advice">Against Medical Advice</option>
                    <option value="Deceased">Deceased</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2 text-sm">
                  <label className="block font-medium text-slate-700">Discharge Notes</label>
                  <textarea
                    rows={3}
                    value={dischargeForm.dischargeNotes}
                    onChange={(e) => setDischargeForm({ ...dischargeForm, dischargeNotes: e.target.value })}
                    className="w-full rounded-2xl border border-slate-300 px-3 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Notes for discharge instructions"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowDischargeForm(false)}
                    className="flex-1 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                  >
                    Confirm Discharge
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admission;
