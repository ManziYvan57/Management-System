const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const StockMovement = require('../models/StockMovement');
const Inventory = require('../models/Inventory');

const router = express.Router();

// Get all stock movements with filtering
router.get('/', protect, async (req, res) => {
  try {
    const { 
      search, 
      type, 
      itemId,
      dateFilter,
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    // Type filter
    if (type && type !== 'all') {
      query.movementType = type;
    }

    // Item filter
    if (itemId && itemId !== 'all') {
      query.inventoryItem = itemId;
    }

    // Date filter
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateFilter) {
        case 'this-month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last-3-months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.date = { $gte: startDate };
      }
    }

    const skip = (page - 1) * limit;
    
    const stockMovements = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('inventoryItem', 'name sku category');

    const total = await StockMovement.countDocuments(query);

    res.json({
      success: true,
      data: stockMovements,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock movements',
      error: error.message 
    });
  }
});

// Get stock movement statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await StockMovement.aggregate([
      {
        $group: {
          _id: null,
          totalMovements: { $sum: 1 },
          totalInQuantity: {
            $sum: { $cond: [{ $eq: ['$movementType', 'in'] }, '$quantity', 0] }
          },
          totalOutQuantity: {
            $sum: { $cond: [{ $eq: ['$movementType', 'out'] }, '$quantity', 0] }
          },
          netQuantity: {
            $sum: { 
              $cond: [
                { $eq: ['$movementType', 'in'] }, 
                '$quantity', 
                { $multiply: ['$quantity', -1] }
              ] 
            }
          }
        }
      }
    ]);

    const typeStats = await StockMovement.aggregate([
      {
        $group: {
          _id: '$movementType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const monthlyStats = await StockMovement.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$movementType'
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 24 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalMovements: 0,
          totalInQuantity: 0,
          totalOutQuantity: 0,
          netQuantity: 0
        },
        typeStats,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching stock movement stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock movement statistics',
      error: error.message 
    });
  }
});

// Get single stock movement
router.get('/:id', protect, async (req, res) => {
  try {
    const stockMovement = await StockMovement.findById(req.params.id)
      .populate('inventoryItem', 'name sku category');

    if (!stockMovement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stock movement not found' 
      });
    }

    res.json({ success: true, data: stockMovement });
  } catch (error) {
    console.error('Error fetching stock movement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stock movement',
      error: error.message 
    });
  }
});

// Create new stock movement
router.post('/', protect, [
  body('inventoryItem').notEmpty().withMessage('Item ID is required'),
  body('movementType').isIn(['in', 'out']).withMessage('Type must be either "in" or "out"'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('reference').optional().isString().withMessage('Reference must be a string'),
  body('referenceType').optional().isIn(['purchase_order', 'work_order', 'maintenance', 'manual', 'system', 'other']).withMessage('Invalid reference type'),
  body('terminal').notEmpty().withMessage('Terminal is required').isIn(['Kigali', 'Kampala', 'Nairobi', 'Juba', 'Goma', 'Bor']).withMessage('Invalid terminal')
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

    const { inventoryItem, movementType, quantity, reason, reference, referenceType, terminal } = req.body;

    // Check if item exists
    const item = await Inventory.findById(inventoryItem);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // For out movements, check if enough stock is available
    if (movementType === 'out' && item.quantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient stock available' 
      });
    }

    const stockMovement = new StockMovement({
      inventoryItem,
      itemName: item.name,
      movementType,
      quantity,
      previousQuantity: item.quantity,
      newQuantity: movementType === 'in' ? item.quantity + quantity : item.quantity - quantity,
      unitCost: item.unitCost,
      reason,
      reference,
      referenceType: referenceType || 'manual',
      terminal: terminal || 'Kigali', // Use provided terminal or default to Kigali
      createdBy: req.user._id
    });

    await stockMovement.save();

    // Update inventory quantity
    const quantityChange = movementType === 'in' ? quantity : -quantity;
    await Inventory.findByIdAndUpdate(
      inventoryItem,
      { $inc: { quantity: quantityChange } }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Stock movement created successfully',
      data: stockMovement 
    });
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create stock movement',
      error: error.message 
    });
  }
});

// Update stock movement
router.put('/:id', protect, [
  body('reason').optional().notEmpty().withMessage('Reason cannot be empty'),
  body('reference').optional().isString().withMessage('Reference must be a string'),
  body('location').optional().isString().withMessage('Location must be a string')
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

    const stockMovement = await StockMovement.findById(req.params.id);
    if (!stockMovement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stock movement not found' 
      });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['reason', 'reference', 'location'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedMovement = await StockMovement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ 
      success: true, 
      message: 'Stock movement updated successfully',
      data: updatedMovement 
    });
  } catch (error) {
    console.error('Error updating stock movement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update stock movement',
      error: error.message 
    });
  }
});

// Delete stock movement (only for recent movements)
router.delete('/:id', protect, async (req, res) => {
  try {
    const stockMovement = await StockMovement.findById(req.params.id);
    if (!stockMovement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Stock movement not found' 
      });
    }

    // Only allow deletion of movements from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (stockMovement.createdAt < oneDayAgo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only recent stock movements (within 24 hours) can be deleted' 
      });
    }

    // Reverse the inventory change
    const quantityChange = stockMovement.movementType === 'in' ? -stockMovement.quantity : stockMovement.quantity;
    await Inventory.findByIdAndUpdate(
      stockMovement.inventoryItem,
      { $inc: { quantity: quantityChange } }
    );

    await StockMovement.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Stock movement deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting stock movement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete stock movement',
      error: error.message 
    });
  }
});

module.exports = router;
