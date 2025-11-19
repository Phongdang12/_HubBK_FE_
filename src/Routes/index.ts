import { Application } from 'express';
import auth from './auth.routes';
import students from './students.routes';
import statisticsRouter from './statistics.routes';
import roomsRouter from './rooms.routes';
import dormitoryCardRouter from './dormitoryCard.routes';

function route(app: Application): void {
  // Debug endpoint to help frontend development
  app.get('/api/debug/students-sample', (req, res) => {
    res.json({
      message: 'Sample student data structure',
      sample: {
        ssn: '05620513',
        first_name: 'Khoi',
        last_name: 'Nguyen Minh',
        birthday: '2003-06-02T17:00:00.000Z',
        sex: 'M',
        health_state: 'Good',
        ethnic_group: 'Kinh',
        student_id: '2312613',
        has_health_insurance: false,
        study_status: 'Active',
        class_name: 'KHMT1',
        faculty: 'Computer Science',
        building_id: 'BK001',
        room_id: 'P.104',
        phone_numbers: '0389162347',
        emails: 'khoi.nguyenminh03@hcmut.edu.vn',
        addresses: 'Tam Dan, Quang Nam'
      },
      fields: [
        'ssn', 'first_name', 'last_name', 'birthday', 'sex', 
        'health_state', 'ethnic_group', 'student_id', 'has_health_insurance',
        'study_status', 'class_name', 'faculty', 'building_id', 'room_id',
        'phone_numbers', 'emails', 'addresses'
      ]
    });
  });

  // Debug endpoint to test students data without auth
  app.get('/api/debug/students', async (req, res) => {
    try {
      const { StudentService } = await import('../Services/students.service');
      const students = await StudentService.getAllStudents();
      res.json({
        message: 'Students data fetched successfully',
        count: students.length,
        data: students
      });
    } catch (error) {
      console.error('Error in debug students:', error);
      res.status(500).json({ 
        message: 'Error fetching students', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.use('/api/students', students);
  app.use('/api/statistics', statisticsRouter);
  app.use('/api/rooms', roomsRouter);
  app.use('/api/auth', auth);
  app.use('/api/dormitoryCard', dormitoryCardRouter);
}

export default route;
