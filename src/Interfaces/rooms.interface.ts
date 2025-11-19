export interface Room {
 building_id: string;
  room_id: string;
  max_num_of_students: number;
  current_num_of_students: number;
  occupancy_rate: string;
  rental_price: string;
  room_status: 'Available' | 'Occupied' | 'Under Maintenance';
}

