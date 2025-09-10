const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const WorkOrder = require('./models/WorkOrder');
const MaintenanceSchedule = require('./models/MaintenanceSchedule');
const Vehicle = require('./models/Vehicle');

async function migrateGarageTerminals() {
  try {
    console.log('🔄 Starting garage terminals migration...');
    
    // Update Work Orders
    console.log('📊 Migrating Work Orders...');
    const workOrders = await WorkOrder.find({ terminal: { $exists: true } }).populate('vehicle');
    
    let workOrderCount = 0;
    for (const workOrder of workOrders) {
      if (workOrder.vehicle && workOrder.vehicle.terminals) {
        // Remove the terminal field - it will be inherited from vehicle
        delete workOrder.terminal;
        await workOrder.save();
        workOrderCount++;
        console.log(`✅ Migrated work order ${workOrder.workOrderNumber}`);
      }
    }
    
    // Update Maintenance Schedules
    console.log('📊 Migrating Maintenance Schedules...');
    const maintenanceSchedules = await MaintenanceSchedule.find({ terminal: { $exists: true } }).populate('vehicle');
    
    let maintenanceCount = 0;
    for (const maintenance of maintenanceSchedules) {
      if (maintenance.vehicle && maintenance.vehicle.terminals) {
        // Remove the terminal field - it will be inherited from vehicle
        delete maintenance.terminal;
        await maintenance.save();
        maintenanceCount++;
        console.log(`✅ Migrated maintenance schedule ${maintenance.title}`);
      }
    }
    
    console.log(`🎉 Migration completed!`);
    console.log(`📝 ${workOrderCount} work orders migrated`);
    console.log(`📝 ${maintenanceCount} maintenance schedules migrated`);
    console.log('📝 All garage records now inherit terminals from their vehicles');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migrateGarageTerminals();
