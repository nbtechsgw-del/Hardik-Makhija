import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Users, ShieldCheck, ArrowRight, CreditCard, UserPlus, UserMinus, UserCheck, FileText, Download, Calendar } from 'lucide-react';
import { getDashboardStats, getMonthlyReport, downloadMonthlyReportPDF } from '../api';

const Dashboard = () => {
  const [totalPatients, setTotalPatients] = useState('—');
  const [todayVisited, setTodayVisited] = useState('—');
  const [recentPatients, setRecentPatients] = useState([]);
  const [dailyPayments, setDailyPayments] = useState([]);
  const [todayPaymentsTotal, setTodayPaymentsTotal] = useState(0);
  const [currentlyAdmitted, setCurrentlyAdmitted] = useState('—');
  const [admittedToday, setAdmittedToday] = useState('—');
  const [dischargedToday, setDischargedToday] = useState('—');
  const [currentlyAdmittedList, setCurrentlyAdmittedList] = useState([]);
  const [admittedTodayList, setAdmittedTodayList] = useState([]);
  const [dischargedTodayList, setDischargedTodayList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showAdmittedModal, setShowAdmittedModal] = useState(false);
  const [showAdmittedTodayModal, setShowAdmittedTodayModal] = useState(false);
  const [showDischargedTodayModal, setShowDischargedTodayModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthlyReportModal, setShowMonthlyReportModal] = useState(false);
  const [currentMonthlyReport, setCurrentMonthlyReport] = useState(null);
  const [loadingMonthlyReport, setLoadingMonthlyReport] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const formattedReportMonth = String(selectedMonth).padStart(2, '0');

  // Scroll to recent patients section
  const scrollToRecentPatients = () => {
    const recentPatientsSection = document.getElementById('recent-patients-section');
    if (recentPatientsSection) {
      recentPatientsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Show today's payments modal
  const showTodaysPayments = () => {
    setShowPaymentsModal(true);
  };

  // Show currently admitted patients modal
  const showCurrentlyAdmitted = () => {
    setShowAdmittedModal(true);
  };

  // Show admitted today modal
  const showAdmittedToday = () => {
    setShowAdmittedTodayModal(true);
  };

  // Show discharged today modal
  const showDischargedToday = () => {
    setShowDischargedTodayModal(true);
  };

  // Generate monthly report
  const generateMonthlyReport = async () => {
    try {
      setLoadingMonthlyReport(true);
      const response = await getMonthlyReport(selectedYear, formattedReportMonth);
      setCurrentMonthlyReport(response.data);
      setShowMonthlyReportModal(true);
    } catch (err) {
      console.error('Failed to generate monthly report:', err);
      alert('Failed to generate monthly report. Please try again.');
    } finally {
      setLoadingMonthlyReport(false);
    }
  };

  // Download monthly report PDF
  const downloadMonthlyReport = async () => {
    try {
      setDownloadingReport(true);
      const response = await downloadMonthlyReportPDF(selectedYear, formattedReportMonth);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `monthly-report-${selectedYear}-${formattedReportMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download monthly report:', err);
      alert('Failed to download monthly report. Please try again.');
    } finally {
      setDownloadingReport(false);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        const data = response.data;
        
        setTotalPatients(data.totalPatients ?? 0);
        setTodayVisited(data.todayVisited ?? 0);
        setRecentPatients(data.recentPatients ?? []);
        setDailyPayments(data.dailyPayments ?? []);
        setTodayPaymentsTotal(data.todayPaymentsTotal ?? 0);
        setCurrentlyAdmitted(data.currentlyAdmitted ?? 0);
        setAdmittedToday(data.admittedToday ?? 0);
        setDischargedToday(data.dischargedToday ?? 0);
        setCurrentlyAdmittedList(data.currentlyAdmittedList ?? []);
        setAdmittedTodayList(data.admittedTodayList ?? []);
        setDischargedTodayList(data.dischargedTodayList ?? []);
      } catch (err) {
        setTotalPatients('N/A');
        setTodayVisited('N/A');
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const stats = [
    { title: 'Total Patients', count: totalPatients, description: 'Total registered records', icon: <Users className="h-8 w-8" /> },
    { title: "Today's Visits", count: todayVisited, description: 'Patients visited today', icon: <Activity className="h-8 w-8" /> },
    { title: 'Daily Payments', count: `₹${todayPaymentsTotal.toLocaleString()}`, description: 'Outstanding amount to collect today', icon: <CreditCard className="h-8 w-8" />, onClick: showTodaysPayments },
    { title: 'Currently Admitted', count: currentlyAdmitted, description: 'Patients currently in hospital', icon: <UserCheck className="h-8 w-8" />, onClick: showCurrentlyAdmitted },
    { title: 'Admitted Today', count: admittedToday, description: 'New admissions today', icon: <UserPlus className="h-8 w-8" />, onClick: showAdmittedToday },
    { title: 'Discharged Today', count: dischargedToday, description: 'Patients discharged today', icon: <UserMinus className="h-8 w-8" />, onClick: showDischargedToday },
  ];

  const formatTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Hospital Command Center</p>
              <h1 className="mt-3 text-4xl font-extrabold text-slate-900">Professional Dashboard</h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Real-time insights for patient flow, operational effectiveness, and clinical performance.
                Use this dashboard to manage admissions, follow up on pending reports and keep your staff aligned.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-700"
              >
                Register Patient
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
              >
                Search Records
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <div 
              key={item.title} 
              className={`rounded-3xl bg-white p-6 shadow-sm border border-slate-200 ${item.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
              onClick={item.onClick}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{item.title}</p>
                  <p className="mt-4 text-4xl font-extrabold text-slate-900">{loading ? '—' : item.count}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-blue-700">
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Admission Snapshot</h2>
              <p className="mt-1 text-sm text-slate-500">Live admissions, discharges, and inpatient status pulled from hospital records.</p>
            </div>
            <div className="inline-flex items-center rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Updated automatically from live data
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Currently Admitted</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '—' : currentlyAdmitted}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">Patients currently under care in the hospital.</p>

              <div className="mt-5 space-y-3">
                {(currentlyAdmittedList && currentlyAdmittedList.length > 0) ? currentlyAdmittedList.slice(0, 3).map((admission, idx) => (
                  <div key={idx} className="rounded-2xl bg-white p-3 border border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {admission.patientId?.personalDetails?.firstName || 'Unknown'} {admission.patientId?.personalDetails?.lastName || ''}
                        </p>
                        <p className="text-xs text-slate-500">{admission.patientId?.patientId || '—'}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        Bed {admission.bedNumber || '—'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Admitted {formatDate(admission.admissionDate)}</p>
                  </div>
                )) : (
                  <p className="mt-4 text-sm text-slate-500">No active inpatient records found.</p>
                )}
              </div>

              <button
                onClick={showCurrentlyAdmitted}
                className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View all admitted
              </button>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Admitted Today</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '—' : admittedToday}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <UserPlus className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">New admissions recorded in the last 24 hours.</p>

              <div className="mt-5 space-y-3">
                {(admittedTodayList && admittedTodayList.length > 0) ? admittedTodayList.slice(0, 3).map((admission, idx) => (
                  <div key={idx} className="rounded-2xl bg-white p-3 border border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {admission.patientId?.personalDetails?.firstName || 'Unknown'} {admission.patientId?.personalDetails?.lastName || ''}
                        </p>
                        <p className="text-xs text-slate-500">{admission.patientId?.patientId || '—'}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase text-slate-600">
                        {formatTime(admission.admissionDate)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{admission.admissionReason || 'Reason not provided'}</p>
                  </div>
                )) : (
                  <p className="mt-4 text-sm text-slate-500">No admissions recorded today.</p>
                )}
              </div>

              <button
                onClick={showAdmittedToday}
                className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View today's admissions
              </button>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Discharged Today</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? '—' : dischargedToday}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <UserMinus className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">Patients discharged from the hospital today.</p>

              <div className="mt-5 space-y-3">
                {(dischargedTodayList && dischargedTodayList.length > 0) ? dischargedTodayList.slice(0, 3).map((admission, idx) => (
                  <div key={idx} className="rounded-2xl bg-white p-3 border border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {admission.patientId?.personalDetails?.firstName || 'Unknown'} {admission.patientId?.personalDetails?.lastName || ''}
                        </p>
                        <p className="text-xs text-slate-500">{admission.patientId?.patientId || '—'}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase text-slate-600">
                        {formatTime(admission.dischargeDate)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{admission.dischargeReason || 'Discharge details not available'}</p>
                  </div>
                )) : (
                  <p className="mt-4 text-sm text-slate-500">No discharges recorded today.</p>
                )}
              </div>

              <button
                onClick={showDischargedToday}
                className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View today's discharges
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Today's Visited Patients</h2>
                <p className="mt-1 text-sm text-slate-500">Patient visits recorded today.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                {todayVisited} patients
              </div>
            </div>

            {loading ? (
              <p className="mt-6 text-slate-500">Loading...</p>
            ) : todayVisited > 0 ? (
              <div className="mt-6 overflow-hidden rounded-3xl bg-slate-50 p-4">
                <ul className="space-y-3">
                  {(Array.isArray(recentPatients) ? recentPatients : []).map((patient, idx) => (
                    <li key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{patient.patientName || 'N/A'}</p>
                          <p className="text-sm text-slate-500">{patient.patientId}</p>
                          <p className="text-xs text-slate-500 mt-1">📞 {patient.phone}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                          {patient.lastVisit ? formatTime(patient.lastVisit) : 'N/A'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600"><strong>Diagnosis:</strong> {patient.diagnosis || 'N/A'}</p>
                      <p className="text-sm text-slate-600"><strong>Doctor:</strong> {patient.doctorName || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No patient visits recorded today.</p>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Fast Actions</h2>
                <p className="mt-1 text-sm text-slate-500">One-click operations for your team.</p>
              </div>
              <ShieldCheck className="h-6 w-6 text-blue-700" />
            </div>

            <div className="mt-6 space-y-4">
              <Link 
                to="/register"
                className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-100 block"
              >
                <div className="flex items-center justify-between">
                  <span>Register new patient</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
              <button 
                onClick={scrollToRecentPatients}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <div className="flex items-center justify-between">
                  <span>View recent patients</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
              <button 
                onClick={showTodaysPayments}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <div className="flex items-center justify-between">
                  <span>Today's payments</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
              <Link 
                to="/billing"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 block"
              >
                <div className="flex items-center justify-between">
                  <span>Manage billing</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div id="recent-patients-section" className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recent Patient Activity</h2>
                <p className="mt-1 text-sm text-slate-500">Last 10 patients with medical history.</p>
              </div>
              <Activity className="h-6 w-6 text-slate-500" />
            </div>

            {loading ? (
              <p className="mt-6 text-slate-500">Loading...</p>
            ) : recentPatients.length > 0 ? (
              <div className="mt-6 overflow-hidden rounded-3xl bg-slate-50 p-4">
                <ul className="space-y-3">
                  {recentPatients.slice(0, 8).map((patient, idx) => (
                    <li key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{patient.patientName || 'N/A'}</p>
                          <p className="text-sm text-slate-500">{patient.patientId}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          patient.status === 'In Treatment' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {patient.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No recent patient activity.</p>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Daily Payment Record</h2>
                <p className="mt-1 text-sm text-slate-500">All payments today.</p>
              </div>
              <CreditCard className="h-6 w-6 text-slate-500" />
            </div>

            {loading ? (
              <p className="mt-6 text-slate-500">Loading...</p>
            ) : dailyPayments.length > 0 ? (
              <div className="mt-6 overflow-hidden rounded-3xl bg-slate-50 p-4">
                <ul className="space-y-3">
                  {dailyPayments.map((payment, idx) => (
                    <li key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{payment.patientName || 'N/A'}</p>
                          <p className="text-sm text-slate-500">{payment.invoiceId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">₹{payment.amount.toLocaleString()}</p>
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold mt-1 ${
                            payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-6 text-slate-500">No payments recorded today.</p>
            )}
          </div>
        </section>

        {/* Monthly Reports Section */}
        <section className="mt-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Monthly Reports</h2>
                <p className="mt-1 text-sm text-slate-500">Generate comprehensive monthly reports with all hospital data.</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <button
                onClick={generateMonthlyReport}
                disabled={loadingMonthlyReport}
                className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-5 w-5" />
                {loadingMonthlyReport ? 'Generating...' : 'View Monthly Report'}
              </button>
              <button
                onClick={downloadMonthlyReport}
                disabled={downloadingReport}
                className="flex items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-5 w-5" />
                {downloadingReport ? 'Downloading...' : 'Download PDF Report'}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">New Patients</p>
                <p className="text-2xl font-bold text-slate-900">{currentMonthlyReport?.summary?.totalNewPatients || 0}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Admissions</p>
                <p className="text-2xl font-bold text-slate-900">{currentMonthlyReport?.summary?.totalAdmissions || 0}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <UserMinus className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Discharges</p>
                <p className="text-2xl font-bold text-slate-900">{currentMonthlyReport?.summary?.totalDischarges || 0}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Revenue</p>
                <p className="text-2xl font-bold text-slate-900">₹{(currentMonthlyReport?.summary?.totalRevenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Report Modal */}
        {showMonthlyReportModal && currentMonthlyReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Monthly Report - {currentMonthlyReport.month}</h3>
                    <p className="text-sm text-slate-500 mt-1">Comprehensive hospital data for the selected month</p>
                  </div>
                  <button
                    onClick={() => setShowMonthlyReportModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Summary */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Monthly Summary</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-blue-50 p-4 rounded-2xl">
                      <p className="text-sm text-blue-600 font-medium">New Patients</p>
                      <p className="text-2xl font-bold text-blue-900">{currentMonthlyReport.summary.totalNewPatients}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl">
                      <p className="text-sm text-green-600 font-medium">Total Admissions</p>
                      <p className="text-2xl font-bold text-green-900">{currentMonthlyReport.summary.totalAdmissions}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl">
                      <p className="text-sm text-red-600 font-medium">Total Discharges</p>
                      <p className="text-2xl font-bold text-red-900">{currentMonthlyReport.summary.totalDischarges}</p>
                    </div>
                  </div>
                </div>

                {/* New Patients */}
                {currentMonthlyReport.newPatients && currentMonthlyReport.newPatients.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">New Patients Registered</h4>
                    <div className="space-y-2">
                      {currentMonthlyReport.newPatients.map((patient, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-2xl">
                          <p className="font-medium text-slate-900">
                            {patient.personalDetails.firstName} {patient.personalDetails.lastName} - {patient.patientId}
                          </p>
                          <p className="text-sm text-slate-500">Registered: {new Date(patient.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admissions */}
                {currentMonthlyReport.admissions && currentMonthlyReport.admissions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Patient Admissions</h4>
                    <div className="space-y-2">
                      {currentMonthlyReport.admissions.map((admission, idx) => (
                        <div key={idx} className="bg-green-50 p-3 rounded-2xl">
                          <p className="font-medium text-slate-900">
                            {admission.patientId?.personalDetails?.firstName} {admission.patientId?.personalDetails?.lastName} - {admission.patientId?.patientId}
                          </p>
                          <p className="text-sm text-slate-600">Date: {new Date(admission.admissionDate).toLocaleDateString()} | Doctor: {admission.admittingDoctor}</p>
                          <p className="text-sm text-slate-500">Reason: {admission.admissionReason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discharges */}
                {currentMonthlyReport.discharges && currentMonthlyReport.discharges.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Patient Discharges</h4>
                    <div className="space-y-2">
                      {currentMonthlyReport.discharges.map((discharge, idx) => (
                        <div key={idx} className="bg-red-50 p-3 rounded-2xl">
                          <p className="font-medium text-slate-900">
                            {discharge.patientId?.personalDetails?.firstName} {discharge.patientId?.personalDetails?.lastName} - {discharge.patientId?.patientId}
                          </p>
                          <p className="text-sm text-slate-600">Date: {new Date(discharge.dischargeDate).toLocaleDateString()} | Doctor: {discharge.admittingDoctor}</p>
                          <p className="text-sm text-slate-500">Reason: {discharge.dischargeReason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Visits */}
                {currentMonthlyReport.visits && currentMonthlyReport.visits.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Medical Visits</h4>
                    <div className="space-y-2">
                      {currentMonthlyReport.visits.map((visit, idx) => (
                        <div key={idx} className="bg-blue-50 p-3 rounded-2xl">
                          <p className="font-medium text-slate-900">{visit.patientName} - {visit.patientId}</p>
                          <p className="text-sm text-slate-600">Date: {new Date(visit.visitDate).toLocaleDateString()} | Doctor: {visit.doctorName}</p>
                          <p className="text-sm text-slate-500">Diagnosis: {visit.diagnosis}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Billing */}
                {currentMonthlyReport.billing && currentMonthlyReport.billing.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Billing Records</h4>
                    <div className="space-y-2">
                      {currentMonthlyReport.billing.map((bill, idx) => (
                        <div key={idx} className="bg-purple-50 p-3 rounded-2xl">
                          <p className="font-medium text-slate-900">{bill.patientName} - {bill.patientId}</p>
                          <p className="text-sm text-slate-600">Invoice: {bill.invoiceId} | Amount: ₹{bill.amount.toLocaleString()} | Status: {bill.status}</p>
                          <p className="text-sm text-slate-500">Date: {new Date(bill.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Today's Payments Modal */}
        {showPaymentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Today's Payments</h3>
                    <p className="text-sm text-slate-500 mt-1">All payment transactions recorded today</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentsModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {dailyPayments.length > 0 ? (
                  <div className="space-y-4">
                    {dailyPayments.map((payment, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{payment.patientName || 'N/A'}</p>
                            <p className="text-sm text-slate-500">{payment.patientId}</p>
                            <p className="text-xs text-slate-500 mt-1">📞 {payment.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">₹{payment.amount.toLocaleString()}</p>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold mt-2 ${
                              payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-500">Invoice: {payment.invoiceId}</p>
                          <p className="text-xs text-slate-500">Date: {new Date(payment.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No payments recorded today.</p>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Today's Total Outstanding:</span>
                  <span className="text-xl font-bold text-blue-600">₹{todayPaymentsTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Currently Admitted Modal */}
        {showAdmittedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Currently Admitted Patients</h3>
                    <p className="text-sm text-slate-500 mt-1">Patients currently in hospital</p>
                  </div>
                  <button
                    onClick={() => setShowAdmittedModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {currentlyAdmittedList.length > 0 ? (
                  <div className="space-y-4">
                    {currentlyAdmittedList.map((admission, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{admission.patientId?.personalDetails?.firstName} {admission.patientId?.personalDetails?.lastName}</p>
                            <p className="text-sm text-slate-500">{admission.patientId?.patientId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-600">Ward: {admission.ward}</p>
                            <p className="text-sm text-slate-500">Bed: {admission.bedNumber}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-500">Admitted: {new Date(admission.admissionDate).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500">Doctor: {admission.admittingDoctor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No patients currently admitted.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admitted Today Modal */}
        {showAdmittedTodayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Admitted Today</h3>
                    <p className="text-sm text-slate-500 mt-1">New admissions today</p>
                  </div>
                  <button
                    onClick={() => setShowAdmittedTodayModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {admittedTodayList.length > 0 ? (
                  <div className="space-y-4">
                    {admittedTodayList.map((admission, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{admission.patientId?.personalDetails?.firstName} {admission.patientId?.personalDetails?.lastName}</p>
                            <p className="text-sm text-slate-500">{admission.patientId?.patientId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-600">{formatTime(admission.admissionDate)}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-500">Reason: {admission.admissionReason}</p>
                          <p className="text-xs text-slate-500">Doctor: {admission.admittingDoctor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No new admissions today.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Discharged Today Modal */}
        {showDischargedTodayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Discharged Today</h3>
                    <p className="text-sm text-slate-500 mt-1">Patients discharged today</p>
                  </div>
                  <button
                    onClick={() => setShowDischargedTodayModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-96">
                {dischargedTodayList.length > 0 ? (
                  <div className="space-y-4">
                    {dischargedTodayList.map((admission, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{admission.patientId?.personalDetails?.firstName} {admission.patientId?.personalDetails?.lastName}</p>
                            <p className="text-sm text-slate-500">{admission.patientId?.patientId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-600">{formatTime(admission.dischargeDate)}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-500">Reason: {admission.dischargeReason}</p>
                          <p className="text-xs text-slate-500">Doctor: {admission.admittingDoctor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No discharges today.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Dashboard;

