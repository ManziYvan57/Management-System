const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all routes
// @route   GET /api/transport/routes
// @access  Private
router.get('/routes', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, terminal } = req.query;
    
    // Build query based on user role and terminal
    let query = { isActive: true };
    
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
    
    // Mock routes data
    const mockRoutes = [
      {
        _id: '1',
        routeName: 'Kampala-Nairobi',
        origin: 'Kampala',
        destination: 'Nairobi',
        distance: 850,
        estimatedDuration: 12,
        fare: 45000,
        status: 'active',
        terminal: req.user.terminal || 'kampala',
        createdBy: req.user.id
      },
      {
        _id: '2',
        routeName: 'Goma-Kampala',
        origin: 'Goma',
        destination: 'Kampala',
        distance: 650,
        estimatedDuration: 10,
        fare: 35000,
        status: 'active',
        terminal: req.user.terminal || 'kampala',
        createdBy: req.user.id
      },
      {
        _id: '3',
        routeName: 'Nairobi-Kigali',
        origin: 'Nairobi',
        destination: 'Kigali',
        distance: 1200,
        estimatedDuration: 16,
        fare: 55000,
        status: 'active',
        terminal: req.user.terminal || 'nairobi',
        createdBy: req.user.id
      }
    ];
    
    const total = mockRoutes.length;
    
    res.status(200).json({
      success: true,
      count: mockRoutes.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: mockRoutes
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

// @desc    Get all trips
// @route   GET /api/transport/trips
// @access  Private
router.get('/trips', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, route, terminal } = req.query;
    
    // Build query based on user role and terminal
    let query = { isActive: true };
    
    // Terminal-based filtering
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { tripNumber: { $regex: search, $options: 'i' } },
        { busPlate: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } }
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
    
    // Mock trips data
    const mockTrips = [
      {
        _id: '1',
        tripNumber: 'TRP001',
        route: 'Kampala-Nairobi',
        busPlate: 'UAB 123A',
        driverName: 'John Driver',
        departureTime: '2024-01-20T08:00:00Z',
        arrivalTime: '2024-01-20T20:00:00Z',
        status: 'departed',
        passengers: 45,
        capacity: 50,
        fare: 45000,
        terminal: req.user.terminal || 'kampala',
        createdBy: req.user.id
      },
      {
        _id: '2',
        tripNumber: 'TRP002',
        route: 'Goma-Kampala',
        busPlate: 'RAB 456B',
        driverName: 'Sarah Driver',
        departureTime: '2024-01-20T10:00:00Z',
        arrivalTime: '2024-01-20T20:00:00Z',
        status: 'boarding',
        passengers: 35,
        capacity: 50,
        fare: 35000,
        terminal: req.user.terminal || 'kampala',
        createdBy: req.user.id
      },
      {
        _id: '3',
        tripNumber: 'TRP003',
        route: 'Nairobi-Kigali',
        busPlate: 'KCA 789C',
        driverName: 'David Driver',
        departureTime: '2024-01-20T14:00:00Z',
        arrivalTime: '2024-01-21T06:00:00Z',
        status: 'scheduled',
        passengers: 0,
        capacity: 50,
        fare: 55000,
        terminal: req.user.terminal || 'nairobi',
        createdBy: req.user.id
      }
    ];
    
    const total = mockTrips.length;
    
    res.status(200).json({
      success: true,
      count: mockTrips.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: mockTrips
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
router.post('/trips', protect, authorize('transport', 'create'), async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      terminal: req.user.role === 'super_admin' ? req.body.terminal : req.user.terminal,
      createdBy: req.user.id,
      status: 'scheduled'
    };
    
    // Mock response for now
    const mockTrip = {
      _id: Date.now().toString(),
      ...tripData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: mockTrip
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

// @desc    Get transport statistics
// @route   GET /api/transport/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { terminal } = req.query;
    
    // Build query based on user role and terminal
    let query = { isActive: true };
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Mock statistics
    const stats = {
      totalTrips: 45,
      activeTrips: 12,
      completedTrips: 28,
      delayedTrips: 5,
      totalRevenue: 1850000,
      averageOccupancy: 78.5,
      routes: [
        { name: 'Kampala-Nairobi', trips: 15, revenue: 675000 },
        { name: 'Goma-Kampala', trips: 12, revenue: 420000 },
        { name: 'Nairobi-Kigali', trips: 18, revenue: 755000 }
      ],
      topDrivers: [
        { name: 'John Driver', trips: 25, rating: 4.8 },
        { name: 'Sarah Driver', trips: 22, rating: 4.7 },
        { name: 'David Driver', trips: 20, rating: 4.6 }
      ]
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

module.exports = router;
