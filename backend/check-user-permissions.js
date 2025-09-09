const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUserPermissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('🔗 Connected to MongoDB');
    
    // Get all users
    const users = await User.find({}, 'username email role terminal department permissions');
    
    console.log('👥 All Users in Database:');
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Terminal: ${user.terminal}`);
      console.log(`   Department: ${user.department}`);
      console.log(`   Permissions:`);
      
      if (user.permissions) {
        Object.keys(user.permissions).forEach(module => {
          const modulePerms = user.permissions[module];
          const actions = Object.keys(modulePerms).map(action => 
            `${action}: ${modulePerms[action] ? '✅' : '❌'}`
          ).join(', ');
          console.log(`     ${module}: ${actions}`);
        });
      } else {
        console.log('     No permissions set');
      }
    });
    
    // Check for users with missing or incorrect permissions
    console.log('\n🔍 Permission Analysis:');
    console.log('='.repeat(80));
    
    const usersWithIssues = [];
    
    users.forEach(user => {
      const issues = [];
      
      if (!user.permissions) {
        issues.push('No permissions object');
      } else {
        // Check if user has proper permissions based on role
        if (user.role === 'super_admin' || user.role === 'admin') {
          // Should have full permissions
          Object.keys(user.permissions).forEach(module => {
            const modulePerms = user.permissions[module];
            Object.keys(modulePerms).forEach(action => {
              if (!modulePerms[action]) {
                issues.push(`${module}.${action} should be true for ${user.role}`);
              }
            });
          });
        } else if (user.role === 'HR') {
          // Should have view-only permissions
          Object.keys(user.permissions).forEach(module => {
            const modulePerms = user.permissions[module];
            if (module === 'users') {
              // HR should not have user management access
              if (modulePerms.view || modulePerms.create || modulePerms.edit || modulePerms.delete) {
                issues.push(`${module} should be view: false for HR`);
              }
            } else {
              // Other modules should be view-only
              if (modulePerms.create || modulePerms.edit || modulePerms.delete) {
                issues.push(`${module} should be view-only for HR`);
              }
            }
          });
        }
      }
      
      if (issues.length > 0) {
        usersWithIssues.push({
          username: user.username,
          role: user.role,
          issues: issues
        });
      }
    });
    
    if (usersWithIssues.length > 0) {
      console.log('⚠️  Users with permission issues:');
      usersWithIssues.forEach(user => {
        console.log(`\n   ${user.username} (${user.role}):`);
        user.issues.forEach(issue => {
          console.log(`     - ${issue}`);
        });
      });
    } else {
      console.log('✅ All users have correct permissions!');
    }
    
  } catch (error) {
    console.error('❌ Error checking permissions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
checkUserPermissions();
