// fileName: TransferStudentDialog.tsx
import { useState, useEffect, useMemo } from 'react'; // Thêm useMemo
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

// 1. ĐỊNH NGHĨA QUY TẮC TÒA NHÀ (Đồng bộ với AssignRoomDialog)
const ALL_BUILDINGS = ['BK001', 'BK002', 'BK003', 'BK004'];
const BUILDING_GENDER_RULES: Record<string, 'M' | 'F'> = {
  'BK001': 'M',
  'BK002': 'M',
  'BK003': 'F',
  'BK004': 'F',
};

// Helper chuẩn hóa giới tính
const normalizeSex = (sex?: string | null) => {
  if (!sex) return '';
  const s = sex.toUpperCase();
  if (s === 'M' || s === 'MALE' || s === 'NAM') return 'M';
  if (s === 'F' || s === 'FEMALE' || s === 'NU' || s === 'NỮ') return 'F';
  return '';
};

// Hàm hiển thị nhãn giới tính
const getGenderLabel = (gender: string) => {
  const g = normalizeSex(gender);
  if (g === 'M') return 'Male';
  if (g === 'F') return 'Female';
  return gender;
};

const getGenderColor = (gender: string) => {
  const g = normalizeSex(gender);
  if (g === 'M') return 'text-blue-600';
  if (g === 'F') return 'text-pink-600';
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

  // 2. LỌC DANH SÁCH TÒA NHÀ HỢP LỆ THEO GIỚI TÍNH SV
  const validBuildings = useMemo(() => {
    if (!student) return [];
    const sGender = normalizeSex(student.sex);
    
    return ALL_BUILDINGS.filter(b => {
      const rule = BUILDING_GENDER_RULES[b];
      // Nếu tòa có rule thì phải khớp giới tính, nếu không có rule thì hiển thị luôn
      return rule ? rule === sGender : true;
    });
  }, [student]);

  useEffect(() => {
    if (!targetBuilding) return;

    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const data = await getRoomsByBuilding(targetBuilding);
        const sGender = normalizeSex(student?.sex);
        
        // --- LOGIC LỌC PHÒNG ---
        const availableRooms = data.filter(r => {
          // 1. Loại bỏ phòng đã đầy
          if (r.current_num_of_students >= r.max_num_of_students) return false;
          // 2. Loại bỏ phòng đang bảo trì
          if (r.room_status !== 'Available') return false;

          // 3. Loại bỏ chính phòng hiện tại
          const sRoomId = student?.room_id ? String(student.room_id).trim() : '';
          const sBuildingId = student?.building_id ? String(student.building_id).trim() : '';
          const tRoomId = String(r.room_id).trim();
          const tBuildingId = String(targetBuilding).trim();
          const isSameBuilding = sBuildingId === '' || sBuildingId === tBuildingId;
          
          if (isSameBuilding && sRoomId === tRoomId) return false;

          // 4. Loại bỏ phòng lệch giới tính (nếu phòng đã có người hoặc đã set gender)
          const rGender = normalizeSex(r.room_gender);
          if ((r.current_num_of_students > 0 || r.room_gender) && rGender) {
             if (rGender !== sGender) return false;
          }

          return true;
        });

        setRooms(availableRooms);
      } catch (error) {
        toast.error('Unable to load room list.');
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

      toast.success(`Student ${student.last_name} has been transferred to room ${targetRoom}!`);
      onSuccess(); 
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Transfer failed.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const sGenderDisplay = getGenderLabel(student?.sex || '');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Student</DialogTitle>
          <DialogDescription>
            Transfer student <strong>{student?.first_name} {student?.last_name}</strong> ({sGenderDisplay}) to another room.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="building" className="text-right">Building</Label>
            <div className="col-span-3">
              <Select onValueChange={setTargetBuilding} value={targetBuilding}>
                <SelectTrigger>
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {validBuildings.length === 0 ? (
                     <SelectItem value="none" disabled>No suitable building</SelectItem>
                  ) : (
                    validBuildings.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room" className="text-right">Room</Label>
            <div className="col-span-3">
              <Select 
                onValueChange={setTargetRoom} 
                value={targetRoom} 
                disabled={!targetBuilding || loadingRooms}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingRooms ? "Loading..." : "Select suitable room"} />
                </SelectTrigger>
                <SelectContent>
                  {rooms.length === 0 && !loadingRooms ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      {targetBuilding ? "No suitable rooms available" : "Please select a building"}
                    </div>
                  ) : (
                    rooms.map(r => (
                      <SelectItem key={r.room_id} value={r.room_id}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="font-semibold">{r.room_id}</span>
                          <span className={`text-xs ${getGenderColor(r.room_gender)}`}>
                            ({getGenderLabel(r.room_gender)} - Available {r.max_num_of_students - r.current_num_of_students})
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
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}