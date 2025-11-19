"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const statistics_controller_1 = require("../App/Controllers/statistics.controller");
const validate_1 = require("../App/Middlewares/validate");
const statistics_validator_1 = require("../App/Validations/statistics.validator");
const auth_1 = require("../App/Middlewares/auth");
const statisticsRouter = express_1.default.Router();
const statisticsController = new statistics_controller_1.StatisticsController();
statisticsRouter
    .get('/disciplined-students', auth_1.verifyToken, (0, validate_1.validateAll)({ query: statistics_validator_1.GetDisciplinedStudents }), statisticsController.getDisciplinedStudents.bind(statisticsController))
    .get('/total-students/:buildingId', auth_1.verifyToken, (0, validate_1.validateAll)({ params: statistics_validator_1.BuildingIdParams }), statisticsController.getTotalStudentsByBuilding.bind(statisticsController))
    .get('/valid-dormitory-cards', auth_1.verifyToken, statisticsController.getValidDormitoryCards.bind(statisticsController));
exports.default = statisticsRouter;
