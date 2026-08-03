const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  // Unique Identification
  patientId: { 
    type: String, 
    unique: true, 
    required: true,
    default: () => `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}` // Unique ID with timestamp
  },
  
  // Basic Information
  personalDetails: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    phone: { type: String, required: true },
    address: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },

  // Medical Data (Array to store multiple visits)
  medicalHistory: [{
    visitDate: { type: Date, default: Date.now },
    doctorName: String,
    diagnosis: String,
    symptoms: [String],
    vitals: {
      bloodPressure: String,
      weight: Number,
      temperature: Number
    },
    prescriptions: [{
      medicineName: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    labReports: [{
      testName: String,
      result: String,
      fileUrl: String // Cloudinary ya AWS S3 link
    }]
  }],

  // Admission/Discharge Status
  admissionStatus: {
    type: String,
    enum: ['outpatient', 'admitted', 'discharged'],
    default: 'outpatient'
  },
  admissionDate: { type: Date },
  dischargeDate: { type: Date },

  // Billing
  billingRecords: [{
    invoiceId: String,
    amount: Number,
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    date: { type: Date, default: Date.now },
    isFinalInvoice: { type: Boolean, default: false },
    items: [{
      invoiceId: String,
      amount: Number,
      status: String,
      date: Date
    }],
    note: String
  }]

}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Patient', PatientSchema);