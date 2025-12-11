const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixManagerPermissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.NODE_ENV === 'production' 
        ? process.env.MONGODB_URI_PROD 
        : process.env.MONGODB_URI || 'mongodb://localhost:27017/jali_transport_management_system',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log('✅ Connected to MongoDB');

    // Find all managers
    const managers = await User.find({ role: 'managers' });
    
    if (managers.length === 0) {
      console.log('⚠️  No managers found in database');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Found ${managers.length} manager(s)`);

    // Fix each manager's permissions
    for (const manager of managers) {
      // Call setDefaultPermissions to ensure correct structure
      manager.setDefaultPermissions();
      await manager.save();
      console.log(`✅ Fixed permissions for manager: ${manager.username}`);
    }

    console.log('\n🎉 Manager permissions updated successfully!');

  } catch (error) {
    console.error('❌ Error fixing manager permissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

fixManagerPermissions();
