// Simple fix for Personnel email duplicate issue
// This script directly removes email field from personnel with null/empty emails

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trinity-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function simpleEmailFix() {
  try {
    console.log('🔧 Simple email fix: Removing problematic email values...\n');
    
    const Personnel = require('./models/Personnel');
    
    // Find all personnel with null or empty emails
    const problematicPersonnel = await Personnel.find({
      $or: [
        { email: null },
        { email: '' },
        { email: { $exists: false } }
      ]
    });
    
    console.log(`📊 Found ${problematicPersonnel.length} personnel with problematic email values`);
    
    if (problematicPersonnel.length > 0) {
      // Remove email field from all problematic personnel
      const result = await Personnel.updateMany(
        {
          $or: [
            { email: null },
            { email: '' },
            { email: { $exists: false } }
          ]
        },
        { $unset: { email: 1 } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} personnel records`);
      console.log('✅ Removed email field from all problematic records');
    } else {
      console.log('✅ No problematic email values found');
    }
    
    // Verify the fix
    const remainingProblematic = await Personnel.find({
      $or: [
        { email: null },
        { email: '' }
      ]
    });
    
    console.log(`\n📊 Verification: ${remainingProblematic.length} personnel still have problematic email values`);
    
    if (remainingProblematic.length === 0) {
      console.log('🎉 Email fix completed successfully!');
      console.log('✅ You can now create personnel without email addresses');
    } else {
      console.log('⚠️  Some records still have issues, but this should resolve the duplicate error');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

simpleEmailFix();
