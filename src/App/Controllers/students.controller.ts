import { Request, Response } from 'express';
import { StudentService } from '@/Services/students.service';
import { Student } from '@/Interfaces/student.interface';
import { QueryError } from 'mysql2';

class StudentController {
  static async getStudent(req: Request, res: Response) {
    try {
      const students: Student[] = await StudentService.getAllStudents();

      const formatted = students.map((student: Student) => ({
        cccd: student.cccd || '',
        ssn: student.ssn || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        birthday: student.birthday || null,
        sex: student.sex || '',
        health_state: student.health_state || 'Unknown',
        ethnic_group: student.ethnic_group || 'Unknown',

        student_id: student.student_id || '',
        has_health_insurance: student.has_health_insurance || false,
        study_status: student.study_status || 'Unknown',
        class_name: student.class_name || 'Unknown',
        faculty: student.faculty || 'Unknown',
        building_id: student.building_id || null,
        room_id: student.room_id || null,

        phone_numbers: student.phone_numbers || '',
        emails: student.emails || '',
        addresses: student.addresses || '',
      }));

      // Ensure we always return an array with safe values
      res.status(200).json(formatted.filter(student => student.ssn));
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
  static async getPaginated(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;

      const result = await StudentService.getPaginated(page, limit);

      res.status(200).json(result);
    } catch (error) {
      console.error('getPaginated error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getStudentBySsn(req: Request, res: Response): Promise<void> {
    try {
      const ssn = req.params.ssn;
      const students: Student[] = await StudentService.getStudentBySsn(ssn);
      const student: Student | undefined = students[0];

      if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }

      // ✅ Giữ nguyên tất cả dữ liệu sinh viên
      const formatted = {
  ssn: student.ssn,
  cccd: student.cccd,
  first_name: student.first_name,
  last_name: student.last_name,
  birthday: student.birthday,
  sex: student.sex,
  health_state: student.health_state || 'Unknown',
  ethnic_group: student.ethnic_group || 'Unknown',

  student_id: student.student_id,
  has_health_insurance: student.has_health_insurance,
  study_status: student.study_status || 'Unknown',
  class_name: student.class_name || 'Unknown',
  faculty: student.faculty || 'Unknown',
  building_id: student.building_id,
  room_id: student.room_id,

  phone_numbers: student.phone_numbers,
  emails: student.emails,
  addresses: student.addresses,

  // ✅ Thêm đầy đủ Guardian Info
  guardian_cccd: student.guardian_cccd,
  guardian_name: student.guardian_name,
  guardian_relationship: student.guardian_relationship,
  guardian_occupation: student.guardian_occupation,
  guardian_birthday: student.guardian_birthday,
  guardian_phone_numbers: student.guardian_phone_numbers,
  guardian_addresses: student.guardian_addresses,
};

      res.status(200).json(formatted);
    } catch (error) {
      console.error('getStudentBySsn error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }


  static async createStudent(req: Request, res: Response) {
    const student: Student = req.body;
    try {
      await StudentService.insertStudent(student);
      res.status(201).json({ message: 'Student created successfully' });
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }

  static async put(req: Request, res: Response): Promise<void> {
    const student: Student = req.body;
    try {
      await StudentService.updateStudent(student);
      res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const ssn = req.params.ssn;
      console.log('Attempting to delete student with SSN:', ssn);
      await StudentService.deleteStudent(ssn);
      console.log('Student deleted successfully');
      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Error deleting student:', error);
      const err = error as any;
      res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
  
}

export default StudentController;
