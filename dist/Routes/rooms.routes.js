"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rooms_controller_1 = require("../App/Controllers/rooms.controller");
const validate_1 = require("../App/Middlewares/validate");
const rooms_validator_1 = require("../App/Validations/rooms.validator");
const auth_1 = require("../App/Middlewares/auth");
const roomsRouter = express_1.default.Router();
const roomsController = new rooms_controller_1.RoomsController();
roomsRouter
    .get('/', auth_1.verifyToken, roomsController.getAllRooms.bind(roomsController))
    .get('/underoccupied', auth_1.verifyToken, roomsController.getUnderoccupiedRooms.bind(roomsController))
    .get('/:buildingId', auth_1.verifyToken, (0, validate_1.validateAll)({ params: rooms_validator_1.BuildingIdParams }), roomsController.getRoomsByBuildingId.bind(roomsController))
    .get('/underoccupied/:buildingId', auth_1.verifyToken, (0, validate_1.validateAll)({ params: rooms_validator_1.BuildingIdParams }), roomsController.getUnderoccupiedRoomsByBuildingId.bind(roomsController))
    .get('/underoccupied/:buildingId/:roomId', auth_1.verifyToken, (0, validate_1.validateAll)({ params: rooms_validator_1.RoomCheckParams }), roomsController.checkUnderoccupiedRoom.bind(roomsController));
exports.default = roomsRouter;
