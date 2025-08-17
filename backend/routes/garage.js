const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all work orders
// @route   GET /api/garage/work-orders
// @access  Private
router.get('/work-orders', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, priority, terminal } = req.query;
    
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
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { assignedTo: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by priority
    if (priority) {
      query.priority = priority;
    }
    
    // For now, return mock data until we create the WorkOrder model
    const mockWorkOrders = [
      {
        _id: '1',
        title: 'Engine Oil Change',
        description: 'Regular oil change for Bus #001',
        status: 'in-progress',
        priority: 'medium',
        assignedTo: 'John Mechanic',
        estimatedCost: 50000,
        actualCost: 45000,
        startDate: '2024-01-15',
        completionDate: null,
        terminal: req.user.terminal || 'kigali',
        createdBy: req.user.id
      },
      {
        _id: '2',
        title: 'Brake System Repair',
        description: 'Fix brake issues on Bus #002',
        status: 'completed',
        priority: 'high',
        assignedTo: 'Sarah Technician',
        estimatedCost: 150000,
        actualCost: 140000,
        startDate: '2024-01-10',
        completionDate: '2024-01-12',
        terminal: req.user.terminal || 'kigali',
        createdBy: req.user.id
      }
    ];
    
    const total = mockWorkOrders.length;
    
    res.status(200).json({
      success: true,
      count: mockWorkOrders.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: mockWorkOrders
    });
  } catch (error) {
    console.error('Error fetching work orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching work orders',
      error: error.message
    });
  }
});

// @desc    Create new work order
// @route   POST /api/garage/work-orders
// @access  Private
router.post('/work-orders', protect, authorize('garage', 'create'), async (req, res) => {
  try {
    const workOrderData = {
      ...req.body,
      terminal: req.user.role === 'super_admin' ? req.body.terminal : req.user.terminal,
      createdBy: req.user.id,
      status: 'pending'
    };
    
    // For now, return mock response until we create the WorkOrder model
    const mockWorkOrder = {
      _id: Date.now().toString(),
      ...workOrderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Work order created successfully',
      data: mockWorkOrder
    });
  } catch (error) {
    console.error('Error creating work order:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating work order',
      error: error.message
    });
  }
});

// @desc    Get garage statistics
// @route   GET /api/garage/stats
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
    
    // Mock statistics for now
    const stats = {
      totalWorkOrders: 15,
      pendingWorkOrders: 5,
      inProgressWorkOrders: 3,
      completedWorkOrders: 7,
      totalCost: 2500000,
      averageCompletionTime: 3.2, // days
      topTechnicians: [
        { name: 'John Mechanic', completed: 8 },
        { name: 'Sarah Technician', completed: 6 },
        { name: 'Mike Engineer', completed: 4 }
      ]
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching garage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching garage statistics',
      error: error.message
    });
  }
});

module.exports = router;
