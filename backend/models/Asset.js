const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide asset name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide asset category'],
    enum: ['Bus', 'Equipment', 'Tool', 'Vehicle', 'Other'],
    default: 'Other'
  },
  type: {
    type: String,
    required: [true, 'Please provide asset type'],
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  registrationNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
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
  maintenanceCost: {
    type: Number,
    default: 0,
    min: [0, 'Maintenance cost cannot be negative']
  },
  status: {
    type: String,
    required: [true, 'Please provide asset status'],
    enum: ['active', 'maintenance', 'inactive', 'retired'],
    default: 'active'
  },
  location: {
    type: String,
    required: [true, 'Please provide asset location'],
    trim: true
  },
  insuranceExpiry: {
    type: Date
  },
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  assignedTo: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },

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

// Index for better query performance
AssetSchema.index({ terminal: 1, status: 1 });
AssetSchema.index({ category: 1 });
AssetSchema.index({ createdBy: 1 });

// Virtual for age calculation
AssetSchema.virtual('age').get(function() {
  if (!this.year) return null;
  return new Date().getFullYear() - this.year;
});

// Virtual for depreciation calculation
AssetSchema.virtual('depreciation').get(function() {
  return this.purchaseCost - this.currentValue;
});

// Virtual for depreciation percentage
AssetSchema.virtual('depreciationPercentage').get(function() {
  if (this.purchaseCost === 0) return 0;
  return ((this.purchaseCost - this.currentValue) / this.purchaseCost) * 100;
});

// Ensure virtual fields are serialized
AssetSchema.set('toJSON', { virtuals: true });
AssetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Asset', AssetSchema);
