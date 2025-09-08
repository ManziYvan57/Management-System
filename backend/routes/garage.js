const express = require('express');
const { body, validationResult } = require('express-validator');
const WorkOrder = require('../models/WorkOrder');
const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const Vehicle = require('../models/Vehicle');
const Personnel = require('../models/Personnel');
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/garage/work-orders - Get all work orders
router.get('/work-orders', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, workType, vehicle, terminal } = req.query;
    const skip = (page - 1) * limit;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (workType && workType !== 'all') query.workType = workType;
    if (vehicle && vehicle !== 'all') query.vehicle = vehicle;
    if (terminal && terminal !== 'all') query.terminal = terminal;

    const workOrders = await WorkOrder.find(query)
      .populate('vehicle', 'plateNumber make model assignedRoute')
      .sort({ dateCreated: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WorkOrder.countDocuments(query);

    res.json({
      success: true,
      data: workOrders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch work orders' });
  }
});

// POST /api/garage/work-orders - Create new work order
router.post('/work-orders', protect, [
  body('vehicle').isMongoId().withMessage('Valid vehicle ID is required'),
  body('workType').isIn(['repair', 'maintenance', 'inspection', 'emergency', 'preventive', 'other']).withMessage('Invalid work type'),
  body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required'),
  body('scheduledDate').notEmpty().withMessage('Scheduled date is required')
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

    const workOrderData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Generate work order number manually if not provided
    if (!workOrderData.workOrderNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Get count of work orders for this month
      const count = await WorkOrder.countDocuments({
        createdAt: {
          $gte: new Date(year, date.getMonth(), 1),
          $lt: new Date(year, date.getMonth() + 1, 1)
        }
      });
      
      workOrderData.workOrderNumber = `WO-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`;
    }

    const workOrder = new WorkOrder(workOrderData);
    await workOrder.save();

    // Set vehicle status to maintenance when work order is created
    if (workOrder.vehicle) {
      await Vehicle.findByIdAndUpdate(
        workOrder.vehicle,
        { status: 'maintenance' },
        { new: true }
      );
    }

    await workOrder.populate([
      { path: 'vehicle', select: 'plateNumber make model assignedRoute' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Work order created successfully',
      data: workOrder
    });
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create work order' });
  }
});

// GET /api/garage/maintenance-schedules - Get all maintenance schedules
router.get('/maintenance-schedules', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, maintenanceType, vehicle, terminal } = req.query;
    const skip = (page - 1) * limit;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (maintenanceType && maintenanceType !== 'all') query.maintenanceType = maintenanceType;
    if (vehicle && vehicle !== 'all') query.vehicle = vehicle;
    if (terminal && terminal !== 'all') query.terminal = terminal;

    const maintenanceSchedules = await MaintenanceSchedule.find(query)
      .populate('vehicle', 'plateNumber make model assignedRoute')
      .sort({ nextDue: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MaintenanceSchedule.countDocuments(query);

    res.json({
      success: true,
      data: maintenanceSchedules,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get maintenance schedules error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch maintenance schedules' });
  }
});

// POST /api/garage/maintenance-schedules - Create new maintenance schedule
router.post('/maintenance-schedules', protect, [
  body('vehicle').isMongoId().withMessage('Valid vehicle ID is required'),
  body('maintenanceType').isIn(['oil_change', 'tire_rotation', 'brake_service', 'engine_tune_up', 'transmission_service', 'air_filter', 'fuel_filter', 'spark_plugs', 'battery_check', 'coolant_check', 'general_inspection', 'other']).withMessage('Invalid maintenance type'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('frequency').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'semi_annually', 'annually', 'mileage_based', 'custom']).withMessage('Invalid frequency'),
  body('interval').isInt({ min: 1 }).withMessage('Interval must be at least 1'),
  body('nextDue').notEmpty().withMessage('Next due date is required')
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

    const maintenanceData = {
      ...req.body,
      createdBy: req.user._id
    };

    const maintenanceSchedule = new MaintenanceSchedule(maintenanceData);
    await maintenanceSchedule.save();

    // Set vehicle status to maintenance when maintenance schedule is created
    if (maintenanceSchedule.vehicle) {
      await Vehicle.findByIdAndUpdate(
        maintenanceSchedule.vehicle,
        { status: 'maintenance' },
        { new: true }
      );
    }

    await maintenanceSchedule.populate([
      { path: 'vehicle', select: 'plateNumber make model assignedRoute' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Maintenance schedule created successfully',
      data: maintenanceSchedule
    });
  } catch (error) {
    console.error('Create maintenance schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to create maintenance schedule' });
  }
});

// PUT /api/garage/work-orders/:id - Update work order
router.put('/work-orders/:id', protect, async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('vehicle', 'plateNumber make model assignedRoute');

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    // If work order is completed, update vehicle status to active
    if (req.body.status === 'completed' && workOrder.vehicle) {
      await Vehicle.findByIdAndUpdate(
        workOrder.vehicle._id,
        { status: 'active' },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Work order updated successfully',
      data: workOrder
    });
  } catch (error) {
    console.error('Update work order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update work order' });
  }
});

// PUT /api/garage/maintenance-schedules/:id - Update maintenance schedule
router.put('/maintenance-schedules/:id', protect, async (req, res) => {
  try {
    const maintenanceSchedule = await MaintenanceSchedule.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('vehicle', 'plateNumber make model assignedRoute');

    if (!maintenanceSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance schedule not found'
      });
    }

    // If maintenance is completed, update vehicle status to active
    if (req.body.status === 'completed' && maintenanceSchedule.vehicle) {
      await Vehicle.findByIdAndUpdate(
        maintenanceSchedule.vehicle._id,
        { status: 'active' },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: 'Maintenance schedule updated successfully',
      data: maintenanceSchedule
    });
  } catch (error) {
    console.error('Update maintenance schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update maintenance schedule' });
  }
});

// GET /api/garage/stats - Get garage statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const totalWorkOrders = await WorkOrder.countDocuments();
    const pendingWorkOrders = await WorkOrder.countDocuments({ status: 'pending' });
    const inProgressWorkOrders = await WorkOrder.countDocuments({ status: 'in_progress' });
    const completedWorkOrders = await WorkOrder.countDocuments({ status: 'completed' });

    const totalMaintenanceSchedules = await MaintenanceSchedule.countDocuments();
    const pendingMaintenanceSchedules = await MaintenanceSchedule.countDocuments({ 
      status: { $in: ['scheduled', 'in_progress'] } 
    });
    const overdueMaintenance = await MaintenanceSchedule.countDocuments({
      nextDue: { $lt: new Date() },
      status: { $ne: 'completed' }
    });
    const upcomingMaintenance = await MaintenanceSchedule.countDocuments({
      nextDue: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      },
      status: { $ne: 'completed' }
    });

    const vehiclesInMaintenance = await Vehicle.countDocuments({ status: 'maintenance', isActive: true });
    const vehiclesInGarage = await Vehicle.countDocuments({ status: 'maintenance', isActive: true });
    
    // Get available mechanics
    const availableMechanics = await Personnel.countDocuments({ 
      role: { $in: ['mechanic', 'technician'] },
      employmentStatus: 'active'
    });

    // Calculate critical alerts (overdue maintenance + high priority work orders)
    const criticalWorkOrders = await WorkOrder.countDocuments({ 
      priority: 'critical',
      status: { $ne: 'completed' }
    });
    const criticalAlerts = overdueMaintenance + criticalWorkOrders;

    // Calculate monthly spending (placeholder - would need actual cost tracking)
    const monthlySpending = 0; // This would need to be calculated from actual work order costs

    // Calculate average repair time (placeholder - would need actual time tracking)
    const averageRepairTime = 0; // This would need to be calculated from completed work orders

    res.json({
      success: true,
      data: {
        // Work Orders
        totalWorkOrders,
        pendingWorkOrders,
        inProgressWorkOrders,
        completedWorkOrders,
        
        // Maintenance Schedules
        totalMaintenanceSchedules,
        pendingMaintenanceSchedules,
        overdueMaintenance,
        upcomingMaintenance,
        
        // Garage Operations
        vehiclesInMaintenance,
        vehiclesInGarage,
        availableMechanics,
        criticalAlerts,
        monthlySpending,
        averageRepairTime
      }
    });
  } catch (error) {
    console.error('Get garage stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch garage statistics' });
  }
});



// GET /api/garage/mechanics - Get mechanics for dropdown
router.get('/mechanics', protect, async (req, res) => {
  try {
    const mechanics = await Personnel.find(
      { role: { $in: ['mechanic', 'technician', 'supervisor'] } },
      'firstName lastName employeeId phone email'
    ).sort({ firstName: 1, lastName: 1 });

    res.json({
      success: true,
      data: mechanics
    });
  } catch (error) {
    console.error('Get mechanics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mechanics' });
  }
});

// GET /api/garage/parts - Get inventory items for parts selection
router.get('/parts', protect, async (req, res) => {
  try {
    const parts = await Inventory.find(
      { category: { $in: ['Lubricants', 'Brake System', 'Filters', 'Electrical', 'Tires', 'Tools', 'Safety Equipment', 'Consumables', 'Spare Parts'] } },
      'name sku category unitCost quantity minQuantity'
    ).sort({ name: 1 });

    res.json({
      success: true,
      data: parts
    });
  } catch (error) {
    console.error('Get parts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch parts' });
  }
});

module.exports = router;
