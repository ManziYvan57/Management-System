const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all personnel
// @route   GET /api/personnel
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, status, terminal } = req.query;
    
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
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by department
    if (department) {
      query.department = department;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Mock personnel data
    const mockPersonnel = [
      {
        _id: '1',
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Driver',
        email: 'john.driver@trinity.com',
        phone: '+250700000001',
        department: 'drivers',
        position: 'Senior Driver',
        hireDate: '2020-03-15',
        salary: 450000,
        status: 'active',
        licenseNumber: 'DL123456',
        licenseExpiry: '2025-12-31',
        emergencyContact: {
          name: 'Jane Driver',
          phone: '+250700000002',
          relationship: 'Spouse'
        },
        terminal: req.user.terminal || 'kigali',
        createdBy: req.user.id
      },
      {
        _id: '2',
        employeeId: 'EMP002',
        firstName: 'Sarah',
        lastName: 'Mechanic',
        email: 'sarah.mechanic@trinity.com',
        phone: '+250700000003',
        department: 'garage',
        position: 'Lead Mechanic',
        hireDate: '2019-08-10',
        salary: 550000,
        status: 'active',
        certifications: ['ASE Certified', 'Diesel Engine Specialist'],
        emergencyContact: {
          name: 'Mike Mechanic',
          phone: '+250700000004',
          relationship: 'Brother'
        },
        terminal: req.user.terminal || 'kigali',
        createdBy: req.user.id
      },
      {
        _id: '3',
        employeeId: 'EMP003',
        firstName: 'David',
        lastName: 'Manager',
        email: 'david.manager@trinity.com',
        phone: '+250700000005',
        department: 'management',
        position: 'Operations Manager',
        hireDate: '2018-01-15',
        salary: 750000,
        status: 'active',
        emergencyContact: {
          name: 'Lisa Manager',
          phone: '+250700000006',
          relationship: 'Spouse'
        },
        terminal: req.user.terminal || 'kigali',
        createdBy: req.user.id
      }
    ];
    
    const total = mockPersonnel.length;
    
    res.status(200).json({
      success: true,
      count: mockPersonnel.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: mockPersonnel
    });
  } catch (error) {
    console.error('Error fetching personnel:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching personnel',
      error: error.message
    });
  }
});

// @desc    Create new personnel
// @route   POST /api/personnel
// @access  Private
router.post('/', protect, authorize('personnel', 'create'), async (req, res) => {
  try {
    const personnelData = {
      ...req.body,
      terminal: req.user.role === 'super_admin' ? req.body.terminal : req.user.terminal,
      createdBy: req.user.id,
      status: 'active'
    };
    
    // Mock response for now
    const mockPersonnel = {
      _id: Date.now().toString(),
      ...personnelData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Personnel created successfully',
      data: mockPersonnel
    });
  } catch (error) {
    console.error('Error creating personnel:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating personnel',
      error: error.message
    });
  }
});

// @desc    Get personnel statistics
// @route   GET /api/personnel/stats
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
      totalPersonnel: 25,
      activePersonnel: 23,
      onLeavePersonnel: 2,
      totalSalary: 12500000,
      departments: [
        { name: 'Drivers', count: 12, avgSalary: 450000 },
        { name: 'Garage', count: 6, avgSalary: 550000 },
        { name: 'Management', count: 4, avgSalary: 750000 },
        { name: 'Transport', count: 3, avgSalary: 500000 }
      ],
      recentHires: [
        { name: 'John Driver', date: '2024-01-15', department: 'Drivers' },
        { name: 'Sarah Mechanic', date: '2024-01-10', department: 'Garage' }
      ]
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching personnel stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching personnel statistics',
      error: error.message
    });
  }
});

module.exports = router;
