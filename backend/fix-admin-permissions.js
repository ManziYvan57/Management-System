const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixAdminPermissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🔗 Connected to MongoDB');
    
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`📊 Found ${adminUsers.length} admin users to fix`);
    
    if (adminUsers.length === 0) {
      console.log('✅ No admin users found to fix');
      return;
    }
    
    // Update admin permissions to view-only (no user management)
    const adminPermissions = {
      garage: { view: true, create: false, edit: false, delete: false },
      inventory: { view: true, create: false, edit: false, delete: false },
      assets: { view: true, create: false, edit: false, delete: false },
      personnel: { view: true, create: false, edit: false, delete: false },
      transport: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, export: false },
      users: { view: false, create: false, edit: false, delete: false }
    };
    
    for (const user of adminUsers) {
      await User.findByIdAndUpdate(user._id, { permissions: adminPermissions });
      console.log(`✅ Fixed permissions for admin user: ${user.username}`);
    }
    
    console.log(`\n🎉 Fixed ${adminUsers.length} admin users!`);
    console.log('📋 Admin users now have:');
    console.log('   - View-only access to all modules');
    console.log('   - Access to all terminals');
    console.log('   - NO access to User Management');
    
  } catch (error) {
    console.error('❌ Error fixing admin permissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
fixAdminPermissions();
