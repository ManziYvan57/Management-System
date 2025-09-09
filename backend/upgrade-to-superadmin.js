const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const upgradeToSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🔗 Connected to MongoDB');
    
    // Find your user account (replace with your actual username or email)
    const username = process.argv[2] || 'admin'; // You can pass username as argument
    const email = process.argv[3]; // Or email as second argument
    
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ username });
    }
    
    if (!user) {
      console.log('❌ User not found. Please check your username/email.');
      console.log('Available users:');
      const allUsers = await User.find({}, 'username email role terminal');
      allUsers.forEach(u => {
        console.log(`- Username: ${u.username}, Email: ${u.email}, Role: ${u.role}, Terminal: ${u.terminal}`);
      });
      return;
    }
    
    console.log('👤 Found user:', {
      username: user.username,
      email: user.email,
      currentRole: user.role,
      terminal: user.terminal,
      department: user.department
    });
    
    // Update user to super_admin
    user.role = 'super_admin';
    user.department = 'management';
    user.terminal = 'Kigali'; // Super admin can access all terminals
    
    // Set full permissions for super admin
    user.permissions = {
      garage: { view: true, create: true, edit: true, delete: true },
      inventory: { view: true, create: true, edit: true, delete: true },
      assets: { view: true, create: true, edit: true, delete: true },
      personnel: { view: true, create: true, edit: true, delete: true },
      transport: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, export: true },
      users: { view: true, create: true, edit: true, delete: true }
    };
    
    await user.save();
    
    console.log('✅ Successfully upgraded user to super_admin!');
    console.log('🎯 New permissions:', user.permissions);
    
    // Verify the update
    const updatedUser = await User.findById(user._id);
    console.log('🔍 Verification - Updated user:', {
      username: updatedUser.username,
      role: updatedUser.role,
      department: updatedUser.department,
      terminal: updatedUser.terminal,
      permissions: updatedUser.permissions
    });
    
  } catch (error) {
    console.error('❌ Error upgrading user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
upgradeToSuperAdmin();
