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
    console.log('\n🔍 Checking Personnel collection...');
    
    const allPersonnel = await Personnel.find({});
    console.log(`Total personnel records: ${allPersonnel.length}`);
    
    if (allPersonnel.length > 0) {
      console.log('\n📋 All personnel records:');
      allPersonnel.forEach((person, index) => {
        console.log(`${index + 1}. ID: ${person._id}`);
        console.log(`   Employee ID: ${person.employeeId || 'NULL'}`);
        console.log(`   Name: ${person.firstName || 'N/A'} ${person.lastName || 'N/A'}`);
        console.log(`   Role: ${person.role || 'N/A'}`);
        console.log(`   Status: ${person.status || 'N/A'}`);
        console.log(`   Terminal: ${person.terminal || 'N/A'}`);
        console.log(`   Department: ${person.department || 'N/A'}`);
        console.log('   ---');
      });
    }
    
    // Check for records with null employeeId
    const nullEmployeeIdRecords = await Personnel.find({ employeeId: null });
    console.log(`\n⚠️  Records with null employeeId: ${nullEmployeeIdRecords.length}`);
    
    if (nullEmployeeIdRecords.length > 0) {
      console.log('These records should be cleaned up:');
      nullEmployeeIdRecords.forEach((person, index) => {
        console.log(`${index + 1}. ID: ${person._id}`);
        console.log(`   Name: ${person.firstName || 'N/A'} ${person.lastName || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
});
