const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Route, Trip, DailySchedule } = require('./models/Transport');
const Vehicle = require('./models/Vehicle');
const Personnel = require('./models/Personnel');
const VehicleDocument = require('./models/VehicleDocument');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity_management')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testDailyScheduleSystem() {
  try {
    console.log('\n=== TESTING DAILY SCHEDULE SYSTEM ===\n');

    // 1. Test creating a daily schedule
    console.log('1. Testing Daily Schedule Creation...');
    
    // First, let's check if we have any existing data
    const existingRoutes = await Route.find().limit(1);
    const existingVehicles = await Vehicle.find({ status: 'active' }).limit(1);
    const existingDrivers = await Personnel.find({ role: 'driver', status: 'active' }).limit(1);
    
    if (existingRoutes.length === 0 || existingVehicles.length === 0 || existingDrivers.length === 0) {
      console.log('❌ Need existing routes, vehicles, and drivers to test daily schedules');
      console.log('Please run the seeder first or create some test data');
      return;
    }
    
    const testRoute = existingRoutes[0];
    const testVehicle = existingVehicles[0];
    const testDriver = existingDrivers[0];
    
    // Create a daily schedule for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dailyScheduleData = {
      date: tomorrow,
      route: testRoute._id,
      departureTime: '09:00',
      assignedVehicle: testVehicle._id,
      assignedDriver: testDriver._id,
      capacity: testVehicle.seatingCapacity || 50,
      terminal: testRoute.terminal || 'Main Terminal',
      notes: 'Test daily schedule for demonstration',
      createdBy: testDriver._id // Using driver ID as creator for demo
    };
    
    const dailySchedule = new DailySchedule(dailyScheduleData);
    await dailySchedule.save();
    
    console.log('✅ Daily schedule created successfully');
    console.log(`   Route: ${testRoute.routeName} (${testRoute.origin} → ${testRoute.destination})`);
    console.log(`   Vehicle: ${testVehicle.plateNumber} (${testVehicle.make} ${testVehicle.model})`);
    console.log(`   Driver: ${testDriver.firstName} ${testDriver.lastName}`);
    console.log(`   Date: ${tomorrow.toDateString()}`);
    console.log(`   Time: ${dailyScheduleData.departureTime}`);
    console.log(`   Status: ${dailySchedule.status}`);

    // 2. Test smart vehicle suggestions
    console.log('\n2. Testing Smart Vehicle Suggestions...');
    
    const suggestions = await getSmartVehicleSuggestions({
      terminal: testRoute.terminal || 'Main Terminal',
      date: tomorrow.toISOString(),
      routeId: testRoute._id.toString(),
      requiredCapacity: 30
    });
    
    if (suggestions.success) {
      console.log(`✅ Found ${suggestions.count} available vehicles`);
      suggestions.data.slice(0, 3).forEach((vehicle, index) => {
        console.log(`   ${index + 1}. ${vehicle.plateNumber} - ${vehicle.make} ${vehicle.model} (${vehicle.seatingCapacity} seats) - Score: ${vehicle.score}`);
      });
    } else {
      console.log('❌ Error getting vehicle suggestions:', suggestions.message);
    }

    // 3. Test daily schedule retrieval
    console.log('\n3. Testing Daily Schedule Retrieval...');
    
    const schedules = await DailySchedule.find({ date: tomorrow })
      .populate('route', 'routeName origin destination')
      .populate('assignedVehicle', 'plateNumber make model seatingCapacity')
      .populate('assignedDriver', 'firstName lastName employeeId');
    
    console.log(`✅ Retrieved ${schedules.length} schedules for ${tomorrow.toDateString()}`);
    schedules.forEach((schedule, index) => {
      console.log(`   ${index + 1}. ${schedule.route.routeName} - ${schedule.departureTime} - ${schedule.assignedVehicle.plateNumber}`);
    });

    // 4. Test trip generation from daily schedules
    console.log('\n4. Testing Trip Generation...');
    
    // First, confirm the schedule
    await DailySchedule.findByIdAndUpdate(dailySchedule._id, { status: 'confirmed' });
    
    const tripGenerationResult = await generateTripsFromSchedules(tomorrow.toISOString());
    
    if (tripGenerationResult.success) {
      console.log(`✅ Successfully generated ${tripGenerationResult.count} trips`);
      console.log(`   Trip IDs: ${tripGenerationResult.data.map(t => t._id).join(', ')}`);
    } else {
      console.log('❌ Error generating trips:', tripGenerationResult.message);
    }

    // 5. Test conflict detection
    console.log('\n5. Testing Conflict Detection...');
    
    try {
      // Try to create another schedule with the same vehicle on the same date
      const conflictingSchedule = new DailySchedule({
        ...dailyScheduleData,
        departureTime: '14:00', // Different time but same date and vehicle
        _id: undefined // Ensure new document
      });
      
      await conflictingSchedule.save();
      console.log('❌ Conflict detection failed - should have prevented duplicate vehicle assignment');
    } catch (error) {
      if (error.message.includes('Vehicle is already assigned')) {
        console.log('✅ Conflict detection working - prevented duplicate vehicle assignment');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n=== DAILY SCHEDULE SYSTEM TEST COMPLETED ===\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test data
    await cleanupTestData();
    mongoose.connection.close();
  }
}

// Helper function to simulate smart vehicle suggestions
async function getSmartVehicleSuggestions({ terminal, date, routeId, requiredCapacity }) {
  try {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Get vehicles that are active and meet capacity requirements
    let vehicleQuery = { 
      status: 'active',
      seatingCapacity: { $gte: parseInt(requiredCapacity) }
    };
    
    if (terminal) {
      vehicleQuery.terminal = terminal;
    }
    
    // Get all active vehicles
    const allVehicles = await Vehicle.find(vehicleQuery)
      .populate('assignedDriver', 'firstName lastName employeeId')
      .sort({ seatingCapacity: 1 });
    
    // Get vehicles already assigned on this date
    const assignedVehicles = await DailySchedule.find({
      date: {
        $gte: searchDate,
        $lt: nextDay
      },
      status: { $in: ['planned', 'confirmed', 'in_progress'] }
    }).distinct('assignedVehicle');
    
    // Filter out assigned vehicles and sort by best match
    const availableVehicles = allVehicles
      .filter(vehicle => !assignedVehicles.includes(vehicle._id.toString()))
      .map(vehicle => ({
        _id: vehicle._id,
        plateNumber: vehicle.plateNumber,
        make: vehicle.make,
        model: vehicle.model,
        seatingCapacity: vehicle.seatingCapacity,
        terminal: vehicle.terminal,
        assignedDriver: vehicle.assignedDriver,
        score: Math.abs(vehicle.seatingCapacity - parseInt(requiredCapacity))
      }))
      .sort((a, b) => a.score - b.score);
    
    return {
      success: true,
      count: availableVehicles.length,
      data: availableVehicles
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Helper function to simulate trip generation
async function generateTripsFromSchedules(date) {
  try {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Get all confirmed schedules for the date
    const schedules = await DailySchedule.find({
      date: {
        $gte: searchDate,
        $lt: nextDay
      },
      status: 'confirmed',
      tripGenerated: false
    }).populate('route assignedVehicle assignedDriver customerCare');
    
    if (schedules.length === 0) {
      return {
        success: false,
        message: 'No confirmed schedules found for the specified date'
      };
    }
    
    const generatedTrips = [];
    
    for (const schedule of schedules) {
      try {
        // Create trip from schedule
        const departureTime = new Date(schedule.date);
        departureTime.setHours(parseInt(schedule.departureTime.split(':')[0]));
        departureTime.setMinutes(parseInt(schedule.departureTime.split(':')[1]));
        departureTime.setSeconds(0);
        departureTime.setMilliseconds(0);
        
        // Calculate arrival time based on route duration
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + schedule.route.estimatedDuration);
        
        const tripData = {
          route: schedule.route._id,
          vehicle: schedule.assignedVehicle._id,
          driver: schedule.assignedDriver._id,
          customerCare: schedule.customerCare?._id,
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          capacity: schedule.capacity,
          fare: schedule.route.fare,
          terminal: schedule.terminal,
          createdBy: schedule.assignedDriver._id // Using driver as creator for demo
        };
        
        const trip = await Trip.create(tripData);
        
        // Update schedule to mark trip as generated
        await DailySchedule.findByIdAndUpdate(schedule._id, {
          tripGenerated: true,
          generatedTrip: trip._id,
          status: 'in_progress'
        });
        
        generatedTrips.push(trip);
      } catch (error) {
        console.error(`Error generating trip for schedule ${schedule._id}:`, error);
      }
    }
    
    return {
      success: true,
      message: `Successfully generated ${generatedTrips.length} trips`,
      count: generatedTrips.length,
      data: generatedTrips
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// Clean up test data
async function cleanupTestData() {
  try {
    // Find and delete test schedules
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const testSchedules = await DailySchedule.find({ 
      date: tomorrow,
      notes: 'Test daily schedule for demonstration'
    });
    
    for (const schedule of testSchedules) {
      // Delete associated trips if any
      if (schedule.generatedTrip) {
        await Trip.findByIdAndDelete(schedule.generatedTrip);
      }
      // Delete the schedule
      await DailySchedule.findByIdAndDelete(schedule._id);
    }
    
    console.log(`🧹 Cleaned up ${testSchedules.length} test schedules and associated trips`);
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

// Run the test
if (require.main === module) {
  testDailyScheduleSystem();
}

module.exports = {
  testDailyScheduleSystem,
  getSmartVehicleSuggestions,
  generateTripsFromSchedules
};
