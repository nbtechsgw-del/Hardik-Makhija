import React, { useState } from 'react';
import { getPatientData, addMedicalHistory } from '../api';

const Doctor = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ doctorName: '', diagnosis: '', symptoms: '', prescriptions: '' });
  const [reportFile, setReportFile] = useState(null);

  const handleSearch = async () => {
    setError('');
    if (!searchTerm.trim()) {
      setError('Patient ID ya phone number dalein.');
      return;
    }

    setLoading(true);
    try {
      const response = await getPatientData(searchTerm.trim());
      setPatient(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Patient record nahi mila.');
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!patient) {
      setError('Pehele patient search karein.');
      return;
    }
    if (!form.doctorName || !form.diagnosis) {
      setError('Doctor name aur diagnosis dono zaroori hain.');
      return;
    }

    const formData = new FormData();
    formData.append('patientId', patient.patientId);
    formData.append('doctorName', form.doctorName);
    formData.append('diagnosis', form.diagnosis);
    formData.append('symptoms', form.symptoms);
    formData.append('prescriptions', form.prescriptions);
    if (reportFile) {
      formData.append('reportFile', reportFile);
    }

    setLoading(true);
    try {
      await addMedicalHistory(formData);
      const updated = await getPatientData(patient.patientId);
      setPatient(updated.data);
      setForm({ doctorName: '', diagnosis: '', symptoms: '', prescriptions: '' });
      setReportFile(null);
      alert('Medical history updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Update mein error aaya.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Doctor Portal</p>
              <h1 className="mt-3 text-4xl font-extrabold text-slate-900">Clinical Patient Review</h1>
              <p className="mt-2 text-slate-600 max-w-2xl">Search patient records, review medical history, create prescriptions and attach lab reports from one place.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Search Patient</h2>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Patient ID or Phone"
                  className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </section>

            {patient && (
              <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">Patient Details</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Name</p>
                    <p className="mt-3 text-lg font-semibold text-slate-900">{patient.personalDetails.firstName} {patient.personalDetails.lastName}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Patient ID</p>
                    <p className="mt-3 text-lg font-semibold text-slate-900">{patient.patientId}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Phone</p>
                    <p className="mt-3 text-lg font-semibold text-slate-900">{patient.personalDetails.phone}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Gender</p>
                    <p className="mt-3 text-lg font-semibold text-slate-900">{patient.personalDetails.gender}</p>
                  </div>
                </div>
              </section>
            )}

            {patient && (
              <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900">Medical History</h2>
                {patient.medicalHistory?.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {patient.medicalHistory.map((history, idx) => (
                      <div key={idx} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Visit Date</p>
                            <p className="mt-1 font-semibold text-slate-900">{new Date(history.visitDate).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Doctor</p>
                            <p className="mt-1 font-semibold text-slate-900">{history.doctorName}</p>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-sm text-slate-500">Diagnosis</p>
                            <p className="mt-2 text-slate-900">{history.diagnosis}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Symptoms</p>
                            <p className="mt-2 text-slate-900">{history.symptoms?.join(', ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Prescriptions</p>
                            <p className="mt-2 text-slate-900">{history.prescriptions?.map((p) => p.medicineName).join(', ') || 'N/A'}</p>
                          </div>
                        </div>
                        {history.labReports?.length > 0 && (
                          <div className="mt-5 rounded-2xl bg-white p-4 border border-slate-200">
                            <p className="text-sm font-semibold text-slate-700">Lab Reports</p>
                            <ul className="mt-3 space-y-2 text-slate-700">
                              {history.labReports.map((report, reportIdx) => (
                                <li key={reportIdx}>
                                  <a href={report.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                                    {report.testName || 'View Report'}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-slate-500">Is patient ke liye koi medical history abhi tak record nahi hui.</p>
                )}
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Digital Prescription & Report Upload</h2>
              <p className="mt-2 text-slate-500">Patient select karne ke baad yahan se nayi clinical entry create karein.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Doctor Name</label>
                  <input
                    type="text"
                    value={form.doctorName}
                    onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Diagnosis</label>
                  <textarea
                    value={form.diagnosis}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Symptoms (comma separated)</label>
                  <input
                    type="text"
                    value={form.symptoms}
                    onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Prescriptions (comma separated)</label>
                  <textarea
                    value={form.prescriptions}
                    onChange={(e) => setForm({ ...form, prescriptions: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Upload Report (PDF / Image)</label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setReportFile(e.target.files[0])}
                    className="mt-2 w-full text-slate-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-white font-semibold transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? 'Saving...' : 'Save Clinical Note'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctor;
