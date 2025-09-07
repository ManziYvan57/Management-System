const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trinity-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkUsers() {
  try {
    console.log('🔍 Checking all users in the database...\n');
    
    const users = await User.find({}).select('username email firstName lastName role terminal department isActive createdAt');
    
    console.log(`📊 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Terminal: ${user.terminal}`);
      console.log(`   Department: ${user.department}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ' + '─'.repeat(50));
    });
    
    // Check for super_admin users
    const superAdmins = users.filter(user => user.role === 'super_admin');
    console.log(`\n👑 Super Admin users: ${superAdmins.length}`);
    superAdmins.forEach(admin => {
      console.log(`   - ${admin.username} (${admin.email}) - Terminal: ${admin.terminal}`);
    });
    
    // Check for admin users
    const admins = users.filter(user => user.role === 'admin');
    console.log(`\n🔧 Admin users: ${admins.length}`);
    admins.forEach(admin => {
      console.log(`   - ${admin.username} (${admin.email}) - Terminal: ${admin.terminal}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
