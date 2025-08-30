const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters']
  },
  supplies: {
    type: String,
    trim: true,
    maxlength: [200, 'Supplies description cannot exceed 200 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  website: {
    type: String,
    trim: true,
    maxlength: [200, 'Website URL cannot exceed 200 characters']
  },
  taxId: {
    type: String,
    trim: true,
    maxlength: [50, 'Tax ID cannot exceed 50 characters']
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_30', 'net_60', 'net_90', 'other'],
    default: 'net_30'
  },
  creditLimit: {
    type: Number,
    min: [0, 'Credit limit cannot be negative'],
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 3
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
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
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for better performance
SupplierSchema.index({ name: 1 });
SupplierSchema.index({ status: 1 });
SupplierSchema.index({ createdBy: 1 });

// Virtual for full contact info
SupplierSchema.virtual('contactInfo').get(function() {
  const parts = [];
  if (this.contactPerson) parts.push(this.contactPerson);
  if (this.phone) parts.push(this.phone);
  if (this.email) parts.push(this.email);
  return parts.join(' | ');
});

// Ensure virtuals are included in JSON output
SupplierSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
