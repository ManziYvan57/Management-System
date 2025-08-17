const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createDefaultUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.NODE_ENV === 'production' 
        ? process.env.MONGODB_URI_PROD 
        : process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity_management_system',
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

    // Create test users for different roles and terminals
    const testUsers = [
      // Super Admin (can access all terminals)
      {
        username: 'superadmin',
        email: 'superadmin@trinity.com',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'super_admin',
        terminal: 'kigali', // Default terminal, but can access all
        route: 'none',
        fleetType: 'both',
        department: 'management',
        phone: '+250700000000',
        isActive: true
      },
      // Terminal Managers
      {
        username: 'kigali_manager',
        email: 'kigali.manager@trinity.com',
        password: 'kigali123',
        firstName: 'Kigali',
        lastName: 'Manager',
        role: 'terminal_manager',
        terminal: 'kigali',
        route: 'none',
        fleetType: 'both',
        department: 'management',
        phone: '+250700000001',
        isActive: true
      },
      {
        username: 'kampala_manager',
        email: 'kampala.manager@trinity.com',
        password: 'kampala123',
        firstName: 'Kampala',
        lastName: 'Manager',
        role: 'terminal_manager',
        terminal: 'kampala',
        route: 'none',
        fleetType: 'both',
        department: 'management',
        phone: '+256700000001',
        isActive: true
      },
      {
        username: 'nairobi_manager',
        email: 'nairobi.manager@trinity.com',
        password: 'nairobi123',
        firstName: 'Nairobi',
        lastName: 'Manager',
        role: 'terminal_manager',
        terminal: 'nairobi',
        route: 'none',
        fleetType: 'both',
        department: 'management',
        phone: '+254700000001',
        isActive: true
      },
      {
        username: 'juba_manager',
        email: 'juba.manager@trinity.com',
        password: 'juba123',
        firstName: 'Juba',
        lastName: 'Manager',
        role: 'terminal_manager',
        terminal: 'juba',
        route: 'none',
        fleetType: 'both',
        department: 'management',
        phone: '+211700000001',
        isActive: true
      },
      // Route Managers
      {
        username: 'kampala_nairobi_route',
        email: 'kampala.nairobi@trinity.com',
        password: 'route123',
        firstName: 'Kampala-Nairobi',
        lastName: 'Route Manager',
        role: 'route_manager',
        terminal: 'kampala',
        route: 'kampala-nairobi',
        fleetType: 'active',
        department: 'transport',
        phone: '+256700000002',
        isActive: true
      },
      {
        username: 'goma_kampala_route',
        email: 'goma.kampala@trinity.com',
        password: 'route123',
        firstName: 'Goma-Kampala',
        lastName: 'Route Manager',
        role: 'route_manager',
        terminal: 'kampala',
        route: 'goma-kampala',
        fleetType: 'active',
        department: 'transport',
        phone: '+256700000003',
        isActive: true
      },
      {
        username: 'nairobi_kigali_route',
        email: 'nairobi.kigali@trinity.com',
        password: 'route123',
        firstName: 'Nairobi-Kigali',
        lastName: 'Route Manager',
        role: 'route_manager',
        terminal: 'nairobi',
        route: 'nairobi-kigali',
        fleetType: 'active',
        department: 'transport',
        phone: '+254700000002',
        isActive: true
      },
      {
        username: 'kampala_kigali_route',
        email: 'kampala.kigali@trinity.com',
        password: 'route123',
        firstName: 'Kampala-Kigali',
        lastName: 'Route Manager',
        role: 'route_manager',
        terminal: 'kampala',
        route: 'kampala-kigali',
        fleetType: 'active',
        department: 'transport',
        phone: '+256700000004',
        isActive: true
      },
      {
        username: 'kampala_juba_route',
        email: 'kampala.juba@trinity.com',
        password: 'route123',
        firstName: 'Kampala-Juba',
        lastName: 'Route Manager',
        role: 'route_manager',
        terminal: 'kampala',
        route: 'kampala-juba',
        fleetType: 'active',
        department: 'transport',
        phone: '+256700000005',
        isActive: true
      },
      {
        username: 'juba_bor_route',
        email: 'juba.bor@trinity.com',
        password: 'route123',
        firstName: 'Juba-Bor',
        lastName: 'Route Manager',
        role: 'route_manager',
        terminal: 'juba',
        route: 'juba-bor',
        fleetType: 'both',
        department: 'transport',
        phone: '+211700000002',
        isActive: true
      },
      // Fleet Managers
      {
        username: 'active_fleet_manager',
        email: 'active.fleet@trinity.com',
        password: 'fleet123',
        firstName: 'Active Fleet',
        lastName: 'Manager',
        role: 'fleet_manager',
        terminal: 'kigali',
        route: 'none',
        fleetType: 'active',
        department: 'garage',
        phone: '+250700000002',
        isActive: true
      },
      {
        username: 'maintenance_fleet_manager',
        email: 'maintenance.fleet@trinity.com',
        password: 'fleet123',
        firstName: 'Maintenance Fleet',
        lastName: 'Manager',
        role: 'fleet_manager',
        terminal: 'kigali',
        route: 'none',
        fleetType: 'maintenance',
        department: 'garage',
        phone: '+250700000003',
        isActive: true
      }
    ];

    // Create all users
    const createdUsers = await User.insertMany(testUsers);

    console.log('✅ Test users created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    createdUsers.forEach(user => {
      console.log(`\n👤 ${user.role.toUpperCase()} - ${user.terminal.toUpperCase()}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Terminal: ${user.terminal}`);
      console.log(`   Department: ${user.department}`);
    });

    console.log('\n⚠️  IMPORTANT: Change passwords after first login!');
    console.log('\n🧪 Test different roles to see role-based UI in action!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
    process.exit(1);
  }
};

// Run seeder
createDefaultUsers();
