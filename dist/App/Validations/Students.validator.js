"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentBody = exports.SsnParam = void 0;
const zod_1 = require("zod");
exports.SsnParam = zod_1.z.object({
    ssn: zod_1.z.string().length(8, {
        message: 'SSN must be exactly 8 characters long',
    }),
});
exports.StudentBody = zod_1.z.object({
    ssn: zod_1.z.string().trim().length(8, {
        message: 'SSN must be exactly 8 characters long',
    }),
    new_ssn: zod_1.z.string().trim().length(8, {
        message: 'New SSN must be exactly 8 characters long',
    }),
    first_name: zod_1.z.string().trim().min(1, {
        message: 'First name is required',
    }),
    last_name: zod_1.z.string().trim().min(1, {
        message: 'Last name is required',
    }),
    birthday: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Birthday must be a valid date',
    }),
    sex: zod_1.z.enum(['M', 'F'], {
        message: 'Sex is required',
    }),
    health_state: zod_1.z.string().nullable(),
    ethnic_group: zod_1.z.string({
        message: 'Ethnic group is required',
    }),
    student_id: zod_1.z.string().trim().length(7, {
        message: 'Student ID must be exactly 7 characters long',
    }),
    has_health_insurance: zod_1.z.boolean().nullable(),
    study_status: zod_1.z.string({
        message: 'Study status is required',
    }),
    class_name: zod_1.z.string().nullable(),
    faculty: zod_1.z.string().nullable(),
    building_id: zod_1.z.string({
        message: 'Building ID is required',
    }),
    room_id: zod_1.z.string({
        message: 'Room ID is required',
    }),
    phone_numbers: zod_1.z.string().nullable(),
    emails: zod_1.z.string().nullable(),
    addresses: zod_1.z.string().nullable(),
});
