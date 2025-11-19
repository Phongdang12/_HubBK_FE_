import express from 'express';
import { StatisticsController } from '@/App/Controllers/statistics.controller';
import { validateAll } from '@/App/Middlewares/validate';
import {
  GetDisciplinedStudents,
  BuildingIdParams,
} from '@/App/Validations/statistics.validator';
import { verifyToken } from '@/App/Middlewares/auth';

const statisticsRouter = express.Router();
const statisticsController = new StatisticsController();

statisticsRouter
  .get(
    '/disciplined-students',
    verifyToken,
    validateAll({ query: GetDisciplinedStudents }),
    statisticsController.getDisciplinedStudents.bind(statisticsController),
  )
  .get(
    '/total-students/:buildingId',
    verifyToken,
    validateAll({ params: BuildingIdParams }),
    statisticsController.getTotalStudentsByBuilding.bind(statisticsController),
  )
  .get(
    '/valid-dormitory-cards',
    verifyToken,
    statisticsController.getValidDormitoryCards.bind(statisticsController),
  );

export default statisticsRouter;
