const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trinity-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updateUserToSuperAdmin() {
  try {
    console.log('🔍 Looking for admin users to upgrade...\n');
    
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found');
      return;
    }
    
    console.log(`📊 Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Terminal: ${user.terminal}`);
    });
    
    // Update the first admin user to super_admin
    const userToUpdate = adminUsers[0];
    console.log(`\n🔄 Updating ${userToUpdate.username} to super_admin...`);
    
    await User.findByIdAndUpdate(userToUpdate._id, { 
      role: 'super_admin',
      'permissions.users.view': true,
      'permissions.users.create': true,
      'permissions.users.edit': true,
      'permissions.users.delete': true
    });
    
    console.log('✅ Successfully updated user to super_admin!');
    console.log(`   Username: ${userToUpdate.username}`);
    console.log(`   Email: ${userToUpdate.email}`);
    console.log(`   Terminal: ${userToUpdate.terminal}`);
    console.log('\n🎉 You can now delete equipment from any terminal!');
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateUserToSuperAdmin();
