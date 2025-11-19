"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomCheckParams = exports.BuildingIdParams = void 0;
const zod_1 = require("zod");
exports.BuildingIdParams = zod_1.z.object({
    buildingId: zod_1.z.string().min(1, 'buildingId is required'),
});
exports.RoomCheckParams = zod_1.z.object({
    buildingId: zod_1.z.string().min(1, 'buildingId is required'),
    roomId: zod_1.z.string().min(1, 'roomId is required'),
});
