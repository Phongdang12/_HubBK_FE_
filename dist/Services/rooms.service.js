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
exports.RoomsService = void 0;
const db_config_1 = __importDefault(require("../Config/db.config"));
class RoomsService {
    constructor() {
        console.log('RoomsService initialized');
    }
    getAllRooms() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_config_1.default.query('CALL list_all_rooms()');
            const rows = result[0];
            if (Array.isArray(rows) && Array.isArray(rows[0])) {
                return rows[0];
            }
            else {
                throw new Error('Unexpected result format');
            }
        });
    }
    getRoomsByBuildingId(buildingId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (buildingId.length > 5) {
                throw new Error('Building ID is exactly 5 characters long');
            }
            const result = yield db_config_1.default.query('CALL list_rooms_building(?)', [
                buildingId,
            ]);
            const rows = result[0];
            if (Array.isArray(rows) && Array.isArray(rows[0])) {
                return rows[0];
            }
            else {
                throw new Error('Unexpected result format');
            }
        });
    }
    getUnderoccupiedRooms() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_config_1.default.query('CALL list_all_underoccupied_rooms()');
            const rows = result[0];
            if (Array.isArray(rows) && Array.isArray(rows[0])) {
                return rows[0];
            }
            else {
                throw new Error('Unexpected result format');
            }
        });
    }
    getUnderoccupiedRoomsByBuildingId(buildingId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (buildingId.length > 5) {
                throw new Error('Building ID is exactly 5 characters long');
            }
            const result = yield db_config_1.default.query('CALL list_underoccupied_by_building(?)', [
                buildingId,
            ]);
            const rows = result[0];
            if (Array.isArray(rows) && Array.isArray(rows[0])) {
                return rows[0];
            }
            else {
                throw new Error('Unexpected result format');
            }
        });
    }
    checkUnderoccupiedRoom(buildingId, roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (buildingId.length > 5) {
                throw new Error('Building ID is exactly 5 characters long');
            }
            if (roomId.length > 5) {
                throw new Error('Room ID is exactly 5 characters long');
            }
            const result = yield db_config_1.default.query('CALL check_one_room_underoccupied(?, ?)', [
                buildingId,
                roomId,
            ]);
            const rows = result[0];
            if (Array.isArray(rows) && Array.isArray(rows[0])) {
                return rows[0];
            }
            else {
                throw new Error('Unexpected result format');
            }
        });
    }
}
exports.RoomsService = RoomsService;
