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
exports.RoomsController = void 0;
const rooms_service_1 = require("../../Services/rooms.service");
class RoomsController {
    constructor() {
        this.roomsService = new rooms_service_1.RoomsService();
        console.log('RoomsController initialized');
    }
    getAllRooms(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('getAllRooms called');
                const result = yield this.roomsService.getAllRooms();
                res.json(result);
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
    getRoomsByBuildingId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('getRoomsByBuildingId called');
                const { buildingId } = req.params;
                const result = yield this.roomsService.getRoomsByBuildingId(buildingId);
                res.json(result);
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
    getUnderoccupiedRooms(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('getUnderoccupiedRooms called');
                const result = yield this.roomsService.getUnderoccupiedRooms();
                res.json(result);
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
    getUnderoccupiedRoomsByBuildingId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('getUnderoccupiedRoomsByBuildingId called');
                const { buildingId } = req.params;
                const result = yield this.roomsService.getUnderoccupiedRoomsByBuildingId(buildingId);
                res.json(result);
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
    checkUnderoccupiedRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { buildingId, roomId } = req.params;
                const result = yield this.roomsService.checkUnderoccupiedRoom(buildingId, roomId);
                res.json(result);
            }
            catch (error) {
                const mysqlErrorMessage = error.message || 'Unknown error';
                res.status(500).json({ success: false, message: mysqlErrorMessage });
            }
        });
    }
}
exports.RoomsController = RoomsController;
