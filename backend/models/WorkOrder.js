const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  // Basic work order information
  workOrderNumber: {
    type: String,
    required: [true, 'Work order number is required'],
    unique: true,
    trim: true
  },
  
  // Vehicle information
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  
  terminal: {
    type: String,
    enum: ['Kigali', 'Kampala', 'Nairobi', 'Juba'],
    required: [true, 'Terminal is required']
  },
  
  // Work order details
  workType: {
    type: String,
    required: [true, 'Work type is required'],
    enum: ['repair', 'maintenance', 'inspection', 'emergency', 'preventive', 'other'],
    default: 'repair'
  },
  
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'],
    default: 'pending'
  },
  
  // Description and details
  title: {
    type: String,
    required: [true, 'Work order title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  problemReported: {
    type: String,
    trim: true,
    maxlength: [500, 'Problem description cannot exceed 500 characters']
  },
  
  workPerformed: {
    type: String,
    trim: true,
    maxlength: [1000, 'Work performed description cannot exceed 1000 characters']
  },
  
  // Personnel assignment (optional - can be assigned later)
  assignedMechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel'
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel'
  },
  
  // Dates and timing
  dateCreated: {
    type: Date,
    default: Date.now
  },
  
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  
  startDate: {
    type: Date
  },
  
  completedDate: {
    type: Date
  },
  
  estimatedDuration: {
    type: Number, // in hours
    min: [0, 'Estimated duration cannot be negative']
  },
  
  actualDuration: {
    type: Number, // in hours
    min: [0, 'Actual duration cannot be negative']
  },
  
  // Parts and materials used
  partsUsed: [{
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitCost: {
      type: Number,
      required: true,
      min: [0, 'Unit cost cannot be negative']
    },
    totalCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative']
    }
  }],
  
  // Cost tracking
  laborCost: {
    type: Number,
    min: [0, 'Labor cost cannot be negative'],
    default: 0
  },
  
  partsCost: {
    type: Number,
    min: [0, 'Parts cost cannot be negative'],
    default: 0
  },
  
  totalCost: {
    type: Number,
    min: [0, 'Total cost cannot be negative'],
    default: 0
  },
  
  // Additional information
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
  
  nextServiceDue: {
    type: Date
  },
  
  recommendations: {
    type: String,
    trim: true,
    maxlength: [500, 'Recommendations cannot exceed 500 characters']
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Location
  
  location: {
    type: String,
    trim: true
  },
  
  // Quality control
  qualityCheck: {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Personnel'
    },
    performedAt: {
      type: Date
    },
    passed: {
      type: Boolean
    },
    notes: {
      type: String,
      trim: true
    }
  },
  
  // Customer information (if applicable)
  customerName: {
    type: String,
    trim: true
  },
  
  customerPhone: {
    type: String,
    trim: true
  },
  
  // Warranty information
  warrantyWork: {
    type: Boolean,
    default: false
  },
  
  warrantyDetails: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
workOrderSchema.index({ workOrderNumber: 1 });
workOrderSchema.index({ vehicle: 1 });
workOrderSchema.index({ assignedMechanic: 1 });
workOrderSchema.index({ status: 1 });
workOrderSchema.index({ workType: 1 });
workOrderSchema.index({ priority: 1 });
workOrderSchema.index({ scheduledDate: 1 });
workOrderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate work order number
workOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.workOrderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get count of work orders for this month
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    });
    
    this.workOrderNumber = `WO-${year}${month}-${String(count + 1).padStart(3, '0')}`;
  }
  
  // Calculate total cost
  this.partsCost = this.partsUsed.reduce((sum, part) => sum + part.totalCost, 0);
  this.totalCost = this.laborCost + this.partsCost;
  
  next();
});

// Virtual for work order age
workOrderSchema.virtual('age').get(function() {
  if (!this.dateCreated) return 0;
  const now = new Date();
  const created = new Date(this.dateCreated);
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Virtual for completion time
workOrderSchema.virtual('completionTime').get(function() {
  if (!this.startDate || !this.completedDate) return null;
  const start = new Date(this.startDate);
  const completed = new Date(this.completedDate);
  return Math.floor((completed - start) / (1000 * 60 * 60 * 24));
});

// Method to mark work order as started
workOrderSchema.methods.startWork = function() {
  this.status = 'in_progress';
  this.startDate = new Date();
  return this.save();
};

// Method to mark work order as completed
workOrderSchema.methods.completeWork = function(actualDuration, workPerformed) {
  this.status = 'completed';
  this.completedDate = new Date();
  if (actualDuration) this.actualDuration = actualDuration;
  if (workPerformed) this.workPerformed = workPerformed;
  return this.save();
};

// Method to add part usage
workOrderSchema.methods.addPartUsage = function(inventoryItem, quantity, unitCost) {
  const totalCost = quantity * unitCost;
  this.partsUsed.push({
    inventoryItem,
    quantity,
    unitCost,
    totalCost
  });
  return this.save();
};

// Ensure virtuals are included in JSON output
workOrderSchema.set('toJSON', { virtuals: true });
workOrderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('WorkOrder', workOrderSchema);

