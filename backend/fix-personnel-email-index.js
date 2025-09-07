const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trinity-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function fixPersonnelEmailIndex() {
  try {
    await connectDB();
    console.log('🔧 Fixing Personnel email index...\n');
    
    const db = mongoose.connection.db;
    const collection = db.collection('personnels');
    
    // Check current indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Drop the existing email index
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped existing email_1 index');
    } catch (error) {
      console.log('ℹ️  email_1 index not found or already dropped');
    }
    
    // Create new sparse unique index
    await collection.createIndex({ email: 1 }, { 
      unique: true, 
      sparse: true,
      name: 'email_1_sparse'
    });
    console.log('✅ Created new sparse unique email index');
    
    // Verify the new index
    console.log('\n📋 Updated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)} (sparse: ${index.sparse || false})`);
    });
    
    // Test by checking for null emails
    const nullEmailCount = await collection.countDocuments({ email: null });
    const emptyEmailCount = await collection.countDocuments({ email: '' });
    const undefinedEmailCount = await collection.countDocuments({ email: { $exists: false } });
    
    console.log('\n📊 Email field analysis:');
    console.log(`  - Documents with email: null = ${nullEmailCount}`);
    console.log(`  - Documents with email: "" = ${emptyEmailCount}`);
    console.log(`  - Documents without email field = ${undefinedEmailCount}`);
    
    // Clean up null emails by removing the field
    if (nullEmailCount > 0) {
      console.log('\n🧹 Cleaning up null email values...');
      await collection.updateMany(
        { email: null },
        { $unset: { email: 1 } }
      );
      console.log('✅ Removed null email values');
    }
    
    if (emptyEmailCount > 0) {
      console.log('\n🧹 Cleaning up empty email values...');
      await collection.updateMany(
        { email: '' },
        { $unset: { email: 1 } }
      );
      console.log('✅ Removed empty email values');
    }
    
    console.log('\n🎉 Personnel email index fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing personnel email index:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixPersonnelEmailIndex();
