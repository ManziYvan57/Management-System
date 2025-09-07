const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const { body, validationResult } = require('express-validator');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, fuelType } = req.query;
    
    // Build query based on user role
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { plateNumber: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { assignedRoute: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by fuel type
    if (fuelType) {
      query.fuelType = fuelType;
    }
    
    const vehicles = await Vehicle.find(query)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedDriver', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Vehicle.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: vehicles.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message
    });
  }
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedDriver', 'username firstName lastName');
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    

    
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle',
      error: error.message
    });
  }
});

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
router.post('/', protect, authorize('vehicles', 'create'), [
  body('plateNumber').notEmpty().withMessage('Plate number is required'),
  body('make').notEmpty().withMessage('Make is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('seatingCapacity').isInt({ min: 1 }).withMessage('Seating capacity must be at least 1'),
  body('terminal').isIn(['Kigali', 'Kampala', 'Nairobi', 'Juba']).withMessage('Valid terminal is required')
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

    // Check if plate number already exists
    const existingVehicle = await Vehicle.findOne({ 
      plateNumber: req.body.plateNumber,
      isActive: true 
    });
    
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this plate number already exists'
      });
    }
    
    const vehicleData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const vehicle = await Vehicle.create(vehicleData);
    
    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedDriver', 'username firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: populatedVehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating vehicle',
      error: error.message
    });
  }
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
router.put('/:id', protect, authorize('vehicles', 'edit'), async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    

    
    // Check if plate number is being changed and if it already exists
    if (req.body.plateNumber && req.body.plateNumber !== vehicle.plateNumber) {
      const existingVehicle = await Vehicle.findOne({ 
        plateNumber: req.body.plateNumber,
        isActive: true,
        _id: { $ne: req.params.id }
      });
      
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle with this plate number already exists'
        });
      }
    }
    

    
    // Remove createdBy from update data to prevent modification
    delete req.body.createdBy;
    
    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('createdBy', 'username firstName lastName')
    .populate('assignedDriver', 'username firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message
    });
  }
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
router.delete('/:id', protect, authorize('vehicles', 'delete'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    

    
    // Soft delete - set isActive to false
    vehicle.isActive = false;
    await vehicle.save();
    
    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message
    });
  }
});

// @desc    Get vehicle statistics
// @route   GET /api/vehicles/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    // Build query based on user role
    let query = { isActive: true };
    
    const [
      totalVehicles,
      activeVehicles,
      inactiveVehicles,
      maintenanceVehicles,
      outOfServiceVehicles,
      totalValue,
      totalMileage,
      fuelTypeStats,
      statusStats
    ] = await Promise.all([
      Vehicle.countDocuments(query),
      Vehicle.countDocuments({ ...query, status: 'active' }),
      Vehicle.countDocuments({ ...query, status: 'inactive' }),
      Vehicle.countDocuments({ ...query, status: 'maintenance' }),
      Vehicle.countDocuments({ ...query, status: 'out_of_service' }),
      Vehicle.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$currentValue' } } }
      ]),
      Vehicle.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalMileage' } } }
      ]),
      Vehicle.aggregate([
        { $match: query },
        { $group: { _id: '$fuelType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Vehicle.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalVehicles,
        activeVehicles,
        inactiveVehicles,
        maintenanceVehicles,
        outOfServiceVehicles,
        totalValue: totalValue[0]?.total || 0,
        totalMileage: totalMileage[0]?.total || 0,
        fuelTypeStats,
        statusStats
      }
    });
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle statistics',
      error: error.message
    });
  }
});

// @desc    Get available vehicles (not assigned to any driver)
// @route   GET /api/vehicles/available
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    let query = { 
      isActive: true,
      status: 'active',
      $or: [
        { assignedDriver: { $exists: false } },
        { assignedDriver: null }
      ]
    };
    
    const vehicles = await Vehicle.find(query)
      .populate('createdBy', 'username firstName lastName')
      .sort({ plateNumber: 1 });
    
    res.status(200).json({
      success: true,
      count: vehicles.length,
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

module.exports = router;
