// fileName: roomsService.ts
import axios from 'axios';

export interface Room {
  building_id: string;
  room_id: string;
  max_num_of_students: number;
  current_num_of_students: number;
  occupancy_rate: number;
  rental_price: number;
  room_status: 'Available' | 'Occupied' | 'Under Maintenance';
  room_gender: 'Male' | 'Female' | 'Mixed';
}
export interface TransferPayload {
  sssn: string;
  targetBuildingId: string;
  targetRoomId: string;
}
export interface Student {
  ssn: string;
  student_id: string;
  cccd: string;
  first_name: string;
  last_name: string;
  birthday: string;
  sex: string;
  phone_numbers: string;
  emails: string;
  addresses: string;
  health_state: string | null;
  ethnic_group: string | null;
  has_health_insurance?: boolean;
  study_status: string | null;
  class_name: string | null;
  faculty: string | null;
  building_id: string;
  room_id: string;
  
  // Guardian info
  guardian_cccd?: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_occupation?: string;
  guardian_birthday?: string;
  guardian_phone_numbers?: string;
  guardian_addresses?: string;
}

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
  try {
    const res = await axios.get<Student[]>(`/api/rooms/${buildingId}/${roomId}/students`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error: any) {
    console.error('Failed to fetch students in room:', error);
    return []; // Trả về mảng rỗng nếu lỗi để tránh crash UI
  }
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
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update room');
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

// Thêm sinh viên vào phòng
export const addStudentToRoom = async (
  buildingId: string,
  roomId: string,
  sssn: string
): Promise<Room> => {
  try {
    const response = await axios.post<Room>(
      `/api/rooms/${buildingId}/${roomId}/students`,
      { sssn }, // Gửi sssn trong body (khớp với RoomStudentMutationBody ở Backend)
      { headers: { ...getAuthHeaders() } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to add student to room:', error);
    // Ném lỗi chi tiết để Frontend hiển thị Toast
    const message = error.response?.data?.error || error.response?.data?.message || 'Failed to add student';
    throw new Error(message);
  }
};

// Xóa sinh viên khỏi phòng
export const removeStudentFromRoom = async (
  buildingId: string,
  roomId: string,
  sssn: string
): Promise<Room> => {
  try {
    const response = await axios.delete<Room>(
      `/api/rooms/${buildingId}/${roomId}/students/${sssn}`, // Gửi sssn trên URL (khớp với route param ở Backend)
      { headers: { ...getAuthHeaders() } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to remove student from room:', error);
    const message = error.response?.data?.error || error.response?.data?.message || 'Failed to remove student';
    throw new Error(message);
  }
};
export const transferStudent = async (payload: TransferPayload): Promise<void> => {
  try {
    await axios.post(
      `/api/rooms/transfer`,
      payload,
      { headers: getAuthHeaders() }
    );
  } catch (error: any) {
    console.error('Failed to transfer student:', error);
    const message = error.response?.data?.error || error.response?.data?.message || 'Failed to transfer student';
    throw new Error(message);
  }
};