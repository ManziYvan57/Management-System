const https = require('https');

// Test if the server is responding
const testServer = () => {
  const options = {
    hostname: 'trinity-management-system.onrender.com',
    port: 443,
    path: '/api/terminals',
    method: 'GET',
    headers: {
      'Origin': 'http://localhost:3002',
      'Content-Type': 'application/json'
    }
  };

  console.log('🔍 Testing server health...');
  console.log('URL: https://trinity-management-system.onrender.com/api/terminals');

  const req = https.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Response:', data);
      if (res.statusCode === 200) {
        console.log('✅ Server is responding correctly');
      } else {
        console.log('❌ Server returned error status');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.setTimeout(10000, () => {
    console.log('⏰ Request timeout');
    req.destroy();
  });

  req.end();
};

testServer();
