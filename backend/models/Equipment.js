const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  // Basic equipment information
  name: {
    type: String,
    required: [true, 'Please provide equipment name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  
  // Equipment classification
  category: {
    type: String,
    required: [true, 'Please provide equipment category'],
    enum: ['Tool', 'Machinery', 'Diagnostic', 'Safety', 'Office', 'Other'],
    default: 'Other'
  },
  
  type: {
    type: String,
    required: [true, 'Please provide equipment type'],
    trim: true
  },
  
  model: {
    type: String,
    trim: true
  },
  
  serialNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  // Specifications
  specifications: {
    type: String,
    trim: true,
    maxlength: [500, 'Specifications cannot be more than 500 characters']
  },
  
  // Financial information
  purchaseCost: {
    type: Number,
    required: [true, 'Please provide purchase cost'],
    min: [0, 'Purchase cost cannot be negative']
  },
  
  purchaseDate: {
    type: Date,
    required: [true, 'Please provide purchase date']
  },
  
  currentValue: {
    type: Number,
    required: [true, 'Please provide current value'],
    min: [0, 'Current value cannot be negative']
  },
  
  // Operational status
  status: {
    type: String,
    required: [true, 'Please provide equipment status'],
    enum: ['available', 'in_use', 'maintenance', 'out_of_service', 'retired'],
    default: 'available'
  },
  
  // Location and assignment
  location: {
    type: String,
    required: [true, 'Please provide equipment location'],
    trim: true
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  
  // Terminal information
  terminal: {
    type: String,
    required: [true, 'Please specify terminal'],
    enum: ['kigali', 'kampala', 'nairobi', 'juba']
  },
  
  // Maintenance information
  lastMaintenance: {
    type: Date
  },
  
  nextMaintenance: {
    type: Date
  },
  
  maintenanceCost: {
    type: Number,
    default: 0,
    min: [0, 'Maintenance cost cannot be negative']
  },
  
  // Usage tracking
  usageHours: {
    type: Number,
    default: 0,
    min: [0, 'Usage hours cannot be negative']
  },
  
  lastUsed: {
    type: Date
  },
  
  // Condition and notes
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'good'
  },
  
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
EquipmentSchema.index({ terminal: 1, status: 1 });
EquipmentSchema.index({ category: 1 });
EquipmentSchema.index({ assignedTo: 1 });
EquipmentSchema.index({ assignedVehicle: 1 });
EquipmentSchema.index({ status: 1 });
EquipmentSchema.index({ nextMaintenance: 1 });

// Virtual for equipment age calculation
EquipmentSchema.virtual('age').get(function() {
  if (!this.purchaseDate) return null;
  const today = new Date();
  const purchase = new Date(this.purchaseDate);
  const diffTime = today - purchase;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365.25)); // Age in years
});

// Virtual for depreciation calculation
EquipmentSchema.virtual('depreciation').get(function() {
  return this.purchaseCost - this.currentValue;
});

// Virtual for depreciation percentage
EquipmentSchema.virtual('depreciationPercentage').get(function() {
  if (this.purchaseCost === 0) return 0;
  return ((this.purchaseCost - this.currentValue) / this.purchaseCost) * 100;
});

// Virtual for days until next maintenance
EquipmentSchema.virtual('daysUntilNextMaintenance').get(function() {
  if (!this.nextMaintenance) return null;
  const today = new Date();
  const maintenance = new Date(this.nextMaintenance);
  const diffTime = maintenance - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
EquipmentSchema.set('toJSON', { virtuals: true });
EquipmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Equipment', EquipmentSchema);
