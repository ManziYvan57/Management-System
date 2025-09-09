const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const migrateRolesAndRemoveDepartments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🔗 Connected to MongoDB');
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate`);
    
    let updatedCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};
      
      // 1. Replace HR role with managers
      if (user.role === 'HR') {
        updates.role = 'managers';
        needsUpdate = true;
        console.log(`🔄 Converting HR user ${user.username} to managers`);
      }
      
      // 2. Remove department field
      if (user.department) {
        updates.$unset = { department: 1 };
        needsUpdate = true;
        console.log(`🗑️  Removing department field from ${user.username}`);
      }
      
      // 3. Update permissions based on new role structure
      if (user.role === 'admin' || user.role === 'managers' || user.role === 'HR') {
        const rolePermissions = {
          super_admin: {
            garage: { view: true, create: true, edit: true, delete: true },
            inventory: { view: true, create: true, edit: true, delete: true },
            assets: { view: true, create: true, edit: true, delete: true },
            personnel: { view: true, create: true, edit: true, delete: true },
            transport: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, create: true, export: true },
            users: { view: true, create: true, edit: true, delete: true }
          },
          admin: {
            garage: { view: true, create: false, edit: false, delete: false },
            inventory: { view: true, create: false, edit: false, delete: false },
            assets: { view: true, create: false, edit: false, delete: false },
            personnel: { view: true, create: false, edit: false, delete: false },
            transport: { view: true, create: false, edit: false, delete: false },
            reports: { view: true, create: false, export: false },
            users: { view: true, create: false, edit: false, delete: false }
          },
          managers: {
            garage: { view: true, create: false, edit: false, delete: false },
            inventory: { view: true, create: false, edit: false, delete: false },
            assets: { view: true, create: false, edit: false, delete: false },
            personnel: { view: true, create: false, edit: false, delete: false },
            transport: { view: true, create: false, edit: false, delete: false },
            reports: { view: true, create: false, export: false },
            users: { view: false, create: false, edit: false, delete: false }
          }
        };
        
        const newRole = updates.role || user.role;
        updates.permissions = rolePermissions[newRole] || rolePermissions.managers;
        needsUpdate = true;
        console.log(`🔐 Updating permissions for ${user.username} (${newRole})`);
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updates);
        updatedCount++;
        console.log(`✅ Updated user: ${user.username}`);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Updated ${updatedCount} users`);
    
    // Show final user list
    console.log('\n👥 Final User List:');
    const finalUsers = await User.find({}, 'username email role terminal permissions');
    finalUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.username} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Terminal: ${user.terminal}`);
      console.log(`   Permissions: ${JSON.stringify(user.permissions, null, 2)}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the migration
migrateRolesAndRemoveDepartments();
