// Test script to verify Paris API
const axios = require('axios');

async function testParisAPI() {
  try {
    console.log('🚀 Testing Paris API...');
    
    // Make a request to the orders endpoint
    const response = await axios.get('http://localhost:3000/orders');
    
    console.log('✅ Successful response!');
    console.log(`📊 Number of orders retrieved: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('📋 First order:');
      console.log(JSON.stringify(response.data[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📄 Server response:', error.response.data);
    }
  }
}

// Run the test
testParisAPI();
