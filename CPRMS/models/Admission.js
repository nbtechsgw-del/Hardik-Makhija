const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.Mixed, // Allow both String and ObjectId during transition
    required: true,
    ref: 'Patient'
  },

  // Admission Details
  admissionDate: {
    type: Date,
    required: true,
    default: Date.now
  },

  dischargeDate: {
    type: Date
  },

  // Status
  status: {
    type: String,
    enum: ['admitted', 'discharged'],
    default: 'admitted'
  },

  // Hospital Details
  ward: {
    type: String,
    enum: ['General', 'ICU', 'Emergency', 'Maternity', 'Pediatric', 'Surgical', 'Medical'],
    default: 'General'
  },

  bedNumber: {
    type: String
  },

  roomNumber: {
    type: String
  },

  // Medical Details
  admittingDoctor: {
    type: String,
    required: true
  },

  admissionReason: {
    type: String,
    required: true
  },

  diagnosis: {
    type: String
  },

  dischargeReason: {
    type: String
  },

  // Treatment Details
  treatment: {
    type: String
  },

  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],

  // Financial
  estimatedCost: {
    type: Number,
    default: 0
  },

  // Notes
  admissionNotes: {
    type: String
  },

  dischargeNotes: {
    type: String
  },

  // Emergency Contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }

}, {
  timestamps: true
});

// Index for better query performance
AdmissionSchema.index({ patientId: 1, status: 1 });
AdmissionSchema.index({ admissionDate: -1 });
AdmissionSchema.index({ dischargeDate: -1 });

module.exports = mongoose.model('Admission', AdmissionSchema);