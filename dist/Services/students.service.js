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
exports.StudentService = void 0;
const db_config_1 = __importDefault(require("../Config/db.config")); // Cấu hình kết nối với DB
class StudentService {
    static getAllStudents() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_config_1.default.query('CALL get_student()');
            const rows = result[0];
            if (Array.isArray(rows) && Array.isArray(rows[0])) {
                return rows[0];
            }
            else {
                throw new Error('Unexpected result format');
            }
        });
    }
    static getNotFamilyStudent() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_config_1.default.query('CALL list_student_not_family()');
            const rows = result[0];
            if (Array.isArray(rows) && Array.isArray(rows[0])) {
                return rows[0];
            }
            else {
                throw new Error('Unexpected result format');
            }
        });
    }
    static getStudentBySsn(ssn) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_config_1.default.query('CALL get_student_by_ssn(?)', [ssn]);
            const rows = result[0];
            if (Array.isArray(rows) && Array.isArray(rows[0])) {
                return rows[0];
            }
            else {
                throw new Error('Unexpected result format');
            }
        });
    }
    static deleteStudent(ssn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_config_1.default.query('CALL delete_student_by_ssn(?)', [ssn]);
        });
    }
    static insertStudent(student) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_config_1.default.query('CALL add_new_student(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                student.ssn,
                student.first_name,
                student.last_name,
                student.birthday,
                student.sex,
                student.health_state,
                student.ethnic_group,
                student.student_id,
                student.has_health_insurance,
                student.study_status,
                student.class_name,
                student.faculty,
                student.building_id,
                student.room_id,
                student.addresses,
                student.phone_numbers,
                student.emails,
            ]);
            yield db_config_1.default.query('CALL create_dormitory_card(?)', [student.ssn]);
        });
    }
    static updateStudent(student) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_config_1.default.query('CALL update_student(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                student.new_ssn,
                student.ssn,
                student.first_name,
                student.last_name,
                student.birthday,
                student.sex,
                student.health_state,
                student.ethnic_group,
                student.student_id,
                student.has_health_insurance,
                student.study_status,
                student.class_name,
                student.faculty,
                student.building_id,
                student.room_id,
                student.addresses,
                student.phone_numbers,
                student.emails,
            ]);
        });
    }
}
exports.StudentService = StudentService;
