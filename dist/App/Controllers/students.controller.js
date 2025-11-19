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
const students_service_1 = require("../../Services/students.service");
class StudentController {
    static getStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const students = yield students_service_1.StudentService.getAllStudents();
                const formatted = students.map((student) => ({
                    new_ssn: student.ssn,
                    ssn: student.ssn,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    birthday: student.birthday,
                    sex: student.sex,
                    health_state: student.health_state || 'Unknown',
                    ethnic_group: student.ethnic_group || 'Unknown',
                    student_id: student.student_id,
                    has_health_insurance: student.has_health_insurance || false,
                    study_status: student.study_status || 'Unknown',
                    class_name: student.class_name || 'Unknown',
                    faculty: student.faculty || 'Unknown',
                    building_id: student.building_id,
                    room_id: student.room_id,
                    phone_numbers: student.phone_numbers,
                    emails: student.emails,
                    addresses: student.addresses,
                }));
                res.status(200).json(formatted);
            }
            catch (error) {
                console.error('Error fetching students:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    static getStudentBySsn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ssn = req.params.ssn;
                const students = yield students_service_1.StudentService.getStudentBySsn(ssn);
                const student = students[0];
                if (!student) {
                    res.status(404).json({ message: 'Student not found' });
                    return;
                }
                const formatted = {
                    new_ssn: student.ssn,
                    ssn: student.ssn,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    birthday: student.birthday,
                    sex: student.sex,
                    health_state: student.health_state || 'Unknown',
                    ethnic_group: student.ethnic_group || 'Unknown',
                    student_id: student.student_id,
                    has_health_insurance: student.has_health_insurance,
                    study_status: student.study_status || 'Unknown',
                    class_name: student.class_name || 'Unknown',
                    faculty: student.faculty || 'Unknown',
                    building_id: student.building_id,
                    room_id: student.room_id,
                    phone_numbers: student.phone_numbers,
                    emails: student.emails,
                    addresses: student.addresses,
                };
                res.status(200).json(formatted);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    static createStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const student = req.body;
            try {
                yield students_service_1.StudentService.insertStudent(student);
                res.status(201).json({ message: 'Student created successfully' });
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
    static put(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const student = req.body;
            try {
                yield students_service_1.StudentService.updateStudent(student);
                res.status(200).json({ message: 'Student updated successfully' });
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ssn = req.params.ssn;
                yield students_service_1.StudentService.deleteStudent(ssn);
                res.status(200).json({ message: 'Student deleted successfully' });
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    static getNoRelative(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const students = yield students_service_1.StudentService.getNotFamilyStudent();
                const formatted = students.map((student) => ({
                    ssn: student.ssn,
                    full_name: student.first_name + ' ' + student.last_name,
                }));
                res.status(200).json(formatted);
            }
            catch (error) {
                console.error('Error fetching students:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
}
exports.default = StudentController;
