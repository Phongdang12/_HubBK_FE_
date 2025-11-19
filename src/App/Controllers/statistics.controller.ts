import { Request, Response } from 'express';
import { StatisticsService } from '@/Services/statistics.service';
import {
  GetDisciplinedStudentsDto,
  BuildingIdParamsDto,
} from '../Validations/statistics.validator';
import { QueryError } from 'mysql2';

export class StatisticsController {
  private statisticsService: StatisticsService;

  constructor() {
    this.statisticsService = new StatisticsService();
    console.log('StatisticsController initialized');
  }

  async getDisciplinedStudents(
    req: Request<{}, {}, {}, GetDisciplinedStudentsDto>,
    res: Response,
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const { totalDisciplinedStudents } =
        await this.statisticsService.getDisciplinedStudents(startDate, endDate);
      res.json({ totalDisciplinedStudents });
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      console.error('Error insert student: ', error);
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }

  async getTotalStudentsByBuilding(
    req: Request<BuildingIdParamsDto>,
    res: Response,
  ): Promise<void> {
    try {
      const { buildingId } = req.params;
      const { totalStudents } =
        await this.statisticsService.getTotalStudentsByBuilding(buildingId);
      res.json({ totalStudents });
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }

  async getValidDormitoryCards(_req: Request, res: Response): Promise<void> {
    try {
      const { validDormCards } =
        await this.statisticsService.getValidDormitoryCards();
      res.json({ validDormCards });
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }
}
