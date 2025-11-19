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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = void 0;
const db_config_1 = __importDefault(require("../Config/db.config"));
class StatisticsService {
    constructor() {
        console.log('StatisticsService initialized');
    }
    getDisciplinedStudents(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_config_1.default.query('SELECT count_disciplined_students(?, ?) AS totalDisciplinedStudents', [startDate, endDate]);
            const totalDisciplinedStudents = result[0];
            return totalDisciplinedStudents[0];
        });
    }
    getTotalStudentsByBuilding(buildingId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (buildingId.length > 5) {
                throw new Error('Building ID is exactly 5 characters long');
            }
            const result = yield db_config_1.default.query('SELECT total_students_by_building(?) AS totalStudents', [buildingId]);
            const totalStudents = result[0];
            return totalStudents[0];
        });
    }
    getValidDormitoryCards() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_config_1.default.query('SELECT num_validity_dormitory_card() AS validDormCards;');
            const validCards = result[0];
            return validCards[0];
        });
    }
}
exports.StatisticsService = StatisticsService;
