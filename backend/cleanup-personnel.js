const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Personnel = require('./models/Personnel');

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
    console.log('\n🧹 Cleaning up incomplete personnel records...');
    
    // Find and delete records with null employeeId
    const nullEmployeeIdRecords = await Personnel.find({ employeeId: null });
    console.log(`Found ${nullEmployeeIdRecords.length} records with null employeeId`);
    
    if (nullEmployeeIdRecords.length > 0) {
      for (const record of nullEmployeeIdRecords) {
        console.log(`Deleting record: ${record._id} - ${record.firstName || 'N/A'} ${record.lastName || 'N/A'}`);
        await Personnel.findByIdAndDelete(record._id);
      }
      console.log('✅ Cleaned up incomplete personnel records');
    }
    
    // Verify cleanup
    const remainingRecords = await Personnel.find({});
    console.log(`\n📊 Remaining personnel records: ${remainingRecords.length}`);
    
    if (remainingRecords.length > 0) {
      console.log('Remaining records:');
      remainingRecords.forEach((person, index) => {
        console.log(`${index + 1}. ${person.firstName || 'N/A'} ${person.lastName || 'N/A'} (${person.employeeId || 'N/A'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
});
