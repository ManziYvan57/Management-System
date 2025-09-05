const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Asset = require('../models/Asset');

// @desc    Get all assets
// @route   GET /api/assets
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
        { registrationNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { assignedTo: { $regex: search, $options: 'i' } }
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
    
    const assets = await Asset.find(query)
      .populate('createdBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Asset.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: assets.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: assets
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
});

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('createdBy', 'username firstName lastName');
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    // Check terminal access
    if (req.user.role !== 'super_admin' && asset.terminal !== req.user.terminal) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this asset'
      });
    }
    
    res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset',
      error: error.message
    });
  }
});

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private
router.post('/', protect, authorize('assets', 'create'), async (req, res) => {
  try {
    // Set terminal based on user role
    const assetData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const asset = await Asset.create(assetData);
    
    const populatedAsset = await Asset.findById(asset._id)
      .populate('createdBy', 'username firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: populatedAsset
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating asset',
      error: error.message
    });
  }
});

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private
router.put('/:id', protect, authorize('assets', 'edit'), async (req, res) => {
  try {
    let asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    // Check terminal access
    if (req.user.role !== 'super_admin' && asset.terminal !== req.user.terminal) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this asset'
      });
    }
    
    // Prevent terminal change for non-super admins
    if (req.user.role !== 'super_admin') {
      delete req.body.terminal;
    }
    
    asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'username firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: asset
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating asset',
      error: error.message
    });
  }
});

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private
router.delete('/:id', protect, authorize('assets', 'delete'), async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    // Check terminal access
    if (req.user.role !== 'super_admin' && asset.terminal !== req.user.terminal) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this asset'
      });
    }
    
    // Soft delete - set isActive to false
    asset.isActive = false;
    await asset.save();
    
    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting asset',
      error: error.message
    });
  }
});

// @desc    Get asset statistics
// @route   GET /api/assets/stats/overview
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
      totalAssets,
      activeAssets,
      maintenanceAssets,
      inactiveAssets,
      totalValue,
      totalMaintenanceCost,
      categoryStats
    ] = await Promise.all([
      Asset.countDocuments(query),
      Asset.countDocuments({ ...query, status: 'active' }),
      Asset.countDocuments({ ...query, status: 'maintenance' }),
      Asset.countDocuments({ ...query, status: 'inactive' }),
      Asset.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$currentValue' } } }
      ]),
      Asset.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$maintenanceCost' } } }
      ]),
      Asset.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        activeAssets,
        maintenanceAssets,
        inactiveAssets,
        totalValue: totalValue[0]?.total || 0,
        totalMaintenanceCost: totalMaintenanceCost[0]?.total || 0,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching asset stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset statistics',
      error: error.message
    });
  }
});

module.exports = router;
