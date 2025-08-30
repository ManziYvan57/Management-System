const mongoose = require('mongoose');

// Route Schema
const routeSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    unique: true
  },
  
  origin: {
    type: String,
    required: [true, 'Origin is required'],
    trim: true
  },
  
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [1, 'Distance must be at least 1 km']
  },
  
  estimatedDuration: {
    type: Number, // in hours
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 hour']
  },
  
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: [0, 'Fare cannot be negative']
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Trip Schema
const tripSchema = new mongoose.Schema({
  tripNumber: {
    type: String,
    required: [true, 'Trip number is required'],
    unique: true,
    trim: true
  },
  
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle assignment is required']
  },
  
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel',
    required: [true, 'Driver assignment is required']
  },
  
  customerCare: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel'
  },
  
  departureTime: {
    type: Date,
    required: [true, 'Departure time is required']
  },
  
  arrivalTime: {
    type: Date,
    required: [true, 'Arrival time is required']
  },
  
  status: {
    type: String,
    enum: ['scheduled', 'ready', 'boarding', 'departed', 'delayed', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  passengers: {
    type: Number,
    default: 0,
    min: [0, 'Passengers cannot be negative']
  },
  
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: [0, 'Fare cannot be negative']
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  delayReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Delay reason cannot exceed 500 characters']
  },
  
  actualDepartureTime: {
    type: Date
  },
  
  actualArrivalTime: {
    type: Date
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate trip number
tripSchema.pre('save', async function(next) {
  if (this.isNew && !this.tripNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    });
    
    this.tripNumber = `TRP-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`;
  }
  
  next();
});

// Virtual for occupancy percentage
tripSchema.virtual('occupancyPercentage').get(function() {
  if (this.capacity === 0) return 0;
  return Math.round((this.passengers / this.capacity) * 100);
});

// Virtual for trip duration
tripSchema.virtual('duration').get(function() {
  if (!this.departureTime || !this.arrivalTime) return null;
  const duration = this.arrivalTime - this.departureTime;
  return Math.round(duration / (1000 * 60 * 60)); // hours
});

// Virtual for actual duration
tripSchema.virtual('actualDuration').get(function() {
  if (!this.actualDepartureTime || !this.actualArrivalTime) return null;
  const duration = this.actualArrivalTime - this.actualDepartureTime;
  return Math.round(duration / (1000 * 60 * 60)); // hours
});

// Virtual for delay
tripSchema.virtual('delay').get(function() {
  if (!this.actualDepartureTime || !this.departureTime) return null;
  const delay = this.actualDepartureTime - this.departureTime;
  return Math.round(delay / (1000 * 60)); // minutes
});

// Indexes for efficient queries
routeSchema.index({ routeName: 1 });
routeSchema.index({ status: 1 });
routeSchema.index({ createdBy: 1 });

tripSchema.index({ tripNumber: 1 });
tripSchema.index({ route: 1 });
tripSchema.index({ vehicle: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ departureTime: 1 });
tripSchema.index({ createdBy: 1 });

// Ensure virtuals are included in JSON output
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

// Daily Schedule Schema - for planning daily routes
const dailyScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  
  departureTime: {
    type: String, // Format: "HH:MM" (e.g., "09:00")
    required: [true, 'Departure time is required'],
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Invalid time format. Use HH:MM format'
    }
  },
  
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle assignment is required']
  },
  
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel',
    required: [true, 'Driver assignment is required']
  },
  
  customerCare: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personnel'
  },
  
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  
  status: {
    type: String,
    enum: ['planned', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  
  tripGenerated: {
    type: Boolean,
    default: false
  },
  
  generatedTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to validate vehicle and driver availability
dailyScheduleSchema.pre('save', async function(next) {
  if (this.isModified('assignedVehicle') || this.isModified('assignedDriver') || this.isModified('date') || this.isModified('departureTime')) {
    try {
      // Check if vehicle is available for this date and time
      const conflictingSchedule = await this.constructor.findOne({
        _id: { $ne: this._id },
        date: this.date,
        assignedVehicle: this.assignedVehicle,
        status: { $in: ['planned', 'confirmed', 'in_progress'] }
      });
      
      if (conflictingSchedule) {
        return next(new Error('Vehicle is already assigned to another route on this date'));
      }
      
      // Check if driver is available for this date and time
      const conflictingDriverSchedule = await this.constructor.findOne({
        _id: { $ne: this._id },
        date: this.date,
        assignedDriver: this.assignedDriver,
        status: { $in: ['planned', 'confirmed', 'in_progress'] }
      });
      
      if (conflictingDriverSchedule) {
        return next(new Error('Driver is already assigned to another route on this date'));
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Indexes for daily schedule
dailyScheduleSchema.index({ date: 1, route: 1 });
dailyScheduleSchema.index({ date: 1, assignedVehicle: 1 });
dailyScheduleSchema.index({ date: 1, assignedDriver: 1 });
dailyScheduleSchema.index({ status: 1 });


const Route = mongoose.model('Route', routeSchema);
const Trip = mongoose.model('Trip', tripSchema);
const DailySchedule = mongoose.model('DailySchedule', dailyScheduleSchema);

module.exports = {
  Route,
  Trip,
  DailySchedule
};

