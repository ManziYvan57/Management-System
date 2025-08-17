const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./models/User');

const unlockAccounts = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI is not defined.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Reset all users' login attempts and unlock accounts
    const result = await User.updateMany(
      {}, // Update all users
      {
        $set: {
          loginAttempts: 0,
          lockUntil: null
        }
      }
    );

    console.log(`✅ Successfully unlocked ${result.modifiedCount} accounts`);
    console.log('🎉 All accounts are now unlocked and ready for login!');

    // Show current users
    const users = await User.find({}, 'username email role terminal isActive');
    console.log('\n📋 Current Users:');
    users.forEach(user => {
      console.log(`   👤 ${user.username} (${user.role}) - ${user.terminal} - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error unlocking accounts:', error);
    process.exit(1);
  }
};

unlockAccounts();
