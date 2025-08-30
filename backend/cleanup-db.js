const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Personnel = require('./models/Personnel');
const { Route, Trip, DailySchedule } = require('./models/Transport');
const Vehicle = require('./models/Vehicle');

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
    console.log('\n🧹 Comprehensive database cleanup...');
    
    // 1. Clean up Personnel collection
    console.log('\n1. Cleaning Personnel collection...');
    const personnelCount = await Personnel.countDocuments();
    console.log(`Current personnel records: ${personnelCount}`);
    
    if (personnelCount > 0) {
      // Delete all personnel records
      await Personnel.deleteMany({});
      console.log('✅ Deleted all personnel records');
    }
    
    // 2. Clean up DailySchedule collection
    console.log('\n2. Cleaning DailySchedule collection...');
    const scheduleCount = await DailySchedule.countDocuments();
    console.log(`Current daily schedule records: ${scheduleCount}`);
    
    if (scheduleCount > 0) {
      // Delete all daily schedule records
      await DailySchedule.deleteMany({});
      console.log('✅ Deleted all daily schedule records');
    }
    
    // 3. Clean up Trip collection
    console.log('\n3. Cleaning Trip collection...');
    const tripCount = await Trip.countDocuments();
    console.log(`Current trip records: ${tripCount}`);
    
    if (tripCount > 0) {
      // Delete all trip records
      await Trip.deleteMany({});
      console.log('✅ Deleted all trip records');
    }
    
    // 4. Clean up Route collection
    console.log('\n4. Cleaning Route collection...');
    const routeCount = await Route.countDocuments();
    console.log(`Current route records: ${routeCount}`);
    
    if (routeCount > 0) {
      // Delete all route records
      await Route.deleteMany({});
      console.log('✅ Deleted all route records');
    }
    
    // 5. Check Vehicle collection (keep this data)
    console.log('\n5. Checking Vehicle collection...');
    const vehicleCount = await Vehicle.countDocuments();
    console.log(`Current vehicle records: ${vehicleCount} (keeping these)`);
    
    if (vehicleCount > 0) {
      const vehicles = await Vehicle.find();
      vehicles.forEach((vehicle, index) => {
        console.log(`   ${index + 1}. ${vehicle.plateNumber || 'N/A'} - ${vehicle.make || 'N/A'} ${vehicle.model || 'N/A'} (${vehicle.status || 'N/A'})`);
      });
    }
    
    console.log('\n✅ Database cleanup completed!');
    console.log('\n📊 Final counts:');
    console.log(`   Personnel: ${await Personnel.countDocuments()}`);
    console.log(`   Daily Schedules: ${await DailySchedule.countDocuments()}`);
    console.log(`   Trips: ${await Trip.countDocuments()}`);
    console.log(`   Routes: ${await Route.countDocuments()}`);
    console.log(`   Vehicles: ${await Vehicle.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
});
