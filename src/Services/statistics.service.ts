import pool from '@/Config/db.config';
import {
  DisciplinedStudentsResponse,
  TotalStudentsByBuildingResponse,
  ValidDormitoryCardsResponse,
} from '@/Interfaces/statistics.interface';

export class StatisticsService {
  constructor() {
    console.log('StatisticsService initialized');
  }

  async getDisciplinedStudents(
    startDate: string,
    endDate: string,
  ): Promise<DisciplinedStudentsResponse> {
    const result = await pool.query(
      'SELECT count_disciplined_students(?, ?) AS totalDisciplinedStudents',
      [startDate, endDate],
    );

    const totalDisciplinedStudents = result[0] as DisciplinedStudentsResponse[];
    return totalDisciplinedStudents[0];
  }

  async getTotalStudentsByBuilding(
    buildingId: string,
  ): Promise<TotalStudentsByBuildingResponse> {
    if (buildingId.length > 5) {
      throw new Error('Building ID is exactly 5 characters long');
    }

    const result = await pool.query(
      'SELECT total_students_by_building(?) AS totalStudents',
      [buildingId],
    );
    const totalStudents = result[0] as TotalStudentsByBuildingResponse[];

    return totalStudents[0];
  }

  async getValidDormitoryCards(): Promise<ValidDormitoryCardsResponse> {
    const result = await pool.query(
      'SELECT num_validity_dormitory_card() AS validDormCards;',
    );
    const validCards = result[0] as ValidDormitoryCardsResponse[];

    return validCards[0];
  }
}
