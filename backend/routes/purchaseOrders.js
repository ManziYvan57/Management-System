const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const PurchaseOrder = require('../models/PurchaseOrder');
const Inventory = require('../models/Inventory');

const router = express.Router();

// Get all purchase orders with filtering
router.get('/', protect, async (req, res) => {
  try {
    const { 
      search, 
      status, 
      supplier, 
      dateFilter,
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Supplier filter
    if (supplier && supplier !== 'all') {
      query.supplier = supplier;
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
        query.orderDate = { $gte: startDate };
      }
    }

    const skip = (page - 1) * limit;
    
    const purchaseOrders = await PurchaseOrder.find(query)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.inventoryItem', 'name sku');

    const total = await PurchaseOrder.countDocuments(query);

    res.json({
      success: true,
      data: purchaseOrders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch purchase orders',
      error: error.message 
    });
  }
});

// Get purchase order statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          receivedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'received'] }, 1, 0] }
          }
        }
      }
    ]);

    const monthlyStats = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalOrders: 0,
          totalValue: 0,
          averageOrderValue: 0,
          pendingOrders: 0,
          receivedOrders: 0
        },
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching purchase order stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch purchase order statistics',
      error: error.message 
    });
  }
});

// Get single purchase order
router.get('/:id', protect, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('items.inventoryItem', 'name sku category');

    if (!purchaseOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Purchase order not found' 
      });
    }

    res.json({ success: true, data: purchaseOrder });
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch purchase order',
      error: error.message 
    });
  }
});

// Create new purchase order
router.post('/', protect, [
  body('supplier').notEmpty().withMessage('Supplier is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemId').notEmpty().withMessage('Item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unitCost').isFloat({ min: 0 }).withMessage('Unit cost must be positive'),
  body('expectedDelivery').optional().isISO8601().withMessage('Invalid delivery date'),
  body('paymentTerms').optional().isString().withMessage('Payment terms must be a string'),
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

    const { supplier, items, expectedDelivery, paymentTerms, terminal } = req.body;

    // Transform items to match model structure
    const transformedItems = items.map(item => ({
      inventoryItem: item.itemId,
      itemName: item.itemName || 'Unknown Item',
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: item.quantity * item.unitCost
    }));

    // Calculate total amount
    const totalAmount = transformedItems.reduce((sum, item) => {
      return sum + item.totalCost;
    }, 0);

    // Generate order number
    const orderCount = await PurchaseOrder.countDocuments();
    const orderNumber = `PO-${String(orderCount + 1).padStart(4, '0')}`;

    const purchaseOrder = new PurchaseOrder({
      orderNumber,
      supplier: supplier, // Keep as string for now, we'll handle this differently
      items: transformedItems,
      totalAmount,
      grandTotal: totalAmount, // Set grand total same as total amount for now
      expectedDelivery,
      paymentTerms: paymentTerms || 'net_30',
      status: 'pending',
      orderDate: new Date(),
      terminal: terminal || 'Kigali', // Use provided terminal or default to Kigali
      createdBy: req.user._id // Set from authenticated user
    });

    await purchaseOrder.save();

    res.status(201).json({ 
      success: true, 
      message: 'Purchase order created successfully',
      data: purchaseOrder 
    });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create purchase order',
      error: error.message 
    });
  }
});

// Update purchase order
router.put('/:id', protect, [
  body('status').optional().isIn(['pending', 'received', 'cancelled']).withMessage('Invalid status'),
  body('expectedDelivery').optional().isISO8601().withMessage('Invalid delivery date'),
  body('paymentTerms').optional().isString().withMessage('Payment terms must be a string')
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

    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Purchase order not found' 
      });
    }

    // If status is being changed to 'received', update inventory
    if (req.body.status === 'received' && purchaseOrder.status !== 'received') {
      for (const item of purchaseOrder.items) {
        await Inventory.findByIdAndUpdate(
          item.inventoryItem,
          { $inc: { quantity: item.quantity } }
        );
      }
    }

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ 
      success: true, 
      message: 'Purchase order updated successfully',
      data: updatedOrder 
    });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update purchase order',
      error: error.message 
    });
  }
});

// Delete purchase order
router.delete('/:id', protect, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Purchase order not found' 
      });
    }

    // Only allow deletion of pending orders
    if (purchaseOrder.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending orders can be deleted' 
      });
    }

    await PurchaseOrder.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Purchase order deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete purchase order',
      error: error.message 
    });
  }
});

module.exports = router;
