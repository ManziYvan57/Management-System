const mongoose = require('mongoose');
const Personnel = require('./models/Personnel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity_management_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixPersonnelIds() {
  try {
    console.log('Starting to fix personnel employeeId values...');
    
    // Find all personnel records with null or empty employeeId
    const personnelWithNullIds = await Personnel.find({
      $or: [
        { employeeId: null },
        { employeeId: '' },
        { employeeId: { $exists: false } }
      ]
    });
    
    console.log(`Found ${personnelWithNullIds.length} personnel records with null/empty employeeId`);
    
    // Find the highest existing employeeId
    const lastPersonnel = await Personnel.findOne(
      { 
        employeeId: { 
          $exists: true, 
          $ne: null, 
          $ne: '',
          $regex: /^EMP\d+$/
        } 
      }, 
      {}, 
      { sort: { employeeId: -1 } }
    );
    
    let nextId = 1;
    if (lastPersonnel && lastPersonnel.employeeId) {
      const lastId = parseInt(lastPersonnel.employeeId.replace('EMP', ''));
      if (!isNaN(lastId) && lastId > 0) {
        nextId = lastId + 1;
      }
    }
    
    console.log(`Starting employeeId generation from: ${nextId}`);
    
    // Update each record with a new employeeId
    for (let i = 0; i < personnelWithNullIds.length; i++) {
      const personnel = personnelWithNullIds[i];
      const employeeId = `EMP${String(nextId).padStart(4, '0')}`;
      
      // Check if this employeeId already exists
      let counter = 0;
      let finalEmployeeId = employeeId;
      while (counter < 100) {
        const existing = await Personnel.findOne({ employeeId: finalEmployeeId });
        if (!existing) {
          break;
        }
        nextId++;
        finalEmployeeId = `EMP${String(nextId).padStart(4, '0')}`;
        counter++;
      }
      
      await Personnel.findByIdAndUpdate(personnel._id, { employeeId: finalEmployeeId });
      console.log(`Updated ${personnel.firstName} ${personnel.lastName} with employeeId: ${finalEmployeeId}`);
      nextId++;
    }
    
    console.log('Successfully fixed all personnel employeeId values!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing personnel IDs:', error);
    process.exit(1);
  }
}

fixPersonnelIds();

