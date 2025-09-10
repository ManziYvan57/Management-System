const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Vehicle = require('./models/Vehicle');

async function migrateVehiclesTerminals() {
  try {
    console.log('🔄 Starting vehicle terminals migration...');
    
    // Find all vehicles with single terminal field
    const vehicles = await Vehicle.find({ terminal: { $exists: true } });
    
    console.log(`📊 Found ${vehicles.length} vehicles to migrate`);
    
    let migratedCount = 0;
    
    for (const vehicle of vehicles) {
      // Convert single terminal to terminals array
      if (vehicle.terminal && !vehicle.terminals) {
        vehicle.terminals = [vehicle.terminal];
        
        // Remove the old terminal field
        delete vehicle.terminal;
        
        // Save the updated vehicle
        await vehicle.save();
        migratedCount++;
        
        console.log(`✅ Migrated vehicle ${vehicle.plateNumber}: ${vehicle.terminals.join(', ')}`);
      }
    }
    
    console.log(`🎉 Migration completed! ${migratedCount} vehicles migrated`);
    console.log('📝 All vehicles now use terminals array instead of single terminal field');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateVehiclesTerminals();
