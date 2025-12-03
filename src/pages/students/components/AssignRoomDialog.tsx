import { useEffect, useState, useMemo } from 'react'; // Thêm useMemo
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllRooms, Room, addStudentToRoom } from '@/services/roomsService';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentSsn: string;
  studentName: string;
  studentSex: string; 
  onSuccess: () => void;
}

// 1. ĐỊNH NGHĨA QUY TẮC PHÂN TÒA
const BUILDING_GENDER_RULES: Record<string, 'M' | 'F'> = {
  'BK001': 'M', // Chỉ dành cho Nam
  'BK002': 'M', // Chỉ dành cho Nam
  'BK003': 'F', // Chỉ dành cho Nữ
  'BK004': 'F', // Chỉ dành cho Nữ
  // Các tòa khác không khai báo ở đây sẽ được coi là Mixed (Nam/Nữ tùy phòng)
};

const normalizeSex = (sex?: string | null) => {
  if (!sex) return '';
  const s = sex.toUpperCase();
  if (s === 'M' || s === 'MALE' || s === 'NAM') return 'M';
  if (s === 'F' || s === 'FEMALE' || s === 'NU' || s === 'NỮ') return 'F';
  return '';
};

export function AssignRoomDialog({ isOpen, onClose, studentSsn, studentName, studentSex, onSuccess }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAllRooms()
        .then(setRooms)
        .catch(() => toast.error("Failed to load rooms"))
        .finally(() => setLoading(false));
    } else {
        setSelectedBuilding('');
        setSelectedRoomId('');
    }
  }, [isOpen]);

  // Chuẩn hóa giới tính sinh viên hiện tại
  const sGender = normalizeSex(studentSex);

  // 2. LỌC DANH SÁCH TÒA NHÀ ĐƯỢC PHÉP HIỂN THỊ
  const allowedBuildings = useMemo(() => {
    const allBuildings = Array.from(new Set(rooms.map(r => r.building_id))).sort();
    
    return allBuildings.filter(bId => {
      const rule = BUILDING_GENDER_RULES[bId];
      // Nếu tòa nhà có quy tắc, phải khớp giới tính sinh viên
      if (rule) {
        return rule === sGender;
      }
      // Nếu không có quy tắc (VD: BK005), cho phép hiển thị
      return true;
    });
  }, [rooms, sGender]);

  // 3. LỌC DANH SÁCH PHÒNG (Kết hợp cả quy tắc Tòa + quy tắc Phòng)
  const availableRooms = rooms.filter(r => {
    // Check 1: Tòa nhà phải đúng tòa đang chọn
    const matchBuilding = r.building_id === selectedBuilding;
    
    // Check 2: Còn chỗ & Status OK
    const hasSpace = r.current_num_of_students < r.max_num_of_students;
    const isAvailable = r.room_status === 'Available';

    // Check 3: Logic giới tính từng phòng (như cũ)
    const rGender = normalizeSex(r.room_gender); 
    let matchRoomGender = true;
    if ((r.current_num_of_students > 0 || r.room_gender) && rGender) {
        matchRoomGender = rGender === sGender;
    }

    // Check 4: Logic giới tính theo Tòa nhà (Bảo vệ 2 lớp)
    const buildingRule = BUILDING_GENDER_RULES[r.building_id];
    let matchBuildingRule = true;
    if (buildingRule) {
        matchBuildingRule = buildingRule === sGender;
    }

    return matchBuilding && hasSpace && isAvailable && matchRoomGender && matchBuildingRule;
  });

  // Tự động reset chọn phòng nếu đổi tòa
  useEffect(() => {
    setSelectedRoomId('');
  }, [selectedBuilding]);

  const handleSave = async () => {
    if (!selectedBuilding || !selectedRoomId) return;
    try {
      setSaving(true);
      await addStudentToRoom(selectedBuilding, selectedRoomId, studentSsn);
      toast.success(`Đã xếp sinh viên vào phòng ${selectedRoomId}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xếp phòng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Xếp phòng cho: <span className="text-blue-600">{studentName}</span>
          </DialogTitle>
          <div className="text-sm text-gray-500 flex flex-col gap-1">
            <p>
              Giới tính: <span className="font-semibold text-gray-900">{sGender === 'M' ? 'Nam' : 'Nữ'}</span> 
            </p>
            {/* Hiển thị quy tắc tòa nhà cho người dùng biết */}
            <p className="text-xs italic text-orange-600">
               * Hệ thống chỉ hiển thị các tòa nhà dành cho {sGender === 'M' ? 'Nam' : 'Nữ'} (Theo quy định BK001-002: Nam, BK003-004: Nữ).
            </p>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn Tòa nhà</label>
            <Select onValueChange={setSelectedBuilding} value={selectedBuilding}>
              <SelectTrigger><SelectValue placeholder="Chọn tòa..." /></SelectTrigger>
              <SelectContent>
                {allowedBuildings.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Không có tòa phù hợp</div>
                ) : (
                    allowedBuildings.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn Phòng</label>
            <Select onValueChange={setSelectedRoomId} value={selectedRoomId} disabled={!selectedBuilding}>
              <SelectTrigger><SelectValue placeholder="Chọn phòng..." /></SelectTrigger>
              <SelectContent>
                {availableRooms.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    {!selectedBuilding ? 'Vui lòng chọn tòa' : 'Hết phòng trống phù hợp'}
                  </div>
                ) : (
                  availableRooms.map(r => {
                    const displayGender = normalizeSex(r.room_gender) === 'M' ? 'Nam' : normalizeSex(r.room_gender) === 'F' ? 'Nữ' : 'Trống';
                    return (
                      <SelectItem key={r.room_id} value={r.room_id}>
                        {r.room_id} 
                        <span className="text-gray-400 text-xs ml-2">
                          ({r.current_num_of_students}/{r.max_num_of_students}) - {displayGender}
                        </span>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} disabled={saving || !selectedRoomId} style={{ backgroundColor: '#032B91' }}>
            {saving ? 'Đang lưu...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}