const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Route, Trip, DailySchedule } = require('./models/Transport');
const Vehicle = require('./models/Vehicle');
const Personnel = require('./models/Personnel');

// Create a simple test server
const app = express();
app.use(express.json());

// Test route without authentication
app.get('/test/daily-schedules', async (req, res) => {
  try {
    console.log('Testing daily schedules route...');
    
    // Try to access the DailySchedule model
    const count = await DailySchedule.countDocuments();
    console.log(`DailySchedule count: ${count}`);
    
    // Try to find schedules
    const schedules = await DailySchedule.find()
      .populate('route', 'routeName origin destination')
      .populate('assignedVehicle', 'plateNumber make model seatingCapacity')
      .populate('assignedDriver', 'firstName lastName employeeId')
      .populate('customerCare', 'firstName lastName employeeId')
      .populate('createdBy', 'firstName lastName')
      .limit(5);
    
    console.log(`Found ${schedules.length} schedules`);
    
    res.json({
      success: true,
      count: schedules.length,
      data: schedules
    });
    
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing daily schedules',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test route for vehicles
app.get('/test/vehicles', async (req, res) => {
  try {
    console.log('Testing vehicles route...');
    
    const vehicles = await Vehicle.find({ status: 'active' });
    console.log(`Found ${vehicles.length} active vehicles`);
    
    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
    
  } catch (error) {
    console.error('Error in vehicles test route:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing vehicles',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test route for personnel
app.get('/test/personnel', async (req, res) => {
  try {
    console.log('Testing personnel route...');
    
    const personnel = await Personnel.find({ role: 'driver', status: 'active' });
    console.log(`Found ${personnel.length} active drivers`);
    
    res.json({
      success: true,
      count: personnel.length,
      data: personnel
    });
    
  } catch (error) {
    console.error('Error in personnel test route:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing personnel',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test route for routes
app.get('/test/routes', async (req, res) => {
  try {
    console.log('Testing routes route...');
    
    const routes = await Route.find();
    console.log(`Found ${routes.length} routes`);
    
    res.json({
      success: true,
      count: routes.length,
      data: routes
    });
    
  } catch (error) {
    console.error('Error in routes test route:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing routes',
      error: error.message,
      stack: error.stack
    });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Test these endpoints:');
  console.log(`  http://localhost:${PORT}/test/daily-schedules`);
  console.log(`  http://localhost:${PORT}/test/vehicles`);
  console.log(`  http://localhost:${PORT}/test/personnel`);
  console.log(`  http://localhost:${PORT}/test/routes`);
});
