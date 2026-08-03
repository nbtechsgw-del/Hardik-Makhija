import axios from 'axios';

// Keep API base URL in sync with backend server.js (default: 5000)
// Using relative URLs since proxy is configured in package.json
const API_BASE_URL = '/api/patients';

// Axios interceptor to add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Register new patient
export const registerPatient = async (payload) => {
  return axios.post(`${API_BASE_URL}/add`, payload);
};

// Search patient by patientId or phone
export const getPatientData = async (search) => {
  return axios.get(`${API_BASE_URL}/search`, {
    params: { search },
  });
};

export const quickSearchPatients = async (query) => {
  return axios.get(`${API_BASE_URL}/search/quick`, {
    params: { q: query },
  });
};

// Fetch dashboard statistics
export const getDashboardStats = async () => {
  return axios.get(`${API_BASE_URL}/stats`);
};

// Billing API
export const getBillingRecords = async (params = {}) => {
  return axios.get(`${API_BASE_URL}/billing`, {
    params,
  });
};

export const createBillingRecord = async (payload) => {
  return axios.post(`${API_BASE_URL}/billing`, payload, {
    responseType: 'blob' // For PDF download
  });
};

export const payBillingInvoice = async (patientId, invoiceId) => {
  return axios.put(`${API_BASE_URL}/billing/${patientId}/${invoiceId}/pay`, null);
};

export const downloadInvoicePDF = async (patientId, invoiceId) => {
  return axios.get(`${API_BASE_URL}/billing/${patientId}/${invoiceId}/pdf`, {
    responseType: 'blob'
  });
};

export const addMedicalHistory = async (payload) => {
  return axios.post(`${API_BASE_URL}/medical-history`, payload);
};

export const updateAdmissionStatus = async (payload) => {
  return axios.put(`${API_BASE_URL}/admission-status`, payload);
};

export const createAdmission = async (payload) => {
  return axios.post(`${API_BASE_URL}/admissions`, payload);
};

export const dischargePatient = async (payload) => {
  return axios.put(`${API_BASE_URL}/admissions/discharge`, payload);
};

export const getPatientAdmissions = async (patientId) => {
  return axios.get(`${API_BASE_URL}/admissions/${patientId}`);
};

export const getCurrentAdmissions = async () => {
  return axios.get(`${API_BASE_URL}/admissions`);
};

// Monthly Reports API
export const getMonthlyReport = async (year, month) => {
  return axios.get(`${API_BASE_URL}/monthly-report/${year}/${month}`);
};

export const downloadMonthlyReportPDF = async (year, month) => {
  return axios.get(`${API_BASE_URL}/monthly-report/${year}/${month}/pdf`, {
    responseType: 'blob'
  });
};

