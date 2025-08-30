const mongoose = require('mongoose');

const personnelSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },


  role: {
    type: String,
    enum: ['driver', 'team_leader', 'customer_care', 'mechanic', 'supervisor', 'manager', 'admin', 'garage_staff', 'transport_staff', 'inventory_staff'],
    required: [true, 'Role is required']
  },
  department: {
    type: String,
    enum: ['operations', 'maintenance', 'customer_service', 'administration', 'finance', 'compliance', 'other'],
    required: [true, 'Department is required']
  },

  hireDate: {
    type: Date,
    required: false
  },
  employmentStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'terminated', 'on_leave']
  },
  salary: {
    type: Number,
    required: false,
    min: [0, 'Salary cannot be negative']
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel'
  },

  // Driver-specific fields
  licenseNumber: {
    type: String,
    sparse: true // Only required for drivers
  },
  licenseType: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F', null],
    sparse: true
  },
  licenseExpiryDate: {
    type: Date,
    sparse: true
  },
  drivingPoints: {
    type: Number,
    min: [0, 'Driving points cannot be negative'],
    max: [100, 'Driving points cannot exceed 100']
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    sparse: true
  },
  assignedRoute: {
    type: String,
    sparse: true
  },

  // Performance and Training
  performanceRating: {
    type: Number,
    min: [1, 'Performance rating must be at least 1'],
    max: [5, 'Performance rating cannot exceed 5']
  },
  lastEvaluationDate: {
    type: Date
  },
  trainingCompleted: [{
    courseName: String,
    completionDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  certifications: [{
    name: String,
    issuingAuthority: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],

  // Infractions and Disciplinary Actions
  infractions: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    description: String,
    points: {
      type: Number,
      required: true,
      min: [0, 'Points cannot be negative']
    },
    severity: {
      type: String,
      enum: ['minor', 'major', 'critical'],
      default: 'minor'
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'appealed'],
      default: 'pending'
    },
    notes: String
  }],

  // Work Schedule
  workSchedule: {
    shift: {
      type: String,
      enum: ['morning', 'afternoon', 'night', 'flexible']
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: String,
    endTime: String
  },

  // Notes and Additional Information
  notes: String,
  skills: [String],
  languages: [String],

  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
personnelSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
personnelSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for years of service
personnelSchema.virtual('yearsOfService').get(function() {
  if (!this.hireDate) return null;
  const today = new Date();
  const hireDate = new Date(this.hireDate);
  let years = today.getFullYear() - hireDate.getFullYear();
  const monthDiff = today.getMonth() - hireDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDate.getDate())) {
    years--;
  }
  return years;
});

// Virtual for license expiry status
personnelSchema.virtual('licenseStatus').get(function() {
  if (!this.licenseExpiryDate) return null;
  const today = new Date();
  const expiryDate = new Date(this.licenseExpiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'valid';
});

// Pre-save middleware to validate driver-specific fields (only if they are provided)
personnelSchema.pre('save', function(next) {
  if (this.role === 'driver') {
    // Only validate if license fields are provided (they are optional now)
    if (this.licenseNumber && !this.licenseType) {
      return next(new Error('License type is required when license number is provided'));
    }
    if (this.licenseNumber && !this.licenseExpiryDate) {
      return next(new Error('License expiry date is required when license number is provided'));
    }
    if (this.licenseType && !this.licenseNumber) {
      return next(new Error('License number is required when license type is provided'));
    }
    if (this.licenseExpiryDate && !this.licenseNumber) {
      return next(new Error('License number is required when license expiry date is provided'));
    }
  }
  next();
});

// Indexes
personnelSchema.index({ email: 1 });

personnelSchema.index({ role: 1 });

personnelSchema.index({ employmentStatus: 1 });
personnelSchema.index({ licenseNumber: 1 }, { sparse: true });
personnelSchema.index({ assignedVehicle: 1 }, { sparse: true });

module.exports = mongoose.model('Personnel', personnelSchema);
