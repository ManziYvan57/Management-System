const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Asset = require('../models/Asset');
const Personnel = require('../models/Personnel');
const WorkOrder = require('../models/WorkOrder');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Equipment = require('../models/Equipment');
const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    const { terminal } = req.query;
    
    // Define minimum quantity threshold for low stock
    const minQuantity = 10;
    
    // Build query based on user role and terminal
    let query = {};
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Get real data from database
    const [
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      outOfServiceVehicles,
      totalEquipment,
      operationalEquipment,
      underRepairEquipment,
      retiredEquipment,
      totalPersonnel,
      activePersonnel,
      onLeavePersonnel,
      terminatedPersonnel,
      totalDrivers,
      highPerformers,
      driversWithInfractions,
      averagePoints,
      totalWorkOrders,
      pendingWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
      totalSchedules,
      dueThisWeek,
      overdueSchedules,
      completedSchedules,
      totalInventory,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      totalUsers,
      activeUsers,
      inactiveUsers,
      superAdmins,
      terminalManagers,
      routeManagers,
      fleetManagers,
      kigaliUsers,
      kampalaUsers,
      nairobiUsers,
      jubaUsers
    ] = await Promise.all([
      // Assets - Vehicles
      Vehicle.countDocuments({ ...query, type: 'vehicle' }),
      Vehicle.countDocuments({ ...query, type: 'vehicle', status: 'active' }),
      Vehicle.countDocuments({ ...query, type: 'vehicle', status: 'maintenance' }),
      Vehicle.countDocuments({ ...query, type: 'vehicle', status: 'out_of_service' }),
      
      // Assets - Equipment
      Equipment.countDocuments(query),
      Equipment.countDocuments({ ...query, status: 'operational' }),
      Equipment.countDocuments({ ...query, status: 'under_repair' }),
      Equipment.countDocuments({ ...query, status: 'retired' }),
      
      // Personnel
      Personnel.countDocuments(query),
      Personnel.countDocuments({ ...query, employmentStatus: 'active' }),
      Personnel.countDocuments({ ...query, employmentStatus: 'on_leave' }),
      Personnel.countDocuments({ ...query, employmentStatus: 'terminated' }),
      
      // Drivers
      Personnel.countDocuments({ ...query, role: 'driver' }),
      Personnel.countDocuments({ ...query, role: 'driver', drivingPoints: { $gte: 80 } }),
      Personnel.countDocuments({ ...query, role: 'driver', infractions: { $exists: true, $not: { $size: 0 } } }),
      Personnel.aggregate([
        { $match: { ...query, role: 'driver' } },
        { $group: { _id: null, avgPoints: { $avg: '$drivingPoints' } } }
      ]).then(result => result[0]?.avgPoints || 0),
      
      // Work Orders
      WorkOrder.countDocuments(query),
      WorkOrder.countDocuments({ ...query, status: 'pending' }),
      WorkOrder.countDocuments({ ...query, status: 'in_progress' }),
      WorkOrder.countDocuments({ ...query, status: 'completed' }),
      
      // Maintenance Schedules
      MaintenanceSchedule.countDocuments(query),
      MaintenanceSchedule.countDocuments({ 
        ...query, 
        dueDate: { 
          $gte: new Date(), 
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        } 
      }),
      MaintenanceSchedule.countDocuments({ ...query, dueDate: { $lt: new Date() } }),
      MaintenanceSchedule.countDocuments({ ...query, status: 'completed' }),
      
      // Inventory
      Inventory.countDocuments(query),
      Inventory.countDocuments({ ...query, quantity: { $gt: 0 } }),
      Inventory.countDocuments({ 
        ...query, 
        quantity: { $gt: 0, $lte: minQuantity } 
      }),
      Inventory.countDocuments({ ...query, quantity: 0 }),
      
      // Users
      User.countDocuments(query),
      User.countDocuments({ ...query, isActive: true }),
      User.countDocuments({ ...query, isActive: false }),
      User.countDocuments({ ...query, role: 'super_admin' }),
      User.countDocuments({ ...query, role: 'terminal_manager' }),
      User.countDocuments({ ...query, role: 'route_manager' }),
      User.countDocuments({ ...query, role: 'fleet_manager' }),
      User.countDocuments({ ...query, terminal: 'kigali' }),
      User.countDocuments({ ...query, terminal: 'kampala' }),
      User.countDocuments({ ...query, terminal: 'nairobi' }),
      User.countDocuments({ ...query, terminal: 'juba' })
    ]);
    
    // Calculate financial data
    const totalAssetValue = await Vehicle.aggregate([
      { $match: { ...query, type: 'vehicle' } },
      { $group: { _id: null, total: { $sum: '$purchaseCost' } } }
    ]).then(result => result[0]?.total || 0);
    
    const monthlySpending = await WorkOrder.aggregate([
      { 
        $match: { 
          ...query, 
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]).then(result => result[0]?.total || 0);
    
    const inventoryValue = await Inventory.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$unitCost'] } } } }
    ]).then(result => result[0]?.total || 0);
    
    const overview = {
      // Assets
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      outOfServiceVehicles,
      totalEquipment,
      operationalEquipment,
      underRepairEquipment,
      retiredEquipment,
      totalAssetValue,
      
      // Personnel
      totalPersonnel,
      activePersonnel,
      onLeavePersonnel,
      terminatedPersonnel,
      totalDrivers,
      highPerformers,
      driversWithInfractions,
      averagePoints: Math.round(averagePoints),
      
      // Garage
      totalWorkOrders,
      pendingWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
      totalSchedules,
      dueThisWeek,
      overdueSchedules,
      completedSchedules,
      monthlySpending,
      
      // Inventory
      totalInventory,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      inventoryValue,
      
      // Users
      totalUsers,
      activeUsers,
      inactiveUsers,
      superAdmins,
      terminalManagers,
      routeManagers,
      fleetManagers,
      kigaliUsers,
      kampalaUsers,
      nairobiUsers,
      jubaUsers
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
    let query = {};
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Get real financial data
    const [
      totalAssetValue,
      monthlyMaintenanceCosts,
      monthlyInventorySpending,
      totalInventoryValue,
      avgItemCost,
      reorderValue
    ] = await Promise.all([
      // Total asset value
      Vehicle.aggregate([
        { $match: { ...query, type: 'vehicle' } },
        { $group: { _id: null, total: { $sum: '$purchaseCost' } } }
      ]).then(result => result[0]?.total || 0),
      
      // Monthly maintenance costs
      WorkOrder.aggregate([
        { 
          $match: { 
            ...query, 
            createdAt: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]).then(result => result[0]?.total || 0),
      
      // Monthly inventory spending
      PurchaseOrder.aggregate([
        { 
          $match: { 
            ...query, 
            createdAt: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      // Total inventory value
      Inventory.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$unitCost'] } } } }
      ]).then(result => result[0]?.total || 0),
      
      // Average item cost
      Inventory.aggregate([
        { $match: query },
        { $group: { _id: null, avg: { $avg: '$unitCost' } } }
      ]).then(result => result[0]?.avg || 0),
      
      // Reorder value (items that need reordering)
      Inventory.aggregate([
        { $match: { ...query, quantity: { $lte: minQuantity } } },
        { $group: { _id: null, total: { $sum: { $multiply: [minQuantity, '$unitCost'] } } } }
      ]).then(result => result[0]?.total || 0)
    ]);
    
    const financial = {
      totalAssetValue,
      monthlySpending: monthlyMaintenanceCosts + monthlyInventorySpending,
      inventoryValue: totalInventoryValue,
      avgItemCost: Math.round(avgItemCost),
      reorderValue,
      monthlyMaintenanceCosts,
      monthlyInventorySpending,
      totalInventoryValue
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
    
    // Define minimum quantity threshold for low stock
    const minQuantity = 10;
    
    // Build query based on user role and terminal
    let query = {};
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Get real operations data
    const [
      totalInventory,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      totalSuppliers,
      activeSuppliers,
      totalPurchaseOrders,
      pendingOrders,
      completedOrders,
      ordersThisMonth,
      topSupplier
    ] = await Promise.all([
      // Inventory stats
      Inventory.countDocuments(query),
      Inventory.countDocuments({ ...query, quantity: { $gt: 0 } }),
      Inventory.countDocuments({ 
        ...query, 
        quantity: { $gt: 0, $lte: minQuantity } 
      }),
      Inventory.countDocuments({ ...query, quantity: 0 }),
      
      // Supplier stats
      Supplier.countDocuments(query),
      Supplier.countDocuments({ ...query, isActive: true }),
      
      // Purchase order stats
      PurchaseOrder.countDocuments(query),
      PurchaseOrder.countDocuments({ ...query, status: 'pending' }),
      PurchaseOrder.countDocuments({ ...query, status: 'completed' }),
      PurchaseOrder.countDocuments({ 
        ...query, 
        createdAt: { 
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        } 
      }),
      
      // Top supplier
      PurchaseOrder.aggregate([
        { $match: query },
        { $group: { _id: '$supplier', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]).then(result => result[0]?._id || 'N/A')
    ]);
    
    const operations = {
      totalInventory,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      totalSuppliers,
      activeSuppliers,
      totalPurchaseOrders,
      pendingOrders,
      completedOrders,
      ordersThisMonth,
      topSupplier
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
    let query = {};
    
    if (req.user.role !== 'super_admin') {
      query.terminal = req.user.terminal;
    } else if (terminal) {
      query.terminal = terminal;
    }
    
    // Get real maintenance data
    const [
      totalWorkOrders,
      pendingWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
      totalSchedules,
      dueThisWeek,
      overdueSchedules,
      completedSchedules,
      vehiclesInMaintenance,
      availableVehicles,
      outOfService,
      criticalAlerts,
      monthlySpending,
      avgCostPerOrder,
      partsCost,
      laborCost
    ] = await Promise.all([
      // Work Orders
      WorkOrder.countDocuments(query),
      WorkOrder.countDocuments({ ...query, status: 'pending' }),
      WorkOrder.countDocuments({ ...query, status: 'in_progress' }),
      WorkOrder.countDocuments({ ...query, status: 'completed' }),
      
      // Maintenance Schedules
      MaintenanceSchedule.countDocuments(query),
      MaintenanceSchedule.countDocuments({ 
        ...query, 
        dueDate: { 
          $gte: new Date(), 
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        } 
      }),
      MaintenanceSchedule.countDocuments({ ...query, dueDate: { $lt: new Date() } }),
      MaintenanceSchedule.countDocuments({ ...query, status: 'completed' }),
      
      // Vehicle Status
      Vehicle.countDocuments({ ...query, type: 'vehicle', status: 'maintenance' }),
      Vehicle.countDocuments({ ...query, type: 'vehicle', status: 'active' }),
      Vehicle.countDocuments({ ...query, type: 'vehicle', status: 'out_of_service' }),
      Vehicle.countDocuments({ ...query, type: 'vehicle', status: 'critical' }),
      
      // Financial data
      WorkOrder.aggregate([
        { 
          $match: { 
            ...query, 
            createdAt: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
            } 
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ]).then(result => result[0]?.total || 0),
      
      WorkOrder.aggregate([
        { $match: { ...query, status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$totalCost' } } }
      ]).then(result => result[0]?.avg || 0),
      
      WorkOrder.aggregate([
        { $match: { ...query } },
        { $group: { _id: null, total: { $sum: '$partsCost' } } }
      ]).then(result => result[0]?.total || 0),
      
      WorkOrder.aggregate([
        { $match: { ...query } },
        { $group: { _id: null, total: { $sum: '$laborCost' } } }
      ]).then(result => result[0]?.total || 0)
    ]);
    
    const maintenance = {
      totalWorkOrders,
      pendingWorkOrders,
      inProgressWorkOrders,
      completedWorkOrders,
      totalSchedules,
      dueThisWeek,
      overdueSchedules,
      completedSchedules,
      vehiclesInMaintenance,
      availableVehicles,
      outOfService,
      criticalAlerts,
      monthlySpending,
      avgCostPerOrder: Math.round(avgCostPerOrder),
      partsCost,
      laborCost
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
