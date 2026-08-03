const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (invoiceData, patientData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(20).font('Helvetica-Bold').text('CPRMS Healthcare', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(16).text('Patient Invoice Receipt', { align: 'center' });
            doc.moveDown(1);

            // Invoice Details
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Invoice Details:', { underline: true });
            doc.moveDown(0.5);

            doc.font('Helvetica');
            doc.text(`Invoice ID: ${invoiceData.invoiceId}`);
            doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString('en-IN')}`);
            doc.text(`Status: ${invoiceData.status}`);
            doc.moveDown(1);

            // Patient Information
            doc.font('Helvetica-Bold');
            doc.text('Patient Information:', { underline: true });
            doc.moveDown(0.5);

            doc.font('Helvetica');
            doc.text(`Patient ID: ${patientData.patientId}`);
            doc.text(`Name: ${patientData.personalDetails.firstName} ${patientData.personalDetails.lastName}`);
            doc.text(`Phone: ${patientData.personalDetails.phone}`);
            if (patientData.personalDetails.address) {
                doc.text(`Address: ${patientData.personalDetails.address}`);
            }
            doc.moveDown(1);

            // Billing Information
            doc.font('Helvetica-Bold');
            doc.text('Billing Information:', { underline: true });
            doc.moveDown(0.5);

            doc.font('Helvetica');
            doc.fontSize(14);
            doc.text(`Total Amount: ₹${invoiceData.amount.toLocaleString('en-IN')}`, { align: 'right' });
            doc.moveDown(0.5);

            if (invoiceData.isFinalInvoice && invoiceData.items && invoiceData.items.length > 0) {
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Final Invoice Summary', { underline: true });
                doc.moveDown(0.5);

                invoiceData.items.forEach((item) => {
                    const itemDate = new Date(item.date).toLocaleDateString('en-IN');
                    doc.font('Helvetica').fontSize(10).text(`${item.invoiceId} | ₹${item.amount.toLocaleString('en-IN')} | ${item.status} | ${itemDate}`);
                });

                doc.moveDown(0.5);
                doc.font('Helvetica-Bold').fontSize(12);
                doc.text(`Grand Total: ₹${invoiceData.amount.toLocaleString('en-IN')}`, { align: 'right' });
                doc.moveDown(0.5);
            }

            // Payment Status
            const statusColor = invoiceData.status === 'Paid' ? 'green' : 'red';
            doc.fillColor(statusColor).font('Helvetica-Bold');
            doc.text(`Payment Status: ${invoiceData.status}`, { align: 'center' });
            doc.fillColor('black');
            doc.moveDown(1);

            // Footer
            doc.fontSize(10).font('Helvetica');
            doc.text('Thank you for choosing CPRMS Healthcare!', { align: 'center' });
            doc.moveDown(0.5);
            doc.text('For any queries, please contact our billing department.', { align: 'center' });
            doc.moveDown(0.5);
            doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

            // Add border/frame
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

const generateMonthlyReportPDF = (reportData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('CPRMS Healthcare', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(18).text('Monthly Report', { align: 'center' });
            doc.fontSize(14).text(`Month: ${reportData.month}`, { align: 'center' });
            doc.moveDown(1);

            // Summary Section
            doc.fontSize(16).font('Helvetica-Bold');
            doc.text('Monthly Summary', { underline: true });
            doc.moveDown(0.5);

            doc.font('Helvetica').fontSize(12);
            const summary = reportData.summary;
            doc.text(`Total New Patients: ${summary.totalNewPatients}`);
            doc.text(`Total Admissions: ${summary.totalAdmissions}`);
            doc.text(`Total Discharges: ${summary.totalDischarges}`);
            doc.text(`Total Medical Visits: ${summary.totalVisits}`);
            doc.text(`Total Revenue: ₹${summary.totalRevenue.toLocaleString('en-IN')}`);
            doc.text(`Pending Revenue: ₹${summary.pendingRevenue.toLocaleString('en-IN')}`);
            doc.moveDown(1);

            // New Patients Section
            if (reportData.newPatients && reportData.newPatients.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold');
                doc.text('New Patients Registered', { underline: true });
                doc.moveDown(0.5);

                doc.font('Helvetica').fontSize(10);
                reportData.newPatients.forEach((patient, index) => {
                    doc.text(`${index + 1}. ${patient.personalDetails.firstName} ${patient.personalDetails.lastName} (${patient.patientId}) - ${new Date(patient.createdAt).toLocaleDateString('en-IN')}`);
                });
                doc.moveDown(1);
            }

            // Check if we need a new page
            if (doc.y > 600) {
                doc.addPage();
            }

            // Admissions Section
            if (reportData.admissions && reportData.admissions.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold');
                doc.text('Patient Admissions', { underline: true });
                doc.moveDown(0.5);

                doc.font('Helvetica').fontSize(10);
                reportData.admissions.forEach((admission, index) => {
                    const patientName = admission.patientId ? `${admission.patientId.personalDetails.firstName} ${admission.patientId.personalDetails.lastName}` : 'Unknown';
                    doc.text(`${index + 1}. ${patientName} (${admission.patientId?.patientId})`);
                    doc.text(`   Date: ${new Date(admission.admissionDate).toLocaleDateString('en-IN')} | Doctor: ${admission.admittingDoctor} | Ward: ${admission.ward}`);
                    if (admission.admissionReason) {
                        doc.text(`   Reason: ${admission.admissionReason}`);
                    }
                    doc.moveDown(0.3);
                });
                doc.moveDown(1);
            }

            // Check if we need a new page
            if (doc.y > 600) {
                doc.addPage();
            }

            // Discharges Section
            if (reportData.discharges && reportData.discharges.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold');
                doc.text('Patient Discharges', { underline: true });
                doc.moveDown(0.5);

                doc.font('Helvetica').fontSize(10);
                reportData.discharges.forEach((discharge, index) => {
                    const patientName = discharge.patientId ? `${discharge.patientId.personalDetails.firstName} ${discharge.patientId.personalDetails.lastName}` : 'Unknown';
                    doc.text(`${index + 1}. ${patientName} (${discharge.patientId?.patientId})`);
                    doc.text(`   Date: ${new Date(discharge.dischargeDate).toLocaleDateString('en-IN')} | Doctor: ${discharge.admittingDoctor}`);
                    if (discharge.dischargeReason) {
                        doc.text(`   Reason: ${discharge.dischargeReason}`);
                    }
                    doc.moveDown(0.3);
                });
                doc.moveDown(1);
            }

            // Check if we need a new page
            if (doc.y > 600) {
                doc.addPage();
            }

            // Medical Visits Section
            if (reportData.visits && reportData.visits.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold');
                doc.text('Medical Visits', { underline: true });
                doc.moveDown(0.5);

                doc.font('Helvetica').fontSize(10);
                reportData.visits.forEach((visit, index) => {
                    doc.text(`${index + 1}. ${visit.patientName} (${visit.patientId})`);
                    doc.text(`   Date: ${new Date(visit.visitDate).toLocaleDateString('en-IN')} | Doctor: ${visit.doctorName}`);
                    if (visit.diagnosis) {
                        doc.text(`   Diagnosis: ${visit.diagnosis}`);
                    }
                    if (visit.symptoms && visit.symptoms.length > 0) {
                        doc.text(`   Symptoms: ${visit.symptoms.join(', ')}`);
                    }
                    doc.moveDown(0.3);
                });
                doc.moveDown(1);
            }

            // Check if we need a new page
            if (doc.y > 600) {
                doc.addPage();
            }

            // Billing Section
            if (reportData.billing && reportData.billing.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold');
                doc.text('Billing Records', { underline: true });
                doc.moveDown(0.5);

                doc.font('Helvetica').fontSize(10);
                reportData.billing.forEach((bill, index) => {
                    doc.text(`${index + 1}. ${bill.patientName} (${bill.patientId})`);
                    doc.text(`   Invoice: ${bill.invoiceId} | Amount: ₹${bill.amount.toLocaleString('en-IN')} | Status: ${bill.status}`);
                    doc.text(`   Date: ${new Date(bill.date).toLocaleDateString('en-IN')}`);
                    doc.moveDown(0.3);
                });
                doc.moveDown(1);
            }

            // Footer
            doc.fontSize(10).font('Helvetica');
            doc.text('Generated by CPRMS Healthcare Management System', { align: 'center' });
            doc.moveDown(0.5);
            doc.text(`Report generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

            // Add border/frame
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoicePDF, generateMonthlyReportPDF };