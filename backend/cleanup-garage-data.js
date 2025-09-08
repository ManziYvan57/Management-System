const mongoose = require('mongoose');
const WorkOrder = require('./models/WorkOrder');
const MaintenanceSchedule = require('./models/MaintenanceSchedule');
const Vehicle = require('./models/Vehicle');

// Load environment variables from .env file
require('dotenv').config({ path: '../.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trinity-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function cleanupGarageData() {
  await connectDB();
  console.log('🧹 Starting garage data cleanup...\n');

  try {
    // 1. Delete all work orders
    const workOrderResult = await WorkOrder.deleteMany({});
    console.log(`✅ Deleted ${workOrderResult.deletedCount} work orders`);

    // 2. Delete all maintenance schedules
    const maintenanceResult = await MaintenanceSchedule.deleteMany({});
    console.log(`✅ Deleted ${maintenanceResult.deletedCount} maintenance schedules`);

    // 3. Reset vehicle statuses from maintenance back to active
    const vehicleResult = await Vehicle.updateMany(
      { status: 'maintenance' },
      { $set: { status: 'active' } }
    );
    console.log(`✅ Reset ${vehicleResult.modifiedCount} vehicles from maintenance to active status`);

    // 4. Show summary
    console.log('\n📊 Cleanup Summary:');
    console.log(`- Work Orders: ${workOrderResult.deletedCount} deleted`);
    console.log(`- Maintenance Schedules: ${maintenanceResult.deletedCount} deleted`);
    console.log(`- Vehicles Reset: ${vehicleResult.modifiedCount} vehicles set to active`);
    
    console.log('\n🎉 Garage database cleanup completed successfully!');
    console.log('💡 You now have a fresh, empty garage database.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupGarageData();
