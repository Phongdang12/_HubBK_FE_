// Test để kiểm tra API kết nối từ frontend
// Chạy file này trong Console của browser để test

async function testStudentsAPI() {
  try {
    console.log('🔍 Testing Students API...');
    
    // 1. Test login trước
    console.log('1. Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: 'sManager',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    // Lưu token vào localStorage
    localStorage.setItem('token', loginData.token);
    
    // 2. Test get students với token
    console.log('2. Testing get students...');
    const studentsResponse = await fetch('http://localhost:3000/api/students', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!studentsResponse.ok) {
      throw new Error(`Get students failed: ${studentsResponse.status}`);
    }
    
    const studentsData = await studentsResponse.json();
    console.log('✅ Students API successful');
    console.log(`📊 Found ${studentsData.length} students`);
    console.log('📋 Sample student:', studentsData[0]);
    
    // 3. Test get no-family students
    console.log('3. Testing no-family students...');
    const noFamilyResponse = await fetch('http://localhost:3000/api/students/no-relatives', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    if (!noFamilyResponse.ok) {
      throw new Error(`No-family students failed: ${noFamilyResponse.status}`);
    }
    
    const noFamilyData = await noFamilyResponse.json();
    console.log('✅ No-family students API successful');
    console.log(`👨‍👩‍👧‍👦 Found ${noFamilyData.length} students without family`);
    
    console.log('🎉 All tests passed! API is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('💡 Suggestions:');
    console.error('   - Make sure backend server is running on port 3000');
    console.error('   - Check CORS settings');
    console.error('   - Verify login credentials');
    return false;
  }
}

// Export cho use trong browser console
window.testStudentsAPI = testStudentsAPI;

console.log('🚀 Test function loaded. Run: testStudentsAPI()');