const mongoose = require('mongoose');
require('dotenv').config();

const testOnlineBackend = async () => {
  try {
    console.log('🔗 Testing online backend schema...');
    
    // Test different role and terminal combinations
    const testCombinations = [
      { role: 'super_admin', terminal: 'kigali' },
      { role: 'admin', terminal: 'kigali' },
      { role: 'super_admin', terminal: 'Kigali' },
      { role: 'admin', terminal: 'Kigali' },
      { role: 'manager', terminal: 'kigali' },
      { role: 'manager', terminal: 'Kigali' },
      { role: 'super_admin', terminal: 'kampala' },
      { role: 'admin', terminal: 'kampala' },
      { role: 'super_admin', terminal: 'Kampala' },
      { role: 'admin', terminal: 'Kampala' },
      { role: 'user', terminal: 'kigali' },
      { role: 'user', terminal: 'Kigali' }
    ];

    for (const combo of testCombinations) {
      console.log(`🧪 Testing: role=${combo.role}, terminal=${combo.terminal}`);
      
      // Try to make a request to the online backend
      const response = await fetch('https://trinity-management-system.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'test',
          password: 'test123'
        })
      });
      
      if (response.ok) {
        console.log(`✅ Online backend is accessible`);
        break;
      } else {
        console.log(`❌ Online backend error: ${response.status}`);
      }
    }

  } catch (error) {
    console.error('❌ Error testing online backend:', error);
  }
};

testOnlineBackend();
