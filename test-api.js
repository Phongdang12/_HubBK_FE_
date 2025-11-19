const fetch = require('node-fetch');

async function testAPI() {
    try {
        console.log('Testing API endpoints...');
        
        // Test debug students endpoint
        console.log('1. Testing /api/debug/students...');
        const response = await fetch('http://localhost:3000/api/debug/students');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Debug students endpoint works!');
            console.log('Students count:', data.count);
            console.log('First student sample:', JSON.stringify(data.data?.[0], null, 2));
        } else {
            console.log('❌ Debug students endpoint failed:', response.status, response.statusText);
            const text = await response.text();
            console.log('Response:', text);
        }

        // Test original endpoint (should fail without auth)
        console.log('\n2. Testing /api/students (without auth)...');
        const response2 = await fetch('http://localhost:3000/api/students');
        const data2 = await response2.json();
        console.log('Response:', data2);

    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

testAPI();