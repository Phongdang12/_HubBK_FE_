const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabase() {
    try {
        console.log('Testing database connection...');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
        });

        console.log('✅ Connected to database successfully');

        // Test the get_student stored procedure
        console.log('Testing get_student procedure...');
        const [result] = await connection.execute('CALL get_student()');
        
        console.log('Number of result sets:', result.length);
        console.log('Number of students found:', result[0]?.length || 0);
        
        if (result[0] && result[0].length > 0) {
            console.log('First student sample:', JSON.stringify(result[0][0], null, 2));
        } else {
            console.log('❌ No students found!');
            
            // Check if there are students in the database
            const [studentsCount] = await connection.execute('SELECT COUNT(*) as count FROM student');
            console.log('Total students in student table:', studentsCount[0].count);
            
            // Check dormitory cards
            const [cardsCount] = await connection.execute('SELECT COUNT(*) as total, SUM(validity) as valid FROM dormitory_card');
            console.log('Dormitory cards - Total:', cardsCount[0].total, 'Valid:', cardsCount[0].valid);
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Error details:', error);
    }
}

testDatabase();