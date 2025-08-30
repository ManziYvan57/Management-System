const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Route, Trip, DailySchedule } = require('./models/Transport');
const Vehicle = require('./models/Vehicle');
const Personnel = require('./models/Personnel');
const VehicleDocument = require('./models/VehicleDocument');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Test 1: Check if DailySchedule model exists
    console.log('\n🔍 Testing DailySchedule model...');
    try {
      const count = await DailySchedule.countDocuments();
      console.log(`✅ DailySchedule collection exists with ${count} documents`);
    } catch (error) {
      console.error('❌ Error accessing DailySchedule collection:', error.message);
    }

    // Test 2: Check if Vehicle model exists and has data
    console.log('\n🔍 Testing Vehicle model...');
    try {
      const vehicleCount = await Vehicle.countDocuments();
      console.log(`✅ Vehicle collection exists with ${vehicleCount} documents`);
      
      if (vehicleCount > 0) {
        const vehicles = await Vehicle.find({ status: 'active' }).limit(3);
        console.log('📋 Sample active vehicles:', vehicles.map(v => ({
          id: v._id,
          plateNumber: v.plateNumber,
          make: v.make,
          model: v.model,
          status: v.status
        })));
      }
    } catch (error) {
      console.error('❌ Error accessing Vehicle collection:', error.message);
    }

    // Test 3: Check if Personnel model exists and has data
    console.log('\n🔍 Testing Personnel model...');
    try {
      const personnelCount = await Personnel.countDocuments();
      console.log(`✅ Personnel collection exists with ${personnelCount} documents`);
      
      if (personnelCount > 0) {
        const drivers = await Personnel.find({ role: 'driver', status: 'active' }).limit(3);
        console.log('📋 Sample active drivers:', drivers.map(d => ({
          id: d._id,
          firstName: d.firstName,
          lastName: d.lastName,
          role: d.role,
          status: d.status
        })));
      }
    } catch (error) {
      console.error('❌ Error accessing Personnel collection:', error.message);
    }

    // Test 4: Check if Route model exists and has data
    console.log('\n🔍 Testing Route model...');
    try {
      const routeCount = await Route.countDocuments();
      console.log(`✅ Route collection exists with ${routeCount} documents`);
      
      if (routeCount > 0) {
        const routes = await Route.find().limit(3);
        console.log('📋 Sample routes:', routes.map(r => ({
          id: r._id,
          routeName: r.routeName,
          origin: r.origin,
          destination: r.destination
        })));
      }
    } catch (error) {
      console.error('❌ Error accessing Route collection:', error.message);
    }

    // Test 5: Try to create a simple DailySchedule
    console.log('\n🔍 Testing DailySchedule creation...');
    try {
      // Check if we have the required data
      const vehicle = await Vehicle.findOne({ status: 'active' });
      const driver = await Personnel.findOne({ role: 'driver', status: 'active' });
      const route = await Route.findOne();
      
      if (!vehicle || !driver || !route) {
        console.log('⚠️  Missing required data for DailySchedule test:');
        console.log(`   Vehicle: ${vehicle ? 'Found' : 'Missing'}`);
        console.log(`   Driver: ${driver ? 'Found' : 'Missing'}`);
        console.log(`   Route: ${route ? 'Found' : 'Missing'}`);
      } else {
        console.log('✅ All required data found for DailySchedule test');
        
        // Try to create a test schedule
        const testSchedule = new DailySchedule({
          date: new Date(),
          route: route._id,
          departureTime: '09:00',
          assignedVehicle: vehicle._id,
          assignedDriver: driver._id,
          capacity: 50,
          terminal: 'Main Terminal',
          createdBy: new mongoose.Types.ObjectId() // Dummy user ID
        });
        
        await testSchedule.save();
        console.log('✅ Successfully created test DailySchedule');
        
        // Clean up
        await DailySchedule.findByIdAndDelete(testSchedule._id);
        console.log('✅ Cleaned up test DailySchedule');
      }
    } catch (error) {
      console.error('❌ Error creating DailySchedule:', error.message);
      console.error('Full error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
});
