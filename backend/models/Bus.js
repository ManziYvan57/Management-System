const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  busType: {
    type: String,
    required: [true, 'Bus type is required'],
    enum: ['Mini Bus', 'Coaster', 'Large Bus', 'Truck'],
    default: 'Coaster'
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot exceed 100']
  },
  status: {
    type: String,
    required: true,
    enum: ['operational', 'not_in_operation', 'parked', 'maintenance', 'reserve'],
    default: 'operational'
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1990, 'Year must be 1990 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  // Route information
  route: {
    type: String,
    enum: ['Kampala-Nairobi', 'Goma-Cyanika-Kampala', 'Nairobi-Kigali', 'Kampala-Kigali', 'Kampala-Juba', 'Juba-Bor'],
    trim: true
  },
  assignedDriver: {
    type: String,
    trim: true,
    maxlength: [100, 'Assigned driver name cannot exceed 100 characters']
  },
  customerCareStaff: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer care staff name cannot exceed 100 characters']
  },
  departureTime: {
    type: String,
    trim: true
  },
  teamLeader: {
    type: String,
    trim: true,
    maxlength: [100, 'Team leader name cannot exceed 100 characters']
  },
  // Asset tracking fields
  assetValue: {
    type: Number,
    min: [0, 'Asset value cannot be negative']
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: [0, 'Purchase price cannot be negative']
  },
  currentValue: {
    type: Number,
    min: [0, 'Current value cannot be negative']
  },
  depreciationRate: {
    type: Number,
    min: [0, 'Depreciation rate cannot be negative'],
    max: [100, 'Depreciation rate cannot exceed 100%'],
    default: 10 // 10% per year
  },
  // Maintenance tracking
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  },
  maintenanceInterval: {
    type: Number, // in days
    default: 90
  },
  totalMaintenanceCost: {
    type: Number,
    default: 0,
    min: [0, 'Total maintenance cost cannot be negative']
  },
  // Documentation
  insuranceExpiry: {
    type: Date,
    required: [true, 'Insurance expiry date is required']
  },
  registrationExpiry: {
    type: Date,
    required: [true, 'Registration expiry date is required']
  },
  // Condition tracking
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'good'
  },
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative'],
    default: 0
  },
  fuelEfficiency: {
    type: Number, // km per liter
    min: [0, 'Fuel efficiency cannot be negative']
  },
  // Additional fields
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Asset location
  currentLocation: {
    type: String,
    trim: true
  },
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
busSchema.index({ plateNumber: 1 });
busSchema.index({ status: 1 });
busSchema.index({ busType: 1 });
busSchema.index({ route: 1 });
busSchema.index({ condition: 1 });
busSchema.index({ assignedDriver: 1 });
busSchema.index({ teamLeader: 1 });

// Virtual for insurance status
busSchema.virtual('insuranceStatus').get(function() {
  const today = new Date();
  const daysUntilExpiry = Math.ceil((this.insuranceExpiry - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'valid';
});

// Virtual for registration status
busSchema.virtual('registrationStatus').get(function() {
  const today = new Date();
  const daysUntilExpiry = Math.ceil((this.registrationExpiry - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'valid';
});

// Virtual for maintenance status
busSchema.virtual('maintenanceStatus').get(function() {
  if (!this.nextMaintenanceDate) return 'unknown';
  
  const today = new Date();
  const daysUntilMaintenance = Math.ceil((this.nextMaintenanceDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilMaintenance < 0) return 'overdue';
  if (daysUntilMaintenance <= 7) return 'due_soon';
  return 'scheduled';
});

// Virtual for age
busSchema.virtual('age').get(function() {
  const currentYear = new Date().getFullYear();
  return currentYear - this.year;
});

// Virtual for depreciation
busSchema.virtual('depreciatedValue').get(function() {
  if (!this.purchasePrice || !this.purchaseDate) return this.currentValue || 0;
  
  const age = this.age;
  const depreciationAmount = (this.purchasePrice * this.depreciationRate * age) / 100;
  return Math.max(0, this.purchasePrice - depreciationAmount);
});

// Method to update maintenance schedule
busSchema.methods.scheduleNextMaintenance = function() {
  if (this.lastMaintenanceDate) {
    this.nextMaintenanceDate = new Date(this.lastMaintenanceDate);
    this.nextMaintenanceDate.setDate(this.nextMaintenanceDate.getDate() + this.maintenanceInterval);
  }
};

// Method to add maintenance cost
busSchema.methods.addMaintenanceCost = function(cost) {
  this.totalMaintenanceCost += cost;
  this.lastMaintenanceDate = new Date();
  this.scheduleNextMaintenance();
};

// Ensure virtuals are included in JSON output
busSchema.set('toJSON', { virtuals: true });
busSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Bus', busSchema); 