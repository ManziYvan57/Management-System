const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createOnlineUser = async () => {
  try {
    console.log('🔗 Connecting to online database...');
    
    // Connect to MongoDB Atlas (online database)
    const mongoUri = process.env.MONGODB_URI_PROD || 'mongodb+srv://username:password@cluster.mongodb.net/trinity_management_system';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Try different role and terminal combinations
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@trinity.com',
        password: 'Admin123!',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'super_admin',
        terminal: 'kigali',
        department: 'management',
        phone: '+250700000000'
      },
      {
        username: 'admin2',
        email: 'admin2@trinity.com',
        password: 'Admin123!',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'manager',
        terminal: 'kigali',
        department: 'management',
        phone: '+250700000000'
      },
      {
        username: 'admin3',
        email: 'admin3@trinity.com',
        password: 'Admin123!',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'user',
        terminal: 'kigali',
        department: 'management',
        phone: '+250700000000'
      }
    ];

    for (const userData of testUsers) {
      try {
        // Delete existing user if exists
        await User.deleteOne({ username: userData.username });
        console.log(`🗑️ Deleted existing user: ${userData.username}`);

        // Create new user
        const user = await User.create(userData);
        console.log(`✅ Created user: ${user.username} with role: ${user.role}, terminal: ${user.terminal}`);
        
        // If successful, use this combination
        console.log('\n🎉 Success! Use these credentials:');
        console.log(`Username: ${user.username}`);
        console.log('Password: Admin123!');
        console.log(`Role: ${user.role}`);
        console.log(`Terminal: ${user.terminal}`);
        break;
        
      } catch (error) {
        console.log(`❌ Failed to create user ${userData.username}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error creating online user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createOnlineUser();
