const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { Route, Trip, DailySchedule } = require('../models/Transport');
const Vehicle = require('../models/Vehicle');
const Personnel = require('../models/Personnel');
const VehicleDocument = require('../models/VehicleDocument');

// @desc    Get all routes
// @route   GET /api/transport/routes
// @access  Private
router.get('/routes', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, terminal } = req.query;
    
    // Build query based on user role and terminal
    let query = { status: { $ne: 'deleted' } };
    
    // Terminal-based filtering
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { routeName: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const routes = await Route.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Route.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: routes.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: routes
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching routes',
      error: error.message
    });
  }
});

// @desc    Simple test endpoint
// @route   GET /api/transport/test
// @access  Public
router.get('/test', async (req, res) => {
  res.json({ message: 'Transport API is working!', timestamp: new Date().toISOString() });
});

// @desc    Get test routes (no authentication required for testing)
// @route   GET /api/transport/test-routes
// @access  Public
router.get('/test-routes', async (req, res) => {
  try {
    console.log('🔍 Test routes endpoint called');
    
            // Simple hard-coded test routes with valid MongoDB ObjectId format
        const testRoutes = [
          {
            _id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
            routeName: 'Kampala to Kigali',
            origin: 'Kampala',
            destination: 'Kigali',
            distance: 450,
            estimatedDuration: 8,
            fare: 25000,
            terminal: 'Main Terminal',
            status: 'active'
          },
          {
            _id: '507f1f77bcf86cd799439012', // Valid MongoDB ObjectId format
            routeName: 'Kigali to Kampala',
            origin: 'Kigali',
            destination: 'Kampala',
            distance: 450,
            estimatedDuration: 8,
            fare: 25000,
            terminal: 'Main Terminal',
            status: 'active'
          }
        ];

    console.log('📤 Sending test routes:', testRoutes.length);
    
    res.status(200).json({
      success: true,
      count: testRoutes.length,
      total: testRoutes.length,
      data: testRoutes
    });
  } catch (error) {
    console.error('❌ Error in test routes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test routes',
      error: error.message
    });
  }
});

// @desc    Create new route
// @route   POST /api/transport/routes
// @access  Private
router.post('/routes', protect, authorize('transport', 'create'), [
  body('routeName').notEmpty().withMessage('Route name is required'),
  body('origin').notEmpty().withMessage('Origin is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('distance').isNumeric().withMessage('Distance must be a number'),
  body('estimatedDuration').isNumeric().withMessage('Estimated duration must be a number'),
  body('fare').isNumeric().withMessage('Fare must be a number'),
  body('terminal').notEmpty().withMessage('Terminal is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const routeData = {
      ...req.body,
      terminal: req.user.role === 'super_admin' ? req.body.terminal : req.user.terminal,
      createdBy: req.user.id
    };

    const route = await Route.create(routeData);
    
    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    console.error('Error creating route:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Route name already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Error creating route',
      error: error.message
    });
  }
});

// @desc    Update route
// @route   PUT /api/transport/routes/:id
// @access  Private
router.put('/routes/:id', protect, authorize('transport', 'edit'), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating route',
      error: error.message
    });
  }
});

// @desc    Delete route
// @route   DELETE /api/transport/routes/:id
// @access  Private
router.delete('/routes/:id', protect, authorize('transport', 'delete'), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { status: 'deleted' },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting route',
      error: error.message
    });
  }
});

// @desc    Get all trips
// @route   GET /api/transport/trips
// @access  Private
router.get('/trips', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, route, terminal, date } = req.query;
    
    // Build query based on user role and terminal
    let query = { status: { $ne: 'deleted' } };
    
    // Terminal-based filtering
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { tripNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by route
    if (route) {
      query.route = route;
    }
    
    // Filter by date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.departureTime = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const trips = await Trip.find(query)
      .populate('route', 'routeName origin destination')
      .populate('vehicle', 'plateNumber make model')
      .populate('driver', 'firstName lastName employeeId')
      .populate('customerCare', 'firstName lastName employeeId')
      .populate('createdBy', 'firstName lastName')
      .sort({ departureTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Trip.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: trips
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trips',
      error: error.message
    });
  }
});

// @desc    Create new trip
// @route   POST /api/transport/trips
// @access  Private
router.post('/trips', protect, authorize('transport', 'create'), [
  body('route').isMongoId().withMessage('Valid route ID is required'),
  body('vehicle').isMongoId().withMessage('Valid vehicle ID is required'),
  body('driver').isMongoId().withMessage('Valid driver ID is required'),
  body('departureTime').notEmpty().withMessage('Departure time is required'),
  body('arrivalTime').notEmpty().withMessage('Arrival time is required'),
  body('capacity').isNumeric().withMessage('Capacity must be a number'),
  body('fare').isNumeric().withMessage('Fare must be a number'),
  body('terminal').notEmpty().withMessage('Terminal is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tripData = {
      ...req.body,
      terminal: req.user.role === 'super_admin' ? req.body.terminal : req.user.terminal,
      createdBy: req.user.id,
      status: 'scheduled'
    };

    const trip = await Trip.create(tripData);
    
    // Populate the created trip
    const populatedTrip = await Trip.findById(trip._id)
      .populate('route', 'routeName origin destination')
      .populate('vehicle', 'plateNumber make model')
      .populate('driver', 'firstName lastName employeeId')
      .populate('customerCare', 'firstName lastName employeeId');
    
    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: populatedTrip
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating trip',
      error: error.message
    });
  }
});

// @desc    Update trip
// @route   PUT /api/transport/trips/:id
// @access  Private
router.put('/trips/:id', protect, authorize('transport', 'edit'), async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('route', 'routeName origin destination')
     .populate('vehicle', 'plateNumber make model')
     .populate('driver', 'firstName lastName employeeId')
     .populate('customerCare', 'firstName lastName employeeId');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: trip
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trip',
      error: error.message
    });
  }
});

// @desc    Delete trip
// @route   DELETE /api/transport/trips/:id
// @access  Private
router.delete('/trips/:id', protect, authorize('transport', 'delete'), async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: 'deleted' },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting trip',
      error: error.message
    });
  }
});

// @desc    Get transport statistics
// @route   GET /api/transport/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { terminal, date } = req.query;
    
    // Build query based on user role and terminal
    let query = { status: { $ne: 'deleted' } };
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.departureTime = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    // Get trip statistics
    const totalTrips = await Trip.countDocuments(query);
    const activeTrips = await Trip.countDocuments({ ...query, status: { $in: ['scheduled', 'ready', 'boarding', 'departed'] } });
    const completedTrips = await Trip.countDocuments({ ...query, status: 'completed' });
    const delayedTrips = await Trip.countDocuments({ ...query, status: 'delayed' });
    
    // Get route statistics
    const routeQuery = { status: { $ne: 'deleted' } };
    if (req.user.role !== 'super_admin') {
      routeQuery.terminal = req.user.terminal;
    } else if (terminal) {
      routeQuery.terminal = terminal;
    }
    
    const totalRoutes = await Route.countDocuments(routeQuery);
    
    // Get vehicle statistics
    const vehicleQuery = { status: { $ne: 'deleted' } };
    if (req.user.role !== 'super_admin') {
      vehicleQuery.terminal = req.user.terminal;
    } else if (terminal) {
      vehicleQuery.terminal = terminal;
    }
    
    const totalVehicles = await Vehicle.countDocuments(vehicleQuery);
    
    // Get personnel statistics
    const personnelQuery = { role: { $in: ['driver', 'customer_care'] } };
    const totalPersonnel = await Personnel.countDocuments(personnelQuery);
    
    const stats = {
      totalTrips,
      activeTrips,
      completedTrips,
      delayedTrips,
      totalRoutes,
      totalVehicles,
      totalPersonnel,
      averageOccupancy: 0, // Calculate from actual data
      totalRevenue: 0 // Calculate from actual data
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching transport stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transport statistics',
      error: error.message
    });
  }
});

// @desc    Get available vehicles for trip assignment
// @route   GET /api/transport/available-vehicles
// @access  Private
router.get('/available-vehicles', protect, async (req, res) => {
  try {
    const { terminal, date } = req.query;
    
    let query = { status: 'active' };
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    const vehicles = await Vehicle.find(query, 'plateNumber make model seatingCapacity terminal')
      .sort({ plateNumber: 1 });
    
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available vehicles',
      error: error.message
    });
  }
});

// @desc    Get test vehicles (no authentication required for testing)
// @route   GET /api/transport/test-vehicles
// @access  Public
router.get('/test-vehicles', async (req, res) => {
  try {
    // Hard-coded test vehicles
    const testVehicles = [
      {
        _id: 'test-vehicle-1',
        plateNumber: 'TEST001',
        make: 'Toyota',
        model: 'Coaster',
        seatingCapacity: 30,
        status: 'active',
        terminal: 'Kampala',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'test-vehicle-2',
        plateNumber: 'TEST002',
        make: 'Isuzu',
        model: 'NPR',
        seatingCapacity: 25,
        status: 'active',
        terminal: 'Kigali',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.status(200).json({
      success: true,
      count: testVehicles.length,
      data: testVehicles
    });
  } catch (error) {
    console.error('Error fetching test vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test vehicles',
      error: error.message
    });
  }
});

// @desc    Get available personnel for trip assignment
// @route   GET /api/transport/available-personnel
// @access  Private
router.get('/available-personnel', protect, async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = { status: 'active' };
    
    if (role) {
      query.role = role;
    } else {
      query.role = { $in: ['driver', 'customer_care'] };
    }
    
    const personnel = await Personnel.find(query, 'firstName lastName employeeId role phone')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json({
      success: true,
      data: personnel
    });
  } catch (error) {
    console.error('Error fetching available personnel:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available personnel',
      error: error.message
    });
  }
});

// @desc    Get test personnel (no authentication required for testing)
// @route   GET /api/transport/test-personnel
// @access  Public
router.get('/test-personnel', async (req, res) => {
  try {
    // Hard-coded test personnel
    const testPersonnel = [
      {
        _id: 'test-driver-1',
        firstName: 'John',
        lastName: 'Driver',
        role: 'driver',
        employmentStatus: 'active',
        terminal: 'Kampala',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'test-driver-2',
        firstName: 'Jane',
        lastName: 'Driver',
        role: 'driver',
        employmentStatus: 'active',
        terminal: 'Kigali',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'test-care-1',
        firstName: 'Mike',
        lastName: 'Care',
        role: 'customer_care',
        employmentStatus: 'active',
        terminal: 'Kampala',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.status(200).json({
      success: true,
      count: testPersonnel.length,
      data: testPersonnel
    });
  } catch (error) {
    console.error('Error fetching test personnel:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test personnel',
      error: error.message
    });
  }
});

// ==================== DAILY SCHEDULE ROUTES ====================

// @desc    Get all daily schedules with pagination and filtering
// @route   GET /api/transport/daily-schedules
// @access  Private
router.get('/daily-schedules', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, terminal, date, route } = req.query;
    
    let query = { status: { $ne: 'deleted' } };
    
    // Terminal-based filtering
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Date filtering
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }
    
    // Route filtering
    if (route) {
      query.route = route;
    }
    
    // Status filtering
    if (status) {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const schedules = await DailySchedule.find(query)
      .populate('route', 'routeName origin destination')
      .populate('assignedVehicle', 'plateNumber make model seatingCapacity')
      .populate('assignedDriver', 'firstName lastName employeeId')
      .populate('customerCare', 'firstName lastName employeeId')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1, departureTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await DailySchedule.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: schedules.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching daily schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily schedules',
      error: error.message
    });
  }
});

// @desc    Create new daily schedule
// @route   POST /api/transport/daily-schedules
// @access  Private
router.post('/daily-schedules', protect, authorize('transport', 'create'), [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('route').isMongoId().withMessage('Valid route ID is required'),
  body('departureTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid departure time is required (HH:MM format)'),
  body('assignedVehicle').isMongoId().withMessage('Valid vehicle ID is required'),
  body('assignedDriver').isMongoId().withMessage('Valid driver ID is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('terminal').notEmpty().withMessage('Terminal is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const scheduleData = {
      ...req.body,
      terminal: req.user.role !== 'super_admin' ? req.body.terminal : req.user.terminal,
      createdBy: req.user.id
    };

    const schedule = await DailySchedule.create(scheduleData);
    
    const populatedSchedule = await DailySchedule.findById(schedule._id)
      .populate('route', 'routeName origin destination')
      .populate('assignedVehicle', 'plateNumber make model seatingCapacity')
      .populate('assignedDriver', 'firstName lastName employeeId')
      .populate('customerCare', 'firstName lastName employeeId')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Daily schedule created successfully',
      data: populatedSchedule
    });
  } catch (error) {
    console.error('Error creating daily schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating daily schedule',
      error: error.message
    });
  }
});

// @desc    Update daily schedule
// @route   PUT /api/transport/daily-schedules/:id
// @access  Private
router.put('/daily-schedules/:id', protect, authorize('transport', 'edit'), async (req, res) => {
  try {
    const schedule = await DailySchedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Daily schedule not found'
      });
    }
    
    // Check if schedule can be modified
    if (schedule.status === 'completed' || schedule.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify completed or in-progress schedules'
      });
    }
    
    const updatedSchedule = await DailySchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('route', 'routeName origin destination')
     .populate('assignedVehicle', 'plateNumber make model seatingCapacity')
     .populate('assignedDriver', 'firstName lastName employeeId')
     .populate('customerCare', 'firstName lastName employeeId')
     .populate('createdBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Daily schedule updated successfully',
      data: updatedSchedule
    });
  } catch (error) {
    console.error('Error updating daily schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating daily schedule',
      error: error.message
    });
  }
});

// @desc    Delete daily schedule
// @route   DELETE /api/transport/daily-schedules/:id
// @access  Private
router.delete('/daily-schedules/:id', protect, authorize('transport', 'edit'), async (req, res) => {
  try {
    const schedule = await DailySchedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Daily schedule not found'
      });
    }
    
    // Check if schedule can be deleted
    if (schedule.status === 'completed' || schedule.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed or in-progress schedules'
      });
    }
    
    await DailySchedule.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Daily schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting daily schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting daily schedule',
      error: error.message
    });
  }
});

// @desc    Get smart vehicle suggestions for daily schedule
// @route   GET /api/transport/smart-vehicle-suggestions
// @access  Private
router.get('/smart-vehicle-suggestions', protect, async (req, res) => {
  try {
    const { terminal, date, routeId, requiredCapacity } = req.query;
    
    if (!date || !routeId || !requiredCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Date, route ID, and required capacity are required'
      });
    }
    
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Get vehicles that are active and have valid documents
    let vehicleQuery = { 
      status: 'active',
      seatingCapacity: { $gte: parseInt(requiredCapacity) }
    };
    
    if (req.user.role !== 'super_admin') {
      vehicleQuery.terminal = req.user.terminal;
    } else if (terminal) {
      vehicleQuery.terminal = terminal;
    }
    
    // Get all active vehicles with document validation
    const allVehicles = await Vehicle.find(vehicleQuery)
      .populate('assignedDriver', 'firstName lastName employeeId')
      .sort({ seatingCapacity: 1 });
    
    // Get vehicles already assigned on this date
    const assignedVehicles = await DailySchedule.find({
      date: {
        $gte: searchDate,
        $lt: nextDay
      },
      status: { $in: ['planned', 'confirmed', 'in_progress'] }
    }).distinct('assignedVehicle');
    
    // Check vehicle documents and filter out vehicles with expired documents
    const vehiclesWithValidDocs = [];
    for (const vehicle of allVehicles) {
      // Check if vehicle has valid documents
      const criticalDocs = await VehicleDocument.find({
        vehicle: vehicle._id,
        documentType: { $in: ['insurance', 'technical_control', 'registration'] },
        status: 'active',
        expiryDate: { $gt: new Date() }
      });
      
      // Vehicle must have at least 2 critical documents valid
      if (criticalDocs.length >= 2) {
        vehiclesWithValidDocs.push(vehicle);
      }
    }
    
    // Filter out assigned vehicles and sort by best match
    const availableVehicles = vehiclesWithValidDocs
      .filter(vehicle => !assignedVehicles.includes(vehicle._id.toString()))
      .map(vehicle => ({
        _id: vehicle._id,
        plateNumber: vehicle.plateNumber,
        make: vehicle.make,
        model: vehicle.model,
        seatingCapacity: vehicle.seatingCapacity,
        terminal: vehicle.terminal,
        assignedDriver: vehicle.assignedDriver,
        // Score based on capacity match (closer to required = higher score)
        score: Math.abs(vehicle.seatingCapacity - parseInt(requiredCapacity))
      }))
      .sort((a, b) => a.score - b.score);
    
    res.status(200).json({
      success: true,
      count: availableVehicles.length,
      data: availableVehicles
    });
  } catch (error) {
    console.error('Error getting smart vehicle suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting smart vehicle suggestions',
      error: error.message
    });
  }
});

// @desc    Generate trips from daily schedules
// @route   POST /api/transport/generate-trips
// @access  Private
router.post('/generate-trips', protect, authorize('transport', 'create'), async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Get all confirmed schedules for the date
    const schedules = await DailySchedule.find({
      date: {
        $gte: searchDate,
        $lt: nextDay
      },
      status: 'confirmed',
      tripGenerated: false
    }).populate('route assignedVehicle assignedDriver customerCare');
    
    if (schedules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No confirmed schedules found for the specified date'
      });
    }
    
    const generatedTrips = [];
    
    for (const schedule of schedules) {
      try {
        // Create trip from schedule
        const departureTime = new Date(schedule.date);
        departureTime.setHours(parseInt(schedule.departureTime.split(':')[0]));
        departureTime.setMinutes(parseInt(schedule.departureTime.split(':')[1]));
        departureTime.setSeconds(0);
        departureTime.setMilliseconds(0);
        
        // Calculate arrival time based on route duration
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + schedule.route.estimatedDuration);
        
        const tripData = {
          route: schedule.route._id,
          vehicle: schedule.assignedVehicle._id,
          driver: schedule.assignedDriver._id,
          customerCare: schedule.customerCare?._id,
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          capacity: schedule.capacity,
          fare: schedule.route.fare,
          terminal: schedule.terminal,
          createdBy: req.user.id
        };
        
        const trip = await Trip.create(tripData);
        
        // Update schedule to mark trip as generated
        await DailySchedule.findByIdAndUpdate(schedule._id, {
          tripGenerated: true,
          generatedTrip: trip._id,
          status: 'in_progress'
        });
        
        generatedTrips.push(trip);
      } catch (error) {
        console.error(`Error generating trip for schedule ${schedule._id}:`, error);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Successfully generated ${generatedTrips.length} trips`,
      count: generatedTrips.length,
      data: generatedTrips
    });
  } catch (error) {
    console.error('Error generating trips:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating trips',
      error: error.message
    });
  }
});

module.exports = router;
