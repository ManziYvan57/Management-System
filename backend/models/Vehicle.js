const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  // Unique identifier - plate number
  plateNumber: {
    type: String,
    required: [true, 'Please provide plate number'],
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Basic plate number validation (can be customized per country)
        return /^[A-Z0-9\s-]+$/.test(v);
      },
      message: 'Invalid plate number format'
    }
  },
  
  // Basic vehicle information
  make: {
    type: String,
    required: [true, 'Please provide vehicle make'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please provide vehicle model'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please provide vehicle year'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  color: {
    type: String,
    trim: true
  },
  
  // Technical specifications
  engineCapacity: {
    type: String,
    trim: true
  },
  fuelType: {
    type: String,
    enum: ['Diesel', 'Petrol', 'Electric', 'Hybrid', 'Other'],
    default: 'Diesel'
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic', 'Semi-Automatic'],
    default: 'Manual'
  },
  seatingCapacity: {
    type: Number,
    required: [true, 'Please provide seating capacity'],
    min: [1, 'Seating capacity must be at least 1']
  },
  
  // Financial information
  purchaseCost: {
    type: Number,
    default: 0,
    min: [0, 'Purchase cost cannot be negative']
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  currentValue: {
    type: Number,
    default: 0,
    min: [0, 'Current value cannot be negative']
  },
  
  // Operational status
  status: {
    type: String,
    required: [true, 'Please provide vehicle status'],
    enum: ['active', 'inactive', 'maintenance', 'out_of_service'],
    default: 'active'
  },
  
  // Assignment information
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel',
    validate: {
      validator: function(v) {
        return v === null || v === undefined || (typeof v === 'string' && v.trim() === '') || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid driver ID format'
    }
  },
  assignedRoute: {
    type: String,
    trim: true
  },
  
  // Location
  currentLocation: {
    type: String,
    trim: true
  },
  terminals: {
    type: [String],
    enum: ['Kigali', 'Kampala', 'Nairobi', 'Juba'],
    required: [true, 'At least one terminal is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one terminal must be selected'
    }
  },
  
  // Document management
  insurance: {
    policyNumber: {
      type: String,
      trim: true
    },
    provider: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  technicalControl: {
    certificateNumber: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Maintenance information
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  totalMileage: {
    type: Number,
    default: 0,
    min: [0, 'Mileage cannot be negative']
  },
  lastMileageUpdate: {
    type: Date
  },
  
  // Fuel efficiency tracking
  averageFuelConsumption: {
    type: Number,
    default: 0,
    min: [0, 'Fuel consumption cannot be negative']
  },
  lastFuelLog: {
    type: Date
  },
  
  // Notes and additional information
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  
  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
VehicleSchema.index({ plateNumber: 1 }, { unique: true });

VehicleSchema.index({ assignedDriver: 1 });
VehicleSchema.index({ status: 1 });
VehicleSchema.index({ 'insurance.expiryDate': 1 });
VehicleSchema.index({ 'technicalControl.expiryDate': 1 });
VehicleSchema.index({ nextMaintenance: 1 });

// Virtual for vehicle age calculation
VehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for depreciation calculation
VehicleSchema.virtual('depreciation').get(function() {
  return this.purchaseCost - this.currentValue;
});

// Virtual for depreciation percentage
VehicleSchema.virtual('depreciationPercentage').get(function() {
  if (this.purchaseCost === 0) return 0;
  return ((this.purchaseCost - this.currentValue) / this.purchaseCost) * 100;
});

// Virtual for days until insurance expiry
VehicleSchema.virtual('daysUntilInsuranceExpiry').get(function() {
  if (!this.insurance.expiryDate) return null;
  const today = new Date();
  const expiry = new Date(this.insurance.expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until technical control expiry
VehicleSchema.virtual('daysUntilTechnicalControlExpiry').get(function() {
  if (!this.technicalControl.expiryDate) return null;
  const today = new Date();
  const expiry = new Date(this.technicalControl.expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until next maintenance
VehicleSchema.virtual('daysUntilNextMaintenance').get(function() {
  if (!this.nextMaintenance) return null;
  const today = new Date();
  const maintenance = new Date(this.nextMaintenance);
  const diffTime = maintenance - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update lastMileageUpdate
VehicleSchema.pre('save', function(next) {
  if (this.isModified('totalMileage')) {
    this.lastMileageUpdate = new Date();
  }
  next();
});

// Ensure virtual fields are serialized
VehicleSchema.set('toJSON', { virtuals: true });
VehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
