const axios = require('axios');

const BASE_URL = 'https://trinity-management-system.onrender.com/api';

async function testDeployedAPI() {
  try {
    console.log('🧪 Testing Deployed Trinity Management System API...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server status...');
    const statusResponse = await axios.get(`${BASE_URL.replace('/api', '')}`);
    console.log('✅ Server is running:', statusResponse.data.message);
    console.log('');

    // Test 2: Test authentication endpoints
    console.log('2. Testing authentication endpoints...');
    
    // Test login with test user - try both formats
    let loginResponse;
    try {
      // Try username format first
      loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'serge',
        password: 'password123'
      });
      console.log('✅ Login successful with username format');
    } catch (error) {
      if (error.response?.data?.errors?.some(e => e.path === 'email')) {
        // Try email format
        loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'serge@trinityexpress',
          password: 'password123'
        });
        console.log('✅ Login successful with email format');
      } else {
        throw error;
      }
    }
    
    const token = loginResponse.data.token;
    console.log('User role:', loginResponse.data.user.role);
    console.log('User permissions:', Object.keys(loginResponse.data.user.permissions));
    console.log('');

    // Test 3: Test bus endpoints
    console.log('3. Testing bus management endpoints...');
    
    // Get bus statistics
    const statsResponse = await axios.get(`${BASE_URL}/buses/stats/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Bus statistics retrieved:', statsResponse.data);
    console.log('');

    console.log('🎉 Deployed API tests completed successfully!');
    console.log('Your Trinity Management System is live and working!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Make sure the test user exists in the database');
    }
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Make sure your backend is deployed and the URL is correct');
    }
  }
}

testDeployedAPI(); 