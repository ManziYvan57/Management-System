const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trinity-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function cleanupDuplicateVehicles() {
  try {
    console.log('🔍 Checking for duplicate vehicles...\n');
    
    // Find all vehicles grouped by plate number
    const duplicates = await Vehicle.aggregate([
      {
        $group: {
          _id: '$plateNumber',
          count: { $sum: 1 },
          vehicles: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate vehicles found!');
      return;
    }
    
    console.log(`❌ Found ${duplicates.length} plate numbers with duplicates:\n`);
    
    for (const duplicate of duplicates) {
      console.log(`Plate Number: ${duplicate._id}`);
      console.log(`Count: ${duplicate.count}`);
      console.log('Vehicles:');
      
      // Sort by creation date (keep the newest, delete the older ones)
      const sortedVehicles = duplicate.vehicles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      for (let i = 0; i < sortedVehicles.length; i++) {
        const vehicle = sortedVehicles[i];
        const status = i === 0 ? 'KEEP (newest)' : 'DELETE (duplicate)';
        console.log(`  - ${vehicle._id}: ${vehicle.make} ${vehicle.model} (${vehicle.status}) - ${status}`);
        
        if (i > 0) {
          // Delete the duplicate
          await Vehicle.findByIdAndDelete(vehicle._id);
          console.log(`    ✅ Deleted duplicate vehicle ${vehicle._id}`);
        }
      }
      console.log('─'.repeat(50));
    }
    
    console.log('\n🎉 Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
}

cleanupDuplicateVehicles();
