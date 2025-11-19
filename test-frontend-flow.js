// Test what the frontend might be doing
const testFrontendFlow = async () => {
  try {
    console.log('Testing frontend API flow...');
    
    // Check if there's a token in localStorage (common frontend pattern)
    const storedToken = 'fake-stored-token'; // Frontend might have this
    
    console.log('1. Trying to get students without login (should fail)');
    const unauthorizedResponse = await fetch('http://localhost:3000/api/students', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      }
    });
    console.log('Status without auth:', unauthorizedResponse.status);
    console.log('Body without auth:', await unauthorizedResponse.text());
    
    console.log('\n2. Login first');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      },
      body: JSON.stringify({
        user_name: 'sManager',
        password: 'admin123'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.token) {
      console.log('\n3. Now get students with token');
      const studentsResponse = await fetch('http://localhost:3000/api/students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`,
          'Origin': 'http://localhost:5173'
        }
      });
      
      console.log('Students status:', studentsResponse.status);
      console.log('Students headers:', Object.fromEntries(studentsResponse.headers.entries()));
      
      const studentsText = await studentsResponse.text();
      console.log('Students body length:', studentsText.length);
      
      // Try to parse as JSON
      try {
        const studentsJson = JSON.parse(studentsText);
        console.log('Students count:', studentsJson.length);
        console.log('First student:', studentsJson[0]);
      } catch (e) {
        console.log('Failed to parse students as JSON:', e.message);
        console.log('Raw response preview:', studentsText.slice(0, 200));
      }
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
};

testFrontendFlow();