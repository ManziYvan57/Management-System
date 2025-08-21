const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
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
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const inventory = await Inventory.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Inventory.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: inventory.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message
    });
  }
});

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
router.post('/', protect, authorize('inventory', 'create'), [
  body('name').notEmpty().withMessage('Item name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('category').isIn([
    'Lubricants', 'Brake System', 'Filters', 'Electrical', 'Tires', 
    'Tools', 'Safety Equipment', 'Consumables', 'Spare Parts', 'Other'
  ]).withMessage('Invalid category'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unit').isIn(['pieces', 'liters', 'sets', 'pairs', 'boxes', 'meters', 'kg', 'other']).withMessage('Invalid unit'),
  body('minQuantity').isNumeric().withMessage('Minimum quantity must be a number'),
  body('unitCost').isNumeric().withMessage('Unit cost must be a number'),
  body('supplier.name').notEmpty().withMessage('Supplier name is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if SKU already exists
    const existingItem = await Inventory.findOne({ sku: req.body.sku.toUpperCase() });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    const inventoryData = {
      ...req.body,
      sku: req.body.sku.toUpperCase(),
      terminal: req.user.role === 'super_admin' ? req.body.terminal : req.user.terminal,
      createdBy: req.user.id
    };
    
    const inventory = new Inventory(inventoryData);
    await inventory.save();
    
    await inventory.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating inventory item',
      error: error.message
    });
  }
});

// @desc    Get inventory statistics
// @route   GET /api/inventory/stats
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
    
    // Get real statistics from database
    const totalItems = await Inventory.countDocuments(query);
    const totalValue = await Inventory.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$totalValue' } } }
    ]);
    
    const lowStockItems = await Inventory.countDocuments({
      ...query,
      quantity: { $lte: '$minQuantity' },
      quantity: { $gt: 0 }
    });
    
    const outOfStockItems = await Inventory.countDocuments({
      ...query,
      quantity: 0
    });
    
    // Category statistics
    const categories = await Inventory.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          value: { $sum: '$totalValue' }
        } 
      },
      { $sort: { value: -1 } }
    ]);
    
    // Supplier statistics
    const suppliers = await Inventory.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: '$supplier.name', 
          items: { $sum: 1 },
          value: { $sum: '$totalValue' }
        } 
      },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);
    
    const stats = {
      totalItems,
      totalValue: totalValue[0]?.total || 0,
      lowStockItems,
      outOfStockItems,
      categories: categories.map(cat => ({
        name: cat._id,
        count: cat.count,
        value: cat.value
      })),
      topSuppliers: suppliers.map(sup => ({
        name: sup._id,
        items: sup.items,
        value: sup.value
      }))
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory statistics',
      error: error.message
    });
  }
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory item',
      error: error.message
    });
  }
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
router.put('/:id', protect, authorize('inventory', 'edit'), [
  body('name').optional().notEmpty().withMessage('Item name cannot be empty'),
  body('category').optional().isIn([
    'Lubricants', 'Brake System', 'Filters', 'Electrical', 'Tires', 
    'Tools', 'Safety Equipment', 'Consumables', 'Spare Parts', 'Other'
  ]).withMessage('Invalid category'),
  body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
  body('unit').optional().isIn(['pieces', 'liters', 'sets', 'pairs', 'boxes', 'meters', 'kg', 'other']).withMessage('Invalid unit'),
  body('minQuantity').optional().isNumeric().withMessage('Minimum quantity must be a number'),
  body('unitCost').optional().isNumeric().withMessage('Unit cost must be a number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const inventory = await Inventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Update fields
    Object.assign(inventory, req.body, {
      updatedBy: req.user.id
    });
    
    await inventory.save();
    await inventory.populate('createdBy', 'firstName lastName');
    await inventory.populate('updatedBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating inventory item',
      error: error.message
    });
  }
});

// @desc    Delete inventory item (soft delete)
// @route   DELETE /api/inventory/:id
// @access  Private
router.delete('/:id', protect, authorize('inventory', 'delete'), async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Soft delete
    inventory.isActive = false;
    inventory.updatedBy = req.user.id;
    await inventory.save();
    
    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory item',
      error: error.message
    });
  }
});

// @desc    Update stock quantity
// @route   PATCH /api/inventory/:id/stock
// @access  Private
router.patch('/:id/stock', protect, authorize('inventory', 'edit'), [
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('reason').notEmpty().withMessage('Reason for stock change is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const inventory = await Inventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Update quantity
    inventory.quantity = parseInt(req.body.quantity);
    inventory.updatedBy = req.user.id;
    
    await inventory.save();
    await inventory.populate('createdBy', 'firstName lastName');
    await inventory.populate('updatedBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Stock quantity updated successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating stock quantity',
      error: error.message
    });
  }
});

module.exports = router;
