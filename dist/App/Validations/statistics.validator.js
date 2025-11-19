"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingIdParams = exports.GetDisciplinedStudents = void 0;
const zod_1 = require("zod");
exports.GetDisciplinedStudents = zod_1.z.object({
    startDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid startDate format',
    }),
    endDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid endDate format',
    }),
});
exports.BuildingIdParams = zod_1.z.object({
    buildingId: zod_1.z
        .string()
        .min(1, {
        message: 'Building ID is required',
    })
        .max(5, {
        message: 'Building ID must be at most 5 characters long',
    }),
});
