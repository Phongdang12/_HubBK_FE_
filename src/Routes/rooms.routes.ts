import express from 'express';
import { RoomsController } from '@/App/Controllers/rooms.controller';
import { validateAll } from '@/App/Middlewares/validate';
import {
  BuildingIdParams,
  RoomCheckParams,
} from '@/App/Validations/rooms.validator';
import { verifyToken } from '@/App/Middlewares/auth';

const roomsRouter = express.Router();
const roomsController = new RoomsController();
// --- Lấy danh sách sinh viên trong phòng ---
roomsRouter.get(
  '/:buildingId/:roomId/students',
  verifyToken,
  validateAll({ params: RoomCheckParams }),
  roomsController.getStudentsInRoom.bind(roomsController)
);

// --- Lấy chi tiết 1 phòng ---
roomsRouter.get(
  '/:buildingId/:roomId',
  verifyToken,
  validateAll({ params: RoomCheckParams }),
  roomsController.getRoomDetail.bind(roomsController)
);

// --- Kiểm tra 1 phòng có dưới mức hay không ---
roomsRouter.get(
  '/underoccupied/:buildingId/:roomId',
  verifyToken,
  validateAll({ params: RoomCheckParams }),
  roomsController.checkUnderoccupiedRoom.bind(roomsController)
);

// --- Lấy tất cả phòng dưới mức theo building ---
roomsRouter.get(
  '/underoccupied/:buildingId',
  verifyToken,
  validateAll({ params: BuildingIdParams }),
  roomsController.getUnderoccupiedRoomsByBuildingId.bind(roomsController)
);

// --- Lấy tất cả phòng của 1 building ---
roomsRouter.get(
  '/:buildingId',
  verifyToken,
  validateAll({ params: BuildingIdParams }),
  roomsController.getRoomsByBuildingId.bind(roomsController)
);

// --- Lấy tất cả phòng ---
roomsRouter.get(
  '/',
  verifyToken,
  roomsController.getAllRooms.bind(roomsController)
);

// --- Lấy tất cả phòng dưới mức ---
roomsRouter.get(
  '/underoccupied',
  verifyToken,
  roomsController.getUnderoccupiedRooms.bind(roomsController)
);
roomsRouter.put(
  '/:buildingId/:roomId',
  verifyToken,
  validateAll({ params: RoomCheckParams }),
  roomsController.updateRoom.bind(roomsController)
);

export default roomsRouter;
