const mongoose = require('mongoose');
const Personnel = require('./models/Personnel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity_management_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function forceClearInfractions() {
  try {
    console.log('Force clearing ALL infraction data...');
    
    // Method 1: Direct MongoDB update to clear all infractions
    console.log('Method 1: Using direct MongoDB update...');
    const result1 = await Personnel.updateMany(
      {}, // Match all documents
      { 
        $set: { 
          infractions: [],
          drivingPoints: 0
        }
      }
    );
    console.log(`Updated ${result1.modifiedCount} personnel records with direct update`);
    
    // Method 2: Find and update each document individually
    console.log('\nMethod 2: Finding and updating each document...');
    const allPersonnel = await Personnel.find({});
    console.log(`Found ${allPersonnel.length} total personnel records`);
    
    let updatedCount = 0;
    
    for (const person of allPersonnel) {
      console.log(`\nChecking: ${person.firstName} ${person.lastName}`);
      console.log(`  Infractions array length: ${person.infractions ? person.infractions.length : 'undefined'}`);
      console.log(`  Driving points: ${person.drivingPoints}`);
      
      if (person.infractions && person.infractions.length > 0) {
        console.log(`  Found ${person.infractions.length} infractions:`);
        person.infractions.forEach((infraction, index) => {
          console.log(`    ${index + 1}. ${infraction.type} - Status: "${infraction.status}"`);
        });
      }
      
      // Force clear infractions and reset points
      person.infractions = [];
      person.drivingPoints = 0;
      
      try {
        await person.save();
        updatedCount++;
        console.log(`  ✅ Updated successfully`);
      } catch (error) {
        console.log(`  ❌ Error updating: ${error.message}`);
      }
    }
    
    // Method 3: Use MongoDB collection directly
    console.log('\nMethod 3: Using MongoDB collection directly...');
    const db = mongoose.connection.db;
    const collection = db.collection('personnels');
    
    const result3 = await collection.updateMany(
      {},
      {
        $set: {
          infractions: [],
          drivingPoints: 0
        }
      }
    );
    console.log(`MongoDB collection update: ${result3.modifiedCount} documents modified`);
    
    console.log(`\n=== FINAL SUMMARY ===`);
    console.log(`Total personnel records: ${allPersonnel.length}`);
    console.log(`Records updated individually: ${updatedCount}`);
    console.log(`Direct MongoDB updates: ${result1.modifiedCount + result3.modifiedCount}`);
    console.log(`\n✅ All methods completed!`);
    
    // Verify the results
    console.log('\nVerifying results...');
    const verifyPersonnel = await Personnel.find({});
    for (const person of verifyPersonnel) {
      console.log(`${person.firstName} ${person.lastName}: ${person.infractions.length} infractions, ${person.drivingPoints} points`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error force clearing infractions:', error);
    process.exit(1);
  }
}

forceClearInfractions();
