import React, { useState } from 'react';
import { getBillingRecords, createBillingRecord, payBillingInvoice, downloadInvoicePDF } from '../api';

const Billing = () => {
  const [searchId, setSearchId] = useState('');
  const [searchType, setSearchType] = useState('patientId'); // patientId, phone, all, status
  const [statusFilter, setStatusFilter] = useState('');
  const [billingRecords, setBillingRecords] = useState([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ patientId: '', amount: '', status: 'Pending' });

  const handleSearch = async () => {
    setError('');
    setBillingLoading(true);

    try {
      let params = {};

      if (searchType === 'patientId') {
        if (!searchId) {
          setError('Please enter a Patient ID to search billing records.');
          return;
        }
        params.patientId = searchId.trim();
      } else if (searchType === 'name') {
        if (!searchId) {
          setError('Please enter a name to search billing records.');
          return;
        }
        params.search = searchId.trim();
      } else if (searchType === 'phone') {
        if (!searchId) {
          setError('Please enter a Phone Number to search billing records.');
          return;
        }
        params.search = searchId.trim(); // Phone search uses the general search parameter
      } else if (searchType === 'status') {
        if (!statusFilter) {
          setError('Please select a status to filter billing records.');
          return;
        }
        params.status = statusFilter;
      } else if (searchType === 'all') {
        if (searchId) {
          params.search = searchId.trim();
        }
        // If no search term, get all records
      }

      const response = await getBillingRecords(params);
      setBillingRecords(response.data.billingRecords || []);
    } catch (err) {
      setBillingRecords([]);
      setError(err.response?.data?.error || 'Unable to load billing records.');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.patientId || !form.amount) {
      setError('Patient ID and amount are required to create an invoice.');
      return;
    }

    setInvoiceLoading(true);
    try {
      const response = await createBillingRecord({
        patientId: form.patientId.trim(),
        amount: Number(form.amount),
        status: form.status,
        generatePDF: true
      });

      if (!response.headers['content-type']?.includes('application/pdf')) {
        throw new Error('Invalid PDF response from server.');
      }

      // Handle PDF download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract invoice ID from response headers or generate one
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'invoice.pdf';
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename=([^;]+)/);
        if (matches) {
          filename = matches[1].replace(/"/g, '');
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setForm({ ...form, amount: '', status: 'Pending' });
      if (form.patientId === searchId) {
        handleSearch();
      }
      alert('Invoice created successfully! PDF downloaded.');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create invoice.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleDownloadPDF = async (record) => {
    try {
      const response = await downloadInvoicePDF(record.patientId, record.invoiceId);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${record.invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Unable to download PDF.');
    }
  };

  const handleMarkPaid = async (record) => {
    setError('');
    try {
      await payBillingInvoice(record.patientId, record.invoiceId);
      handleSearch(); // Refresh the search results
      alert('Invoice marked as paid.');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update invoice.');
    }
  };

  const normalBillingRecords = billingRecords.filter((record) => !record.isFinalInvoice);
  const totalPending = normalBillingRecords.filter((record) => record.status === 'Pending')
    .reduce((sum, record) => sum + (record.amount || 0), 0);
  const totalPaid = normalBillingRecords.filter((record) => record.status === 'Paid')
    .reduce((sum, record) => sum + (record.amount || 0), 0);
  const totalRecords = normalBillingRecords.length;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Billing Management</p>
              <h1 className="mt-3 text-4xl font-extrabold text-slate-900">Invoice & Payment Tracking</h1>
              <p className="mt-2 text-slate-600 max-w-2xl">Search patient billing history, create invoices, and manage payment status all from one place.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Search Billing Records</h2>
              <p className="text-sm text-slate-500 mt-1">Search and filter billing invoices across all patients.</p>

              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="patientId">Search by Patient ID</option>
                    <option value="name">Search by Patient Name</option>
                    <option value="phone">Search by Phone Number</option>
                    <option value="all">Search All Records</option>
                    <option value="status">Filter by Status</option>
                  </select>

                  {searchType === 'status' ? (
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select Status</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      placeholder={
                        searchType === 'patientId'
                          ? "Patient ID (e.g. PAT-1234)"
                          : searchType === 'name'
                          ? "Patient Name (e.g. Raj Kumar)"
                          : searchType === 'phone'
                          ? "Phone Number (e.g. +91 9876543210)"
                          : "Search by ID, name, phone, or invoice ID"
                      }
                      className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  )}

                  <button
                    onClick={handleSearch}
                    className="rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold transition hover:bg-blue-700"
                  >
                    {billingLoading ? 'Loading...' : 'Search'}
                  </button>
                </div>
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Create New Invoice</h2>
                  <p className="text-sm text-slate-500 mt-1">Generate billing for an existing patient record.</p>
                </div>
              </div>
              <form onSubmit={handleCreateInvoice} className="mt-6 grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  placeholder="Patient ID"
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="Amount"
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
                <button
                  type="submit"
                  disabled={invoiceLoading}
                  className={`rounded-2xl px-6 py-3 text-white font-semibold transition ${invoiceLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {invoiceLoading ? 'Saving...' : 'Create Invoice'}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Billing Summary</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Records</p>
                  <p className="mt-4 text-3xl font-bold text-slate-900">{totalRecords}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Pending</p>
                  <p className="mt-4 text-3xl font-bold text-slate-900">₹{totalPending.toFixed(2)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Paid</p>
                  <p className="mt-4 text-3xl font-bold text-slate-900">₹{totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
              {billingRecords.length === 0 ? (
                <p className="mt-4 text-slate-500">No billing records loaded yet. Search by patient ID above.</p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">Invoice ID</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Patient</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Amount</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {billingRecords.map((record) => (
                        <tr key={record.invoiceId}>
                          <td className="px-4 py-4 text-slate-700">{record.invoiceId}</td>
                          <td className="px-4 py-4 text-slate-700">
                            <div>
                              <p className="font-medium">{record.patientName || 'N/A'}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs text-slate-500">{record.patientId}</p>
                                {record.isFinalInvoice && (
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                                    Final Invoice
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-900">₹{record.amount.toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${record.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-500">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDownloadPDF(record)}
                                className="rounded-full bg-blue-600 px-3 py-2 text-white text-sm transition hover:bg-blue-700"
                                title="Download PDF"
                              >
                                📄 PDF
                              </button>
                              {!record.isFinalInvoice && record.status === 'Pending' ? (
                                <button
                                  onClick={() => handleMarkPaid(record)}
                                  className="rounded-full bg-emerald-600 px-3 py-2 text-white text-sm transition hover:bg-emerald-700"
                                >
                                  Mark Paid
                                </button>
                              ) : (
                                <span className="text-slate-500 text-sm">
                                  {record.isFinalInvoice ? 'Final Invoice' : 'Paid'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
