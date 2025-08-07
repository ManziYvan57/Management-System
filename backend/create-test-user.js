const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity_management_db');
    console.log('Connected to database');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'serge@trinityexpress' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Create a test super admin user
    const testUser = new User({
      username: 'serge',
      password: 'password123',
      role: 'super_admin',
      firstName: 'Serge',
      lastName: 'Trinity',
      email: 'serge@trinityexpress',
      department: 'Management',
      permissions: {
        assetRegister: true,
        inventory: true,
        garage: true,
        driverPerformance: true,
        transportOperations: true,
        packageManagement: true,
        reports: true
      }
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('Email: serge@trinityexpress');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

createTestUser();
