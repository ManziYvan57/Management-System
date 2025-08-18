const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Equipment = require('../models/Equipment');

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status, terminal } = req.query;
    
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
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    const equipment = await Equipment.find(query)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedTo', 'username firstName lastName')
      .populate('assignedVehicle', 'plateNumber make model')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Equipment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: equipment.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
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

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedTo', 'username firstName lastName')
      .populate('assignedVehicle', 'plateNumber make model');
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    // Check terminal access
    if (req.user.role !== 'super_admin' && equipment.terminal !== req.user.terminal) {
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
router.post('/', protect, authorize('equipment', 'create'), async (req, res) => {
  try {
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
    
    // Set terminal based on user role
    const equipmentData = {
      ...req.body,
      terminal: req.user.role === 'super_admin' ? req.body.terminal : req.user.terminal,
      createdBy: req.user.id
    };
    
    const equipment = await Equipment.create(equipmentData);
    
    const populatedEquipment = await Equipment.findById(equipment._id)
      .populate('createdBy', 'username firstName lastName')
      .populate('assignedTo', 'username firstName lastName')
      .populate('assignedVehicle', 'plateNumber make model');
    
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
    
    // Check terminal access
    if (req.user.role !== 'super_admin' && equipment.terminal !== req.user.terminal) {
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
    
    // Prevent terminal change for non-super admins
    if (req.user.role !== 'super_admin') {
      delete req.body.terminal;
    }
    
    equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('createdBy', 'username firstName lastName')
    .populate('assignedTo', 'username firstName lastName')
    .populate('assignedVehicle', 'plateNumber make model');
    
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
    
    // Check terminal access
    if (req.user.role !== 'super_admin' && equipment.terminal !== req.user.terminal) {
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

// @desc    Get equipment statistics
// @route   GET /api/equipment/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const { terminal } = req.query;
    
    // Build query based on user role and terminal
    let query = { isActive: true };
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    const [
      totalEquipment,
      availableEquipment,
      inUseEquipment,
      maintenanceEquipment,
      totalValue,
      totalMaintenanceCost,
      categoryStats,
      conditionStats
    ] = await Promise.all([
      Equipment.countDocuments(query),
      Equipment.countDocuments({ ...query, status: 'available' }),
      Equipment.countDocuments({ ...query, status: 'in_use' }),
      Equipment.countDocuments({ ...query, status: 'maintenance' }),
      Equipment.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$currentValue' } } }
      ]),
      Equipment.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$maintenanceCost' } } }
      ]),
      Equipment.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Equipment.aggregate([
        { $match: query },
        { $group: { _id: '$condition', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalEquipment,
        availableEquipment,
        inUseEquipment,
        maintenanceEquipment,
        totalValue: totalValue[0]?.total || 0,
        totalMaintenanceCost: totalMaintenanceCost[0]?.total || 0,
        categoryStats,
        conditionStats
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

// @desc    Get available equipment (not assigned to anyone)
// @route   GET /api/equipment/available
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    const { terminal } = req.query;
    
    let query = { 
      isActive: true,
      status: 'available',
      $or: [
        { assignedTo: { $exists: false } },
        { assignedTo: null }
      ]
    };
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    const equipment = await Equipment.find(query)
      .populate('createdBy', 'username firstName lastName')
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
