const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testAuth() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity_management_db');
    console.log('Connected to database');

    // Create a test super admin user
    const testUser = new User({
      username: 'admin',
      password: 'admin123',
      role: 'super_admin',
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@trinity.com',
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
    console.log('Test user created successfully');

    // Test password comparison
    const isValid = await testUser.comparePassword('admin123');
    console.log('Password validation:', isValid);

    // Test permissions
    console.log('Has asset register permission:', testUser.hasPermission('assetRegister'));
    console.log('Has inventory permission:', testUser.hasPermission('inventory'));

    console.log('✅ Authentication system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testAuth(); 