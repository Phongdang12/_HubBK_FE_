// fileName: TransferStudentDialog.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { getRoomsByBuilding, Room, transferStudent, Student } from '@/services/roomsService';
import { Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

const BUILDINGS = ['BK001', 'BK002', 'BK003', 'BK004'];

// Hàm hỗ trợ hiển thị nhãn giới tính
const getGenderLabel = (gender: string) => {
  const g = gender?.toLowerCase();
  if (g === 'male') return 'Nam';
  if (g === 'female') return 'Nữ';
  if (g === 'co-ed') return 'Nam/Nữ';
  return gender;
};

// Hàm xác định màu sắc dựa trên giới tính
const getGenderColor = (gender: string) => {
  const g = gender?.toLowerCase();
  if (g === 'male') return 'text-blue-600';
  if (g === 'female') return 'text-pink-600';
  return 'text-gray-600';
};

export function TransferStudentDialog({ isOpen, onClose, student, onSuccess }: Props) {
  const [targetBuilding, setTargetBuilding] = useState<string>('');
  const [targetRoom, setTargetRoom] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetBuilding('');
      setTargetRoom('');
      setRooms([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!targetBuilding) return;

    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const data = await getRoomsByBuilding(targetBuilding);
        
        // --- LOGIC LỌC CHẶT CHẼ ---
        const availableRooms = data.filter(r => {
          // 1. Loại bỏ phòng đã đầy
          if (r.current_num_of_students >= r.max_num_of_students) return false;

          // 2. Loại bỏ phòng hiện tại của sinh viên
          // Chuẩn hóa dữ liệu về chuỗi và cắt khoảng trắng để so sánh chính xác
          const sRoomId = student?.room_id ? String(student.room_id).trim() : '';
          const sBuildingId = student?.building_id ? String(student.building_id).trim() : '';
          const tRoomId = String(r.room_id).trim();
          const tBuildingId = String(targetBuilding).trim();

          // Nếu cùng tòa VÀ cùng phòng -> Ẩn đi
          // (Lưu ý: Nếu sBuildingId rỗng do API thiếu dữ liệu, ta vẫn so sánh roomId để an toàn)
          const isSameBuilding = sBuildingId === '' || sBuildingId === tBuildingId;
          if (isSameBuilding && sRoomId === tRoomId) {
            return false;
          }

          // 3. Loại bỏ phòng lệch giới tính
          let isGenderCompatible = true;
          if (student?.sex && r.room_gender) {
            const studentSexChar = student.sex.toString().trim().charAt(0).toUpperCase();
            const roomGenderChar = r.room_gender.toString().trim().charAt(0).toUpperCase();
            // So sánh ký tự đầu (M/F)
            isGenderCompatible = studentSexChar === roomGenderChar;
          }

          return isGenderCompatible;
        });

        setRooms(availableRooms);
      } catch (error) {
        toast.error('Không thể tải danh sách phòng.');
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [targetBuilding, student?.room_id, student?.building_id, student?.sex]);

  const handleTransfer = async () => {
    if (!student || !targetBuilding || !targetRoom) return;

    setSubmitting(true);
    try {
      await transferStudent({
        sssn: student.ssn,
        targetBuildingId: targetBuilding,
        targetRoomId: targetRoom,
      });

      toast.success(`Đã chuyển sinh viên ${student.last_name} sang phòng ${targetRoom}!`);
      onSuccess(); 
      onClose();
    } catch (error: any) {
      const message = error?.message || 'Chuyển phòng thất bại.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chuyển phòng</DialogTitle>
          <DialogDescription>
            Chuyển sinh viên <strong>{student?.first_name} {student?.last_name}</strong> ({getGenderLabel(student?.sex || '')}) sang phòng khác.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="building" className="text-right">Tòa nhà</Label>
            <div className="col-span-3">
              <Select onValueChange={setTargetBuilding} value={targetBuilding}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tòa nhà" />
                </SelectTrigger>
                <SelectContent>
                  {BUILDINGS.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room" className="text-right">Phòng</Label>
            <div className="col-span-3">
              <Select 
                onValueChange={setTargetRoom} 
                value={targetRoom} 
                disabled={!targetBuilding || loadingRooms}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingRooms ? "Đang tải..." : "Chọn phòng phù hợp"} />
                </SelectTrigger>
                <SelectContent>
                  {rooms.length === 0 && !loadingRooms ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      {targetBuilding ? "Không có phòng phù hợp" : "Vui lòng chọn tòa nhà"}
                    </div>
                  ) : (
                    rooms.map(r => (
                      <SelectItem key={r.room_id} value={r.room_id}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="font-semibold">{r.room_id}</span>
                          <span className={`text-xs ${getGenderColor(r.room_gender)}`}>
                            ({getGenderLabel(r.room_gender)} - Trống {r.max_num_of_students - r.current_num_of_students})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Hủy</Button>
          <Button 
            onClick={handleTransfer} 
            disabled={submitting || !targetRoom}
            style={{ backgroundColor: '#032B91' }}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận chuyển
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}