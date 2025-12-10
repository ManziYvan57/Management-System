const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createDefaultUsers = async () => {
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

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log('⚠️  Users already exist in database');
      process.exit(0);
    }

    // Create test user (Admin with full access)
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@jalitransport.com',
        password: 'TempPass123!',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'super_admin',
        company: 'Kigali',
        route: 'none',
        fleetType: 'both',
        department: 'management',
        phone: '+250700000000',
        isActive: true
      }
    ];

    // Create users
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    console.log('\n🎉 Test user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('=====================================');
    console.log('ADMIN:');
    console.log('  Username: admin');
    console.log('  Email: admin@jalitransport.com');
    console.log('  Password: Check auto-generated password');
    console.log('  Company: Kigali');
    console.log('  ---');

    console.log('\n🔐 Use this account to test all features of the system.');
    console.log('💡 This admin account has full access to all modules.');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

createDefaultUsers();
