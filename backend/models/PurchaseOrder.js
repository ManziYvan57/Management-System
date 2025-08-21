const mongoose = require('mongoose');

const PurchaseOrderItemSchema = new mongoose.Schema({
  inventoryItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: [0, 'Unit cost cannot be negative']
  },
  totalCost: {
    type: Number,
    required: true,
    min: [0, 'Total cost cannot be negative']
  },
  receivedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Received quantity cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, { _id: true });

const PurchaseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true
  },
  items: [PurchaseOrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  shippingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Shipping amount cannot be negative']
  },
  grandTotal: {
    type: Number,
    required: true,
    min: [0, 'Grand total cannot be negative']
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'ordered', 'partially_received', 'received', 'cancelled'],
    default: 'draft'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDelivery: {
    type: Date,
    required: [true, 'Expected delivery date is required']
  },
  actualDelivery: {
    type: Date
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_30', 'net_60', 'net_90', 'other'],
    default: 'net_30'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  terminal: {
    type: String,
    required: [true, 'Terminal is required'],
    enum: ['Kigali', 'Kampala', 'Nairobi', 'Juba']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for better performance
PurchaseOrderSchema.index({ orderNumber: 1 });
PurchaseOrderSchema.index({ supplier: 1 });
PurchaseOrderSchema.index({ status: 1 });
PurchaseOrderSchema.index({ orderDate: -1 });
PurchaseOrderSchema.index({ terminal: 1 });

// Pre-save middleware to calculate totals
PurchaseOrderSchema.pre('save', function(next) {
  // Calculate total amount from items
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalCost, 0);
  
  // Calculate grand total
  this.grandTotal = this.totalAmount + this.taxAmount + this.shippingAmount;
  
  // Generate order number if not provided
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `PO-${year}${month}${day}-${random}`;
  }
  
  next();
});

// Virtual for order progress
PurchaseOrderSchema.virtual('progress').get(function() {
  if (this.status === 'received') return 100;
  if (this.status === 'partially_received') {
    const totalItems = this.items.length;
    const receivedItems = this.items.filter(item => item.receivedQuantity > 0).length;
    return Math.round((receivedItems / totalItems) * 100);
  }
  return 0;
});

// Virtual for days until delivery
PurchaseOrderSchema.virtual('daysUntilDelivery').get(function() {
  const today = new Date();
  const delivery = new Date(this.expectedDelivery);
  const diffTime = delivery - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtuals are included in JSON output
PurchaseOrderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
