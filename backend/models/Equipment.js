const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  // Basic equipment information
  name: {
    type: String,
    required: [true, 'Please provide equipment name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide equipment category'],
    enum: ['tools', 'electronics', 'safety', 'office', 'maintenance'],
    trim: true
  },
  type: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  
  // Status and location
  status: {
    type: String,
    required: [true, 'Please provide equipment status'],
    enum: ['active', 'inactive', 'maintenance', 'out_of_service'],
    default: 'active'
  },
  location: {
    type: String,
    trim: true
  },
  terminal: {
    type: String,
    enum: ['Kigali', 'Kampala', 'Nairobi', 'Juba'],
    required: [true, 'Terminal is required']
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
  
  // Description and specifications
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  
  // Maintenance information
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    description: String,
    cost: {
      type: Number,
      default: 0
    },
    performedBy: String
  }],
  
  // Assignment information
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDate: {
    type: Date
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
EquipmentSchema.index({ name: 1 });
EquipmentSchema.index({ category: 1 });
EquipmentSchema.index({ status: 1 });
EquipmentSchema.index({ terminal: 1 });
EquipmentSchema.index({ serialNumber: 1 });
EquipmentSchema.index({ assignedTo: 1 });

// Virtual for equipment age calculation
EquipmentSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.purchaseDate) / (1000 * 60 * 60 * 24 * 365));
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

// Pre-save middleware to update assignedDate when assignedTo changes
EquipmentSchema.pre('save', function(next) {
  if (this.isModified('assignedTo') && this.assignedTo) {
    this.assignedDate = new Date();
  }
  next();
});

// Ensure virtual fields are serialized
EquipmentSchema.set('toJSON', { virtuals: true });
EquipmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Equipment', EquipmentSchema);
