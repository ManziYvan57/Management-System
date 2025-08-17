const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testServer() {
  console.log('🧪 Testing Trinity Management System Backend...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test API endpoints (should return placeholder data)
    console.log('2. Testing API endpoints...');
    
    const endpoints = [
      '/api/garage/stats',
      '/api/inventory/stats', 
      '/api/assets/stats',
      '/api/personnel/stats',
      '/api/transport/stats',
      '/api/dashboard/overview'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        console.log(`✅ ${endpoint}: ${response.data.message}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      }
    }

    console.log('\n🎉 Server test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Set up MongoDB connection');
    console.log('2. Create .env file with proper configuration');
    console.log('3. Test authentication endpoints');
    console.log('4. Implement module-specific models and routes');

  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running on port 5000');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Verify .env configuration');
  }
}

// Run the test
testServer();
