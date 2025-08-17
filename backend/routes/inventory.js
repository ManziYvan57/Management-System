const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

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
    if (category) {
      query.category = category;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Mock inventory data for now
    const mockInventory = [
      {
        _id: '1',
        name: 'Engine Oil 5W-30',
        sku: 'OIL-001',
        category: 'Lubricants',
        description: 'High-quality engine oil for diesel engines',
        quantity: 50,
        unit: 'liters',
        unitCost: 2500,
        totalValue: 125000,
        reorderPoint: 10,
        supplier: 'OilCo Ltd',
        location: 'Warehouse A',
        status: 'in-stock',
        terminal: req.user.terminal || 'kigali',
        createdBy: req.user.id
      },
      {
        _id: '2',
        name: 'Brake Pads Set',
        sku: 'BRAKE-001',
        category: 'Brake Parts',
        description: 'Front brake pads for Toyota Coaster',
        quantity: 15,
        unit: 'sets',
        unitCost: 15000,
        totalValue: 225000,
        reorderPoint: 5,
        supplier: 'BrakeParts Inc',
        location: 'Warehouse B',
        status: 'low-stock',
        terminal: req.user.terminal || 'kigali',
        createdBy: req.user.id
      },
      {
        _id: '3',
        name: 'Air Filter',
        sku: 'FILTER-001',
        category: 'Filters',
        description: 'Engine air filter for Isuzu NPR',
        quantity: 25,
        unit: 'pieces',
        unitCost: 8000,
        totalValue: 200000,
        reorderPoint: 8,
        supplier: 'FilterPro',
        location: 'Warehouse A',
        status: 'in-stock',
        terminal: req.user.terminal || 'kigali',
        createdBy: req.user.id
      }
    ];
    
    const total = mockInventory.length;
    
    res.status(200).json({
      success: true,
      count: mockInventory.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: mockInventory
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
router.post('/', protect, authorize('inventory', 'create'), async (req, res) => {
  try {
    const inventoryData = {
      ...req.body,
      terminal: req.user.role === 'super_admin' ? req.body.terminal : req.user.terminal,
      createdBy: req.user.id,
      totalValue: req.body.quantity * req.body.unitCost
    };
    
    // Mock response for now
    const mockItem = {
      _id: Date.now().toString(),
      ...inventoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: mockItem
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
    
    // Mock statistics
    const stats = {
      totalItems: 45,
      totalValue: 2500000,
      lowStockItems: 8,
      outOfStockItems: 2,
      categories: [
        { name: 'Lubricants', count: 12, value: 800000 },
        { name: 'Brake Parts', count: 8, value: 600000 },
        { name: 'Filters', count: 15, value: 400000 },
        { name: 'Electrical', count: 10, value: 700000 }
      ],
      topSuppliers: [
        { name: 'OilCo Ltd', items: 15, value: 900000 },
        { name: 'BrakeParts Inc', items: 8, value: 600000 },
        { name: 'FilterPro', items: 12, value: 400000 }
      ]
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

module.exports = router;
