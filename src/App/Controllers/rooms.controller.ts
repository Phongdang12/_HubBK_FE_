import { Request, Response } from 'express';
import {
  BuildingIdParamsDto,
  RoomCheckParamsDto,
} from '../Validations/rooms.validator';
import { RoomsService } from '@/Services/rooms.service';
import { QueryError } from 'mysql2';

export class RoomsController {
  private roomsService: RoomsService;

  constructor() {
    this.roomsService = new RoomsService();
    console.log('RoomsController initialized');
  }

  async getAllRooms(_req: Request, res: Response): Promise<void> {
    try {
      console.log('getAllRooms called');
      const result = await this.roomsService.getAllRooms();
      res.json(result);
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }
  async getRoomDetail(req: Request<RoomCheckParamsDto>, res: Response): Promise<void> {
    try {
      const { buildingId, roomId } = req.params;

      // Trực tiếp lấy object Room từ service
      const room = await this.roomsService.getRoomDetail(buildingId, roomId);
      console.log('Params received:', buildingId, roomId);
      if (!room) {
        res.status(404).json({ message: 'Room not found' });
        return;
      }
      console.log('Room from DB:', room);
      const formatted = {
        building_id: room.building_id,
        room_id: room.room_id,
        max_num_of_students: room.max_num_of_students,
        current_num_of_students: room.current_num_of_students,
        occupancy_rate: room.occupancy_rate,
        rental_price: room.rental_price,
        room_status: room.room_status,
      };

      res.status(200).json(formatted);
    } catch (error) {
      console.error('getRoomDetail error:', error);
      const msg = (error as QueryError).message || 'Unknown error';
      res.status(500).json({ message: msg });
    }
  }
  async getStudentsInRoom(req: Request<RoomCheckParamsDto>, res: Response): Promise<void> {
    try {
      const { buildingId, roomId } = req.params;
      const students = await this.roomsService.getStudentsInRoom(buildingId, roomId);
      res.status(200).json(students);
    } catch (error) {
      const msg = (error as QueryError).message || 'Unknown error';
      res.status(500).json({ message: msg });
    }
  }
async updateRoom(req: Request, res: Response) {
  try {
    const { buildingId, roomId } = req.params;
    const data = req.body;

    const updated = await this.roomsService.updateRoom(buildingId, roomId, data);

    return res.status(200).json(updated);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'Update room failed' });
  }
}

  async getRoomsByBuildingId(
    req: Request<BuildingIdParamsDto>,
    res: Response,
  ): Promise<void> {
    try {
      console.log('getRoomsByBuildingId called');
      const { buildingId } = req.params;
      const result = await this.roomsService.getRoomsByBuildingId(buildingId);
      res.json(result);
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }

  async getUnderoccupiedRooms(_req: Request, res: Response): Promise<void> {
    try {
      console.log('getUnderoccupiedRooms called');
      const result = await this.roomsService.getUnderoccupiedRooms();
      res.json(result);
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }

  async getUnderoccupiedRoomsByBuildingId(
    req: Request<BuildingIdParamsDto>,
    res: Response,
  ): Promise<void> {
    try {
      console.log('getUnderoccupiedRoomsByBuildingId called');
      const { buildingId } = req.params;
      const result =
        await this.roomsService.getUnderoccupiedRoomsByBuildingId(buildingId);
      res.json(result);
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }

  async checkUnderoccupiedRoom(
    req: Request<RoomCheckParamsDto>,
    res: Response,
  ): Promise<void> {
    try {
      const { buildingId, roomId } = req.params;
      const result = await this.roomsService.checkUnderoccupiedRoom(
        buildingId,
        roomId,
      );
      res.json(result);
    } catch (error) {
      const mysqlErrorMessage =
        (error as QueryError).message || 'Unknown error';
      res.status(500).json({ success: false, message: mysqlErrorMessage });
    }
  }
}
