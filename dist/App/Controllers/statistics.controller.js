"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsController = void 0;
const statistics_service_1 = require("../../Services/statistics.service");
class StatisticsController {
    constructor() {
        this.statisticsService = new statistics_service_1.StatisticsService();
        console.log('StatisticsController initialized');
    }
    getDisciplinedStudents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate } = req.query;
                const { totalDisciplinedStudents } = yield this.statisticsService.getDisciplinedStudents(startDate, endDate);
                res.json({ totalDisciplinedStudents });
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                console.error('Error insert student: ', error);
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
    getTotalStudentsByBuilding(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { buildingId } = req.params;
                const { totalStudents } = yield this.statisticsService.getTotalStudentsByBuilding(buildingId);
                res.json({ totalStudents });
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
    getValidDormitoryCards(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { validDormCards } = yield this.statisticsService.getValidDormitoryCards();
                res.json({ validDormCards });
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
}
exports.StatisticsController = StatisticsController;
