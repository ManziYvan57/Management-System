const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// @desc    Get dashboard overview - Vehicles only
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    const { terminal } = req.query;
    
    // Build vehicle-specific query for multi-terminal support
    let vehicleQuery = { isActive: true };
    if (req.user.role !== 'super_admin') {
      vehicleQuery.terminals = { $in: [req.user.terminal] };
    } else if (terminal) {
      vehicleQuery.terminals = { $in: [terminal] };
    }
    
    // Get vehicle data from database
    const [
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      outOfServiceVehicles
    ] = await Promise.all([
      Vehicle.countDocuments({ ...vehicleQuery, type: 'vehicle' }),
      Vehicle.countDocuments({ ...vehicleQuery, type: 'vehicle', status: 'active' }),
      Vehicle.countDocuments({ ...vehicleQuery, type: 'vehicle', status: 'maintenance' }),
      Vehicle.countDocuments({ ...vehicleQuery, type: 'vehicle', status: 'out_of_service' })
    ]);
    
    // Calculate total asset value
    const totalAssetValue = await Vehicle.aggregate([
      { $match: { ...vehicleQuery, type: 'vehicle' } },
      { $group: { _id: null, total: { $sum: '$purchaseCost' } } }
    ]).then(result => result[0]?.total || 0);
    
    const overview = {
      // Assets - Vehicles only
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      outOfServiceVehicles,
      totalAssetValue
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

module.exports = router;
