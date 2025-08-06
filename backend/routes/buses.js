const express = require('express');
const { body, validationResult } = require('express-validator');
const Bus = require('../models/Bus');
const { authenticateToken, requireAssetRegisterPermission } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const busValidation = [
  body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
  body('busType').isIn(['Mini Bus', 'Coaster', 'Large Bus', 'Truck']).withMessage('Invalid bus type'),
  body('capacity').isInt({ min: 1, max: 100 }).withMessage('Capacity must be between 1 and 100'),
  body('status').isIn(['operational', 'not_in_operation', 'parked', 'maintenance', 'reserve']).withMessage('Invalid status'),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
  body('manufacturer').trim().notEmpty().withMessage('Manufacturer is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('route').optional().isIn(['Kampala-Nairobi', 'Goma-Cyanika-Kampala', 'Nairobi-Kigali', 'Kampala-Kigali', 'Kampala-Juba', 'Juba-Bor']).withMessage('Invalid route'),
  body('assignedDriver').optional().trim().isLength({ max: 100 }).withMessage('Driver name too long'),
  body('customerCareStaff').optional().trim().isLength({ max: 100 }).withMessage('Customer care staff name too long'),
  body('departureTime').optional().trim(),
  body('teamLeader').optional().trim().isLength({ max: 100 }).withMessage('Team leader name too long'),
  body('insuranceExpiry').isISO8601().withMessage('Invalid insurance expiry date'),
  body('registrationExpiry').isISO8601().withMessage('Invalid registration expiry date'),
  body('assetValue').optional().isFloat({ min: 0 }).withMessage('Asset value cannot be negative'),
  body('purchaseDate').optional().isISO8601().withMessage('Invalid purchase date'),
  body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price cannot be negative'),
  body('currentValue').optional().isFloat({ min: 0 }).withMessage('Current value cannot be negative'),
  body('depreciationRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Depreciation rate must be between 0 and 100'),
  body('lastMaintenanceDate').optional().isISO8601().withMessage('Invalid last maintenance date'),
  body('nextMaintenanceDate').optional().isISO8601().withMessage('Invalid next maintenance date'),
  body('maintenanceInterval').optional().isInt({ min: 1 }).withMessage('Maintenance interval must be positive'),
  body('totalMaintenanceCost').optional().isFloat({ min: 0 }).withMessage('Total maintenance cost cannot be negative'),
  body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor', 'critical']).withMessage('Invalid condition'),
  body('mileage').optional().isFloat({ min: 0 }).withMessage('Mileage cannot be negative'),
  body('fuelEfficiency').optional().isFloat({ min: 0 }).withMessage('Fuel efficiency cannot be negative'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes too long'),
  body('currentLocation').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

// GET all buses with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.busType) filter.busType = req.query.busType;
    if (req.query.route) filter.route = req.query.route;
    if (req.query.condition) filter.condition = req.query.condition;
    if (req.query.assignedDriver) filter.assignedDriver = { $regex: req.query.assignedDriver, $options: 'i' };
    if (req.query.teamLeader) filter.teamLeader = { $regex: req.query.teamLeader, $options: 'i' };
    if (req.query.search) {
      filter.$or = [
        { plateNumber: { $regex: req.query.search, $options: 'i' } },
        { manufacturer: { $regex: req.query.search, $options: 'i' } },
        { model: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const buses = await Bus.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bus.countDocuments(filter);

    res.json({
      buses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({ error: 'Failed to get buses' });
  }
});

// GET bus statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [
      totalBuses,
      operationalBuses,
      maintenanceBuses,
      parkedBuses,
      reserveBuses,
      expiredInsurance,
      expiringInsurance,
      overdueMaintenance,
      dueMaintenance
    ] = await Promise.all([
      Bus.countDocuments(),
      Bus.countDocuments({ status: 'operational' }),
      Bus.countDocuments({ status: 'maintenance' }),
      Bus.countDocuments({ status: 'parked' }),
      Bus.countDocuments({ status: 'reserve' }),
      Bus.countDocuments({ insuranceExpiry: { $lt: new Date() } }),
      Bus.countDocuments({ 
        insuranceExpiry: { 
          $gte: new Date(), 
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        } 
      }),
      Bus.countDocuments({ nextMaintenanceDate: { $lt: new Date() } }),
      Bus.countDocuments({ 
        nextMaintenanceDate: { 
          $gte: new Date(), 
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        } 
      })
    ]);

    res.json({
      totalBuses,
      operationalBuses,
      maintenanceBuses,
      parkedBuses,
      reserveBuses,
      expiredInsurance,
      expiringInsurance,
      overdueMaintenance,
      dueMaintenance
    });
  } catch (error) {
    console.error('Get bus stats error:', error);
    res.status(500).json({ error: 'Failed to get bus statistics' });
  }
});

// GET single bus by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json({ bus });
  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({ error: 'Failed to get bus' });
  }
});

// POST create new bus
router.post('/', [authenticateToken, requireAssetRegisterPermission, ...busValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const bus = new Bus(req.body);
    await bus.save();

    res.status(201).json({
      message: 'Bus created successfully',
      bus
    });
  } catch (error) {
    console.error('Create bus error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Plate number already exists' });
    }
    res.status(500).json({ error: 'Failed to create bus' });
  }
});

// PUT update bus
router.put('/:id', [authenticateToken, requireAssetRegisterPermission, ...busValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json({
      message: 'Bus updated successfully',
      bus
    });
  } catch (error) {
    console.error('Update bus error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Plate number already exists' });
    }
    res.status(500).json({ error: 'Failed to update bus' });
  }
});

// DELETE bus
router.delete('/:id', [authenticateToken, requireAssetRegisterPermission], async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({ error: 'Failed to delete bus' });
  }
});

// PATCH update bus maintenance
router.patch('/:id/maintenance', [
  authenticateToken, 
  requireAssetRegisterPermission,
  body('cost').optional().isFloat({ min: 0 }).withMessage('Maintenance cost cannot be negative'),
  body('date').optional().isISO8601().withMessage('Invalid maintenance date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    if (req.body.cost) {
      bus.addMaintenanceCost(req.body.cost);
    }

    if (req.body.date) {
      bus.lastMaintenanceDate = new Date(req.body.date);
      bus.scheduleNextMaintenance();
    }

    await bus.save();

    res.json({
      message: 'Maintenance updated successfully',
      bus
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({ error: 'Failed to update maintenance' });
  }
});

module.exports = router; 