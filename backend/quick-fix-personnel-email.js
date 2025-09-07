// Quick fix for Personnel email duplicate issue
// This script removes all null/empty email values from existing personnel records

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trinity-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function quickFixPersonnelEmail() {
  try {
    console.log('🔧 Quick fix: Removing null/empty email values...\n');
    
    const Personnel = require('./models/Personnel');
    
    // Remove null emails
    const nullResult = await Personnel.updateMany(
      { email: null },
      { $unset: { email: 1 } }
    );
    console.log(`✅ Removed ${nullResult.modifiedCount} null email values`);
    
    // Remove empty string emails
    const emptyResult = await Personnel.updateMany(
      { email: '' },
      { $unset: { email: 1 } }
    );
    console.log(`✅ Removed ${emptyResult.modifiedCount} empty email values`);
    
    // Remove undefined emails
    const undefinedResult = await Personnel.updateMany(
      { email: { $exists: false } },
      { $unset: { email: 1 } }
    );
    console.log(`✅ Removed ${undefinedResult.modifiedCount} undefined email values`);
    
    console.log('\n🎉 Quick fix completed! You can now create personnel without email.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

quickFixPersonnelEmail();
