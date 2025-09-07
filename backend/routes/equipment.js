const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Equipment = require('../models/Equipment');
const { body, validationResult } = require('express-validator');

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
router.get('/', protect, authorize('equipment', 'read'), async (req, res) => {
  try {
    const { search, status, category, terminal } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Terminal filtering - show all terminals for all users, filter by query param if provided
    if (terminal) {
      query.terminal = terminal;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    const equipment = await Equipment.find(query)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedTo', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment',
      error: error.message
    });
  }
});

// @desc    Get equipment statistics overview
// @route   GET /api/equipment/stats/overview
// @access  Private
router.get('/stats/overview', protect, authorize('equipment', 'read'), async (req, res) => {
  try {
    const query = { isActive: true };
    
    // Terminal filtering - allow both super_admin and admin to see all terminals
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      query.terminal = req.user.terminal;
    }
    
    const [
      totalEquipment,
      activeEquipment,
      inactiveEquipment,
      maintenanceEquipment,
      outOfServiceEquipment,
      totalValue,
      categoryStats
    ] = await Promise.all([
      Equipment.countDocuments(query),
      Equipment.countDocuments({ ...query, status: 'active' }),
      Equipment.countDocuments({ ...query, status: 'inactive' }),
      Equipment.countDocuments({ ...query, status: 'maintenance' }),
      Equipment.countDocuments({ ...query, status: 'out_of_service' }),
      Equipment.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$currentValue' } } }
      ]),
      Equipment.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalEquipment,
        activeEquipment,
        inactiveEquipment,
        maintenanceEquipment,
        outOfServiceEquipment,
        totalValue: totalValue[0]?.total || 0,
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching equipment stats overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment statistics overview',
      error: error.message
    });
  }
});

// @desc    Get equipment statistics
// @route   GET /api/equipment/stats
// @access  Private
router.get('/stats', protect, authorize('equipment', 'read'), async (req, res) => {
  try {
    const query = { isActive: true };
    
    // Terminal filtering - allow both super_admin and admin to see all terminals
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      query.terminal = req.user.terminal;
    }
    
    const stats = await Equipment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalValue: { $sum: '$currentValue' },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          inUse: {
            $sum: { $cond: [{ $eq: ['$status', 'in_use'] }, 1, 0] }
          },
          maintenance: {
            $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
          },
          retired: {
            $sum: { $cond: [{ $eq: ['$status', 'retired'] }, 1, 0] }
          }
        }
      }
    ]);
    
    const categoryStats = await Equipment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          totalValue: 0,
          available: 0,
          inUse: 0,
          maintenance: 0,
          retired: 0
        },
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching equipment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment statistics',
      error: error.message
    });
  }
});

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
router.get('/:id', protect, authorize('equipment', 'read'), async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedTo', 'username firstName lastName');
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    // Check terminal access - allow both super_admin and admin to access any terminal
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && equipment.terminal !== req.user.terminal) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this equipment'
      });
    }
    
    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment',
      error: error.message
    });
  }
});

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Private
router.post('/', protect, authorize('equipment', 'create'), [
  body('name').notEmpty().withMessage('Equipment name is required'),
  body('category').isIn(['tools', 'electronics', 'safety', 'office', 'maintenance']).withMessage('Valid category is required'),
  body('status').isIn(['available', 'in_use', 'maintenance', 'retired']).withMessage('Valid status is required'),
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

    // Check if serial number already exists (if provided)
    if (req.body.serialNumber) {
      const existingEquipment = await Equipment.findOne({ 
        serialNumber: req.body.serialNumber,
        isActive: true 
      });
      
      if (existingEquipment) {
        return res.status(400).json({
          success: false,
          message: 'Equipment with this serial number already exists'
        });
      }
    }
    
    // Use terminal from request body (form data)
    const equipmentData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const equipment = await Equipment.create(equipmentData);
    
    const populatedEquipment = await Equipment.findById(equipment._id)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedTo', 'username firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: populatedEquipment
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating equipment',
      error: error.message
    });
  }
});

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private
router.put('/:id', protect, authorize('equipment', 'edit'), async (req, res) => {
  try {
    let equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    // Check terminal access - allow both super_admin and admin to access any terminal
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && equipment.terminal !== req.user.terminal) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this equipment'
      });
    }
    
    // Check if serial number is being changed and if it already exists
    if (req.body.serialNumber && req.body.serialNumber !== equipment.serialNumber) {
      const existingEquipment = await Equipment.findOne({ 
        serialNumber: req.body.serialNumber,
        isActive: true,
        _id: { $ne: req.params.id }
      });
      
      if (existingEquipment) {
        return res.status(400).json({
          success: false,
          message: 'Equipment with this serial number already exists'
        });
      }
    }
    
    // Allow terminal changes for all users (terminal is validated by the model)
    
    // Remove createdBy from update data to prevent modification
    delete req.body.createdBy;
    
    equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('createdBy', 'username firstName lastName')
    .populate('assignedTo', 'username firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating equipment',
      error: error.message
    });
  }
});

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private
router.delete('/:id', protect, authorize('equipment', 'delete'), async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    // Debug logging
    console.log('Equipment deletion attempt:', {
      equipmentId: req.params.id,
      equipmentTerminal: equipment.terminal,
      userRole: req.user.role,
      userTerminal: req.user.terminal,
      isSuperAdmin: req.user.role === 'super_admin'
    });
    
    // Check terminal access - allow both super_admin and admin to delete from any terminal
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && equipment.terminal !== req.user.terminal) {
      console.log('Access denied: User terminal does not match equipment terminal');
      return res.status(403).json({
        success: false,
        message: 'Access denied to this equipment'
      });
    }
    
    // Soft delete - set isActive to false
    equipment.isActive = false;
    await equipment.save();
    
    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting equipment',
      error: error.message
    });
  }
});

// @desc    Get available equipment
// @route   GET /api/equipment/available
// @access  Private
router.get('/available', protect, authorize('equipment', 'read'), async (req, res) => {
  try {
    const query = { 
      isActive: true,
      status: 'active'
    };
    
    // Terminal filtering - allow both super_admin and admin to see all terminals
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      query.terminal = req.user.terminal;
    }
    
    const equipment = await Equipment.find(query)
      .select('name category type serialNumber location terminal')
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    console.error('Error fetching available equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available equipment',
      error: error.message
    });
  }
});

module.exports = router;
