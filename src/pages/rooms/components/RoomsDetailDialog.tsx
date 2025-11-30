// fileName: RoomsDetailDialog.tsx
import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Room } from '@/services/roomsService';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
}

const RoomDetailDialog: FC<Props> = ({ open, onOpenChange, room }) => {
  // Helper hiển thị text giới tính
  const getGenderText = (g?: string | null) => {
    if (g === 'M' || g === 'Male') return 'Nam (Male)';
    if (g === 'F' || g === 'Female') return 'Nữ (Female)';
    return 'Linh hoạt (Chưa có người ở)';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-2xl bg-white p-6 shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-gray-800'>
            Room Details
          </DialogTitle>
        </DialogHeader>

        <div className='mt-4 space-y-2 text-gray-700'>
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Room ID:</strong> {room.room_id}</div>
            <div><strong>Building ID:</strong> {room.building_id}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div><strong>Max Students:</strong> {room.max_num_of_students}</div>
             <div><strong>Current:</strong> {room.current_num_of_students}</div>
          </div>

          <div>
            <strong>Occupancy Rate:</strong> {room.occupancy_rate}%
          </div>
          
          {/* ✅ THÊM DÒNG NÀY */}
          <div>
            <strong>Gender Type:</strong> <span className="font-medium text-blue-600">{getGenderText(room.room_gender)}</span>
          </div>

          <div>
            <strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs font-bold text-white ${
              room.room_status === 'Available' ? 'bg-green-500' : 
              room.room_status === 'Occupied' ? 'bg-red-500' : 'bg-yellow-500'
            }`}>
              {room.room_status}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailDialog;