import pool from '../Config/db.config';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Interface cho dữ liệu trả về
interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export class DatabaseExample {
  
  // 1. SELECT - Lấy dữ liệu
  static async getAllUsers(): Promise<User[]> {
    try {
      const [rows] = await pool.execute<User[]>('SELECT * FROM users');
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error);
      throw error;
    }
  }

  // 2. SELECT với tham số - Tránh SQL Injection
  static async getUserById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute<User[]>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Lỗi khi lấy user:', error);
      throw error;
    }
  }

  // 3. INSERT - Thêm dữ liệu mới
  static async createUser(name: string, email: string): Promise<number> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email]
      );
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo user:', error);
      throw error;
    }
  }

  // 4. UPDATE - Cập nhật dữ liệu
  static async updateUser(id: number, name: string, email: string): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật user:', error);
      throw error;
    }
  }

  // 5. DELETE - Xóa dữ liệu
  static async deleteUser(id: number): Promise<boolean> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa user:', error);
      throw error;
    }
  }

  // 6. Transaction - Thực hiện nhiều thao tác cùng lúc
  static async transferMoney(fromUserId: number, toUserId: number, amount: number): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Trừ tiền từ tài khoản A
      await connection.execute(
        'UPDATE accounts SET balance = balance - ? WHERE user_id = ?',
        [amount, fromUserId]
      );

      // Cộng tiền vào tài khoản B
      await connection.execute(
        'UPDATE accounts SET balance = balance + ? WHERE user_id = ?',
        [amount, toUserId]
      );

      await connection.commit();
      console.log('Chuyển tiền thành công!');
    } catch (error) {
      await connection.rollback();
      console.error('Lỗi chuyển tiền, đã rollback:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // 7. Stored Procedure - Gọi procedure từ database
  static async callStoredProcedure(studentId: number): Promise<any> {
    try {
      const [rows] = await pool.execute('CALL get_student_info(?)', [studentId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi gọi stored procedure:', error);
      throw error;
    }
  }

  // 8. Join tables - Kết hợp nhiều bảng
  static async getUsersWithRoles(): Promise<any[]> {
    try {
      const [rows] = await pool.execute(`
        SELECT u.id, u.name, u.email, r.role_name
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
      `);
      return rows as any[];
    } catch (error) {
      console.error('Lỗi khi join tables:', error);
      throw error;
    }
  }
}