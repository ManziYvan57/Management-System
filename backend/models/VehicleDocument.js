const mongoose = require('mongoose');

const VehicleDocumentSchema = new mongoose.Schema({
  // Reference to the vehicle
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle reference is required']
  },

  // Document type and category
  documentType: {
    type: String,
    required: [true, 'Document type is required'],
    enum: [
      'insurance',
      'technical_control',
      'registration',
      'inspection_certificate',
      'emission_test',
      'safety_certificate',
      'compliance_certificate',
      'other'
    ]
  },

  // Document details
  documentNumber: {
    type: String,
    required: [true, 'Document number is required'],
    trim: true
  },

  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  // Issuing authority and provider
  issuingAuthority: {
    type: String,
    required: [true, 'Issuing authority is required'],
    trim: true
  },

  provider: {
    type: String,
    trim: true
  },

  // Document dates
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required']
  },

  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },

  // Document status
  status: {
    type: String,
    enum: ['active', 'expired', 'pending_renewal', 'suspended', 'cancelled'],
    default: 'active'
  },

  // Document-specific fields (optional for now)
  insurance: {
    policyType: {
      type: String,
      enum: ['comprehensive', 'third_party', 'third_party_fire_theft', 'other']
    },
    coverageAmount: {
      type: Number,
      min: [0, 'Coverage amount cannot be negative']
    },
    premium: {
      type: Number,
      min: [0, 'Premium cannot be negative']
    },
    deductible: {
      type: Number,
      min: [0, 'Deductible cannot be negative']
    }
  },

  technicalControl: {
    inspectionType: {
      type: String,
      enum: ['annual', 'bi_annual', 'quarterly', 'monthly', 'other']
    },
    inspectionResult: {
      type: String,
      enum: ['passed', 'failed', 'conditional_pass', 'pending'],
      default: 'pending'
    },
    inspector: {
      type: String,
      trim: true
    },
    inspectionCenter: {
      type: String,
      trim: true
    },
    nextInspectionDate: {
      type: Date
    }
  },

  // File attachments
  attachments: [{
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Renewal and notification settings
  renewalReminder: {
    enabled: {
      type: Boolean,
      default: true
    },
    reminderDays: {
      type: Number,
      default: 30,
      min: [1, 'Reminder days must be at least 1'],
      max: [365, 'Reminder days cannot exceed 365']
    },
    lastReminderSent: {
      type: Date
    }
  },

  // Notes and additional information
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Compliance tracking
  complianceStatus: {
    type: String,
    enum: ['compliant', 'non_compliant', 'pending_review', 'under_review'],
    default: 'pending_review'
  },

  complianceNotes: {
    type: String,
    trim: true
  },

  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
VehicleDocumentSchema.index({ vehicle: 1, documentType: 1 });
VehicleDocumentSchema.index({ vehicle: 1, status: 1 });
VehicleDocumentSchema.index({ expiryDate: 1 });
VehicleDocumentSchema.index({ status: 1 });
VehicleDocumentSchema.index({ complianceStatus: 1 });
VehicleDocumentSchema.index({ 'renewalReminder.enabled': 1 });

// Virtual for days until expiry
VehicleDocumentSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for expiry status
VehicleDocumentSchema.virtual('expiryStatus').get(function() {
  const daysUntilExpiry = this.daysUntilExpiry;
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  if (daysUntilExpiry <= 90) return 'expiring_later';
  return 'valid';
});

// Virtual for renewal urgency
VehicleDocumentSchema.virtual('renewalUrgency').get(function() {
  const daysUntilExpiry = this.daysUntilExpiry;
  if (daysUntilExpiry < 0) return 'critical';
  if (daysUntilExpiry <= 7) return 'urgent';
  if (daysUntilExpiry <= 30) return 'high';
  if (daysUntilExpiry <= 90) return 'medium';
  return 'low';
});

// Pre-save middleware to update status based on expiry date
VehicleDocumentSchema.pre('save', function(next) {
  const daysUntilExpiry = this.daysUntilExpiry;
  
  if (daysUntilExpiry < 0) {
    this.status = 'expired';
  } else if (daysUntilExpiry <= this.renewalReminder.reminderDays) {
    this.status = 'pending_renewal';
  } else {
    this.status = 'active';
  }
  
  next();
});

// Ensure virtual fields are serialized
VehicleDocumentSchema.set('toJSON', { virtuals: true });
VehicleDocumentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('VehicleDocument', VehicleDocumentSchema);
