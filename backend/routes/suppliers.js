const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    // Build query based on user role
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const suppliers = await Supplier.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Supplier.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: suppliers.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suppliers',
      error: error.message
    });
  }
});

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private
router.post('/', protect, authorize('inventory', 'create'), [
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('contactPerson').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('address').optional().trim(),
  body('website').optional().trim(),
  body('taxId').optional().trim(),
  body('paymentTerms').optional().isIn(['immediate', 'net_30', 'net_60', 'net_90', 'other']).withMessage('Invalid payment terms'),
  body('creditLimit').optional().isNumeric().withMessage('Credit limit must be a number'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('notes').optional().trim()
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

    const supplierData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const supplier = new Supplier(supplierData);
    await supplier.save();
    
    await supplier.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating supplier',
      error: error.message
    });
  }
});

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier',
      error: error.message
    });
  }
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
router.put('/:id', protect, authorize('inventory', 'edit'), [
  body('name').optional().notEmpty().withMessage('Supplier name cannot be empty'),
  body('contactPerson').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('address').optional().trim(),
  body('website').optional().trim(),
  body('taxId').optional().trim(),
  body('paymentTerms').optional().isIn(['immediate', 'net_30', 'net_60', 'net_90', 'other']).withMessage('Invalid payment terms'),
  body('creditLimit').optional().isNumeric().withMessage('Credit limit must be a number'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('notes').optional().trim()
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

    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Update fields
    Object.assign(supplier, req.body, {
      updatedBy: req.user.id
    });
    
    await supplier.save();
    await supplier.populate('createdBy', 'firstName lastName');
    await supplier.populate('updatedBy', 'firstName lastName');
    
    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating supplier',
      error: error.message
    });
  }
});

// @desc    Delete supplier (soft delete)
// @route   DELETE /api/suppliers/:id
// @access  Private
router.delete('/:id', protect, authorize('inventory', 'delete'), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    // Soft delete
    supplier.isActive = false;
    supplier.updatedBy = req.user.id;
    await supplier.save();
    
    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting supplier',
      error: error.message
    });
  }
});

// @desc    Get supplier statistics
// @route   GET /api/suppliers/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    // Build query based on user role
    let query = { isActive: true };
    
    // Get statistics
    const totalSuppliers = await Supplier.countDocuments(query);
    const activeSuppliers = await Supplier.countDocuments({ ...query, status: 'active' });
    const inactiveSuppliers = await Supplier.countDocuments({ ...query, status: 'inactive' });
    const suspendedSuppliers = await Supplier.countDocuments({ ...query, status: 'suspended' });
    
    // Rating statistics
    const ratingStats = await Supplier.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: '$rating', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Payment terms statistics
    const paymentTermsStats = await Supplier.aggregate([
      { $match: query },
      { 
        $group: { 
          _id: '$paymentTerms', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    // Recent suppliers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSuppliers = await Supplier.countDocuments({
      ...query,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const stats = {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      suspendedSuppliers,
      ratingStats: ratingStats.map(stat => ({
        rating: stat._id,
        count: stat.count
      })),
      paymentTermsStats: paymentTermsStats.map(stat => ({
        terms: stat._id,
        count: stat.count
      })),
      recentSuppliers
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching supplier stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier statistics',
      error: error.message
    });
  }
});

module.exports = router;
