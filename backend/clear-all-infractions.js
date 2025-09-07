const mongoose = require('mongoose');
const Personnel = require('./models/Personnel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity_management_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function clearAllInfractions() {
  try {
    console.log('Clearing ALL infraction data from database...');
    
    // Get all personnel records
    const allPersonnel = await Personnel.find({});
    console.log(`Found ${allPersonnel.length} total personnel records`);
    
    let clearedCount = 0;
    let totalInfractionsCleared = 0;
    
    for (const person of allPersonnel) {
      if (person.infractions && person.infractions.length > 0) {
        console.log(`\nPersonnel: ${person.firstName} ${person.lastName}`);
        console.log(`  Current infractions: ${person.infractions.length}`);
        console.log(`  Current driving points: ${person.drivingPoints}`);
        
        // Show current infraction statuses
        person.infractions.forEach((infraction, index) => {
          console.log(`    Infraction ${index + 1}: ${infraction.type} - Status: "${infraction.status}"`);
        });
        
        // Clear all infractions and reset driving points
        person.infractions = [];
        person.drivingPoints = 0;
        
        await person.save();
        clearedCount++;
        totalInfractionsCleared += person.infractions.length;
        
        console.log(`  ✅ Cleared all infractions and reset driving points to 0`);
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total personnel records: ${allPersonnel.length}`);
    console.log(`Personnel with infractions: ${clearedCount}`);
    console.log(`Total infractions cleared: ${totalInfractionsCleared}`);
    console.log(`\n✅ All infraction data has been cleared!`);
    console.log(`You can now create new infractions without validation errors.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing infractions:', error);
    process.exit(1);
  }
}

clearAllInfractions();
