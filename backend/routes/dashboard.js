const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    const { terminal } = req.query;
    
    // Build query based on user role and terminal
    let query = { isActive: true };
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Mock overview statistics
    const overview = {
      totalAssets: 25,
      activeAssets: 22,
      maintenanceAssets: 3,
      totalPersonnel: 45,
      activePersonnel: 42,
      totalTrips: 156,
      completedTrips: 142,
      activeTrips: 14,
      totalRevenue: 8500000,
      monthlyRevenue: 1250000,
      totalWorkOrders: 28,
      pendingWorkOrders: 8,
      completedWorkOrders: 20,
      totalInventory: 125,
      lowStockItems: 12,
      outOfStockItems: 3
    };
    
    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
});

// @desc    Get financial statistics
// @route   GET /api/dashboard/financial
// @access  Private
router.get('/financial', protect, async (req, res) => {
  try {
    const { terminal } = req.query;
    
    // Build query based on user role and terminal
    let query = { isActive: true };
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Mock financial statistics
    const financial = {
      totalRevenue: 8500000,
      monthlyRevenue: 1250000,
      totalExpenses: 3200000,
      monthlyExpenses: 450000,
      netProfit: 5300000,
      monthlyProfit: 800000,
      assetValue: 45000000,
      maintenanceCosts: 850000,
      personnelCosts: 1800000,
      fuelCosts: 550000,
      revenueBreakdown: [
        { month: 'Jan', revenue: 1200000 },
        { month: 'Feb', revenue: 1350000 },
        { month: 'Mar', revenue: 1100000 },
        { month: 'Apr', revenue: 1250000 },
        { month: 'May', revenue: 1400000 },
        { month: 'Jun', revenue: 1200000 }
      ],
      expenseBreakdown: [
        { category: 'Personnel', amount: 1800000 },
        { category: 'Fuel', amount: 550000 },
        { category: 'Maintenance', amount: 850000 }
      ]
    };
    
    res.status(200).json({
      success: true,
      data: financial
    });
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial statistics',
      error: error.message
    });
  }
});

// @desc    Get operations statistics
// @route   GET /api/dashboard/operations
// @access  Private
router.get('/operations', protect, async (req, res) => {
  try {
    const { terminal } = req.query;
    
    // Build query based on user role and terminal
    let query = { isActive: true };
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Mock operations statistics
    const operations = {
      totalTrips: 156,
      completedTrips: 142,
      activeTrips: 14,
      delayedTrips: 8,
      cancelledTrips: 2,
      averageOccupancy: 78.5,
      totalPassengers: 12450,
      totalDistance: 125000,
      averageTripDuration: 12.5,
      topRoutes: [
        { route: 'Kampala-Nairobi', trips: 45, revenue: 2025000 },
        { route: 'Goma-Kampala', trips: 38, revenue: 1330000 },
        { route: 'Nairobi-Kigali', trips: 42, revenue: 2310000 }
      ],
      topDrivers: [
        { name: 'John Driver', trips: 25, rating: 4.8 },
        { name: 'Sarah Driver', trips: 22, rating: 4.7 },
        { name: 'David Driver', trips: 20, rating: 4.6 }
      ],
      vehicleUtilization: 85.2
    };
    
    res.status(200).json({
      success: true,
      data: operations
    });
  } catch (error) {
    console.error('Error fetching operations stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching operations statistics',
      error: error.message
    });
  }
});

// @desc    Get maintenance statistics
// @route   GET /api/dashboard/maintenance
// @access  Private
router.get('/maintenance', protect, async (req, res) => {
  try {
    const { terminal } = req.query;
    
    // Build query based on user role and terminal
    let query = { isActive: true };
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Mock maintenance statistics
    const maintenance = {
      totalWorkOrders: 28,
      pendingWorkOrders: 8,
      inProgressWorkOrders: 5,
      completedWorkOrders: 15,
      totalCost: 850000,
      averageCompletionTime: 3.2,
      preventiveMaintenance: 12,
      correctiveMaintenance: 16,
      topTechnicians: [
        { name: 'John Mechanic', completed: 8, rating: 4.8 },
        { name: 'Sarah Technician', completed: 6, rating: 4.7 },
        { name: 'Mike Engineer', completed: 4, rating: 4.6 }
      ],
      maintenanceByCategory: [
        { category: 'Engine', count: 8, cost: 250000 },
        { category: 'Brakes', count: 6, cost: 180000 },
        { category: 'Electrical', count: 5, cost: 120000 },
        { category: 'Tires', count: 4, cost: 80000 },
        { category: 'Other', count: 5, cost: 220000 }
      ],
      upcomingMaintenance: [
        { asset: 'Bus #001', type: 'Oil Change', dueDate: '2024-02-15' },
        { asset: 'Bus #003', type: 'Brake Inspection', dueDate: '2024-02-20' },
        { asset: 'Bus #005', type: 'Tire Rotation', dueDate: '2024-02-25' }
      ]
    };
    
    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance statistics',
      error: error.message
    });
  }
});

module.exports = router;
