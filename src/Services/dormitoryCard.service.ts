import pool from '@/Config/db.config';
import { DormitoryCard } from '@/Interfaces/dormitoryCard.interface';

export class DormitoryCardService {
  static async checkDormitoryCard(ssn: string): Promise<number> {
    const [rows] = await pool.query(
      'SELECT check_dormitory_card(?) AS validity',
      [ssn],
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return (rows[0] as { validity: number }).validity; // đúng vì rows[0] là { validity: 0/1/2 }
    } else {
      throw new Error('Unexpected result format in checkDormitoryCard');
    }
  }

  static async createDormitoryCard(ssn: string): Promise<void> {
    await pool.query('CALL create_dormitory_card(?)', [ssn]);
  }

  static async setDormitoryCard(ssn: string): Promise<void> {
    await pool.query('CALL set_validity_dormitory_card(?)', [ssn]);
  }
}
