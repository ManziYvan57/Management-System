const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Trinity Management System API...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server status...');
    const statusResponse = await axios.get(`${BASE_URL.replace('/api', '')}`);
    console.log('✅ Server is running:', statusResponse.data.message);
    console.log('');

    // Test 2: Test authentication endpoints
    console.log('2. Testing authentication endpoints...');
    
    // Test login with test user
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
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

    // Get buses list
    const busesResponse = await axios.get(`${BASE_URL}/buses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Buses list retrieved');
    console.log('Total buses:', busesResponse.data.pagination.total);
    console.log('');

    // Test 4: Create a test bus
    console.log('4. Testing bus creation...');
    const testBus = {
      plateNumber: 'TEST001',
      busType: 'Coaster',
      capacity: 25,
      status: 'operational',
      year: 2020,
      manufacturer: 'Toyota',
      model: 'Hiace',
      color: 'White',
      route: 'Kampala-Nairobi',
      assignedDriver: 'John Doe',
      customerCareStaff: 'Jane Smith',
      departureTime: '08:00',
      teamLeader: 'Mike Johnson',
      insuranceExpiry: '2025-12-31',
      registrationExpiry: '2025-12-31',
      assetValue: 50000,
      purchasePrice: 60000,
      currentValue: 45000,
      condition: 'good',
      mileage: 50000,
      fuelEfficiency: 12,
      notes: 'Test bus for API testing',
      currentLocation: 'Kampala',
      tags: ['test', 'coaster']
    };

    const createResponse = await axios.post(`${BASE_URL}/buses`, testBus, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Test bus created successfully');
    console.log('Bus ID:', createResponse.data.bus._id);
    console.log('');

    // Test 5: Get the created bus
    console.log('5. Testing bus retrieval...');
    const getBusResponse = await axios.get(`${BASE_URL}/buses/${createResponse.data.bus._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Bus retrieved successfully');
    console.log('Plate Number:', getBusResponse.data.bus.plateNumber);
    console.log('Insurance Status:', getBusResponse.data.bus.insuranceStatus);
    console.log('Maintenance Status:', getBusResponse.data.bus.maintenanceStatus);
    console.log('Age:', getBusResponse.data.bus.age, 'years');
    console.log('');

    // Test 6: Update bus maintenance
    console.log('6. Testing maintenance update...');
    const maintenanceResponse = await axios.patch(`${BASE_URL}/buses/${createResponse.data.bus._id}/maintenance`, {
      cost: 5000,
      date: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Maintenance updated successfully');
    console.log('Total maintenance cost:', maintenanceResponse.data.bus.totalMaintenanceCost);
    console.log('Next maintenance date:', maintenanceResponse.data.bus.nextMaintenanceDate);
    console.log('');

    // Test 7: Clean up - Delete test bus
    console.log('7. Cleaning up test data...');
    await axios.delete(`${BASE_URL}/buses/${createResponse.data.bus._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Test bus deleted successfully');
    console.log('');

    console.log('🎉 All API tests completed successfully!');
    console.log('The Trinity Management System backend is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Make sure the test user exists in the database');
    }
  }
}

testAPI(); 