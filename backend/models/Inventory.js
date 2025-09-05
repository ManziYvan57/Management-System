const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'SKU cannot exceed 20 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Lubricants',
      'Brake System',
      'Filters',
      'Electrical',
      'Tires',
      'Tools',
      'Safety Equipment',
      'Consumables',
      'Spare Parts',
      'Other'
    ]
  },
  
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  
  terminal: {
    type: String,
    enum: ['Kigali', 'Kampala', 'Nairobi', 'Juba'],
    required: [true, 'Terminal is required']
  },
  
  // Stock Information
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pieces', 'liters', 'sets', 'pairs', 'boxes', 'meters', 'kg', 'other'],
    default: 'pieces'
  },
  
  minQuantity: {
    type: Number,
    required: [true, 'Minimum quantity is required'],
    min: [0, 'Minimum quantity cannot be negative'],
    default: 0
  },
  
  reorderPoint: {
    type: Number,
    min: [0, 'Reorder point cannot be negative'],
    default: 0
  },
  
  // Financial Information
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: [0, 'Unit cost cannot be negative']
  },
  
  totalValue: {
    type: Number,
    min: [0, 'Total value cannot be negative'],
    default: 0
  },
  
  // Supplier Information
  supplier: {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true
    },
    contactPerson: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  
  // Vehicle Compatibility (for parts)
  compatibleVehicles: [{
    make: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    year: {
      type: Number
    }
  }],
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
    default: 'in-stock'
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // System Fields
  
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
InventorySchema.index({ sku: 1 });
InventorySchema.index({ category: 1 });
InventorySchema.index({ status: 1 });
InventorySchema.index({ 'supplier.name': 1 });
InventorySchema.index({ isActive: 1 });

// Virtual for stock status
InventorySchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.minQuantity) return 'low-stock';
  return 'in-stock';
});

// Virtual for stock level percentage
InventorySchema.virtual('stockLevelPercentage').get(function() {
  if (this.reorderPoint === 0) return 100;
  return Math.min(100, (this.quantity / this.reorderPoint) * 100);
});

// Pre-save middleware to update total value and status
InventorySchema.pre('save', function(next) {
  // Update total value
  this.totalValue = this.quantity * this.unitCost;
  
  // Update status based on quantity
  if (this.quantity === 0) {
    this.status = 'out-of-stock';
  } else if (this.quantity <= this.minQuantity) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  
  // Update last updated timestamp
  this.lastUpdated = new Date();
  
  next();
});

// Ensure virtual fields are serialized
InventorySchema.set('toJSON', { virtuals: true });
InventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', InventorySchema);
