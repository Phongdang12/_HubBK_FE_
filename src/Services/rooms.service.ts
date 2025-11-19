import pool from '@/Config/db.config';
import { Room } from '@/Interfaces/rooms.interface';
import { Student } from '@/Interfaces/student.interface';
export class RoomsService {
  constructor() {
    console.log('RoomsService initialized');
  }

  async getAllRooms(): Promise<Room[]> {
    const result = await pool.query('CALL list_all_rooms()');
    const rows = result[0];

    if (Array.isArray(rows) && Array.isArray(rows[0])) {
      return rows[0] as Room[];
    } else {
      throw new Error('Unexpected result format');
    }
  }

  async getRoomsByBuildingId(buildingId: string): Promise<Room[]> {
    if (buildingId.length > 5) {
      throw new Error('Building ID is exactly 5 characters long');
    }
    const result = await pool.query('CALL list_rooms_building(?)', [
      buildingId,
    ]);
    const rows = result[0];

    if (Array.isArray(rows) && Array.isArray(rows[0])) {
      return rows[0] as Room[];
    } else {
      throw new Error('Unexpected result format');
    }
  }

  async getUnderoccupiedRooms(): Promise<Room[]> {
    const result = await pool.query('CALL list_all_underoccupied_rooms()');
    const rows = result[0];

    if (Array.isArray(rows) && Array.isArray(rows[0])) {
      return rows[0] as Room[];
    } else {
      throw new Error('Unexpected result format');
    }
  }
  async getRoomDetail(buildingId: string, roomId: string): Promise<Room> {
    const result: any = await pool.query(`CALL get_room_detail(?, ?)`, [buildingId, roomId]);

    // result[0] là mảng các rows của stored procedure
    const rows = result[0]; // rows: [ [ {...} ] ]

    // Lấy object đầu tiên
    const room = rows[0][0]; // room: { building_id: ..., room_id: ..., ... }

    if (!room) {
      throw new Error('Room not found');
    }

    return room; // ✅ trả object
  }
  async updateRoom(
    buildingId: string,
    roomId: string,
    data: Partial<Room>
  ): Promise<Room> {
    const {
      max_num_of_students,
      current_num_of_students,
      rental_price,
      room_status
    } = data;

    const result: any = await pool.query(
      'CALL update_room(?, ?, ?, ?, ?, ?)',
      [
        buildingId,
        roomId,
        max_num_of_students,
        current_num_of_students,
        rental_price,
        room_status
      ]
    );

    // Sau update → lấy lại bản room mới nhất
    const refreshed = await this.getRoomDetail(buildingId, roomId);
    return refreshed;
  }


  async getStudentsInRoom(buildingId: string, roomId: string): Promise<Student[]> {
    const result: any = await pool.query('CALL get_students_in_room(?, ?)', [buildingId, roomId]);
    const rows = result[0];
    if (!rows || !Array.isArray(rows[0])) return [];
    return rows[0]; // Trả về array sinh viên
  }


  async getUnderoccupiedRoomsByBuildingId(buildingId: string): Promise<Room[]> {
    if (buildingId.length > 5) {
      throw new Error('Building ID is exactly 5 characters long');
    }
    const result = await pool.query('CALL list_underoccupied_by_building(?)', [
      buildingId,
    ]);
    const rows = result[0];

    if (Array.isArray(rows) && Array.isArray(rows[0])) {
      return rows[0] as Room[];
    } else {
      throw new Error('Unexpected result format');
    }
  }

  async checkUnderoccupiedRoom(
    buildingId: string,
    roomId: string,
  ): Promise<Room[]> {
    if (buildingId.length > 5) {
      throw new Error('Building ID is exactly 5 characters long');
    }

    if (roomId.length > 5) {
      throw new Error('Room ID is exactly 5 characters long');
    }
    const result = await pool.query('CALL check_one_room_underoccupied(?, ?)', [
      buildingId,
      roomId,
    ]);
    const rows = result[0];

    if (Array.isArray(rows) && Array.isArray(rows[0])) {
      return rows[0] as Room[];
    } else {
      throw new Error('Unexpected result format');
    }
  }
}
