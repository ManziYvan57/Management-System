const mongoose = require('mongoose');

const StockMovementSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Inventory item is required']
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  movementType: {
    type: String,
    enum: ['in', 'out', 'adjustment', 'transfer', 'damage', 'expiry'],
    required: [true, 'Movement type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  unitCost: {
    type: Number,
    min: [0, 'Unit cost cannot be negative']
  },
  totalValue: {
    type: Number,
    min: [0, 'Total value cannot be negative']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  reference: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference cannot exceed 100 characters']
  },
  referenceType: {
    type: String,
    enum: ['purchase_order', 'work_order', 'maintenance', 'manual', 'system', 'other'],
    default: 'manual'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['PurchaseOrder', 'WorkOrder', 'Maintenance', 'User']
  },
  location: {
    from: {
      type: String,
      trim: true,
      maxlength: [100, 'From location cannot exceed 100 characters']
    },
    to: {
      type: String,
      trim: true,
      maxlength: [100, 'To location cannot exceed 100 characters']
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  terminal: {
    type: String,
    required: [true, 'Terminal is required'],
    enum: ['Kigali', 'Kampala', 'Nairobi', 'Juba'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for better performance
StockMovementSchema.index({ inventoryItem: 1, createdAt: -1 });
StockMovementSchema.index({ movementType: 1 });
StockMovementSchema.index({ createdBy: 1 });
StockMovementSchema.index({ referenceType: 1, referenceId: 1 });
StockMovementSchema.index({ terminal: 1 });

// Pre-save middleware to calculate values
StockMovementSchema.pre('save', function(next) {
  // Calculate total value if unit cost is provided
  if (this.unitCost && this.quantity) {
    this.totalValue = this.unitCost * this.quantity;
  }
  
  next();
});

// Virtual for movement description
StockMovementSchema.virtual('description').get(function() {
  const typeMap = {
    'in': 'Stock In',
    'out': 'Stock Out',
    'adjustment': 'Stock Adjustment',
    'transfer': 'Stock Transfer',
    'damage': 'Damaged Stock',
    'expiry': 'Expired Stock'
  };
  
  return `${typeMap[this.movementType] || this.movementType}: ${this.quantity} ${this.itemName}`;
});

// Virtual for movement impact
StockMovementSchema.virtual('impact').get(function() {
  if (this.movementType === 'in') return 'positive';
  if (this.movementType === 'out') return 'negative';
  return 'neutral';
});

// Ensure virtuals are included in JSON output
StockMovementSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('StockMovement', StockMovementSchema);
