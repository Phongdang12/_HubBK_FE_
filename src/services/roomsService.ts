// src/services/roomService.ts
import axios from 'axios';

export interface Room {
  building_id: string;
  room_id: string;
  max_num_of_students: number;
  current_num_of_students: number;
  occupancy_rate: number;
  rental_price: number;
  room_status: 'Available' | 'Occupied' | 'Under Maintenance';
}
export interface Student {
  new_ssn: string;
  cccd: string;
  ssn: string;
  guardian_list?: any[]; // Thêm trường guardian_list để chứa danh sách người thân
  first_name: string;
  last_name: string;
  birthday: string;
  sex: string;
  health_state: string | null;
  ethnic_group: string | null;
  student_id: string;
  has_health_insurance?: boolean; // Optional vì database không có field này
  study_status: string | null;
  class_name: string | null;
  faculty: string | null;
  building_id: string;
  room_id: string;
  phone_numbers: string;
  emails: string;
  addresses: string;
  guardian_cccd?: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_occupation?: string;
  guardian_birthday?: string;
  guardian_phone_numbers?: string;
  guardian_addresses?: string;
}

const API_URL = "http://localhost:3000/api/rooms";
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const getAllRooms = async (): Promise<Room[]> => {
  const res = await axios.get<Room[]>('/api/rooms/', {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getUnderoccupiedRooms = async (): Promise<Room[]> => {
  const res = await axios.get<Room[]>('/api/rooms/underoccupied', {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const getRoomsByBuilding = async (
  buildingId: string,
): Promise<Room[]> => {
  const res = await axios.get<Room[]>(`/api/rooms/${buildingId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
export const getRoomDetail = async (buildingId: string, roomId: string): Promise<Room> => {
  try {
    const response = await axios.get<Room>(`/api/rooms/${buildingId}/${roomId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {  
    console.error('Failed to fetch room detail:', error);
    if (error.response?.status === 404) {
      throw new Error('Room not found');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch room detail');
  }
};
export const getStudentsInRoom = async (buildingId: string, roomId: string): Promise<Student[]> => {
  const res = await axios.get<Student[]>(`/api/rooms/${buildingId}/${roomId}/students`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
// Cập nhật phòng
export const updateRoom = async (
  buildingId: string,
  roomId: string,
  room: Partial<Room>
): Promise<Room> => {
  try {
    const response = await axios.put<Room>(`/api/rooms/${buildingId}/${roomId}`, room, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to update room:', error);
    throw new Error(error.response?.data?.message || 'Failed to update room');
  }
};

export const getUnderoccupiedRoomsByBuilding = async (
  buildingId: string,
): Promise<Room[]> => {
  const res = await axios.get<Room[]>(
    `/api/rooms/underoccupied/${buildingId}`,
    {
      headers: getAuthHeaders(),
    },
  );
  return res.data;
};

export const addStudentToRoom = async (
  buildingId: string,
  roomId: string,
  sssn: string
): Promise<Room> => {
  const response = await axios.post<Room>(
    `/api/rooms/${buildingId}/${roomId}/students`,
    { sssn },
    { headers: { ...getAuthHeaders() } }
  );
  return response.data;
};

export const removeStudentFromRoom = async (
  buildingId: string,
  roomId: string,
  sssn: string
): Promise<Room> => {
  const response = await axios.delete<Room>(
    `/api/rooms/${buildingId}/${roomId}/students/${sssn}`,
    { headers: { ...getAuthHeaders() } }
  );
  return response.data;
};
