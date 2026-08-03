const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const { registerPatient, getPatient, getStats, getBillingRecords, createBillingRecord, markInvoicePaid, addMedicalHistory, quickSearchPatients, downloadInvoicePDF, updateAdmissionStatus, createAdmission, dischargePatient, getPatientAdmissions, getCurrentAdmissions, getMonthlyReport, downloadMonthlyReportPDF } = require('../controllers/patientController');

console.log('Patient routes loaded successfully');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${timestamp}-${safeName}`);
    },
});

const upload = multer({ storage });

// Routes define karein
router.post('/add', registerPatient);
router.put('/admission-status', updateAdmissionStatus);
router.post('/admissions', createAdmission);
router.put('/admissions/discharge', dischargePatient);
router.get('/admissions/:patientId', getPatientAdmissions);
router.get('/admissions', getCurrentAdmissions);
router.get('/test-monthly', (req, res) => {
    res.json({ message: 'Test route works' });
});
router.get('/monthly-report/:year/:month', (req, res, next) => {
    console.log('Monthly report route hit:', req.params);
    next();
}, getMonthlyReport);
router.get('/monthly-report/:year/:month/pdf', (req, res) => {
    console.log('Monthly PDF route hit:', req.params);
    downloadMonthlyReportPDF(req, res);
});
router.get('/search', getPatient);
router.get('/search/quick', quickSearchPatients);
router.get('/stats', getStats);
router.get('/billing', getBillingRecords);
router.post('/billing', createBillingRecord);
router.put('/billing/:patientId/:invoiceId/pay', markInvoicePaid);
router.get('/billing/:patientId/:invoiceId/pdf', downloadInvoicePDF);
router.post('/medical-history', upload.single('reportFile'), addMedicalHistory);

module.exports = router;