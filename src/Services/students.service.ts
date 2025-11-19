import pool from '@/Config/db.config';
import { Student } from '@/Interfaces/student.interface';

export class StudentService {
  // 🟢 Lấy toàn bộ sinh viên
  static async getAllStudents(): Promise<Student[]> {
    const result: any = await pool.query('CALL get_all_students()');
    const rows = result[0][0];

    if (Array.isArray(rows)) {
      return rows.map((row: any) => ({
        ...row,
        ssn: row.sssn || row.ssn,
        cccd: row.cccd,
      })) as Student[];
    } else {
      throw new Error('Unexpected result format');
    }
  }

  // 🟢 Lấy sinh viên theo SSSN
  static async getStudentBySsn(ssn: string): Promise<Student[]> {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        s.sssn,
        s.cccd,
        s.first_name,
        s.last_name,
        s.birthday,
        s.sex,
        s.health_state,
        s.ethnic_group,
        s.student_id,
        s.study_status,
        s.class_name,
        s.faculty,
        s.building_id,
        s.room_id,
        s.phone_numbers,
        s.emails,
        s.addresses,
        s.has_health_insurance,

        -- 🧩 Thông tin người giám hộ (trong chính bảng student)
        s.guardian_cccd,
        s.guardian_name,
        s.guardian_relationship,
        s.guardian_occupation,
        s.guardian_birthday,
        s.guardian_phone_numbers,
        s.guardian_addresses

      FROM student s
      WHERE s.sssn = ?
      LIMIT 1
    `, [ssn]);

    if (!rows || rows.length === 0) {
      throw new Error('Student not found');
    }

    const s = rows[0];

    return [
      {
        ssn: s.sssn,
        cccd: s.cccd,
        first_name: s.first_name,
        last_name: s.last_name,
        birthday: s.birthday,
        sex: s.sex,
        health_state: s.health_state,
        ethnic_group: s.ethnic_group,
        student_id: s.student_id,
        study_status: s.study_status,
        class_name: s.class_name,
        faculty: s.faculty,
        building_id: s.building_id,
        room_id: s.room_id,
        phone_numbers: s.phone_numbers,
        emails: s.emails,
        addresses: s.addresses,
        has_health_insurance: s.has_health_insurance,

        // ✅ Người giám hộ
        guardian_cccd: s.guardian_cccd,
        guardian_name: s.guardian_name,
        guardian_relationship: s.guardian_relationship,
        guardian_occupation: s.guardian_occupation,
        guardian_birthday: s.guardian_birthday,
        guardian_phone_numbers: s.guardian_phone_numbers,
        guardian_addresses: s.guardian_addresses,
      },
    ] as Student[];
  } catch (err: any) {
    console.error('❌ Error in getStudentBySsn:', err);
    throw new Error('Failed to fetch student info');
  }
}

  // 🟢 Xóa sinh viên
  static async deleteStudent(ssn: string): Promise<void> {
    await pool.query('CALL delete_student_by_sssn(?)', [ssn]);
  }

  // 🟢 Thêm sinh viên
  static async insertStudent(student: Student): Promise<void> {
  const params = [
    student.ssn,
    student.cccd,
    student.first_name,
    student.last_name,
    student.birthday,
    student.sex,
    student.ethnic_group,
    student.health_state,
    student.student_id,
    student.study_status,
    student.class_name,
    student.faculty,
    student.building_id,
    student.room_id,
    student.phone_numbers || null,
    student.emails || null,
    student.addresses || null,
    student.guardian_cccd || null,
    student.guardian_name || null,
    student.guardian_relationship || null,
    student.guardian_occupation || null,
    student.guardian_birthday || null,
    student.guardian_phone_numbers || null,
    student.guardian_addresses || null,
  ];

  console.log('🟢 insertStudent params:', params);

  try {
    await pool.query(
      `CALL insert_student(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );
    await pool.query('CALL create_dormitory_card(?)', [student.ssn]);
    console.log('✅ Student added successfully');
  } catch (err: any) {
    console.error('❌ MySQL error during add_new_student:', err);
    throw new Error('Failed to add student');
  }
}


  // 🟢 Cập nhật sinh viên
  static async updateStudent(student: Student): Promise<void> {
  const studentParams = [
    student.ssn,
    student.cccd,
    student.first_name,
    student.last_name,
    student.birthday ? student.birthday.slice(0, 10) : null,
    student.sex,
    student.ethnic_group,
    student.health_state,
    student.student_id,
    student.study_status,
    student.class_name,
    student.faculty,
    student.building_id,
    student.room_id,
    student.phone_numbers,
    student.emails,
    student.addresses,
    student.has_health_insurance,
  ];

  console.log('🟢 updateStudent params:', studentParams);

  try {
    // Cập nhật sinh viên cơ bản
    await pool.query('CALL update_student_info(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', studentParams);

    // Cập nhật người giám hộ nếu có
    const hasGuardian =
      student.guardian_name ||
      student.guardian_cccd ||
      student.guardian_relationship ||
      student.guardian_birthday;

    if (hasGuardian) {
      console.log('🟢 update_guardian_info params:', [
        student.ssn,
        student.guardian_cccd,
        student.guardian_name,
        student.guardian_relationship,
        student.guardian_occupation,
        student.guardian_birthday ? student.guardian_birthday.slice(0, 10) : null,
        student.guardian_phone_numbers,
        student.guardian_addresses,
      ]);

      await pool.query('CALL update_guardian_info(?, ?, ?, ?, ?, ?, ?, ?)', [
        student.ssn,
        student.guardian_cccd || null,
        student.guardian_name || null,
        student.guardian_relationship || null,
        student.guardian_occupation || null,
        student.guardian_birthday ? student.guardian_birthday.slice(0, 10) : null,
        student.guardian_phone_numbers || null,
        student.guardian_addresses || null,
      ]);

      console.log('✅ Guardian updated successfully');
    } else {
      console.log('⚪ No guardian info provided — skipped updating guardian.');
    }
  } catch (err: any) {
    console.error('❌ MySQL error during update_student_info/update_guardian_info:', err);
    throw new Error('Failed to update student');
  }
}
static async getPaginated(page: number, limit: number) {
    const offset = (page - 1) * limit;

    try {
      // ✅ Lấy danh sách sinh viên theo LIMIT và OFFSET
      const [rows]: any = await pool.query(
        `SELECT 
            s.sssn,
            s.cccd,
            s.first_name,
            s.last_name,
            s.birthday,
            s.sex,
            s.ethnic_group,
            s.study_status,
            s.health_state,
            s.student_id,
            s.class_name,
            s.faculty,
            s.building_id,
            s.room_id,
            s.phone_numbers,
            s.emails,
            s.addresses,
            s.has_health_insurance,
            s.guardian_cccd,
            s.guardian_name,
            s.guardian_relationship,
            s.guardian_occupation,
            s.guardian_birthday,
            s.guardian_phone_numbers,
            s.guardian_addresses
        FROM student s
        ORDER BY s.sssn
        LIMIT ? OFFSET ?;`,
        [limit, offset]
      );

      // ✅ Lấy tổng số sinh viên
      const [[{ total }]]: any = await pool.query(
        `SELECT COUNT(*) AS total FROM student;`
      );

      return {
        data: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err: any) {
      console.error('❌ Error in getPaginated:', err);
      throw new Error('Failed to fetch paginated students');
    }
  }
}
