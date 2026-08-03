const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Admission = require('../models/Admission');
const { generateInvoicePDF, generateMonthlyReportPDF } = require('../utils/pdfGenerator');
const PDFDocument = require('pdfkit');

// 1. Naya Patient Register Karna
exports.registerPatient = async (req, res) => {
    try {
        const newPatient = new Patient(req.body);
        const savedPatient = await newPatient.save();
        res.status(201).json({ success: true, data: savedPatient });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Update patient admission status
exports.updateAdmissionStatus = async (req, res) => {
    try {
        const { patientId, status, admissionDate, dischargeDate } = req.body;

        if (!patientId || !status) {
            return res.status(400).json({ error: 'patientId and status are required' });
        }

        const updateData = { admissionStatus: status };

        if (status === 'admitted' && admissionDate) {
            updateData.admissionDate = new Date(admissionDate);
        } else if (status === 'discharged' && dischargeDate) {
            updateData.dischargeDate = new Date(dischargeDate);
        }

        const patient = await Patient.findOneAndUpdate(
            { patientId },
            updateData,
            { new: true }
        );

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({ success: true, data: patient });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create new admission record
exports.createAdmission = async (req, res) => {
    try {
        const admissionData = req.body;

        // Check if patient exists
        const patient = await Patient.findOne({ patientId: admissionData.patientId });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Check if patient is already admitted
        const existingAdmission = await Admission.findOne({
            patientId: patient._id,
            status: 'admitted'
        });

        if (existingAdmission) {
            return res.status(400).json({ error: 'Patient is already admitted' });
        }

        const newAdmission = new Admission({
            ...admissionData,
            patientId: patient._id // Store ObjectId reference
        });
        const savedAdmission = await newAdmission.save();

        res.status(201).json({ success: true, data: savedAdmission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Discharge patient
exports.dischargePatient = async (req, res) => {
    try {
        const { patientId, dischargeReason, dischargeNotes, dischargeDate } = req.body;

        // Find patient first to get ObjectId
        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const admission = await Admission.findOneAndUpdate(
            { patientId: patient._id, status: 'admitted' },
            {
                status: 'discharged',
                dischargeDate: dischargeDate ? new Date(dischargeDate) : new Date(),
                dischargeReason,
                dischargeNotes
            },
            { new: true }
        );

        if (!admission) {
            return res.status(404).json({ error: 'Active admission not found for this patient' });
        }

        res.json({ success: true, data: admission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get admission history for a patient
exports.getPatientAdmissions = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Find patient first to get ObjectId
        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const admissions = await Admission.find({
            $or: [
                { patientId: patient._id },
                { patientId: patient.patientId }
            ]
        }).sort({ admissionDate: -1 });

        res.json({ success: true, data: admissions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all current admissions
exports.getCurrentAdmissions = async (req, res) => {
    try {
        const admissionsWithPatientData = await getAdmissionsWithPatientData({ status: 'admitted' });
        res.json({ success: true, data: admissionsWithPatientData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Patient Search Karna (By ID or Phone)
exports.getPatient = async (req, res) => {
    try {
        const { search } = req.query; // URL query se search term lega
        const patient = await Patient.findOne({
            $or: [
                { patientId: search },
                { 'personalDetails.phone': search }
            ]
        });
        
        if (!patient) return res.status(404).json({ message: "Patient nahi mila" });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.quickSearchPatients = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Query parameter q required' });
        }

        const regex = new RegExp(q, 'i');
        const results = await Patient.find({
            $or: [
                { patientId: regex },
                { 'personalDetails.phone': regex },
                { 'personalDetails.firstName': regex },
                { 'personalDetails.lastName': regex }
            ]
        })
        .limit(50)
        .select('patientId personalDetails.firstName personalDetails.lastName personalDetails.phone');

        res.json({ results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Helper function to get admissions with patient data
const getAdmissionsWithPatientData = async (query) => {
    const admissions = await Admission.find(query).select('patientId admissionDate dischargeDate admittingDoctor ward bedNumber admissionReason dischargeReason');

    const admissionsWithPatientData = await Promise.all(
        admissions.map(async (admission) => {
            let patient = null;
            const pid = admission.patientId;

            if (pid && mongoose.isValidObjectId(pid)) {
                patient = await Patient.findById(pid)
                    .select('personalDetails.firstName personalDetails.lastName patientId');
            } else if (typeof pid === 'string') {
                patient = await Patient.findOne({ patientId: pid })
                    .select('personalDetails.firstName personalDetails.lastName patientId');
            }

            return {
                ...admission.toObject(),
                patientId: patient
            };
        })
    );

    return admissionsWithPatientData;
};

// 3. Dashboard statistics
exports.getStats = async (req, res) => {
    try {
        // Total registered patients
        const totalPatients = await Patient.countDocuments();

        // Today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all patients with medical history
        const allPatients = await Patient.find({}).select('patientId personalDetails medicalHistory billingRecords createdAt');

        // Calculate admission/discharge statistics from Admission collection
        const currentlyAdmitted = await Admission.countDocuments({ status: 'admitted' });

        const todayAdmissions = await Admission.find({
          admissionDate: { $gte: today, $lt: tomorrow }
        }).select('patientId admissionDate admittingDoctor admissionReason');

        const todayDischarges = await Admission.find({
          dischargeDate: { $gte: today, $lt: tomorrow },
          status: 'discharged'
        }).select('patientId dischargeDate admittingDoctor dischargeReason');

        const admittedToday = todayAdmissions.length;
        const dischargedToday = todayDischarges.length;

        // Filter today's visited patients (based on medical history visits)
        const todayVisited = [];
        const recentPatients = [];
        const dailyPayments = [];

        allPatients.forEach(patient => {
            // Check whether the patient was registered today or had a medical visit today
            const registeredToday = patient.createdAt && new Date(patient.createdAt).setHours(0, 0, 0, 0) === today.getTime();
            let todayVisitEntry = null;

            if (patient.medicalHistory && patient.medicalHistory.length > 0) {
                const todayVisits = patient.medicalHistory.filter(visit => {
                    const visitDate = new Date(visit.visitDate);
                    visitDate.setHours(0, 0, 0, 0);
                    return visitDate.getTime() === today.getTime();
                });

                if (todayVisits.length > 0) {
                    todayVisitEntry = {
                        patientId: patient.patientId,
                        patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                        phone: patient.personalDetails.phone,
                        diagnosis: todayVisits[0].diagnosis || 'New visit',
                        visitTime: todayVisits[0].visitDate,
                        doctorName: todayVisits[0].doctorName || 'Registration'
                    };
                }

                // Add to recent patients (last 10 visits regardless of date)
                recentPatients.push({
                    patientId: patient.patientId,
                    patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                    phone: patient.personalDetails.phone,
                    diagnosis: patient.medicalHistory[0].diagnosis,
                    lastVisit: patient.medicalHistory[0].visitDate,
                    doctorName: patient.medicalHistory[0].doctorName,
                    status: patient.medicalHistory[0].diagnosis ? 'In Treatment' : 'Pending'
                });
            }

            if (registeredToday && !todayVisitEntry) {
                todayVisitEntry = {
                    patientId: patient.patientId,
                    patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                    phone: patient.personalDetails.phone,
                    diagnosis: 'New registration',
                    visitTime: patient.createdAt,
                    doctorName: 'Registration'
                };
            }

            if (todayVisitEntry) {
                todayVisited.push(todayVisitEntry);
            }

            // Check for today's billing payments
            if (patient.billingRecords && patient.billingRecords.length > 0) {
                const todayPayments = patient.billingRecords.filter(payment => {
                    const paymentDate = new Date(payment.date);
                    paymentDate.setHours(0, 0, 0, 0);
                    return paymentDate.getTime() === today.getTime();
                });

                todayPayments.forEach(payment => {
                    dailyPayments.push({
                        patientId: patient.patientId,
                        patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                        invoiceId: payment.invoiceId,
                        amount: payment.amount,
                        status: payment.status,
                        date: payment.date,
                        phone: patient.personalDetails.phone
                    });
                });
            }
        });

        // Sort recent patients by last visit date (descending) and limit to 10
        recentPatients.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
        const topRecentPatients = recentPatients.slice(0, 10);

        // Sort daily payments by date (descending)
        dailyPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Calculate today's payment totals: TOTAL PAYMENT = TOTAL PENDING - TOTAL PAID
        const todayPendingTotal = dailyPayments
            .filter(p => p.status === 'Pending')
            .reduce((sum, p) => sum + p.amount, 0);

        const todayPaidTotal = dailyPayments
            .filter(p => p.status === 'Paid')
            .reduce((sum, p) => sum + p.amount, 0);

        const todayPaymentsTotal = todayPendingTotal - todayPaidTotal;

        res.json({
            totalPatients,
            todayVisited: todayVisited.length,
            todayVisitedList: todayVisited,
            recentPatients: topRecentPatients,
            dailyPayments,
            todayPaymentsTotal,
            currentlyAdmitted,
            admittedToday,
            dischargedToday,
            currentlyAdmittedList: await getAdmissionsWithPatientData({ status: 'admitted' }),
            admittedTodayList: await getAdmissionsWithPatientData({
                admissionDate: { $gte: today, $lt: tomorrow }
            }),
            dischargedTodayList: await getAdmissionsWithPatientData({
                dischargeDate: { $gte: today, $lt: tomorrow },
                status: 'discharged'
            })
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Medical history add karna (Doctor portal ke liye)
exports.addMedicalHistory = async (req, res) => {
    try {
        const { patientId, doctorName, diagnosis, symptoms, prescriptions } = req.body;
        if (!patientId || !doctorName || !diagnosis) {
            return res.status(400).json({ error: 'patientId, doctorName, and diagnosis are required' });
        }

        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const historyEntry = {
            visitDate: new Date(),
            doctorName,
            diagnosis,
            symptoms: symptoms ? symptoms.split(',').map((item) => item.trim()).filter(Boolean) : [],
            prescriptions: prescriptions ? prescriptions.split(',').map((item) => item.trim()).filter(Boolean).map((medicine) => ({ medicineName: medicine, dosage: '', frequency: '', duration: '' })) : [],
            labReports: []
        };

        if (req.file) {
            historyEntry.labReports = [{
                testName: req.file.originalname,
                result: 'Uploaded document',
                fileUrl: `/uploads/${req.file.filename}`
            }];
        }

        patient.medicalHistory = patient.medicalHistory || [];
        patient.medicalHistory.unshift(historyEntry);
        await patient.save();

        res.status(201).json({ success: true, historyEntry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Billing records fetch karna (by patientId or search all)
exports.getBillingRecords = async (req, res) => {
    try {
        const { patientId, status, search } = req.query;

        if (patientId) {
            // Get billing records for specific patient
            const patient = await Patient.findOne({ patientId });
            if (!patient) return res.status(404).json({ error: 'Patient not found' });

            const billingRecords = (patient.billingRecords || []).map((record) => ({
                ...record.toObject(),
                patientId: patient.patientId,
                patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                patientPhone: patient.personalDetails.phone
            }));

            return res.json({ billingRecords });
        }

        if (search) {
            // Search across all patients' billing records
            const regex = new RegExp(search, 'i');
const nameQueries = search.trim().split(/\s+/).map((part) => ({
            $or: [
                { 'personalDetails.firstName': new RegExp(part, 'i') },
                { 'personalDetails.lastName': new RegExp(part, 'i') }
            ]
        }));

        const patients = await Patient.find({
            $or: [
                { patientId: regex },
                { 'personalDetails.phone': regex },
                { 'billingRecords.invoiceId': regex },
                ...nameQueries
            ]
        }).select('patientId personalDetails billingRecords');

        const allBillingRecords = [];
        patients.forEach(patient => {
            if (patient.billingRecords) {
                patient.billingRecords.forEach(record => {
                    const fullName = `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`;
                    if (regex.test(record.invoiceId) ||
                        regex.test(patient.patientId) ||
                        regex.test(patient.personalDetails.firstName) ||
                        regex.test(patient.personalDetails.lastName) ||
                        regex.test(patient.personalDetails.phone) ||
                        regex.test(fullName)) {
                        allBillingRecords.push({
                            ...record.toObject(),
                            patientId: patient.patientId,
                            patientName: fullName,
                            patientPhone: patient.personalDetails.phone
                        });
                    }
                });
            }
        });

            return res.json({ billingRecords: allBillingRecords });
        }

        if (status) {
            // Get all billing records with specific status
            const patients = await Patient.find({
                'billingRecords.status': status
            }).select('patientId personalDetails billingRecords');

            const filteredRecords = [];
            patients.forEach(patient => {
                patient.billingRecords.forEach(record => {
                    if (record.status === status) {
                        filteredRecords.push({
                            ...record.toObject(),
                            patientId: patient.patientId,
                            patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                            patientPhone: patient.personalDetails.phone
                        });
                    }
                });
            });

            return res.json({ billingRecords: filteredRecords });
        }

        // Get all billing records if no specific query
        const patients = await Patient.find({ 'billingRecords.0': { $exists: true } })
            .select('patientId personalDetails billingRecords');

        const allRecords = [];
        patients.forEach(patient => {
            patient.billingRecords.forEach(record => {
                allRecords.push({
                    ...record.toObject(),
                    patientId: patient.patientId,
                    patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                    patientPhone: patient.personalDetails.phone
                });
            });
        });

        res.json({ billingRecords: allRecords });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. New billing record create karna (with PDF generation)
exports.createBillingRecord = async (req, res) => {
    try {
        const { patientId, amount, status, generatePDF = true } = req.body;
        if (!patientId || amount == null) {
            return res.status(400).json({ error: 'patientId and amount are required' });
        }

        const patient = await Patient.findOne({ patientId });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const invoiceId = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
        const billingEntry = {
            invoiceId,
            amount,
            status: status || 'Pending',
            date: new Date()
        };

        patient.billingRecords = patient.billingRecords || [];
        patient.billingRecords.push(billingEntry);
        await patient.save();

        // If this invoice completes all payments for the patient, create a final summary invoice
        if (billingEntry.status === 'Paid') {
            const patientAfterSave = await Patient.findOne({ patientId });
            const unpaidInvoices = patientAfterSave.billingRecords.filter((record) => !record.isFinalInvoice && record.status === 'Pending');
            const existingFinal = patientAfterSave.billingRecords.find((record) => record.isFinalInvoice);

            if (unpaidInvoices.length === 0 && !existingFinal) {
                const invoiceItems = patientAfterSave.billingRecords
                    .filter((record) => !record.isFinalInvoice)
                    .map((record) => ({
                        invoiceId: record.invoiceId,
                        amount: record.amount,
                        status: record.status,
                        date: record.date
                    }));

                const finalInvoice = {
                    invoiceId: `FINAL-${patient.patientId}-${Date.now()}`,
                    amount: invoiceItems.reduce((sum, item) => sum + (item.amount || 0), 0),
                    status: 'Paid',
                    date: new Date(),
                    isFinalInvoice: true,
                    items: invoiceItems,
                    note: 'Final invoice generated after all bills were paid.'
                };

                patientAfterSave.billingRecords.push(finalInvoice);
                await patientAfterSave.save();
            }
        }

        // Generate PDF if requested
        if (generatePDF) {
            try {
                const pdfBuffer = await generateInvoicePDF(billingEntry, patient);

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
                res.setHeader('Content-Length', pdfBuffer.length);

                res.send(pdfBuffer);
                return;
            } catch (pdfError) {
                console.error('PDF generation error:', pdfError);
                // Continue with JSON response if PDF fails
            }
        }

        res.status(201).json({ success: true, billingEntry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. Invoice paid mark karna
exports.markInvoicePaid = async (req, res) => {
    try {
        const { patientId, invoiceId } = req.params;
        const patient = await Patient.findOne({ patientId });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const invoice = patient.billingRecords.find((record) => record.invoiceId === invoiceId);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        invoice.status = 'Paid';
        await patient.save();

        // If patient has no more pending invoices, create a final summary invoice
        const unpaidInvoices = patient.billingRecords.filter((record) => !record.isFinalInvoice && record.status === 'Pending');
        let finalInvoice = null;

        if (unpaidInvoices.length === 0) {
            const existingFinal = patient.billingRecords.find((record) => record.isFinalInvoice);

            if (!existingFinal) {
                const invoiceItems = patient.billingRecords
                    .filter((record) => !record.isFinalInvoice)
                    .map((record) => ({
                        invoiceId: record.invoiceId,
                        amount: record.amount,
                        status: record.status,
                        date: record.date
                    }));

                finalInvoice = {
                    invoiceId: `FINAL-${patient.patientId}-${Date.now()}`,
                    amount: invoiceItems.reduce((sum, item) => sum + (item.amount || 0), 0),
                    status: 'Paid',
                    date: new Date(),
                    isFinalInvoice: true,
                    items: invoiceItems,
                    note: 'Final invoice generated after all bills were paid.'
                };

                patient.billingRecords.push(finalInvoice);
                await patient.save();
            }
        }

        return res.json({ success: true, invoice, finalInvoice });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 7. Invoice PDF download karna
exports.downloadInvoicePDF = async (req, res) => {
    try {
        const { patientId, invoiceId } = req.params;

        const patient = await Patient.findOne({ patientId });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const invoice = patient.billingRecords.find((record) => record.invoiceId === invoiceId);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        const pdfBuffer = await generateInvoicePDF(invoice, patient);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get monthly report data
exports.getMonthlyReport = async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS
        const endDate = new Date(year, month, 1);

        // Get all patients registered in the month
        const newPatients = await Patient.find({
            createdAt: { $gte: startDate, $lt: endDate }
        }).select('patientId personalDetails createdAt');

        // Get all admissions in the month
        const monthlyAdmissions = await getAdmissionsWithPatientData({
            admissionDate: { $gte: startDate, $lt: endDate }
        });

        // Get all discharges in the month
        const monthlyDischarges = await getAdmissionsWithPatientData({
            dischargeDate: { $gte: startDate, $lt: endDate },
            status: 'discharged'
        });

        // Get all medical visits in the month
        const monthlyVisits = [];
        const patientsWithVisits = await Patient.find({
            'medicalHistory.visitDate': { $gte: startDate, $lt: endDate }
        }).select('patientId personalDetails medicalHistory');

        patientsWithVisits.forEach(patient => {
            const visits = patient.medicalHistory.filter(visit => {
                const visitDate = new Date(visit.visitDate);
                return visitDate >= startDate && visitDate < endDate;
            });

            visits.forEach(visit => {
                monthlyVisits.push({
                    patientId: patient.patientId,
                    patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                    visitDate: visit.visitDate,
                    doctorName: visit.doctorName,
                    diagnosis: visit.diagnosis,
                    symptoms: visit.symptoms,
                    prescriptions: visit.prescriptions
                });
            });
        });

        // Get all billing records for the month
        const monthlyBilling = [];
        const patientsWithBilling = await Patient.find({
            'billingRecords.date': { $gte: startDate, $lt: endDate }
        }).select('patientId personalDetails billingRecords');

        patientsWithBilling.forEach(patient => {
            const bills = patient.billingRecords.filter(bill => {
                const billDate = new Date(bill.date);
                return billDate >= startDate && billDate < endDate;
            });

            bills.forEach(bill => {
                monthlyBilling.push({
                    patientId: patient.patientId,
                    patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                    invoiceId: bill.invoiceId,
                    amount: bill.amount,
                    status: bill.status,
                    date: bill.date
                });
            });
        });

        // Calculate monthly statistics
        const totalNewPatients = newPatients.length;
        const totalAdmissions = monthlyAdmissions.length;
        const totalDischarges = monthlyDischarges.length;
        const totalVisits = monthlyVisits.length;
        const totalRevenue = monthlyBilling
            .filter(bill => bill.status === 'Paid')
            .reduce((sum, bill) => sum + bill.amount, 0);
        const pendingRevenue = monthlyBilling
            .filter(bill => bill.status === 'Pending')
            .reduce((sum, bill) => sum + bill.amount, 0);

        res.json({
            month: `${year}-${month.padStart(2, '0')}`,
            summary: {
                totalNewPatients,
                totalAdmissions,
                totalDischarges,
                totalVisits,
                totalRevenue,
                pendingRevenue
            },
            newPatients,
            admissions: monthlyAdmissions,
            discharges: monthlyDischarges,
            visits: monthlyVisits,
            billing: monthlyBilling
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Download monthly report PDF
exports.downloadMonthlyReportPDF = async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        // Get all patients registered in the month
        const newPatients = await Patient.find({
            createdAt: { $gte: startDate, $lt: endDate }
        }).select('patientId personalDetails createdAt');

        // Get all admissions in the month
        const monthlyAdmissions = await getAdmissionsWithPatientData({
            admissionDate: { $gte: startDate, $lt: endDate }
        });

        // Get all discharges in the month
        const monthlyDischarges = await getAdmissionsWithPatientData({
            dischargeDate: { $gte: startDate, $lt: endDate },
            status: 'discharged'
        });

        // Get all medical visits in the month
        const monthlyVisits = [];
        const patientsWithVisits = await Patient.find({
            'medicalHistory.visitDate': { $gte: startDate, $lt: endDate }
        }).select('patientId personalDetails medicalHistory');

        patientsWithVisits.forEach(patient => {
            const visits = patient.medicalHistory.filter(visit => {
                const visitDate = new Date(visit.visitDate);
                return visitDate >= startDate && visitDate < endDate;
            });

            visits.forEach(visit => {
                monthlyVisits.push({
                    patientId: patient.patientId,
                    patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                    visitDate: visit.visitDate,
                    doctorName: visit.doctorName,
                    diagnosis: visit.diagnosis,
                    symptoms: visit.symptoms,
                    prescriptions: visit.prescriptions
                });
            });
        });

        // Get all billing records for the month
        const monthlyBilling = [];
        const patientsWithBilling = await Patient.find({
            'billingRecords.date': { $gte: startDate, $lt: endDate }
        }).select('patientId personalDetails billingRecords');

        patientsWithBilling.forEach(patient => {
            const bills = patient.billingRecords.filter(bill => {
                const billDate = new Date(bill.date);
                return billDate >= startDate && billDate < endDate;
            });

            bills.forEach(bill => {
                monthlyBilling.push({
                    patientId: patient.patientId,
                    patientName: `${patient.personalDetails.firstName} ${patient.personalDetails.lastName}`,
                    invoiceId: bill.invoiceId,
                    amount: bill.amount,
                    status: bill.status,
                    date: bill.date
                });
            });
        });

        // Calculate monthly statistics
        const totalNewPatients = newPatients.length;
        const totalAdmissions = monthlyAdmissions.length;
        const totalDischarges = monthlyDischarges.length;
        const totalVisits = monthlyVisits.length;
        const totalRevenue = monthlyBilling
            .filter(bill => bill.status === 'Paid')
            .reduce((sum, bill) => sum + bill.amount, 0);
        const pendingRevenue = monthlyBilling
            .filter(bill => bill.status === 'Pending')
            .reduce((sum, bill) => sum + bill.amount, 0);

        const reportData = {
            month: `${year}-${month.padStart(2, '0')}`,
            summary: {
                totalNewPatients,
                totalAdmissions,
                totalDischarges,
                totalVisits,
                totalRevenue,
                pendingRevenue
            },
            newPatients,
            admissions: monthlyAdmissions,
            discharges: monthlyDischarges,
            visits: monthlyVisits,
            billing: monthlyBilling
        };

        const pdfBuffer = await generateMonthlyReportPDF(reportData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=monthly-report-${year}-${month}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};