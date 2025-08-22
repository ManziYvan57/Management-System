const mongoose = require('mongoose');

const maintenanceScheduleSchema = new mongoose.Schema({
  // Vehicle information
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  
  // Maintenance type and details
  maintenanceType: {
    type: String,
    required: [true, 'Maintenance type is required'],
    enum: ['oil_change', 'tire_rotation', 'brake_service', 'engine_tune_up', 'transmission_service', 'air_filter', 'fuel_filter', 'spark_plugs', 'battery_check', 'coolant_check', 'general_inspection', 'other'],
    default: 'general_inspection'
  },
  
  title: {
    type: String,
    required: [true, 'Maintenance title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Schedule information
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annually', 'annually', 'mileage_based', 'custom'],
    default: 'monthly'
  },
  
  interval: {
    type: Number, // days or miles depending on frequency
    required: [true, 'Interval is required'],
    min: [1, 'Interval must be at least 1']
  },
  
  intervalType: {
    type: String,
    enum: ['days', 'miles', 'kilometers'],
    default: 'days'
  },
  
  // Dates
  lastPerformed: {
    type: Date
  },
  
  nextDue: {
    type: Date,
    required: [true, 'Next due date is required']
  },
  
  scheduledDate: {
    type: Date
  },
  
  // Status tracking
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['scheduled', 'in_progress', 'completed', 'overdue', 'cancelled'],
    default: 'scheduled'
  },
  
  // Priority and importance
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  isCritical: {
    type: Boolean,
    default: false
  },
  
  // Cost estimation
  estimatedCost: {
    type: Number,
    min: [0, 'Estimated cost cannot be negative'],
    default: 0
  },
  
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative'],
    default: 0
  },
  
  // Parts required
  requiredParts: [{
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    },
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Estimated cost cannot be negative'],
      default: 0
    }
  }],
  
  // Labor requirements
  estimatedLaborHours: {
    type: Number,
    min: [0, 'Estimated labor hours cannot be negative'],
    default: 1
  },
  
  laborRate: {
    type: Number,
    min: [0, 'Labor rate cannot be negative'],
    default: 0
  },
  
  // Assignment
  assignedMechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel'
  },
  
  // Additional information
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  instructions: {
    type: String,
    trim: true,
    maxlength: [2000, 'Instructions cannot exceed 2000 characters']
  },
  
  // Location and terminal
  terminal: {
    type: String,
    required: [true, 'Terminal is required'],
    trim: true
  },
  
  location: {
    type: String,
    trim: true
  },
  
  // Reminder settings
  reminderDays: {
    type: Number,
    min: [0, 'Reminder days cannot be negative'],
    default: 7
  },
  
  sendReminders: {
    type: Boolean,
    default: true
  },
  
  // History tracking
  completedCount: {
    type: Number,
    min: [0, 'Completed count cannot be negative'],
    default: 0
  },
  
  missedCount: {
    type: Number,
    min: [0, 'Missed count cannot be negative'],
    default: 0
  },
  
  // Warranty information
  warrantyRequired: {
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
maintenanceScheduleSchema.index({ vehicle: 1 });
maintenanceScheduleSchema.index({ nextDue: 1 });
maintenanceScheduleSchema.index({ status: 1 });
maintenanceScheduleSchema.index({ priority: 1 });
maintenanceScheduleSchema.index({ maintenanceType: 1 });
maintenanceScheduleSchema.index({ terminal: 1 });
maintenanceScheduleSchema.index({ assignedMechanic: 1 });

// Virtual for days until due
maintenanceScheduleSchema.virtual('daysUntilDue').get(function() {
  if (!this.nextDue) return null;
  const now = new Date();
  const due = new Date(this.nextDue);
  const diffTime = due - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
maintenanceScheduleSchema.virtual('isOverdue').get(function() {
  if (!this.nextDue) return false;
  const now = new Date();
  const due = new Date(this.nextDue);
  return due < now && this.status !== 'completed';
});

// Virtual for due soon status
maintenanceScheduleSchema.virtual('isDueSoon').get(function() {
  if (!this.nextDue) return false;
  const now = new Date();
  const due = new Date(this.nextDue);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= this.reminderDays && diffDays >= 0 && this.status !== 'completed';
});

// Method to mark maintenance as completed
maintenanceScheduleSchema.methods.markCompleted = function(actualCost, completedDate) {
  this.status = 'completed';
  this.lastPerformed = completedDate || new Date();
  if (actualCost) this.actualCost = actualCost;
  this.completedCount += 1;
  
  // Calculate next due date
  this.calculateNextDue();
  
  return this.save();
};

// Method to calculate next due date
maintenanceScheduleSchema.methods.calculateNextDue = function() {
  if (!this.lastPerformed) return;
  
  const lastPerformed = new Date(this.lastPerformed);
  let nextDue = new Date(lastPerformed);
  
  switch (this.frequency) {
    case 'daily':
      nextDue.setDate(lastPerformed.getDate() + this.interval);
      break;
    case 'weekly':
      nextDue.setDate(lastPerformed.getDate() + (this.interval * 7));
      break;
    case 'monthly':
      nextDue.setMonth(lastPerformed.getMonth() + this.interval);
      break;
    case 'quarterly':
      nextDue.setMonth(lastPerformed.getMonth() + (this.interval * 3));
      break;
    case 'semi_annually':
      nextDue.setMonth(lastPerformed.getMonth() + (this.interval * 6));
      break;
    case 'annually':
      nextDue.setFullYear(lastPerformed.getFullYear() + this.interval);
      break;
    case 'custom':
      nextDue.setDate(lastPerformed.getDate() + this.interval);
      break;
    default:
      nextDue.setDate(lastPerformed.getDate() + this.interval);
  }
  
  this.nextDue = nextDue;
  this.status = 'scheduled';
};

// Method to mark as overdue
maintenanceScheduleSchema.methods.markOverdue = function() {
  if (this.isOverdue && this.status !== 'completed') {
    this.status = 'overdue';
    this.missedCount += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Ensure virtuals are included in JSON output
maintenanceScheduleSchema.set('toJSON', { virtuals: true });
maintenanceScheduleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MaintenanceSchedule', maintenanceScheduleSchema);

