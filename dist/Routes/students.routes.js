"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const students_controller_1 = __importDefault(require("../App/Controllers/students.controller"));
const validate_1 = require("../App/Middlewares/validate");
const Students_validator_1 = require("../App/Validations/Students.validator");
const auth_1 = require("../App/Middlewares/auth");
router.get('/no-relatives', auth_1.verifyToken, students_controller_1.default.getNoRelative);
router.get('/', auth_1.verifyToken, students_controller_1.default.getStudent);
router.post('/', (0, validate_1.validateAll)({ body: Students_validator_1.StudentBody }), students_controller_1.default.createStudent);
router.get('/:ssn', auth_1.verifyToken, (0, validate_1.validateAll)({ params: Students_validator_1.SsnParam }), students_controller_1.default.getStudentBySsn);
router.put('/:ssn', (0, validate_1.validateAll)({ params: Students_validator_1.SsnParam, body: Students_validator_1.StudentBody }), students_controller_1.default.put);
router.delete('/:ssn', auth_1.verifyToken, (0, validate_1.validateAll)({ params: Students_validator_1.SsnParam }), students_controller_1.default.delete);
exports.default = router;
